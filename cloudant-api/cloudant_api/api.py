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
        print(data)
        resp = self.client.request("GET", self.uri_db.format("_all_docs"),params=data)
        print(resp.status_code)
        return resp.json()

    def __getitem__(self,_id):
        """
        get an item from the database by id
        args:
            - id: the id of the db item
        """
        resp = self.client.request("GET",self.uri_db.format(_id))
        return resp.json()

    # def update_entry(self, id, item):
    #     resp = self.client.request("PUT",self.uri_db.format(id),data=json.dumps(item))
    #     return resp
    #
    # def add_entry(self, item, id=None):
    #     if id is None:
    #         resp = self.client.request("POST",self.uri.format(self.db_name),data=json.dumps(item))
    #     else:
    #         resp = self.update_entry(id, item)
    #     return resp

    def update_db(self,data):
        """
        Update an item or items in the database
        Args:
            data (list):
        """
        self.client.headers = {'Content-Type':'application/json'}
        if not isinstance(data, list):
            data = [data]
        resp = self.client.request("POST", self.uri_db.format("_bulk_docs"),data=json.dumps({"docs":data}))
        return resp
