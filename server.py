import json
import time

import requests
from flask import Flask, render_template, jsonify, request

app = Flask(
            __name__,
            template_folder="client",
            static_folder="client",
            static_url_path=""
)

@app.route("/")
def main():
	return render_template("index.html")
