import json

import requests

class DatabaseHandler(object):

    def __init__(self, cred):
        """
        Log into the cloudant server and grab the db.
        args:
            - cred: A python dict with the following keys:
                - db: the name of the database
                - api_key: the api key
                - api_pass: the 'password' for the api key
        """
        self.client = requests.session()
        self.client.auth = (cred['api_key'], cred['api_pass'])
        # self.client.headers = {'Content-Type':'application/json'}
        self.client.headers = {'Content-Type':'text/plain'}
        self.uri = "https://dshaff001.cloudant.com/{}"
        self.uri_db = self.uri.format(cred['db']) + "/{}"
        self.db_name = cred['db']

    def get_db(self,data=None):
        """
        Get the contents of the entire database
        """
        self.client.headers = {'Content-Type':'text/plain'}
        if data is None: data = {}
        resp = self.client.request("GET", self.uri_db.format("_all_docs"),params=data)
        return resp.json()

    def __getitem__(self,_id):
        """
        get an item from the database by id
        Args:
            id (str): the id of the db item
        """
        resp = self.client.request("GET",self.uri_db.format(_id))
        return resp.json()

    def update_db(self,data):
        """
        Update an item or items in the database
        Args:
            data (list): A list of entries to update or add. If they don't exist,
                they will be created, otherwise they'll be updated (provided
                there is a _id field).
        """
        self.client.headers = {'Content-Type':'application/json'}
        if not isinstance(data, list):
            data = [data]
        resp = self.client.request("POST", self.uri_db.format("_bulk_docs"),data=json.dumps({"docs":data}))
        return resp
