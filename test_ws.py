import asyncio
import websockets

async def test():
    try:
        async with websockets.connect('ws://localhost:8080/api/ws') as websocket:
            print('Connected')
    except Exception as e:
        print('Error:', e)

asyncio.run(test())
