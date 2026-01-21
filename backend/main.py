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
    logger.info("Loading lightweight sentiment model (TextBlob)...")
    # No heavy loading needed for TextBlob
    logger.info("Model loaded successfully!")

def get_emoji(label):
    label = label.lower()
    if label == "positive":
        return "😊"
    elif label == "negative":
        return "😠"
    else:
        return "😐"

@app.post("/analyze", response_model=SentimentResponse)
async def analyze_tweet(request: TweetRequest):
    try:
        import time
        from textblob import TextBlob
        
        start_time = time.time()
        logger.info(f"Received text for analysis: {request.text[:50]}...")

        text_to_analyze = request.text
        detected_lang = "unknown"
        language_name = "Unknown"
        translated_text = None

        # Opportunistic Language Detection
        try:
            detected_lang = detect(text_to_analyze)
            lookup_code = detected_lang.split('-')[0]
            lang_obj = pycountry.languages.get(alpha_2=lookup_code)
            if lang_obj: language_name = lang_obj.name
            else: language_name = detected_lang.upper()
        except: pass

        # Translation Logic (TextBlob works best with English)
        try:
            # Simple check: if not english, translate
            if detected_lang != 'en' and detected_lang != 'unknown':
                 loop = asyncio.get_event_loop()
                 translated_text = await asyncio.wait_for(
                    loop.run_in_executor(None, lambda: GoogleTranslator(source='auto', target='en').translate(text_to_analyze)),
                    timeout=5.0
                 )
                 if translated_text:
                     text_to_analyze = translated_text
        except Exception as e:
            logger.warning(f"Translation failed: {e}")

        # Sentiment Analysis using TextBlob
        blob = TextBlob(text_to_analyze)
        polarity = blob.sentiment.polarity # -1.0 to 1.0
        
        # Mapping Polarity to Labels/Scores
        # Polarity -1 to -0.1 => Negative
        # Polarity -0.1 to 0.1 => Neutral
        # Polarity 0.1 to 1 => Positive
        
        if polarity > 0.1:
            label = "positive"
            score = (polarity + 1) / 2 # Normalize to 0.5-1.0 roughly
        elif polarity < -0.1:
            label = "negative"
            score = (abs(polarity) + 1) / 2 # Normalize magnitude
        else:
            label = "neutral"
            score = 0.5 + abs(polarity) # Close to 0.5
            
        # Ensure score is within 0-1
        score = min(max(score, 0.0), 1.0)

        total_time = time.time() - start_time
        logger.info(f"Total analysis time: {total_time:.4f}s")

        return SentimentResponse(
            label=label,
            score=score,
            emoji=get_emoji(label),
            details=[
                {"label": "positive", "score": (polarity + 1) / 2},
                {"label": "negative", "score": (1 - polarity) / 2},
                {"label": "neutral", "score": 1.0 - abs(polarity)}
            ],
            language=detected_lang,
            language_name=language_name,
            translation=translated_text,
            comparison_details={"engine": "TextBlob (Lightweight)"} 
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
