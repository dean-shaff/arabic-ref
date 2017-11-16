import os
import json
import uuid

cur_dir = os.path.dirname(os.path.abspath(__file__))

def process_dictionary(in_path, out_path):
    with open(in_path, "r") as f:
        data = json.load(f)
    en_dict = {}
    index_dict = {}
    ar_dict = {}

    for entry in data:
        ar = entry['ar']
        en = entry['en']
        unique_id = str(uuid.uuid4())
        index_dict[unique_id] = {"category":entry['category'], "example":entry["example"]}
        if not isinstance(ar, dict):
            ar = {"fos7a":ar}
        if not isinstance(en, list):
            en = [en]

        for dialect in ar:
            ar_dict[ar[dialect]] = {'en':en, "index":unique_id, "dialect":dialect}
        for word in en:
            en_dict[word] = {'ar':ar, "index":unique_id}

    with open(out_path, "w") as f:
        f.write("en_to_ar={}".format(json.dumps(en_dict)))
        f.write("\n")
        f.write("ar_to_en={}".format(json.dumps(ar_dict)))
        f.write("\n")
        f.write("dict_index={}".format(json.dumps(index_dict)))


if __name__ == '__main__':
    process_dictionary(os.path.join(cur_dir, "dictionary.json"),
                        os.path.join(cur_dir, "dictionary.js"))
