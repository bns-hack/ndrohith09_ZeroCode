from django.db import models

# Create your models here.
class ZeroUser(models.Model):
    uid = models.AutoField(primary_key=True , unique=True)
    username = models.CharField(max_length=100 )
    projects = models.JSONField(default=list) 
    # is_deployed = models.BooleanField(default=False) 
    # env_id = models.CharField(max_length=100 , default="")

    def __str__(self):
        return self.username 
        