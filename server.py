import sys
import json
import time

sys.path.append("./cloudant-api")

import requests
from flask import Flask, render_template, jsonify, request

from cred import arabic_ref_api
from cloudant_api.api import DatabaseHandler


app = Flask(
            __name__,
            template_folder="client",
            static_folder="client",
            static_url_path=""
)

@app.route("/get_dictionary", methods=["GET"])
def get_dictionary():
    dh = DatabaseHandler(arabic_ref_api)
    db = dh.get_db(data={"include_docs":True})
    return jsonify(db)

@app.route("/")
def main():
	return render_template("index.html")
