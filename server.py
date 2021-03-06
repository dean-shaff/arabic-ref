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

@app.route("/remove_word", methods=["POST"])
def remove_word():
    print("remove_word: Called")
    if request.method == "POST":
        data = json.loads(request.values["data"])
        _id = data["id"]
        _rev = data["rev"]
        print("remove_word: _id: {}, _rev: {}".format(_id, _rev))
        update = {
            "_id":_id,
            "_rev":_rev,
            "_deleted": True
        }
        dh = DatabaseHandler(arabic_ref_api)
        dh.update_db(update)

    return jsonify({"sucess": True})

@app.route("/add_word", methods=["POST"])
def add_word():
    if request.method == "POST":
        data = json.loads(request.values["data"])
        en = data["en"]
        ar_fos7a = data["ar_fos7a"]
        ar_3mia = data["ar_3mia"]
        category = data["category"]
        example_en = data["example_en"]
        example_ar = data["example_ar"]
        update = {
            "ar":{"fos7a":ar_fos7a, "3mia":ar_3mia},
            "en":[en],
            "example": {
                "en": example_en,
                "ar": example_ar
            },
            "category": category
        }
        if ("_id" in data and "_rev" in data):
            update["_id"] = data["_id"]
            update["_rev"] = data["_rev"]

        dh = DatabaseHandler(arabic_ref_api)
        resp = dh.update_db(update)
        print(resp)

    return jsonify({"success":True})

@app.route("/get_dictionary", methods=["GET"])
def get_dictionary():
    print("Loading up dictionary")
    dh = DatabaseHandler(arabic_ref_api)
    db = dh.get_db(data={"include_docs":True})
    return jsonify(db)

@app.route("/")
def main():
	return render_template("index.html")
