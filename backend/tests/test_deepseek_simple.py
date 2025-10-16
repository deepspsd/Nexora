"""
Simple synchronous test for DeepSeek configuration
"""
import os
import requests
from dotenv import load_dotenv

load_dotenv()

def test_deepseek_direct():
    """Direct test of DeepSeek API via Hugging Face"""
    
    api_key = os.getenv("HF_TOKEN")
    
    if not api_key:
        print("❌ ERROR: HF_TOKEN not found in .env file")
        return False
    
    print("=" * 80)
    print("Testing DeepSeek V3.1 Model via Hugging Face")
    print("=" * 80)
    print(f"\n🔑 API Key found: {api_key[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "deepseek-ai/DeepSeek-V3-0324",
        "messages": [
            {"role": "user", "content": "Say 'Hello from DeepSeek V3!' and confirm you're working."}
        ],
        "max_tokens": 100,
        "temperature": 0.7
    }
    
    print("\n🔄 Sending request to Hugging Face Router...")
    
    try:
        response = requests.post(
            "https://router.huggingface.co/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            message = data['choices'][0]['message']['content']
            print("\n✅ SUCCESS! DeepSeek is working!\n")
            print(f"💬 Response: {message}\n")
            print("=" * 80)
            print("✨ Configuration is PERFECT! DeepSeek V3.1 via Hugging Face is ready!")
            print("=" * 80)
            return True
        else:
            print(f"\n❌ ERROR: {response.status_code}")
            print(f"📄 Response: {response.text}\n")
            print("=" * 80)
            print("⚠️  Issue detected. Check:")
            print("1. HF_TOKEN validity at: https://huggingface.co/settings/tokens")
            print("2. Fireworks AI provider access")
            print("3. DeepSeek model availability")
            print("=" * 80)
            return False
            
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}\n")
        print("=" * 80)
        return False

if __name__ == "__main__":
    success = test_deepseek_direct()
    exit(0 if success else 1)
