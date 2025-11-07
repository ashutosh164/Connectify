from django.db import models
from django.contrib.auth.models import User


class Conversation(models.Model):
    name = models.CharField(max_length=255, blank=True, null=True)
    is_group = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    members = models.ManyToManyField(User, through='ConversationMember', related_name='conversations')

    def __str__(self):
        if self.is_group and self.name:
            return f"Group: {self.name}"
        return f"Conversation {self.id}"


class ConversationMember(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="conversation_memberships")
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="members_info")
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "conversation")

    def __str__(self):
        return f"{self.user.username} -> Conversation {self.conversation.id}"


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="messages")
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name="sent_messages")
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.sender.username}: {self.text[:25]}"

