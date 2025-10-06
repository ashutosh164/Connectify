from rest_framework import serializers
from .models import Profiles
from django.contrib.auth.models import User


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username')
    full_name = serializers.SerializerMethodField()

    def get_full_name(self, obj):
        first = obj.user.first_name or ""
        last = obj.user.last_name or ""
        return f"{first} {last}".strip()

    class Meta:
        model = Profiles
        fields = '__all__'


class CurrentUserProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    # image_url = serializers.SerializerMethodField()
    #
    #
    # def get_image_url(self, obj):
    #     request = self.context.get("request")
    #     print(obj.image)
    #     if obj.image and request:
    #         return request.build_absolute_uri(obj.image.url)
    #     return None

    class Meta:
        model = Profiles
        fields = '__all__'

        # fields = ["id","username","email","first_name","last_name",
        #           "bio","date_of_birth","image","mob","role",
        #           "company","about","joined_on",]