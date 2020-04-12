from flask import Flask
from flask_pymongo import PyMongo
import os

app = Flask(__name__)
user = os.getenv("USR")
password = os.getenv("PWD")
uri = os.getenv("MONGOURI")
app.config["MONGO_URI"] = uri
mongo = PyMongo(app)


# https://www.roytuts.com/python-flask-rest-api-mongodb-crud-example/

