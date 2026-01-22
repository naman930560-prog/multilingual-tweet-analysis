import requests
import json

BASE_URL = "https://tweet-analysis-backend.onrender.com"

def test_root():
    try:
        print(f"Testing root URL: {BASE_URL}/")
        resp = requests.get(f"{BASE_URL}/")
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        if resp.status_code == 200:
            print("✅ Root check passed")
        else:
            print("❌ Root check failed")
    except Exception as e:
        print(f"❌ Root check error: {e}")

def test_analyze():
    try:
        url = f"{BASE_URL}/analyze"
        print(f"\nTesting Analysis: {url}")
        payload = {"text": "I am so happy and excited about this project!"}
        resp = requests.post(url, json=payload)
        print(f"Status: {resp.status_code}")
        print(f"Response: {resp.text}")
        if resp.status_code == 200:
            print("✅ Analysis check passed")
        else:
            print("❌ Analysis check failed")
    except Exception as e:
        print(f"❌ Analysis check error: {e}")

def test_fetch_tweets():
    try:
        url = f"{BASE_URL}/fetch_tweets"
        print(f"\nTesting Fetch Tweets: {url}")
        payload = {"term": "coding", "limit": 2}
        resp = requests.post(url, json=payload)
        print(f"Status: {resp.status_code}")
        # print(f"Response: {resp.text[:200]}...") # Truncate for readability
        if resp.status_code == 200:
            print("✅ Fetch Tweets check passed")
            data = resp.json()
            if data.get("is_mock"):
                print("⚠️  Warning: Returned Mock Data (Nitter likely failed, used fallback)")
            else:
                print("🎉 Returned Live Twitter Data (via Nitter or API)")
        else:
            print("❌ Fetch Tweets check failed")
            print(f"Error Response: {resp.text}")
    except Exception as e:
        print(f"❌ Fetch Tweets check error: {e}")

if __name__ == "__main__":
    test_root()
    test_analyze()
    test_fetch_tweets()
