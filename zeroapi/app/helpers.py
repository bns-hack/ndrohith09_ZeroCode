import httpx
import base64

def copy_files_to_folder(repo_owner, repo_name, folder_path, files, access_token):

    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github.v3+json"
    }

    for file_path in files:
        with open(file_path, "rb") as file:
            content = file.read()
            file_content_base64 = base64.b64encode(content).decode()

        file_name = file_path.split("/")[-1]
        target_path = f"{folder_path}/{file_name}"

        url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{target_path}"

        payload = {
            "message": "Created Base Files",
            "content": file_content_base64,
            "branch": "main"
        }

        response = httpx.put(url, headers=headers, json=payload)

        if response.status_code == 201:
            print(f"File {file_name} copied successfully.")

        else:
            print(f"Failed to copy file {file_name}.")
            print(response.json())
            return {
                "message": f"Failed to copy file {file_name}.",
                "data": response.json()
            }
    return {
        "message": "Files copied successfully.",
        "data": response.json()
    }

def create_table_query(json_data , repo_owner, repo_name, access_token):
    
    # Extract values from JSON data
    table_name = json_data["table_name"].capitalize().replace(" ", "_")
    columns = json_data["columns"]
    folder_path = json_data["project_name"]
    user_name = json_data["user_name"]
    
    ''''
    GET baseapi.py and its content
    '''
    file_name = "baseapi.py"
    target_path = f"{user_name}-{folder_path}/{file_name}"
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github.v3+json"
    }

    url = f"https://api.github.com/repos/{repo_owner}/{repo_name}/contents/{target_path}"
    response = httpx.get(url, headers=headers)
    response_json = response.json() 

    # Decode the content from base64 
    content = base64.b64decode(response_json["content"]).decode("utf-8")

    '''
    #!Create the query
    '''
    column_definitions = ', '.join(f"{column['name']} {column['type']}" for column in columns)
    query = f"CREATE TABLE IF NOT EXISTS {table_name} (id SERIAL PRIMARY KEY, {column_definitions})"
    print(query)

    '''
    #!Create query in main function
    '''
    execution_string =  f"cursor.execute('{query}') \n    conn.commit()"
    updated_content = content.replace("def main():", f"def main():\n    {execution_string}")

    '''
    #!Create DataClass for the Table 
    '''
    dataclass_string = "#*Dataclasses\n@strawberry.type\n"
    dataclass_string += f"class {table_name}:\n"
    column_names = [column["name"] for column in columns]
    column_names.insert(0, "id")
    for column in column_names:
        dataclass_string += f"    {column}: str\n"
    
    updated_content = updated_content.replace("#*Dataclasses", dataclass_string)

    '''
    #!Create Query Function for the Table
    '''
    
    query_string = f'''#*graphquery
    @strawberry.field
    def all_{table_name.lower()}(self) -> typing.List[{table_name}]:
        cursor.execute("SELECT * FROM {table_name}")
        lst = cursor.fetchall()
        {table_name.lower()} = []
        for i in lst:
            {table_name.lower()}.append({table_name}({', '.join(f"{column}=i[{index}]" for index, column in enumerate(column_names))}))
        return {table_name.lower()}

    @strawberry.field
    def get_{table_name.lower()}(self, id: str) -> {table_name}:
        cursor.execute("SELECT * FROM {table_name} WHERE id = %s", (id,))
        lst = cursor.fetchone()
        return {table_name}({', '.join(f"{column}=lst[{index}]" for index, column in enumerate(column_names))})
    '''
    updated_content = updated_content.replace("#*graphquery", query_string)

    '''
    #!Create Mutation Function for the Table
    '''
    mutation_string = f'''#*graphmutation
    @strawberry.mutation
    def create_{table_name.lower()}(self, {', '.join(f"{column['name']}: str" for column in columns)}) -> {table_name}:
        cursor.execute("INSERT INTO {table_name} ({', '.join(column['name'] for column in columns)}) VALUES ({', '.join('%s' for column in columns)}) RETURNING id", ({', '.join(column['name'] for column in columns)}))
        conn.commit()
        {table_name.lower()}_id = cursor.fetchone()[0]
        return {table_name}(id={table_name.lower()}_id,{', '.join(f"{column['name']}={column['name']}" for column in columns)})
    
    @strawberry.mutation
    def update_{table_name.lower()}(self, id: str, {', '.join(f"{column['name']}: str" for column in columns)}) -> {table_name}:
        
        cursor.execute("UPDATE {table_name} SET {', '.join(f"{column['name']}=%s" for column in columns)} WHERE id = %s", ({', '.join(column['name'] for column in columns)}, id))
        conn.commit()
        return {table_name}(id=id,{', '.join(f"{column['name']}={column['name']}" for column in columns)})
    
    @strawberry.mutation
    def delete_{table_name.lower()}(self, id: str) -> {table_name}:
        cursor.execute("SELECT * FROM {table_name} WHERE id = %s", (id,))
        lst = cursor.fetchone()
        if lst is None:
            return {table_name}(id='No Data Found',{', '.join(f"{column['name']}='No Data Found'" for column in columns)})

        cursor.execute("DELETE FROM {table_name} WHERE id = %s", (id,))
        conn.commit()
        return {table_name}({', '.join(f"{column}=lst[{index}]" for index, column in enumerate(column_names))})
    '''
    updated_content = updated_content.replace("#*graphmutation", mutation_string)

    '''
    #!Commit the changes to baseapi.py
    '''
    encoded_content = base64.b64encode(updated_content.encode()).decode()

    data = {
        "message": f"Initialised graphql {table_name} functions",
        "content": encoded_content,
        "sha": response_json["sha"]
    }

    response = httpx.put(url, headers=headers, json=data)
    print(response.json()) 

    if response.status_code == 200:
        print(f"Successfully updated {file_name}.")
        return {
            "message": f"Successfully updated {file_name}.",
            "data": response.json()
        }
    else:
        print(f"Failed to update {file_name}.")
        print(response.json())
        return {
            "message": f"Failed to update {file_name}.",
            "data": response.json()
        }
    