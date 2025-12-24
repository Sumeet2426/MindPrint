from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

HF_API_KEY = os.getenv("HF_API_KEY")
HF_API_URL = os.getenv("HF_API_URL")

@app.route("/analyze", methods=["POST"])
def analyze_text():
    try:
        data = request.get_json()
        text = data.get("text", "")
        if not text:
            return jsonify({"error": "No text provided"}), 400

        headers = {
    "Authorization": f"Bearer {HF_API_KEY}",
    "Content-Type": "application/json"
}
        
        payload = {
        "inputs": text,
        "parameters": {"candidate_labels": ["positive", "negative", "neutral"]}
    }

        response = requests.post(
    HF_API_URL,
    headers=headers,
    json=payload
)

        if response.status_code != 200:
            print("Hugging Face API error:", response.text)
            return jsonify({"error": "HF API failed", "details": response.text}), 500

        result = response.json()
        return jsonify({"analysis": result})

    except Exception as e:
        print("Error in analysis:", e)
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000)
