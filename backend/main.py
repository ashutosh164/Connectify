import requests
from getpass import getpass
url = 'http://127.0.0.1:8000/auth'
auth_res = requests.post(url, json={'username':'ashu', 'password': 'Admin@123'})

print(auth_res.json())

