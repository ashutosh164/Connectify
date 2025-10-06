from django.shortcuts import render
from rest_framework import viewsets, status
from .models import Profiles
from .serializers import ProfileSerializer
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .serializers import *
from rest_framework.authentication import TokenAuthentication



# profiles/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Profiles
from .serializers import ProfileSerializer


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profiles.objects.all()
    serializer_class = ProfileSerializer
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["get"], url_path="me")
    def current_user_profile(self, request):
        try:
            profile = Profiles.objects.get(user=request.user)
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except Profiles.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)


class CurrentUserProfileView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            profile = Profiles.objects.get(user=request.user)
        except Profiles.DoesNotExist:
            return Response({"error": "Profile not found"}, status=404)

        serializer = CurrentUserProfileSerializer(profile, context={"request": request})
        return Response(serializer.data)



from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Profiles
from django.contrib.auth.models import User


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_unfollow_profile(request):
    """Toggle follow/unfollow a profile."""
    user = request.user
    print('request===>>', request.data)
    profile_id = request.data.get('profile_id')

    if not profile_id:
        return Response({'error': 'profile_id is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        target_profile = Profiles.objects.select_related('user').get(id=profile_id)
    except Profiles.DoesNotExist:
        return Response({'error': 'Profile not found'}, status=status.HTTP_404_NOT_FOUND)

    if target_profile.user == user:
        return Response({'error': "You can't follow yourself"}, status=status.HTTP_400_BAD_REQUEST)

    my_profile, _ = Profiles.objects.get_or_create(user=user)

    # ✅ Check if already following
    is_following = my_profile.following.filter(id=target_profile.user.id).exists()

    if is_following:
        my_profile.following.remove(target_profile.user)
        message = f'You unfollowed {target_profile.user.username}'
        action = 'unfollowed'
    else:
        my_profile.following.add(target_profile.user)
        message = f'You followed {target_profile.user.username}'
        action = 'followed'

    return Response({
        'status': 'success',
        'action': action,
        'message': message,
        'follower_count': my_profile.following.count(),
    }, status=status.HTTP_200_OK)
