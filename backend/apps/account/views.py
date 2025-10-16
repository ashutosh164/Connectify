from django.shortcuts import render, get_object_or_404
from rest_framework import viewsets, status

from rest_framework.decorators import action
from rest_framework.views import APIView

from .serializers import *
from rest_framework.authentication import TokenAuthentication
from .models import *
from .serializers import ProfileSerializer
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Profiles


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

    @action(detail=False, methods=["get"], url_path="exclude-me")
    def exclude_me(self, request):
        queryset = self.filter_queryset(self.get_queryset().exclude(user=request.user))

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


# class CurrentUserProfileView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         profile = Profiles.objects.filter(user=request.user).first()
#         if not profile:
#             return Response({"error": "Profile not found"}, status=204)
#         serializer = CurrentUserProfileSerializer(profile, context={"request": request})
#         return Response(serializer.data)
#
#
# class ProfileListWithoutCurrentUserView(APIView):
#     authentication_classes = [TokenAuthentication]
#     permission_classes = [IsAuthenticated]
#
#     def get(self, request):
#         print('me======')
#         try:
#             profiles = Profiles.objects.exclude(user=request.user)
#             serializer = CurrentUserProfileSerializer(
#                 profiles, many=True, context={"request": request}
#             )
#             return Response(serializer.data, status=status.HTTP_200_OK)
#         except Exception as ex:
#             return Response({'success':f'{ex}'}, status=status.HTTP_204_NO_CONTENT)




@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_unfollow_profile(request):
    user = request.user
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


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_invitation(request):
    try:
        user = request.user
        profile_id = request.data.get('profile_id')
        sender = Profiles.objects.get(user=user)
        receiver = Profiles.objects.get(id=profile_id)
        relation = Relationship.objects.create(sender=sender, receiver=receiver, status='send')
        return Response({'status': 'success',}, status=status.HTTP_200_OK)
    except Exception as ex:
        return Response({'error': f'{ex}', }, status=status.HTTP_400_BAD_REQUEST)



@api_view(['POST'])
@permission_classes([IsAuthenticated])
def accept_invitation(request):
    try:
        user = request.user
        profile_id = request.data.get('profile_id')
        receiver = Profiles.objects.get(user=user)
        sender = Profiles.objects.get(id=profile_id)
        relation = get_object_or_404(Relationship, sender=sender, receiver=receiver)
        if relation.status == 'send':
            relation.status = 'accepted'
            relation.save()
            return Response({'status': 'success', }, status=status.HTTP_200_OK)
    except Exception as ex:
        return Response({'error': f'{ex}', }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reject_invitation(request):
    try:
        user = request.user
        profile_id = request.data.get('profile_id')
        sender = Profiles.objects.get(id=profile_id)
        receiver = Profiles.objects.get(user=user)
        relation = get_object_or_404(Relationship, sender=sender, receiver=receiver)
        relation.delete()
        return Response({'status': 'success', }, status=status.HTTP_200_OK)
    except Exception as ex:
        return Response({'error': f'{ex}', }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invite_profile_list_view(request):
    user = request.user
    qs = Profiles.objects.get_all_profiles_to_invite(user)
    serializer = ProfileSerializer(qs, many=True, context={'request': request})

    return Response( serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def invites_received_view(request):
    profile = Profiles.objects.get(user=request.user)
    qs = Relationship.objs.invatations_received(profile)
    results = list(map(lambda x: x.sender,qs))
    is_empty = False
    if len(results) == 0:
        is_empty = True
    serializer = ProfileSerializer(results, many=True, context={'request': request})
    return Response({'is_empty':is_empty, 'data': serializer.data}, status=status.HTTP_200_OK)



