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
    keywords = []
    for entry in data:
        ar = entry['ar']
        en = entry['en']
        unique_id = str(uuid.uuid4())
        index_dict[unique_id] = {"category":entry['category'], "example":entry["example"]}
        keywords.extend(entry["category"])
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
    unique_keywords = list(set(keywords))
    with open(out_path, "w") as f:
        f.write("__en_to_ar__={}\n".format(json.dumps(en_dict)))
        f.write("__ar_to_en__={}\n".format(json.dumps(ar_dict)))
        f.write("__dict_index__={}\n".format(json.dumps(index_dict)))
        f.write("__keywords__={}\n".format(json.dumps(unique_keywords)))


if __name__ == '__main__':
    process_dictionary(os.path.join(cur_dir, "dictionary.json"),
                        os.path.join(cur_dir, "dictionary.js"))
