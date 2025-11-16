from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Conversation, ConversationMember, Message
from .serializers import ConversationSerializer, MessageSerializer
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class CreateConversationAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # Accept payload: {"user_ids": [2,3]} for 1:1 or group
        user_ids = request.data.get('user_ids', [])
        if not user_ids or request.user.id not in user_ids:
            # ensure current user is participant
            user_ids = list(set(user_ids + [request.user.id]))
        # For 1:1 deterministic lookup: sort two ids and find existing
        if len(user_ids) == 2:
            a,b = sorted(user_ids)
            # try find conversation that has exactly these two members
            convs = Conversation.objects.filter(members__user__id=a).filter(members__user__id=b).distinct()
            for c in convs:
                if c.members.count() == 2:
                    serializer = ConversationSerializer(c)
                    return Response(serializer.data)
        # else create
        conv = Conversation.objects.create()
        for uid in set(user_ids):
            user = get_object_or_404(User, id=uid)
            ConversationMember.objects.create(conversation=conv, user=user)
        return Response(ConversationSerializer(conv).data, status=status.HTTP_201_CREATED)

class ConversationListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ConversationSerializer

    def get_queryset(self):
        return Conversation.objects.filter(members__user=self.request.user).distinct()

class MessageListAPIView(generics.ListAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = MessageSerializer
    pagination_class = None

    def get_queryset(self):
        conv = get_object_or_404(Conversation, id=self.kwargs['conversation_id'])
        if not ConversationMember.objects.filter(conversation=conv, user=self.request.user).exists():
            return Message.objects.none()
        return conv.messages.all()

class MarkSeenAPIView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, conversation_id):
        msg_id = request.data.get('message_id')
        conv = get_object_or_404(Conversation, id=conversation_id)
        if not ConversationMember.objects.filter(conversation=conv, user=request.user).exists():
            return Response(status=status.HTTP_403_FORBIDDEN)
        msg = get_object_or_404(Message, id=msg_id, conversation=conv)
        msg.seen_by.add(request.user)
        msg.save()
        return Response({'status':'ok'})
