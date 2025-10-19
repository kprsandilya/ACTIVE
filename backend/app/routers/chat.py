from fastapi import APIRouter, UploadFile, File
from pydantic import BaseModel
import tempfile
import requests
from transformers import pipeline, Pipeline
import torch
import sys

router = APIRouter()

# ---------------- TEXT INPUT ----------------
class TextInput(BaseModel):
    input: str

class TextResponse(BaseModel):
    reply: str

# ---------------- WHISPER INIT ----------------
def load_whisper_model(model_name="openai/whisper-tiny") -> Pipeline:
    """Load Whisper model safely: use cache if available, otherwise fail gracefully."""
    try:
        print(f"[STT] Loading Whisper model '{model_name}'...")
        stt = pipeline(
            "automatic-speech-recognition",
            model=model_name,
            device=0 if torch.cuda.is_available() else -1
        )
        print("[STT] Whisper loaded from cache.")
        return stt
    except OSError as e:
        print(
            "[STT] ERROR: Whisper model not found in local cache.\n"
            "You need to download it first using an internet connection and Hugging Face authentication.\n"
            "Run:\n"
            "  huggingface-cli login\n"
            f"Then download the model:\n"
            f"  from transformers import pipeline\n"
            f"  pipeline('automatic-speech-recognition', model='{model_name}')\n"
        )
        sys.exit(1)

# Load model once at startup
stt = load_whisper_model()

# ---------------- OLLAMA CONFIG ----------------
OLLAMA_API_URL = "http://localhost:11434/api/generate"
OLLAMA_MODEL = "gemma3:4b"

def query_ollama(prompt: str, model: str = OLLAMA_MODEL) -> str:
    response = requests.post(
        OLLAMA_API_URL,
        json={"model": model, "prompt": prompt, "stream": False},
        timeout=120,
    )
    response.raise_for_status()
    data = response.json()
    return data.get("response", "(no reply)")

# ---------------- ROUTES ----------------
@router.post("/text", response_model=TextResponse)
async def handle_text(input_data: TextInput):
    user_input = input_data.input.strip()
    assistant_reply = query_ollama(
        f"User said: {user_input}\n"
        "You are an expert agricultural advsisor. "
        "Provide clear, practical recommendations for products such as fertilizers, pesticides, seeds, or equipment, "
        "with a focus on helping the farmer save money without compromising crop health or yield."
        "Only reply with 1-2 sentences."
    )
    return {"reply": assistant_reply}

@router.post("/voice", response_model=TextResponse)
async def handle_audio(file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    print(f"[STT] Transcribing {file.filename}...")
    result = stt(tmp_path)
    user_text = result["text"].strip()
    print(f"[STT] Transcribed text: {user_text}")

    assistant_reply = query_ollama(f"The user said: {user_text}\nRespond as a helpful assistant.")
    return {"reply": assistant_reply}
