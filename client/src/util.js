function Util(){

    this.processCallbacks = function(callbacks){
        if (callbacks == undefined){
            callbacks = [(data)=>{}]
        }else{
            if (callbacks.constructor !== Array){
                callbacks = [callbacks]
            }
        }
        return callbacks
    }


    this.vowels = {
        damma:"u064F",
        fatha:"u064E",
        kasra:"u0650",
        sukun:"u0652",
        madda:"u0653",
    }

    /**
     * Given some word in arabic, remove all vowelization
     * @param  {String} arWord [A word in arabic with vowelization]
     * @return {String} The same word, without vowelization
     */
    this.removeVowelization = function(word){
        var escaped = escape(word).split("%").slice(1,)
        var vowelsCodes = Object.values(this.vowels)
        noVowels = escaped.filter((item) => {
            return vowelsCodes.indexOf(item) == -1
        })
        noVowels = noVowels.map(item => `%${item}`).join("")
        return unescape(noVowels)
    }

    /**
     * Given the raw dictionary from the cloud database (or from a local JSON file),
     * create some additional objects that are easier to search and iterate through.
     * @param {Array} dictionary - An array of Objects containing Arabic to English
     *      groups/pairs
     * @return {Object}
     */
    this.processDictionary = function(callbacks){
        return (dictionary)=>{
            var enDict = {}
            var arDict = {}
            var indexDict = {}
            var keywordDict = {}
            dictionary.forEach((entry, idx)=>{
                if ("doc" in entry){
                    entry = entry.doc
                }
                var ar = entry["ar"]
                var en = entry["en"]
                var id = entry["_id"]
                if (id == undefined){
                    id = idx
                }
                indexDict[id] = entry
                if ("category" in entry){
                    entry["category"].forEach((cat)=>{
                        if (!(cat in keywordDict)){
                            keywordDict[cat] = []
                        }
                        keywordDict[cat].push(id)
                    })
                }
                if (ar != undefined){
                    if (ar.constructor !== Object){
                        ar = {"fos7a":ar}
                    }
                }else{
                    ar = {"fos7a":""}
                }

                if (en != undefined){
                    if (en.constructor !== Array){
                        en = [en]
                    }
                }else{
                    en = [""]
                }

                Object.keys(ar).forEach((dialect)=>{
                    var words_by_dialect = ar[dialect]
                    if (words_by_dialect.constructor !== Array){
                        words_by_dialect = [words_by_dialect]
                    }
                    words_by_dialect.forEach((word)=>{
                        arDict[word] = {
                            en: en,
                            _id: id,
                            dialect: dialect
                        }
                    })
                })

                en.forEach((word)=>{
                    enDict[word] = {
                        ar: ar,
                        _id: id
                    }
                })
            })
            var returnVal = {
                en_to_ar: enDict,
                ar_to_en: arDict,
                index: indexDict,
                keywords: keywordDict
            }

            window.__en_to_ar__ = enDict
            window.__ar_to_en__ = arDict
            window.__dict_index__ = indexDict
            window.__keywords__ = keywordDict

            if (callbacks != undefined){
                if (callbacks.constructor !== Array){
                    callbacks = [callbacks]
                }
                callbacks.forEach((callback)=>{
                    callback(returnVal)
                })
            }
        }
    }

    this.getDictionaryData = function(callbacks,options){
        var dictionaryUrl = $SCRIPT_ROOT + "/get_dictionary"
        callbacks = this.processCallbacks(callbacks)

        if (options != undefined){
            if (options.offline){
                callbacks.forEach((callback)=>{
                    callback(__data_offline)
                })
                return
            }
        }
        $.ajax({
            // crossDomain:true,
            type:"GET",
            url: dictionaryUrl,
            contentType:"json/application",
            success: (data)=>{
                callbacks.forEach((callback)=>{
                    callback(data.rows)
                })
            }
        })
    }

    this.addWord = function(data, callbacks){
        var addWordUrl = $SCRIPT_ROOT + "/add_word"
        callbacks = this.processCallbacks(callbacks)
        console.log(data)
        $.ajax({
            // crossDomain:true,
            type: "POST",
            data:{data:JSON.stringify(data)},
            url: addWordUrl,
            // contentType: "json/application",
            success: (data)=>{
                callbacks.forEach((callback)=>{
                    callback(data)
                })
            }
        })
    }

    this.removeWord = function([id,rev], callbacks){
        var removeWordUrl = $SCRIPT_ROOT + "/remove_word"
        callbacks = this.processCallbacks(callbacks)
        $.ajax({
            type:"POST",
            data:{data:JSON.stringify({id:id,rev:rev})},
            url: removeWordUrl,
            success: (data)=>{
                callbacks.forEach((callback)=>{
                    callback(data)
                })
            }
        })
    }

}

var util = new Util();
