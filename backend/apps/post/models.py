from django.db import models
from django.contrib.auth.models import User
# from apps.account.models import Profiles
STATUS_CHOICES = (
    ('public', 'public'),
    ('friend', 'friend'),
    ('me', 'me'),
)

class Posts(models.Model):
    title = models.TextField(blank=True, null=True)
    image = models.ImageField(blank=True, null=True, upload_to='post')
    liked = models.ManyToManyField(User, default=None, blank=True, related_name='liked')
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True, db_index=True)
    updated_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now=True, db_index=True)
    reposted_from = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True)
    total_repost = models.PositiveIntegerField(default=0, db_index=True)
    is_repost = models.BooleanField(default=False, db_index=True)
    original_post = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='reposts', db_index=True)
    status = models.CharField(choices=STATUS_CHOICES, default='public', max_length=10,  db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['author', 'created_on']),
            models.Index(fields=['is_repost', 'created_on']),
        ]


    def __str__(self):
        return self.title

    def num_like(self):
        return self.liked.all().count()


LIKE_CHOICES = (
    ('Like', 'Like'),
    ('Unlike', 'Unlike'),
)


class Like(models.Model):
    objects = models.Manager()
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    post = models.ForeignKey(Posts, on_delete=models.CASCADE, db_index=True)
    value = models.CharField(choices=LIKE_CHOICES, default='Like', max_length=10)

    def __str__(self):
        return self.value

    class Meta:
        indexes = [
            models.Index(fields=['user', 'post']),
            models.Index(fields=['post', 'value']),
        ]


class Comment(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    post = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name='comments', db_index=True)
    body = models.CharField(max_length=250, blank=True, null=True)
    updated_on = models.DateTimeField(auto_now_add=True)
    created_on = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return self.body

    class Meta:
        ordering = ['-created_on']
        indexes = [
            models.Index(fields=['post', 'created_on']),
            models.Index(fields=['user', 'created_on']),
        ]






