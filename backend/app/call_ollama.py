import requests
import os

def analyze_With_ollama(text:str, prompt: str):
    full_prompt = f"{prompt}\n\n{text}"

    response = requests.post(
        "http://localhost:11434/api/generate",
        json = {
            "model": "llama3",
            "prompt": full_prompt,
            "stream": False
        }
    )

    if response.status_code == 200:
        data = response.json()
        return data.get("response", "No response from model")
    else:
        return f"Error: {response.status_code} - {response.text}"