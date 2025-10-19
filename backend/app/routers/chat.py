from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import tempfile
import requests
from transformers import pipeline
import torch

router = APIRouter()

# --- INIT MODELS ---
# Speech-to-text model (Whisper)
# This model initialization happens ONCE when the FastAPI application starts. 
# The 'transformers' library automatically handles caching the model files 
# (weights and configuration) to your local disk after the first successful 
# download. Subsequent runs will load from the cache, allowing for offline use.
print("Loading Whisper model...")
stt = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-small",    # or "base" / "large-v3"
    device=0 if torch.cuda.is_available() else -1
)
print("Loaded Whisper.")

# Ollama base URL (make sure 'ollama serve' is running)
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma3:4b"  # or "mistral", "gemma", etc.


# --- TEXT INPUT ---
class TextInput(BaseModel):
    input: str

class TextResponse(BaseModel):
    reply: str


def query_ollama(prompt: str, model: str = OLLAMA_MODEL) -> str:
    """Send prompt to Ollama and return response text."""
    response = requests.post(
        OLLAMA_API_URL,
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=120,
    )
    # Check if the response was successful
    response.raise_for_status()
    data = response.json()
    return data.get("response", "(no reply)")


@router.post("/text", response_model=TextResponse)
async def handle_text(input_data: TextInput):
    user_input = input_data.input.strip()

    # Ask Ollama
    print(f"[Ollama] Processing text: {user_input}")
    # Ollama models must also be downloaded once (using 'ollama pull model_name')
    # but run locally after that.
    assistant_reply = query_ollama(f"User said: {user_input}\nRespond helpfully.")
    return {"reply": assistant_reply}


# --- AUDIO INPUT ---
@router.post("/voice", response_model=TextResponse)
async def handle_audio(file: UploadFile = File(...)):
    # Save uploaded audio temporarily
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    # 1️⃣ Transcribe speech (using the cached model)
    print(f"[STT] Transcribing {file.filename}...")
    result = stt(tmp_path)
    user_text = result["text"].strip()
    print(f"[STT] Transcribed text: {user_text}")

    # 2️⃣ Pipe transcription into Ollama
    assistant_reply = query_ollama(
        f"The user said: {user_text}\nRespond as a helpful assistant."
    )

    # 3️⃣ Return the generated reply
    return {"reply": assistant_reply}
