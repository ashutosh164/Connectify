from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListCreate.as_view(), name='conversations'),
    path('conversations/<int:conversation_id>/messages/', views.MessageList.as_view(), name='conversation-messages'),
]
