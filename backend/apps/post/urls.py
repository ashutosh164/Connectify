from rest_framework import routers
from apps.post import views
from django.urls import path, include
from rest_framework.authtoken.views import obtain_auth_token

router = routers.DefaultRouter()
router.register('posts', views.PostView)
router.register('register', views.RegisterView)
router.register('like', views.LikeView)
router.register('comment', views.CommentView)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', views.CustomAuthToken.as_view()),
    path('logout/', views.LogoutUserView.as_view(), name='logout'),
    # path('like/', views.LikeView.as_view(), name='like'),
]







