"""Simple streaming test"""
import asyncio
import aiohttp
import json

async def test_stream():
    url = "http://localhost:8000/api/mvp/stream"
    payload = {
        "prompt": "Create a simple React button",
        "conversationHistory": []
    }
    
    print("Testing streaming endpoint...")
    print(f"URL: {url}")
    print(f"Payload: {payload}\n")
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload, timeout=aiohttp.ClientTimeout(total=60)) as response:
                print(f"Status: {response.status}")
                print(f"Headers: {dict(response.headers)}\n")
                
                if not response.ok:
                    error = await response.text()
                    print(f"Error: {error}")
                    return
                
                print("Streaming events:")
                print("-" * 60)
                
                async for line in response.content:
                    line = line.decode('utf-8').strip()
                    if line:
                        print(line)
                        if line.startswith('data: '):
                            try:
                                data = json.loads(line[6:])
                                event_type = data.get('type')
                                if event_type == 'complete':
                                    print("\n✓ Stream completed successfully!")
                                    break
                                elif event_type == 'error':
                                    print(f"\n✗ Error: {data.get('message')}")
                                    break
                            except:
                                pass
                
    except Exception as e:
        print(f"Exception: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_stream())
