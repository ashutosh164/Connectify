from django.db import models
from django.contrib.auth.models import User
from apps.post.models import Posts


class Profiles(models.Model):
    objects = models.Manager()
    first_name = models.CharField(max_length=50, blank=True, null=True)
    last_name = models.CharField(max_length=50, blank=True, null=True)
    bio = models.CharField(max_length=250, blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    image = models.ImageField(default='user.png')
    mob = models.CharField(max_length=10, blank=True)
    post = models.ForeignKey(Posts, on_delete=models.DO_NOTHING, null=True, blank=True)
    following = models.ManyToManyField(User,related_name='following', blank=True)
    role = models.CharField(max_length=255, blank=True, null=True)
    company = models.CharField(max_length=255, blank=True, null=True)
    about = models.TextField(blank=True, null=True)
    joined_on = models.DateTimeField(auto_now_add=True)  # ✅ final version


    # def __str__(self):
    #     return self.first_name

    def __int__(self):
        return self.user


EMPLOYMENT_CHOICES = (
    ('Full-time', 'Full-time'),
    ('Part-time', 'Part-time'),
    ('Self-employed', 'Self-employed'),
    ('Internship', 'Internship'),
    ('Trainee', 'Trainee'),

)

class AddExperience(models.Model):
    title = models.CharField(max_length=250, blank=True, null=True)
    employment_type = models.CharField(choices=EMPLOYMENT_CHOICES, default='Internship', max_length=250)
    company = models.CharField(max_length=250, blank=True, null=True)
    current_company = models.BooleanField(default=True)
    start_date = models.DateTimeField(auto_now_add=True)
    location = models.CharField(max_length=250, blank=True, null=True)
    skills = models.TextField()
    profile = models.ForeignKey(Profiles, on_delete=models.CASCADE)


STATUS_CHOICES = (
    ('send', 'send'),
    ('accepted','accepted')
)


class RelationshipManager(models.Model):
    def invatations_received(self,receiver):
        qs = Relationship.objects.filter(receiver=receiver,status='send')
        return qs


class Relationship(models.Model):
    sender = models.ForeignKey(Profiles,on_delete=models.CASCADE,related_name='sender')
    receiver = models.ForeignKey(Profiles, on_delete=models.CASCADE, related_name='receiver')
    status = models.CharField(max_length=10 ,choices=STATUS_CHOICES)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    objs = RelationshipManager()

    def __str__(self):
        return f"{self.sender}-{self.receiver}-{self.status}"



