from ntscraper import Nitter
import json

try:
    scraper = Nitter()
    print("Scraping 'AI'...")
    tweets = scraper.get_tweets("AI", mode='term', number=5)
    print(json.dumps(tweets, indent=2))
except Exception as e:
    print(f"Error: {e}")
