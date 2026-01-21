@echo off
echo Installing critical dependencies...
pip install "protobuf==3.20.0" "sentencepiece" "transformers" "torch" "fastapi" "uvicorn" "deep-translator" "langdetect" "pycountry"
echo.
echo Dependencies installed.
pause
