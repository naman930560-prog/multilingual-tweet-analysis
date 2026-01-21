try:
    import wordcloud
    import matplotlib
    print("Imports successful")
except ImportError as e:
    print(f"Import failed: {e}")
