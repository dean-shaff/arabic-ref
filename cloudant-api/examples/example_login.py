from __future__ import print_function

from cloudant_api.api import DatabaseHandler

from .cred import citation_manager_api, arabic_ref_api

dh = DatabaseHandler(arabic_ref_api)
print(dh.get_db())
