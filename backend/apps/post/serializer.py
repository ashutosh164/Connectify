from rest_framework import serializers
from .models import Posts, Like, Comment
# from django.contrib.auth.models import User
from django.contrib.auth import get_user_model
from django.db.models import Q
User = get_user_model()
from apps.account.models import Profiles
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from ..account.serializers import ProfileSerializer, CurrentUserProfileSerializer


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User(email=validated_data['email'], username=validated_data['username'])
        user.set_password(validated_data['password'])
        user.save()
        return user


class LikeSerializer(serializers.ModelSerializer):

    class Meta:
        model = Like
        fields = '__all__'

    def create(self, validated_data):
        # data = validated_data.get('user')
        # user = self.context['request'].user
        user = validated_data.get('user')
        post = validated_data.get('post')
        if user in post.liked.all():
            post.liked.remove(user)
        else:
            post.liked.add(user)
        like, created = Like.objects.get_or_create(**validated_data)
        if not created:
            if like.value == 'Like':
                like.value = 'Unlike'
            else:
                like.value = 'Like'
        like.save()
        return like

        # post_obj = Posts.objects.get(title=post)
        # print(post_obj.id)
        # filter_post_in_like = Like.objects.filter(Q(post_id=post.id) & Q(user_id=user.id)).values('value').exists()
        # print(filter_post_in_like)
        # print(post.liked.all())
        # if filter_post_in_like:
        #     print('yes baby')
        #     Like.objects.get(user_id=user.id).delete()

        # like, created = Like.objects.get_or_create(**validated_data)
        # if not created:
        #     if like.value == 'Like':
        #         like.value = 'Unlike'
        #     else:
        #         like.value = 'Like'
        # like.save()
        # return like


# class ProfileSerializer(serializers.ModelSerializer):
#     user = RegisterSerializer()
#
#     class Meta:
#         model = Profiles
#         fields = '__all__'


class CommentPagination(PageNumberPagination):
    page_size = 3  # comments per page

class CommentSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.username', read_only=True, required=False)
    profile_image = serializers.SerializerMethodField()
    user_role = serializers.SerializerMethodField()

    def get_profile_image(self, obj):
        request = self.context.get("request")
        profile = getattr(obj.user, "profiles", None)  # safer
        if profile and profile.image:
            image_url = profile.image.url
            if request is not None:
                return request.build_absolute_uri(image_url)
            return image_url
        return None

    def get_user_role(self, obj):
        profile = getattr(obj.user, "profiles", None)
        if profile and profile.role:
            return profile.role
        return None

    class Meta:
        model = Comment
        fields = ['id','post', 'body', 'updated_on', 'created_on', 'user_name', 'profile_image', 'user_role', 'user']


class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ["id", "username", "email", "profile"]


class PostSerializer(serializers.ModelSerializer):
    # user_name = serializers.CharField(source='author.username', read_only=True, required=False)
    user_name = serializers.SerializerMethodField()
    # profiles = serializers.SerializerMethodField('get_profile_by_author_of_the_post')
    check_user_like_post = serializers.SerializerMethodField('check_current_user_liked_post')
    total_like = serializers.SerializerMethodField('total_like_per_post')
    total_comment = serializers.SerializerMethodField('total_comment_per_post')
    cehck_current_user_like_the_post = serializers.SerializerMethodField('get_check_user_like_post')
    comments = CommentSerializer(many=True, read_only=True)  # nested serializer
    user_commented = serializers.SerializerMethodField()
    author_profile = ProfileSerializer(source='author.profiles', read_only=True)

    def get_user_name(self, instance):
        return f'{instance.author.first_name} {instance.author.last_name}'.strip() if instance.author.first_name else f'{instance.author.username}'.strip()

    def check_current_user_liked_post(self, instance):
        liked_data = list(instance.liked.values_list(flat=True))
        user_id = self.context['request'].user.id
        result = filter(lambda x: x == user_id, liked_data)
        return result

    def get_user_commented(self, obj):
        request = self.context.get('request')  # current request
        if not request or not request.user.is_authenticated:
            return False
        return obj.comments.filter(user=request.user).exists()

    def get_check_user_like_post(self, instance):
        user = self.context['request'].user
        if user.is_authenticated:
            return instance.liked.filter(id=user.id).exists()
        return False

    def total_like_per_post(self, instance):
        total = instance.liked.all().count()
        return total

    def total_comment_per_post(self, instance):
        total = instance.comments.all().count()
        return total

    # def get_paginated_comments(self, obj):
    #     request = self.context.get('request')
    #     comments = Comment.objects.filter(post=obj).order_by('-created_on')
    #     paginator = CommentPagination()
    #     paginated_comments = paginator.paginate_queryset(comments, request)
    #     serializer = CommentSerializer(paginated_comments, many=True, context={'request': request})
    #     return serializer.data

    class Meta:
        model = Posts
        # fields = '__all__'
        fields = ['id', 'title', 'image', 'liked','author_profile',
                  'author', 'created_on','updated_on',
                   'user_commented', 'comments',
                  'cehck_current_user_like_the_post','total_comment',
                  'total_like','check_user_like_post','user_name', 'total_repost']









