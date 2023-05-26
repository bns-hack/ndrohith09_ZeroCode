from django.urls import path
from .views import *

urlpatterns = [ 
    path('gh-authorize/',GithubLogin.as_view()),
    path('callback-code/',GithubCallback.as_view()),
    path('project/',Project.as_view()),
    path('table/',  Tables.as_view()),
    path('production/', Production.as_view()),
]