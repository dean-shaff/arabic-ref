function App(){
    this.fonts = {
        "amiri": ["Amiri", "serif", {"height":"38px"}, {"bottom":"0px"}],
        "raleway": ["Raleway", "sans-serif", {"height":"38px"}, {"bottom":"0px"}],
        "noto-kannada":["Noto Sans Kannada", "sans-serif", {"height":"38px"}, {"bottom":"0px"}],
        "noto-urdu": ["Noto Nastaliq Urdu", "serif", {"height":"48px"}, {"bottom":"4px"}],
        "noto-kufi": ["Noto Kufi Arabic", "sans-serif", {"height":"38px"}, {"bottom":"0px"}]
    }

    this.init = function(){
        this.setupUI();
        this.resizeCb(this)();
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
        $("#search-input-container").append(util.generateLabeledInput("","Search in Arabic or English...","",
                                                            {id:"search-input"}))
        $("#search-input-container").on("keyup", "input#search-input",this.searchKeyDownCb(this))

    }

    this.setupWordList = function(){
        var self = this ;
        $("#word-list").html(()=>{
            // var contents = self.generateWordListHTML(__ar_to_en__);
            var contents = self.generateWordListHTMLByKeyword();
            var div = util.generateScrollableBox(contents(), {id:"word-list-contents"})()
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
        var dropdown = util.generateDropDown(fonts,{id:"font-dropdown",labelText:"Choose Font"})
        $("#top-bar .columns").last().html(`
            <div class="row">
            <div class="twelve columns">
                ${dropdown()}
            </div>
        </div>`)
        util.dropDownSetup.call($("#font-dropdown"),{callback:this.changeFontCb(this)})
    }

    this.setupAddWord = function(){
        $("#add-word").append(util.generatePlusButton({id:"add-word-button"}))
        $("#add-word-button").on("click", this.addWordCb(this))
    }

    this.wordListClickCb = function(self){
        return (eventObject)=>{
            var generateDescriptionHTML = ()=>{
                var wordText = $(eventObject.currentTarget).find("span").html().split(" | ");
                var [en_word, ar_word] = wordText;
                var arabic = __en_to_ar__[en_word]['ar'];
                html = [`<h5>${en_word}</h5>`];
                var fos7a = arabic['fos7a'];
                html.push(`<h5> فصحى : ${fos7a}</h5>`);
                if ("3mia" in arabic){
                    html.push(`<h5>عامية : ${arabic['3mia']}</h5>`);
                }
                var index = __en_to_ar__[en_word].index;
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
                return html.join("");
            }

            var descripDivName = "word-description"

            var generateNewDescription = (callback)=>{
                $(eventObject.currentTarget).after(
                    util.generateToolTip(`${generateDescriptionHTML()}`,{id:"word-description",class:"closed"})
                )
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
                if (prev.is($(eventObject.currentTarget))){
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
        return (eventObject)=>{
            var currentVal = $(eventObject.currentTarget).val().toLowerCase();
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
        return (event)=>{
            var currentVal = $(event.currentTarget).attr("value");
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

    this.addWordCb = function(self){
        return (event) => {
            $(event.currentTarget).after(util.generateToolTip(
            ))
        }
    }

    this.resizeCb = function(self){
        return function(){
            var newWordListHeight = $(window).height() - $("#main-title").height();
            $("#word-list").find("div").css("max-height", 0.9*newWordListHeight);
        }
    }


    /**
     * Given some dictionary, generate HTML for the words in the dictionary.
     * @param  {Array or Object} dictionary
     * An array or Object containing words of interest
     * @return {Array}            [HTML formatted words]
     */
    this.generateWordListHTML = function(dictionary){
        var scrollable = [];
        Object.keys(dictionary).forEach(function(e){
            var contents ;
            if ("en" in dictionary[e]){
                contents = `${dictionary[e]['en']} | ${e}`;
            } else if ("ar" in dictionary[e]){
                contents = `${e} | ${Object.values(dictionary[e]['ar']).join(", ")}`;
            }
            scrollable.push(util.generateWordEntry(contents)()) ;
        })
        return scrollable
    }

    /**
     * Using the __keywords__ global variable, generate HTML for words,
     * under category/keyword headers
     * @return {function} - function that returns HTML
     */
    this.generateWordListHTMLByKeyword = function(){

        var arabicEnglishWordPair = (entry) => {
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
                    arReturn.push(ar["3mia"])
                }
                arReturn = arReturn.join(", ")
            }

            return `${enReturn} | ${arReturn}`
        }


        return () => {
            var html = [];
            Object.keys(__keywords__).forEach((keyword)=>{
                var wordList = __keywords__[keyword] // This is list of indices.
                html.push(`<div class="float-row"><h4>${keyword}</h4></div>`)
                wordList.forEach((index)=>{
                    var entry = __dict_index__[index]
                    html.push(util.generateWordEntry(arabicEnglishWordPair(entry))());
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
        // make a little function to search the individual dictionaries
        var searchDictionary = function(dictionary){
            Object.keys(dictionary).forEach(function(e){
                if (e.indexOf(keyword) !== -1){
                    possibleMatches[e] = dictionary[e]
                }
            })
        }
        // Now apply searchDictionary to the english -> Arabic and Arabic -> English
        // dictionaries:
        searchDictionary(__ar_to_en__);
        searchDictionary(__en_to_ar__);
        return possibleMatches;
    }
}

$(document).ready(function(){
    var app = new App();
    app.init();
})
