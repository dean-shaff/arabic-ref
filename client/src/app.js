function App(){
    this.fonts = {
        "amiri": ["Amiri", "serif", {"height":"38px"}, {"bottom":"0px"}],
        "raleway": ["Raleway", "sans-serif", {"height":"38px"}, {"bottom":"0px"}],
        "noto-kannada":["Noto Sans Kannada", "sans-serif", {"height":"38px"}, {"bottom":"0px"}],
        "noto-urdu": ["Noto Nastaliq Urdu", "serif", {"height":"48px"}, {"bottom":"4px"}],
        "noto-kufi": ["Noto Kufi Arabic", "sans-serif", {"height":"38px"}, {"bottom":"0px"}]
    }

    this.init = function(){
        util.getDictionaryData(
            util.processDictionary([
                    this.setupUI.bind(this),
                    this.resizeCb(this),
                    // this.testUi.bind(this)
                ]
            ),{offline:false}
        )
    }

    this.testUi = function(){
        $("#toggle-add-word-form").click()
        $("#add-word-button").click()
    }

    this.setupUI = function(){
        this.setupWordList()
        this.setupSearchBox()
        this.setupFontDropDown()
        this.setupAddWord()
        $(window).on("resize", this.resizeCb(this))
    }

    this.setupSearchBox = function(){
        var self = this ;
        $("#search-input-container").append(w.rowInput(["Search in Arabic or English...",""],
                                                            {id:"search-input"}))
        $("#search-input-container").on("keyup", "input#search-input",this.searchKeyDownCb(this))

    }

    this.setupWordList = function(){
        var self = this ;
        $("#word-list").html(()=>{
            // var contents = self.generateWordListHTML(__ar_to_en__);
            var contents = self.generateWordListHTMLByKeyword();
            var div = w.scrollableBox(contents(), {id:"word-list-contents"})
            return $(div)
                    .css("max-height", $(window).height())
                    .css("width",$("#word-list").width());
        })
        $("#word-list-contents").on("click",".word-list-entry", this.wordListClickCb(this));
    }

    this.setupFontDropDown = function(){
        fonts = [] ;
        Object.keys(this.fonts).forEach((font)=>{
            fonts.push([font, this.fonts[font].slice(0,2).join(", ")])
        })
        var dropdown = w.dropDown([fonts,{labelText:"Choose Font"}],{id:"font-dropdown"})
        $("#top-bar .columns").last().html(dropdown)
        $("#font-dropdown").dropDownSetup({callback:this.changeFontCb(this)})
    }

    this.setupAddWord = function(){
        $("#add-word").append(w.button("Add Word",{id:"toggle-add-word-form"}))
        $("#add-word-form-container").html(w.toolTip([
                w.row([
                    w.column(4, w.label("Word in English")),
                    w.column(8, w.rowInput(["mom",""],{id:"add-word-en"}))
                ]),
                w.row([
                    w.column(8,w.rowInput(["ماما",""],{id:"add-word-ar-fos7a",class:"arabic-input"})),
                    w.column(4, w.label("كلمة بالعربية فصحى"))
                ]),
                w.toolTip([
                    w.row([
                        w.column(8,w.rowInput(["ماما",""],{id:"add-word-ar-3mia",class:"arabic-input"})),
                        w.column(4, w.label("كلمة بالعربية عامىة"))
                    ]),
                    w.row([
                        w.column(4, w.label("Keywords")),
                        w.column(8, w.rowInput(["noun, family",""],{id:"add-word-keywords"}))
                    ]),
                    w.row([
                        w.column(4, w.label("Example")),
                        w.column(8, w.rowInput(["I love my mom",""],{id:"add-word-example-en"}))
                    ]),
                    w.row([
                        w.column(8, w.rowInput(["أنا أحب ماما",""],{class:"arabic-input",id:"add-word-example-ar"})),
                        w.column(4, w.label("مثال")),
                    ]),
                ],{id:"extra-add-word",class:"closed no-padding-no-margin"}),
                w.row([
                    w.column(6, w.plusButton({id:"add-word-button", class:"u-full-width"})),
                    w.column(6, w.kebabButton({id:"extra-add-word-button",class:"u-full-width"}))
                ]),
                w.row([
                    w.column(12,()=>`<h5 id="add-word-message"></h5>`)
                ])
            ], {id:"add-word-form",class:"add-word-form closed"})
        )

        $("#toggle-add-word-form").on("click", (evt)=>{
            $("#add-word-form").toggleClass('open closed');
        })
        $("#extra-add-word-button").on("click", (evt)=>{
            $("#extra-add-word").toggleClass('open closed')
        })
        $("#add-word-button").on("click", this.addWordCb(this))
    }

    this.wordListClickCb = function(self){
        return (evt)=>{
            var generateDescriptionHTML = ()=>{
                var wordText = $(evt.currentTarget).find("span").html().split(" | ");
                var [en_word, ar_word] = wordText;
                var arabic = __en_to_ar__[en_word]['ar'];
                html = [`<h5>${en_word}</h5>`];
                var fos7a = arabic['fos7a'];
                html.push(`<h5> فصحى : ${fos7a}</h5>`);
                if ("3mia" in arabic){
                    if (arabic["3mia"] !== ""){
                        html.push(`<h5>عامية : ${arabic['3mia']}</h5>`);
                    }
                }
                var index = __en_to_ar__[en_word]._id;
                var keywords = __dict_index__[index].category
                var examples = __dict_index__[index].example
                if (keywords.length != 0){
                    html.push("<b>keywords: </b>")
                    html.push(`${keywords.join(", ")}`)
                    html.push("<div></div>")
                }
                exampleText = ["<b>Examples: </b><div></div>"];
                ["ar", "en"].forEach((lang)=>{
                    if (examples[lang].length != 0){
                        exampleText.push(`${lang}: `)
                        exampleText.push(examples[lang].join(", "))
                    }
                    exampleText.push("<div></div>")
                })
                if (exampleText.length > 3){
                    html.push(exampleText.join(""))
                }
                var deleteId = `delete-${index}`
                html.push(w.button("Delete word", {id:deleteId}))
                return [html.join(""), deleteId]
            }

            var descripDivName = "word-description"

            var generateNewDescription = (callback)=>{
                var [descriptionHTML, deleteId] = generateDescriptionHTML()
                $(evt.currentTarget).after(
                    w.toolTip(`${descriptionHTML}`,{id:"word-description",class:"closed"})
                )
                $(`#${deleteId}`).on("click",(evt)=>{
                    var id = $(evt.currentTarget).attr("id").split("-").slice(-1)[0]
                    var rev = __dict_index__[id]._rev
                    util.removeWord([id,rev],()=>{})
                })
                setTimeout(()=>{
                    $(`#${descripDivName}`).toggleClass("open closed");
                    if (callback != null){
                        callback()
                    }
                },50);
            }

            var removeCurrentDescription = (callback)=>{
                $(`#${descripDivName}`).toggleClass("open closed")
                setTimeout(()=>{
                    $(`#${descripDivName}`).remove()
                    if (callback != null){
                        callback()
                    }
                },400)
            }

            if ($(`#${descripDivName}`).length){
                var prev = $(`#${descripDivName}`).prev()
                if (prev.is($(evt.currentTarget))){
                    removeCurrentDescription()
                }else{
                    removeCurrentDescription(generateNewDescription)
                }
            }else{
                generateNewDescription()
            }
        }
    }

    this.searchKeyDownCb = function(self){
        return (evt)=>{
            var currentVal = $(evt.currentTarget).val().toLowerCase();
            var scrollable ;
            if (currentVal == ""){
                // contents = self.generateWordListHTML(__ar_to_en__);
                // $("#word-list-contents").html(`${contents.join("")}`);
                contentCallback = self.generateWordListHTMLByKeyword();
                $("#word-list-contents").html(contentCallback);
                return;
            }
            var possibleMatches = self.searchDictionary(currentVal);
            contents = self.generateWordListHTML(possibleMatches);
            $("#word-list-contents").html(`${contents.join("")}`);
        }

    }

    this.changeFontCb = function(self){
        return (evt)=>{
            var currentVal = $(evt.currentTarget).attr("value");
            var font = self.fonts[currentVal];
            console.log(`Changing font to ${font}`)
            $("body").css("font-family", font[0], font[1])
            if (font[2] != null){
                $(".word-list-entry").css(font[2])
            }
            if (font[3] != null){
                $(".word-list-entry span").css(font[3])
            }

        }
    }

    this.checkIfWordExists = function(en, ar_fos7a, ar_3mia){
        if (en in __en_to_ar__){
            var entry_ar = __en_to_ar__[en]
            // console.log(`${en} in __en_to_ar__`)
            // console.log(`entry_ar: ${JSON.stringify(entry_ar)}`)
            // console.log(`entry_ar.fos7a: ${entry_ar["ar"]["fos7a"]}`)
            if (ar_fos7a === entry_ar["ar"]["fos7a"] || ar_3mia === entry_ar["ar"]["3mia"]){
                return true
            }
        }
        return false
    }

    this.addWordCb = function(self){
        return (evt) => {
            var ar_word_fos7a = $("#add-word-ar-fos7a").val()
            var ar_word_3mia = $("#add-word-ar-3mia").val()
            var en_word = $("#add-word-en").val()
            var en_example = $("#add-word-example-en").val().split(",")
            var ar_example = $("#add-word-example-ar").val().split(",")
            var keywords = $("#add-word-keywords").val().split(",")

            console.log(`ar_word_fos7a: ${ar_word_fos7a}`)
            console.log(`ar_word_3mia: ${ar_word_3mia}`)
            console.log(`en_word: ${en_word}`)
            console.log(`en_example: ${en_example}`)
            console.log(`ar_example: ${ar_example}`)
            console.log(`keywords: ${keywords}`)

            if (!self.checkIfWordExists(en_word, ar_word_fos7a, ar_word_3mia)){
                var data = {
                    ar_fos7a:ar_word_fos7a,
                    ar_3mia:ar_word_3mia,
                    en: en_word,
                    category:keywords,
                    example_en:en_example,
                    example_ar:ar_example
                }
                console.log(data)
                util.addWord(data, (data)=>{
                    $("#add-word-message").html("Added word!")
                    setTimeout(()=>{
                        $("#add-word-message").html("")
                    },5000)
                })
            }else{
                $("#add-word-message").html("Word already in dictionary")
            }
        }
    }

    this.removeWordCb = function(self){
        return (evt)={}
    }

    this.resizeCb = function(self){
        return function(){
            var newWordListHeight = $(window).height() - $("#main-title").height();
            $("#word-list").find("div").css("max-height", 0.9*newWordListHeight);
        }
    }

    this.generateArabicEnglishWordPair = function(entry){
        var en = entry.en
        var ar = entry.ar
        // Process English first
        if (en.constructor == String){
            enReturn = en
        } else if (en.constructor == Array){
            enReturn = en.join(", ")
        }
        // Arabic is generally a little trickier because there
        // migth be fos7a and 3mia entries
        if (ar.constructor == String){
            arReturn = ar
        }else if (ar.constructor == Object){
            arReturn = [];
            if ("fos7a" in ar){
                if (ar.fos7a.constructor == Array){
                    arReturn.push(ar.fos7a.join(", "))
                }else{
                    arReturn.push(ar.fos7a)
                }
            }
            if ("3mia" in ar){
                if (ar["3mia"] !== ""){
                    arReturn.push(ar["3mia"])
                }
            }
            arReturn = arReturn.join(", ")
        }

        return `${enReturn} | ${arReturn}`
    }

    /**
     * Given some dictionary, generate HTML for the words in the dictionary.
     * @param  {Array or Object} dictionary
     * An array or Object containing words of interest
     * @return {Array}            [HTML formatted words]
     */
    this.generateWordListHTML = function(dictionary){
        var scrollable = [];
        Object.keys(dictionary).forEach((e)=>{
            var entry = dictionary[e]
            if (!("en" in entry)){
                entry.en = e
            }
            if (!("ar" in entry)){
                entry.ar = e
            }
            scrollable.push(w.wordEntry(this.generateArabicEnglishWordPair(entry))) ;
        })
        return scrollable
    }

    /**
     * Using the __keywords__ global variable, generate HTML for words,
     * under category/keyword headers
     * @return {function} - function that returns HTML
     */
    this.generateWordListHTMLByKeyword = function(){

        return () => {
            var html = [];
            Object.keys(__keywords__).forEach((keyword)=>{
                var wordList = __keywords__[keyword] // This is list of indices.
                html.push(`<div class="float-row"><h4>${keyword}</h4></div>`)
                wordList.forEach((index)=>{
                    var entry = __dict_index__[index]
                    html.push(w.wordEntry(this.generateArabicEnglishWordPair(entry)));
                })
                html.push(`<div class="float-row"></div>`)
            })
            return html;
        }
    }


    /**
     * @function searchDictionary
     * @param  {String} keyword - The search string
     * @return {Array}  A list of words that have keyword in them
     */
    this.searchDictionary = function(keyword){
        var possibleMatches = {};

        var searchIndividualDictionary = (dictionary, wordProcessor)=>{
            Object.keys(dictionary).forEach((e)=>{
                var wordSearch = wordProcessor(e)
                if (wordSearch.indexOf(keyword) !== -1){
                    possibleMatches[e] = dictionary[e]
                }
            })
        }
        // Now apply searchDictionary to the english -> Arabic and Arabic -> English
        // dictionaries:
        searchIndividualDictionary(__ar_to_en__, util.removeVowelization.bind(util));
        searchIndividualDictionary(__en_to_ar__, word=>word);
        return possibleMatches;
    }
}

$(document).ready(function(){
    var app = new App();
    app.init();
})
