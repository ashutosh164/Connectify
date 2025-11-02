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
    path('invite-profile-list/', views.invite_profile_list_view, name='invite-list-view'),
    path('my-invite/', views.invites_received_view, name='my-invites-view'),
    path('my-invite/reject/', views.reject_invitation, name='reject'),
    path('my-invite/accept/', views.accept_invitation, name='accept'),
    path('my-followers/', views.get_my_followers, name='my-followers'),

]







