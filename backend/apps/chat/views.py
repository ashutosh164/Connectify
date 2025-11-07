# chat/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Conversation, Message, ConversationMember
from .serializers import ConversationSerializer, MessageSerializer
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes

class ConversationListCreate(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # return conversations where user is a member
        return Conversation.objects.filter(members__user=self.request.user)

    def perform_create(self, serializer):
        conv = serializer.save()
        ConversationMember.objects.create(conversation=conv, user=self.request.user)

class MessageList(generics.ListAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None

    def get_queryset(self):
        conv_id = self.kwargs['conversation_id']
        # membership check
        if not ConversationMember.objects.filter(conversation_id=conv_id, user=self.request.user).exists():
            return Message.objects.none()
        return Message.objects.filter(conversation_id=conv_id).order_by('-created_at')[:50]  # latest 50
