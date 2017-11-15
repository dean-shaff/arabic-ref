import os
import json

cur_dir = os.path.dirname(os.path.abspath(__file__))

def process_dictionary(in_path, out_path):
    with open(in_path, "r") as f:
        data = json.load(f)
    reversed_data = {}
    for en_word in data:
        ar_word = data[en_word]
        if not isinstance(ar_word, list):
            ar_word = [ar_word]
        for ar in ar_word:
            if ar in reversed_data:
                reversed_data[ar] = [reversed_data[ar]]
                reversed_data[ar].append(en_word)
            else:
                reversed_data[ar] = en_word
    en_to_ar = json.dumps(data)
    ar_to_en = json.dumps(reversed_data)

    with open(out_path, "w") as f:
        f.write("en_to_ar={}".format(en_to_ar))
        f.write("\n")
        f.write("ar_to_en={}".format(ar_to_en))


if __name__ == '__main__':
    process_dictionary(os.path.join(cur_dir, "dictionary.json"),
                        os.path.join(cur_dir, "dictionary.js"))
