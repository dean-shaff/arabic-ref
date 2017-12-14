from __future__ import print_function

import sys
import os
import json
import uuid

cur_dir = os.path.dirname(os.path.abspath(__file__))

def update_cloudant_dictionaries(data):

    sys.path.append("/home/dean/web/cloudant-api")

    from cloudant_api.api import DatabaseHandler

    from cred import arabic_ref_api
    dh = DatabaseHandler(arabic_ref_api)
    print(dh.update_db(data))

def process_dictionary(in_path, out_path=None):

    with open(in_path, "r") as f:
        data = json.load(f)
    en_dict = {}
    index_dict = {}
    ar_dict = {}
    keyword_dict = {}
    for entry in data:
        ar = entry['ar']
        en = entry['en']
        unique_id = str(uuid.uuid4())
        index_dict[unique_id] = entry
        for cat in entry["category"]:
            if cat not in keyword_dict:
                keyword_dict[cat] = []
            keyword_dict[cat].append(unique_id)
        if not isinstance(ar, dict):
            ar = {"fos7a":ar}
        if not isinstance(en, list):
            en = [en]

        for dialect in ar:
            if not isinstance(ar[dialect], list):
                dialect_list = [ar[dialect]]
            else:
                dialect_list = ar[dialect]
            for word in dialect_list:
                ar_dict[word] = {'en':en, "index":unique_id, "dialect":dialect}
        for word in en:
            en_dict[word] = {'ar':ar, "index":unique_id}
    data_js = {
        "__en_to_ar__":en_dict,
        "__ar_to_en__":ar_dict,
        "__dict_index__":index_dict,
        "__keywords__":keyword_dict,
    }
    if out_path is not None:
        print("Writing data out to {}".format(out_path))
        with open(out_path, "w") as f:
            for var_name in data_js:
                data_entry = data_js[var_name]
                f.write("{}={}\n".format(var_name, json.dumps(data_entry)))

    return data


if __name__ == '__main__':
    data = process_dictionary(os.path.join(cur_dir, "dictionary.json"),
                        os.path.join(cur_dir, "dictionary.js"))
    update_cloudant_dictionaries(data)
