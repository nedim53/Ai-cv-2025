import requests
import os

""""
TESTIRANJE

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

        """

def analyze_With_ollama(text: str, prompt: str):
    TOGETHER_API_KEY = os.getenv("TOGETHER_API_KEY")  
    full_prompt = f"{prompt}\n\n{text}"

    headers = {
        "Authorization": f"Bearer {TOGETHER_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "meta-llama/Llama-3.3-70B-Instruct-Turbo-Free",
        "messages": [
            {"role": "system", "content": "Ti si AI asistent koji ocjenjuje CV na osnovu opisa posla."},
            {"role": "user", "content": full_prompt}
        ]
    }

    response = requests.post("https://api.together.xyz/v1/chat/completions", json=payload, headers=headers)

    if response.status_code == 200:
        data = response.json()
        return data["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code} - {response.text}"

