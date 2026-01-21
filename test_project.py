import os
import sys
from datetime import datetime

import requests

filename = input("filename=")

logs_service_url = os.getenv("LOGS_SERVICE_URL", "http://localhost:3001")
users_service_url = os.getenv("USERS_SERVICE_URL", "http://localhost:3002")
costs_service_url = os.getenv("COSTS_SERVICE_URL", "http://localhost:3003")
admin_service_url = os.getenv("ADMIN_SERVICE_URL", "http://localhost:3004")
user_id = int(os.getenv("TEST_USER_ID") or os.getenv("INITIAL_USER_ID") or "123123")
report_year = int(os.getenv("REPORT_YEAR", datetime.utcnow().year))
report_month = int(os.getenv("REPORT_MONTH", datetime.utcnow().month))

output = open(filename, "w")
sys.stdout = output

print("logs_service_url=" + logs_service_url)
print("users_service_url=" + users_service_url)
print("costs_service_url=" + costs_service_url)
print("admin_service_url=" + admin_service_url)

print()

print("testing getting the about")
print("-------------------------")

try:
    text = ""
    url = admin_service_url + "/api/about/"
    data = requests.get(url)
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(data.json())
except Exception as e:
    print("problem")
    print(e)

print("")
print()

print("testing getting the report - 1")
print("------------------------------")

try:
    text = ""
    url = costs_service_url + f"/api/report/?id={user_id}&year={report_year}&month={report_month}"
    data = requests.get(url)
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)
except Exception as e:
    print("problem")
    print(e)

print("")
print()

print("testing adding cost item")
print("----------------------------------")

try:
    text = ""
    url = costs_service_url + "/api/add/"
    data = requests.post(
        url,
        json={
            'userid': user_id,
            'description': 'milk 9',
            'category': 'food',
            'sum': 8
        }
    )
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
except Exception as e:
    print("problem")
    print(e)

print("")
print()

print("testing getting the report - 2")
print("------------------------------")

try:
    text = ""
    url = costs_service_url + f"/api/report/?id={user_id}&year={report_year}&month={report_month}"
    data = requests.get(url)
    print("url=" + url)
    print("data.status_code=" + str(data.status_code))
    print(data.content)
    print("data.text=" + data.text)
    print(text)
except Exception as e:
    print("problem")
    print(e)

print("")
