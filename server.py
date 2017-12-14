import sys
import json
import time

sys.path.append("./cloudant-api")

import requests
from flask import Flask, render_template, jsonify, request

from cred import arabic_ref_api
from cloudant_api.api import DatabaseHandler

db = DatabaseHandler(arabic_ref_api)

app = Flask(
            __name__,
            template_folder="client",
            static_folder="client",
            static_url_path=""
)

@app.route("/get_dictionary", methods=["GET"])
def get_dictionary():
    return

@app.route("/")
def main():
	return render_template("index.html")
