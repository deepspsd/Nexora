"""
Quick test to verify DeepSeek Hugging Face configuration
"""
import asyncio
import sys
from mvp_builder_agent import mvp_builder_agent, AIModel

async def test_deepseek():
    """Test DeepSeek API with Hugging Face"""
    print("=" * 80)
    print("Testing DeepSeek V3.1 Model Configuration via Hugging Face")
    print("=" * 80)
    
    test_prompt = "Say 'Hello from DeepSeek v3.1!' and confirm you're working."
    
    try:
        print("\n🔄 Sending test request to DeepSeek...")
        print(f"📝 Prompt: {test_prompt}\n")
        
        response = ""
        async for chunk in mvp_builder_agent.get_ai_response(
            prompt=test_prompt,
            model=AIModel.DEEPSEEK,
            system_prompt="You are a helpful AI assistant.",
            stream=False
        ):
            response += chunk
        
        print("✅ SUCCESS! DeepSeek is working!")
        print(f"\n💬 Response: {response}\n")
        print("=" * 80)
        print("✨ Configuration is correct! DeepSeek V3.1 via Hugging Face is ready to use.")
        print("=" * 80)
        return True
        
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}\n")
        print("=" * 80)
        print("⚠️  Configuration issue detected!")
        print("\nPossible solutions:")
        print("1. Verify HF_TOKEN at: https://huggingface.co/settings/tokens")
        print("2. Check HF_TOKEN in .env file")
        print("3. Ensure Fireworks AI provider access is enabled")
        print("=" * 80)
        return False

if __name__ == "__main__":
    result = asyncio.run(test_deepseek())
    sys.exit(0 if result else 1)
