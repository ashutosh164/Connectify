from django.db import models
from django.contrib.auth.models import User
# from apps.account.models import Profiles


class Posts(models.Model):
    objects = models.Manager()
    title = models.TextField(blank=True, null=True)
    image = models.ImageField(blank=True, null=True, upload_to='post')
    liked = models.ManyToManyField(User, default=None, blank=True, related_name='liked')
    author = models.ForeignKey(User, on_delete=models.CASCADE, blank=True, null=True)
    updated_on = models.DateTimeField(auto_now=True)
    created_on = models.DateTimeField(auto_now=True)

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
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Posts, on_delete=models.CASCADE)
    value = models.CharField(choices=LIKE_CHOICES, default='Like', max_length=10)

    def __str__(self):
        return self.value


class Comment(models.Model):
    objects = models.Manager()
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    post = models.ForeignKey(Posts, on_delete=models.CASCADE, related_name='comments')
    body = models.CharField(max_length=250, blank=True, null=True)
    updated_on = models.DateTimeField(auto_now_add=True)
    created_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.body

    class Meta:
        ordering = ['-created_on']





