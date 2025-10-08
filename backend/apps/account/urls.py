from tkinter.font import names

from rest_framework import routers
from ..account import views
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

router = routers.DefaultRouter()
router.register('profiles', views.ProfileViewSet, basename='profiles')
# router.register('register', views.RegisterView)

urlpatterns = [
    path('', include(router.urls)),
    # path("my_profile/", views.CurrentUserProfileView.as_view(), name="current-user"),
    path('follow/', views.follow_unfollow_profile, name='follow'),
    path('send-invite/', views.send_invitation, name='send_invitations'),
    # path("profiles/exclude-me/", views.ProfileListWithoutCurrentUserView.as_view(), name="profile-list-exclude-me"),

]







