import json
import bcrypt
from db import users

with open("../database/users.json") as f:
    data=json.load(f)

for u in data:

    hashed=bcrypt.hashpw(u["password"].encode(),bcrypt.gensalt())

    user={
        "name":u["name"],
        "email":u["email"],
        "password":hashed,
        "phone":u["phone"],
        "role":u["role"],
        "trustScore":u["trustScore"]
    }

    try:
        users.insert_one(user)
        print("Inserted:",u["email"])
    except:
        print("User exists:",u["email"])