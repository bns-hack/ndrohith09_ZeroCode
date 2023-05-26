from django.shortcuts import render , redirect
import httpx
# Authentication PermissionS
from app.models import *
from app.serializers import *
from app.helpers import *
# RESTFRAMEWORK
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
# RESPONSE IMPORT 
from zeroapi.responsecode import display_response , SUCCESS , exceptionmsg , exceptiontype
from dotenv import load_dotenv
import os
load_dotenv()

github_client_id = os.environ.get('GH_CLIENT_ID')
github_client_secret = os.environ.get('GH_SECRET_ID')
access_token = os.environ.get('GH_ACCESS_TOKEN')
repo_owner = os.environ.get('GH_REPO_OWNER') 
repo_name = os.environ.get('GH_REPO_NAME')
bunny_api = os.environ.get('BUNNY_API')
bunny_env_id = os.environ.get('BUNNY_ENV_ID')

class GithubLogin(APIView):
    def get(self , request):
        url = f'https://github.com/login/oauth/authorize?client_id={github_client_id}&scope=repo'
        return display_response(
                action = "Redirecting to Github Login Page" ,
                response = url ,
                statuscode = status.HTTP_200_OK
        )   
class GithubCallback(APIView):

    def get(self , request):
        code = request.query_params.get("code")
        print("code",code)
        params = {
            'client_id' : github_client_id,
            'client_secret' : github_client_secret,
            'code' : code
        }
        headers = {'Accept': 'application/json'}

        client = httpx.Client()
        response = client.post(url='https://github.com/login/oauth/access_token',params=params, headers=headers)
    
        response_json = response.json()
        print("response_json",response_json)
        access_token=response_json['access_token']  

        # async with httpx.AsyncClient() as client:
        headers.update({'Authorization': f'Bearer {access_token}'})
        response = client.get('https://api.github.com/user', headers=headers)

        print(response.json()['login'])
        print(type(response.json()['login']))

        # check if user exists in database . If not , create a new entry in ZeroUser
        zero_user = ZeroUser.objects.filter(username=response.json()['login'])
        if zero_user.exists():
            message = "User already exists in database"
        else :
            zero_user = ZeroUser.objects.create(username=response.json()['login'])
            message = "User added to database"
        json_data = {
            "gh_token" : access_token,
            "gh_user" : response.json()['login'],
            "message" : message
        }
        return  display_response(
                action = "Github Login" ,
                response = json_data ,
                statuscode = status.HTTP_200_OK
        )

class Project(APIView):

    def get(self , request):
        user_name = request.query_params.get("user_name")

        get_projects = ZeroUser.objects.filter(username=user_name).first()
        print("get_projects",get_projects , type(get_projects))
        if get_projects is None:
            return display_response(
                action = "Get Project" ,
                response = "User does not exist" ,
                statuscode = status.HTTP_400_BAD_REQUEST
            )
        else:
            print("get_projects.projects",get_projects.projects)
            json_data = []
            for i in get_projects.projects:
                print("i",i)
                data = {
                    "name" : i['name'],
                    "tables" : i['tables'],
                    "is_deployed" : i['is_deployed'],
                    "env_id" : i['env_id'],
                }
                json_data.append(data)

            return display_response(
                action = "Get Project" ,
                response = {
                    "projects" : json_data, 
                } ,
                statuscode = status.HTTP_200_OK
            )

    def post(self , request):

        # body data 
        user_name = request.data.get("user_name")
        project_name = request.data.get("project_name")

        folder_path = f'{user_name}-{project_name}'
        files_to_copy = ["app/base/docker-compose.yaml", "app/base/Dockerfile", "app/base/requirements.txt" , "app/base/baseapi.py"]

        # check if project exists in database . If not , create a new entry in ZeroProject
        zero_project = ZeroUser.objects.filter(username=user_name).first()
        for project in zero_project.projects:
            if project['name'] == project_name:
                message = "Project already exists in database"
                return  display_response(
                    action = "Create Project" , 
                    response = message ,
                    statuscode = status.HTTP_400_BAD_REQUEST
                )
                     
        json_data = {
            "name" : project_name,
            'tables' : [],
            "is_deployed": False,
            "env_id": "",
        }
        print("json_data",zero_project.projects)
        zero_project.projects.append(json_data) 
        zero_project.save() 

        print("Copying files to folder")
        res = copy_files_to_folder(repo_owner, repo_name, folder_path, files_to_copy, access_token) 
        print(res)
        return display_response(
                action = "Create Project" ,
                response = res ,
                statuscode = status.HTTP_200_OK
        )
    
class Tables(APIView):

    def get(self,request):
        user_name = request.query_params.get("user_name")
        project_name = request.query_params.get("project_name")

        get_tables = ZeroUser.objects.filter(username=user_name).first()
        if get_tables is None:
            return display_response(
                action = "Get Tables" ,
                response = "User does not exist" ,
                statuscode = status.HTTP_400_BAD_REQUEST
            )
        else:
            json_data = {
                "name" : project_name,
                'tables' : [],
                "is_deployed": "",
                "env_id": ""
            }
            for i in get_tables.projects:
                if i['name'] == project_name:
                    json_data['tables'] = i['tables']
                    json_data['env_id'] = i['env_id']
                    json_data['is_deployed'] = i['is_deployed']
                    break 
            return display_response(
                action = "Get Tables" ,
                response = json_data,
                statuscode = status.HTTP_200_OK
            )
        
    def post(self,request):
        ''''
        "table_name": "books",
        "columns": [
            {
                "name": "title",
                "type": "VARCHAR(255)"
            },
            {
                "name": "instructor",
                "type": "VARCHAR(255)"
            }
        ] , 
        "project_name" : "test",
        "user_name" : "test"
    '''        
        table_name = request.data.get("table_name")
        columns = request.data.get("columns") 
        project_name = request.data.get("project_name")
        user_name = request.data.get("user_name")

        json_data = {
        "table_name" : table_name,
        "columns" : columns ,
        "project_name" : project_name,
        "user_name" : user_name
        }
        print("json_data",json_data)
        response = create_table_query(json_data , repo_owner, repo_name, access_token)

        # append table to tables list in ZeroProject
        zero_project = ZeroUser.objects.filter(username=user_name).first() 
        for project in zero_project.projects:
            if project['name'] == project_name:
                print("project",project['tables'])
                project['tables'].append({
                    "table_name" : table_name,
                    "columns" : columns
                })
                break
        zero_project.save()
        return display_response(
                action = "Create Table" ,
                response = "Table created successfully" ,
                statuscode = status.HTTP_200_OK
        )

'''
Bunny Shell API
'''

class Production(APIView):

    def get(self, request):
        env_id = request.query_params.get("env_id")
        url = "https://api.environments.bunnyshell.com/v1/environments/"+env_id

        headers = {
            "accept": "application/hal+json",
            "content-type": "application/json",
            "X-Auth-Token": bunny_api
        }

        response = httpx.get(url, headers=headers) 
        return display_response(
                action = "Get Production Environment" ,
                response = response.json() ,
                statuscode = status.HTTP_200_OK
        )

    def post(self , request):
        
        ''''
        "project_name" : "test",
        "user_name" : "test"
        ''' 
        user_name = request.data.get("user_name") 
        project_name = request.data.get("project_name")

        env_url = "https://api.environments.bunnyshell.com/v1/environments/"+bunny_env_id+"/clone" 

        payload = {"name": user_name+"-"+project_name}
        headers = {
            "accept": "application/hal+json",
            "content-type": "application/json",
            "X-Auth-Token": bunny_api
        }

        try:
            env_response = httpx.post(env_url, json=payload, headers=headers) 
        except httpx.HTTPError as exc:
            print(exc)
            return display_response(
                action = "Failed to create Production Environment" , 
                response = exc ,
                statuscode = status.HTTP_424_FAILED_DEPENDENCY
            )
        
        deploy_url = f"https://api.environments.bunnyshell.com/v1/environments/{env_response.json()['id']}/deploy"
        try:
            deploy_response = httpx.post(deploy_url, headers=headers) 
        except httpx.HTTPError as exc:
            print(exc)
            return display_response(
                action = "Failed to deploy in production environment" , 
                response = exc ,
                statuscode = status.HTTP_424_FAILED_DEPENDENCY
            )
        
        json_data = {
            "id" : env_response.json()['id'],
            "name" : env_response.json()['name'],
            "namespace" : env_response.json()['namespace'],
            "operationStatus" : env_response.json()['operationStatus'],
            "deploy_type" : deploy_response.json()['type'],
        } 

        # update deploy field and env_id in ZeroProject
        zero_project = ZeroUser.objects.filter(username=user_name).first()
        for project in zero_project.projects:
            if project['name'] == project_name:
                project['is_deployed'] = True
                project['env_id'] = env_response.json()['id']
                break
        zero_project.save()
        return display_response(
                action = "Create Production Environment" , 
                response = json_data ,
                statuscode = status.HTTP_200_OK
            )
    
    def put(self , request):
        env_id = request.data.get("env_id")
        url = f"https://api.environments.bunnyshell.com/v1/environments/{env_id}/deploy"

        headers = {
            "accept": "application/hal+json",
            "content-type": "application/json",
            "X-Auth-Token": bunny_api
        }
        response = httpx.post(url, headers=headers)
        return display_response(
                action = "Re Deploy in Production Environment" ,
                response = response.json() ,
                statuscode = status.HTTP_200_OK
        )
    
    def delete(self, request):
        env_id = request.data.get("env_id")
        project_name = request.data.get("project_name")
        user_name = request.data.get("user_name")
        url = f"https://api.environments.bunnyshell.com/v1/environments/{env_id}/delete"

        headers = {
            "accept": "application/hal+json",
            "content-type": "application/json",
            "X-Auth-Token": bunny_api
        }

        response = httpx.post(url, headers=headers)

        # update deploy field and env_id in ZeroProject
        zero_project = ZeroUser.objects.filter(username=user_name).first()
        for project in zero_project.projects:
            if project['name'] == project_name:
                project['is_deployed'] = False
                project['env_id'] = ""
                break
        zero_project.save()

        return display_response(
                action = "Delete Production Environment" ,
                response = response.json() ,
                statuscode = status.HTTP_200_OK
        )