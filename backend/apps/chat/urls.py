from django.urls import path
from . import views

urlpatterns = [
    path('conversations/', views.ConversationListAPIView.as_view(), name='conv-list'),
    path('conversations/create/', views.CreateConversationAPIView.as_view(), name='conv-create'),
    path('conversations/<int:conversation_id>/messages/', views.MessageListAPIView.as_view(), name='message-list'),
    path('conversations/<int:conversation_id>/mark-seen/', views.MarkSeenAPIView.as_view(), name='mark-seen'),
]
