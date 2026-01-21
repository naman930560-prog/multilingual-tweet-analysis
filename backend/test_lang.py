from langdetect import detect
import pycountry

texts = [
    "Hello world",
    "Hola mundo",
    "Bonjour le monde",
    "你好", # Chinese
    "こんにちは", # Japanese
    "Привет мир", # Russian
    "Namaste", # Hindi
]

print("Testing Language Detection and Lookup:")
for text in texts:
    try:
        code = detect(text)
        print(f"Text: '{text}' -> Code: '{code}'")
        
        lang_obj = pycountry.languages.get(alpha_2=code)
        if lang_obj:
            print(f"  Lookup alpha_2='{code}': Found '{lang_obj.name}'")
        else:
            print(f"  Lookup alpha_2='{code}': NOT FOUND. Trying fallback...")
            # Try fuzzy search or scope
            try:
                lang_obj = pycountry.languages.get(alpha_3=code)
                print(f"    Lookup alpha_3='{code}': {'Found ' + lang_obj.name if lang_obj else 'NOT FOUND'}")
            except:
                pass

    except Exception as e:
        print(f"Error processing '{text}': {e}")
