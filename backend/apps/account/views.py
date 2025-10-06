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
    # permission_classes = [permissions.IsAuthenticated]

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