from rest_framework import serializers
from .models import Conversation, ConversationMember, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSummarySerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSummarySerializer(read_only=True)
    seen_by = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = Message
        fields = ('id','conversation','sender','content','created_at','seen_by')

class ConversationSerializer(serializers.ModelSerializer):
    members = UserSummarySerializer(many=True, read_only=True, source='members__user')
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ('id','name','created_at','last_message')

    def get_last_message(self, obj):
        msg = obj.messages.last()
        return MessageSerializer(msg).data if msg else None
