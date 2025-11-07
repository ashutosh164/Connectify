# chat/consumers.py
import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message, ConversationMember

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope["user"]
        if user.is_anonymous:
            await self.close()  # require login (session-based)
            return

        self.user = user
        self.conversation_id = self.scope['url_route']['kwargs']['conversation_id']
        self.room_group_name = f'conv_{self.conversation_id}'

        # Optional: verify membership
        is_member = await self._is_member(user.id, self.conversation_id)
        if not is_member:
            await self.close()
            return

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        """
        Expect JSON messages of form:
        { "type": "message.create", "content": "Hello world" }
        """
        data = json.loads(text_data)
        msg_type = data.get('type')
        if msg_type == 'message.create':
            content = data.get('content', '').strip()
            if not content:
                return
            message = await self._create_message(self.user.id, self.conversation_id, content)
            # broadcast saved message to conversation group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat.message',
                    'message': {
                        'id': message['id'],
                        'conversation_id': message['conversation_id'],
                        'sender_id': message['sender_id'],
                        'sender_username': message['sender_username'],
                        'content': message['content'],
                        'created_at': message['created_at'],
                    }
                }
            )

    async def chat_message(self, event):
        # send to WebSocket client
        await self.send(text_data=json.dumps({
            'type': 'message.received',
            'message': event['message']
        }))

    @database_sync_to_async
    def _is_member(self, user_id, conversation_id):
        return ConversationMember.objects.filter(conversation_id=conversation_id, user_id=user_id).exists()

    @database_sync_to_async
    def _create_message(self, sender_id, conversation_id, content):
        # create the message in DB and return a serializable dict
        conv = Conversation.objects.get(id=conversation_id)
        sender = User.objects.get(id=sender_id)
        m = Message.objects.create(conversation=conv, sender=sender, content=content)
        return {
            'id': m.id,
            'conversation_id': conversation_id,
            'sender_id': sender.id,
            'sender_username': sender.username,
            'content': m.content,
            'created_at': m.created_at.isoformat(),
        }
