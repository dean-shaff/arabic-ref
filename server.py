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

@app.route("/add_word", methods=["POST"])
def add_word():
    if request.method == "POST":
        data = request.values
        en = request.values["en"]
        ar = request.values["ar"]
        dh = DatabaseHandler(arabic_ref_api)
        resp = dh.update_db({
            "ar":{"fos7a":ar},
            "en":[en],
            "example": {
                "en": [],
                "ar": []
            },
            "category": []
        })
        print(resp)

    return jsonify({"success":True})

@app.route("/get_dictionary", methods=["GET"])
def get_dictionary():
    dh = DatabaseHandler(arabic_ref_api)
    db = dh.get_db(data={"include_docs":True})
    return jsonify(db)

@app.route("/")
def main():
	return render_template("index.html")
