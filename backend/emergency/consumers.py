import json
from channels.generic.websocket import AsyncWebsocketConsumer

class EmergencyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.group_name = 'emergency_alerts'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def emergency_message(self, event):
        # Called when a message is sent to the group
        message = event['message']
        data = event['data']
        
        await self.send(text_data=json.dumps({
            'type': 'alarm',
            'message': message,
            'data': data
        }))
