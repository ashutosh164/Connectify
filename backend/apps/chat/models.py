from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Conversation(models.Model):
    # For 1:1 conversations ensure uniqueness via helper when creating
    name = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name or f"conv:{self.id}"

class ConversationMember(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='members', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='conversations', on_delete=models.CASCADE)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('conversation', 'user')

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    edited = models.BooleanField(default=False)
    deleted = models.BooleanField(default=False)

    # seen_by: users who've seen this message (many-to-many)
    seen_by = models.ManyToManyField(User, related_name='seen_messages', blank=True)

    class Meta:
        ordering = ['created_at']

    def to_dict(self):
        return {
            'id': self.id,
            'conversation_id': self.conversation_id,
            'sender_id': self.sender_id,
            'sender_username': getattr(self.sender, 'username', None),
            'content': self.content,
            'created_at': self.created_at.isoformat(),
            'seen_by': [u.id for u in self.seen_by.all()],
        }
