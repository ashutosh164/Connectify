import json
import logging
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Conversation, ConversationMember, Message
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # extract conversation id and set group
        self.conversation_id = self.scope['url_route']['kwargs'].get('conversation_id')
        if not self.conversation_id:
            await self.close(code=4002); return

        self.room_group_name = f"chat_{self.conversation_id}"

        # ensure authenticated user
        user = self.scope.get('user')
        if user is None or user.is_anonymous:
            await self.close(code=4001); return
        self.user = user

        # verify membership
        is_member = await self._is_member(user.id, self.conversation_id)
        if not is_member:
            await self.close(code=4003); return

        # join group
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        # notify other participants that user is online
        await self.channel_layer.group_send(self.room_group_name, {
            'type': 'presence',
            'action': 'online',
            'user': {'id': user.id, 'username': user.username}
        })

    async def disconnect(self, close_code):
        # leave group
        try:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
            # notify offline
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'presence',
                'action': 'offline',
                'user': {'id': self.user.id, 'username': self.user.username}
            })
        except Exception:
            pass

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
        except json.JSONDecodeError:
            return

        t = data.get('type')
        if t == 'message.create':
            content = data.get('content', '').strip()
            if not content: return
            msg = await self._create_message(self.user.id, self.conversation_id, content)
            if not msg: return
            # broadcast created message
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat.message',
                'message': msg
            })
        elif t == 'typing':
            await self.channel_layer.group_send(self.room_group_name, {
                'type': 'chat.typing',
                'user': {'id': self.user.id, 'username': self.user.username}
            })
        elif t == 'message.seen':
            message_id = data.get('message_id')
            if message_id:
                await self._mark_seen(self.user.id, message_id)
                # optionally broadcast seen event
                await self.channel_layer.group_send(self.room_group_name, {
                    'type': 'chat.seen',
                    'message_id': message_id,
                    'user_id': self.user.id
                })

    # group event handlers
    async def chat_message(self, event):
        await self.send(json.dumps({'type':'message.received','message': event['message']}))

    async def chat_typing(self, event):
        await self.send(json.dumps({'type':'typing','user': event['user']}))

    async def presence(self, event):
        await self.send(json.dumps({'type':'presence', 'action': event['action'], 'user': event['user']}))

    async def chat_seen(self, event):
        await self.send(json.dumps({'type':'message.seen','message_id': event.get('message_id'),'user_id': event.get('user_id')}))

    # DB helpers
    @database_sync_to_async
    def _is_member(self, user_id, conversation_id):
        return ConversationMember.objects.filter(conversation_id=conversation_id, user_id=user_id).exists()

    @database_sync_to_async
    def _create_message(self, sender_id, conversation_id, content):
        try:
            conv = Conversation.objects.get(id=conversation_id)
            sender = User.objects.get(id=sender_id)
            m = Message.objects.create(conversation=conv, sender=sender, content=content)
            # optionally return serialized form
            return {
                'id': m.id,
                'conversation_id': m.conversation_id,
                'sender_id': sender.id,
                'sender_username': sender.username,
                'content': m.content,
                'created_at': m.created_at.isoformat(),
                'seen_by': [],
            }
        except Exception as e:
            logger.exception("create_message failed: %s", e)
            return None

    @database_sync_to_async
    def _mark_seen(self, user_id, message_id):
        try:
            msg = Message.objects.get(id=message_id)
            user = User.objects.get(id=user_id)
            msg.seen_by.add(user)
            return True
        except Exception:
            return False
