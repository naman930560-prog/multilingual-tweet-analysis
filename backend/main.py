from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import pipeline
import logging
from fastapi.middleware.cors import CORSMiddleware

# New imports for language compatibility
from langdetect import detect
from deep_translator import GoogleTranslator
import pycountry
import asyncio

# Twitter Scraper Integration
from ntscraper import Nitter

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Multilingual Tweet Sentiment Analysis")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for production (Vercel/Render)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variable to hold the model result
sentiment_pipeline = None

from typing import Optional

class TweetRequest(BaseModel):
    text: str
    language: str = "auto" # Optional, for future use

class SentimentResponse(BaseModel):
    label: str
    score: float
    emoji: str
    details: list = []
    language: str = "unknown"
    language_name: str = "Unknown" 
    translation: Optional[str] = None  # Explicitly optional
    comparison_details: dict = {} # New field for decision logic info

class TweetSearchRequest(BaseModel):
    term: str
    limit: int = 5

@app.on_event("startup")
async def load_model():
    global sentiment_pipeline
    try:
        logger.info("Loading sentiment analysis model...")
        # specific multilingual model for sentiment - switching to cardiffnlp which is better for tweets
        model_name = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
        sentiment_pipeline = pipeline("sentiment-analysis", model=model_name, top_k=None)
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        # Fallback or just let it be None and error out on request
        sentiment_pipeline = None

def get_emoji(label):
    label = label.lower()
    if label == "positive":
        return "😊"
    elif label == "negative":
        return "😠"
    else:
        return "😐"

def map_label(label):
    # Map cardiffnlp labels to our standard labels
    # Verify the mapping via documentation or initial check, but usually:
    # LABEL_0, negative; LABEL_1, neutral; LABEL_2, positive
    # Some variants return 'negative', 'neutral', 'positive' directly.
    # We will normalize to lowercase string.
    
    l = label.lower()
    if l in ['label_0', 'negative']:
        return 'negative'
    elif l in ['label_1', 'neutral']:
        return 'neutral'
    elif l in ['label_2', 'positive']:
        return 'positive'
    return 'neutral' # fallback

@app.post("/analyze", response_model=SentimentResponse)
async def analyze_tweet(request: TweetRequest):
    if sentiment_pipeline is None:
        raise HTTPException(status_code=503, detail="Model is not loaded.")
    
    try:
        import time
        start_time = time.time()
        logger.info(f"Received text for analysis: {request.text[:50]}...")

        text_to_analyze = request.text
        detected_lang = "unknown"
        language_name = "Unknown"
        translated_text = None

        # Optimization: Check if we can skip translation for high-confidence inputs
        t2 = time.time()
        loop = asyncio.get_event_loop()
        raw_results = await loop.run_in_executor(None, lambda: sentiment_pipeline(text_to_analyze))
        
        if not raw_results:
             raise HTTPException(status_code=500, detail="No result from model.")

        # Process Raw Results
        sorted_raw = sorted(raw_results[0], key=lambda x: x['score'], reverse=True)
        top_raw = sorted_raw[0]
        
        # Initialize result variables
        final_result = top_raw
        used_translation = False
        top_trans = None
        translated_text = None

        # Opportunistic Language Detection (Always run this)
        try:
            detected_lang = detect(text_to_analyze)
            # Handle codes like 'zh-cn' by taking the first part 'zh'
            lookup_code = detected_lang.split('-')[0]
            lang_obj = pycountry.languages.get(alpha_2=lookup_code)
            if lang_obj: language_name = lang_obj.name
            else: language_name = detected_lang.upper()
        except: pass

        # Logic: If raw confidence is > 0.95, skip translation to optimize latency.
        if top_raw['score'] > 0.95:
            logger.info(f"High confidence ({top_raw['score']:.2f}). Skipping translation.")
        else:
            # Fallback: Translate text to English for better accuracy on mixed/slang inputs
            t0 = time.time()
            try:
                loop = asyncio.get_event_loop()
                translated_text = await asyncio.wait_for(
                    loop.run_in_executor(None, lambda: GoogleTranslator(source='auto', target='en').translate(text_to_analyze)),
                    timeout=3.0
                )
                if not translated_text: translated_text = None
                else: logger.info(f"Translation logic executed.")

            except asyncio.TimeoutError:
                logger.warning("Translation timed out.")
                translated_text = None
            except Exception as e:
                logger.warning(f"Translation failed: {e}")
                translated_text = None
            
            # Run inference on translated text
            trans_results = None
            if translated_text and translated_text.strip().lower() != text_to_analyze.strip().lower():
                 trans_results = await loop.run_in_executor(None, lambda: sentiment_pipeline(translated_text))

            # Compare Raw vs Translated Confidence
            if trans_results:
                sorted_trans = sorted(trans_results[0], key=lambda x: x['score'], reverse=True)
                top_trans = sorted_trans[0]
                
                if top_trans['score'] > top_raw['score']:
                    final_result = top_trans
                    used_translation = True
                    sorted_results = sorted_trans
                else:
                    sorted_results = sorted_raw
            else:
                sorted_results = sorted_raw
        
        if 'sorted_results' not in locals():
            sorted_results = sorted_raw

        raw_label = final_result['label']
        label = map_label(raw_label) # Normalize label
        score = final_result['score']
        
        total_time = time.time() - start_time
        logger.info(f"Total analysis time: {total_time:.4f}s")

        # Prepare details with normalized labels for charts
        normalized_details = []
        for res in sorted_results:
            normalized_details.append({
                "label": map_label(res['label']),
                "score": res['score']
            })

        # Decision comparison details
        comparison_details = {
            "raw": {
                "label": map_label(top_raw['label']),
                "score": top_raw['score']
            }
        }
        
        if top_trans:
            comparison_details["translated"] = {
                "label": map_label(top_trans['label']),
                "score": top_trans['score'],
                "text": translated_text
            }

        return SentimentResponse(
            label=label,
            score=score,
            emoji=get_emoji(label),
            details=normalized_details,
            language=detected_lang,
            language_name=language_name,
            translation=translated_text,
            comparison_details=comparison_details
        )
    except Exception as e:
        import traceback
        tb = traceback.format_exc()
        logger.error(f"Error analyzing tweet: {tb}")
        raise HTTPException(status_code=500, detail=f"{str(e)} -- Traceback: {tb}")

@app.post("/fetch_tweets")
async def fetch_tweets(request: TweetSearchRequest):
    import tweepy
    import os
    from dotenv import load_dotenv
    
    load_dotenv()
    bearer_token = os.getenv("TWITTER_BEARER_TOKEN")

    # Helper for mock data
    def get_mock_tweets(term):
        return [
            {
                "text": f"Just finished learning about {term}! It's amazing how much potential it has. #tech #learning",
                "user": "ByteWizard",
                "name": "Alex The Coder",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=ByteWizard",
                "link": "https://twitter.com/example/status/1",
                "date": "2 hours ago",
                "stats": {"likes": 120, "retweets": 45, "comments": 12}
            },
            {
                "text": f"Honestly, I'm struggling with {term}. The documentation is so confusing sometimes. 😕",
                "user": "CodeNewbie",
                "name": "Sarah J.",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=CodeNewbie",
                "link": "https://twitter.com/example/status/2",
                "date": "5 hours ago",
                "stats": {"likes": 5, "retweets": 0, "comments": 2}
            },
            {
                "text": f"{term} is absolutely changing the game. Can't wait to see what's next! 🚀",
                "user": "TechDaily",
                "name": "Tech Daily News",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=TechDaily",
                "link": "https://twitter.com/example/status/3",
                "date": "1 day ago",
                "stats": {"likes": 850, "retweets": 200, "comments": 56}
            },
            {
                "text": f"Why is everyone talking about {term}? It seems overhyped to me.",
                "user": "SkepticDev",
                "name": "Realist Ray",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=SkepticDev",
                "link": "https://twitter.com/example/status/4",
                "date": "2 days ago",
                "stats": {"likes": 42, "retweets": 10, "comments": 15}
            },
             {
                "text": f"Just deployed my first project using {term}. Feeling proud! 😊",
                "user": "HappyCoder",
                "name": "Emily Writes Code",
                "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=HappyCoder",
                "link": "https://twitter.com/example/status/5",
                "date": "3 days ago",
                "stats": {"likes": 300, "retweets": 89, "comments": 40}
            }
        ]

    # If no token, return mock data immediately
    if not bearer_token:
        logger.warning("No Twitter Token found. Using Mock Data.")
        return {"tweets": get_mock_tweets(request.term), "is_mock": True}

    try:
        client = tweepy.Client(bearer_token=bearer_token)
        # Fetch tweets from API v2
        query = f"{request.term} -is:retweet lang:en"
        response = client.search_recent_tweets(
            query=query,
            max_results=request.limit,
            tweet_fields=['created_at', 'public_metrics', 'author_id'],
            expansions=['author_id'],
            user_fields=['name', 'username', 'profile_image_url']
        )

        if not response.data:
             logger.info("No tweets found from API.")
             return {"tweets": get_mock_tweets(request.term), "is_mock": False}

        # Map users for easy lookup
        users = {u.id: u for u in response.includes['users']}
        
        cleaned_tweets = []
        for t in response.data:
            user = users.get(t.author_id)
            cleaned_tweets.append({
                "text": t.text,
                "user": user.username if user else "Unknown",
                "name": user.name if user else "Unknown",
                "avatar": user.profile_image_url if user else "",
                "link": f"https://twitter.com/{user.username}/status/{t.id}" if user else "",
                "date": t.created_at.strftime("%Y-%m-%d %H:%M"),
                "stats": {
                    "likes": t.public_metrics['like_count'],
                    "retweets": t.public_metrics['retweet_count'],
                    "comments": t.public_metrics['reply_count']
                }
            })
            
        return {"tweets": cleaned_tweets, "is_mock": False}

    except Exception as e:
        logger.error(f"Twitter API Error: {e}")
        # Fallback to mock data on error
        return {"tweets": get_mock_tweets(request.term), "is_mock": True, "error": str(e)}

@app.get("/")
def read_root():
    return {"message": "Sentiment Analysis API is running."}

# Word Cloud Request Model
class WordCloudRequest(BaseModel):
    text: str

@app.post("/generate_wordcloud")
async def generate_wordcloud(request: WordCloudRequest):
    try:
        from wordcloud import WordCloud
        import io
        import base64
        
        # Generate word cloud
        # Use a transparent background or white
        wc = WordCloud(width=800, height=400, background_color='white', colormap='viridis').generate(request.text)
        
        # Convert to image
        img = wc.to_image()
        
        # Save to buffer
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        buffer.seek(0)
        
        # Encode
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return {"image": img_str}
        
    except ImportError:
        logger.error("WordCloud library not installed.")
        return {"error": "WordCloud library missing on server."}
    except Exception as e:
        logger.error(f"WordCloud Error: {e}")
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
