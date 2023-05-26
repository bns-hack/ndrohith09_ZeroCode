from rest_framework.serializers import ModelSerializer
from .models import *

class ZeroUserModelSerializer(ModelSerializer):
    class Meta:
        model = ZeroUser
        fields = '__all__'