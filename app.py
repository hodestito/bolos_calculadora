from flask import Flask
from flask_pymongo import PyMongo
import os

app = Flask(__name__)
user = os.getenv("USR")
password = os.getenv("PWD")
app.config["MONGO_URI"] = "mongodb://"+ user + ":"+ password +"@ds131139.mlab.com:31139/heroku_nqgpg0ph?retryWrites=false"
mongo = PyMongo(app)


# https://www.roytuts.com/python-flask-rest-api-mongodb-crud-example/

