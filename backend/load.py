import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor
import os

# --- Configuration ---
MODEL_ID = "openai/whisper-tiny"
# Set device to CPU or CUDA if available
DEVICE = "cuda:0" if torch.cuda.is_available() else "cpu"

def download_and_cache_model():
    """
    Forces the download of the Whisper model, processor, and tokenizer 
    components from Hugging Face to the local cache.
    
    This script needs to be run once with an internet connection. 
    After execution, the FastAPI application can run completely offline.
    """
    print(f"--- Starting Download and Caching for {MODEL_ID} ---")
    print(f"Target device for model configuration: {DEVICE}")

    try:
        # 1. Download and cache the Processor (Tokenizer and Feature Extractor)
        # We explicitly set token=False to ignore any potentially expired or 
        # invalid tokens that might be stored in the environment.
        print(f"1/2. Downloading and caching processor/tokenizer...")
        AutoProcessor.from_pretrained(MODEL_ID, token=False)
        print("Processor cached successfully.")

        # 2. Download and cache the Model weights
        # We explicitly set token=False here as well for the same reason.
        print("2/2. Downloading and caching model weights...")
        AutoModelForSpeechSeq2Seq.from_pretrained(
            MODEL_ID,
            token=False,
            # We don't need to load the model onto the GPU right now, 
            # but this ensures the checkpoint files are pulled correctly.
        )
        print("Model weights cached successfully.")
        
        print(f"\n✅ SUCCESS: All files for '{MODEL_ID}' are now stored in your local cache.")
        print("You can now run your API server completely offline.")

    except Exception as e:
        print(f"\n❌ ERROR: Failed to download model components.")
        print("Please check your internet connection and try again.")
        print(f"Detailed Error: {e}")

if __name__ == "__main__":
    download_and_cache_model()
