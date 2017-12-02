function App(){
    this.init = function(){
        this.setupUI();
        this.resizeCb(this)();
    }

    this.setupUI = function(){
        this.setupWordList()
        this.setupSearchBox()
        $(window).on("resize", this.resizeCb(this))
    }

    this.setupSearchBox = function(){
        var self = this ;
        $("#search-area").append(function(){
            var div = `
            <div>
                <label for="search-input">Search in Arabic or English</label>
                <input type="search" placeholder="type word here..." id="search-input">
            </div>
            <div id="word-decription"></div>
            `
            return $(div);
        })
        $("#search-area").on("keyup", "div input#search-input",this.searchKeyDownCb(this))

    }

    this.setupWordList = function(){
        var self = this ;
        $("#word-list").html(()=>{
            var scrollable = self.generateWordListHTML(ar_to_en);
            var div = util.generateScrollableBox(scrollable, {id:"word-list-contents"})()
            return $(div)
                    .css("max-height", $(window).height())
                    .css("width",$("#word-list").width());
        })
        $("#word-list-contents").on("click",".word-list-entry", this.wordListClickCb(this));
    }


    this.wordListClickCb = function(self){
        return (event)=>{

            var generateDescriptionHTML = ()=>{
                var wordText = $(event.currentTarget).html().split(" | ");
                var [en_word, ar_word] = wordText;
                var arabic = en_to_ar[en_word]['ar'];
                html = `<h5>${en_word}</h5>`;
                var fos7a = arabic['fos7a'];
                html += `<h5> فصحى : ${fos7a}</h5>`
                if ("3mia" in arabic){
                    html += `<h5>عامية : ${arabic['3mia']}</h5>`;
                }
                return html;
            }

            var descripDivName = "word-description"

            var generateNewDescription = ()=>{
                $(event.currentTarget).after(
                    util.generateToolTip(`${generateDescriptionHTML()}`,{id:"word-description",class:"closed"})
                )
                setTimeout(()=>{
                    $(`#${descripDivName}`).toggleClass("open closed");
                },50);
            }

            var removeCurrentDescription = ()=>{
                $(`#${descripDivName}`).toggleClass("open closed")
                setTimeout(()=>{
                    $(`#${descripDivName}`).remove()
                },400)
            }

            if ($(`#${descripDivName}`).length){
                var prev = $(`#${descripDivName}`).prev()
                if (prev.is($(event.currentTarget))){
                    removeCurrentDescription()
                }else{
                    removeCurrentDescription()
                    generateNewDescription()
                }
            }else{
                generateNewDescription()
            }
            // $("#word-decription").html(function(){
            //     var html = "";
            //     var arabic = en_to_ar[en_word]['ar'];
            //     html += `<h5>${en_word}</h5>`;
            //     var fos7a = arabic['fos7a'];
            //     html += `<h5> فصحى : ${fos7a}</h5>`
            //     if ("3mia" in arabic){
            //         html += `<h5>عامية : ${arabic['3mia']}</h5>`;
            //     }
            //     return $(html);
            // })
        }
    }

    this.searchKeyDownCb = function(self){
        return function(event){
            var currentVal = $(this).val().toLowerCase();
            var scrollable ;
            if (currentVal == ""){
                scrollable = self.generateWordListHTML(ar_to_en);
                console.log(scrollable);
                $("#word-list-contents").html(`${scrollable.join("")}`);
                return;
            }
            var possibleMatches = self.searchDictionary(currentVal);
            scrollable = self.generateWordListHTML(possibleMatches);
            $("#word-list-contents").html(`${scrollable.join("")}`);
        }
    }

    this.resizeCb = function(self){
        return function(){
            var newWordListHeight = $(window).height() - $("#main-title").height();
            $("#word-list").find("div").css("max-height", 0.9*newWordListHeight);
        }
    }


    /**
     * @function generateWordListHTML
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
        searchDictionary(ar_to_en);
        searchDictionary(en_to_ar);
        return possibleMatches;
    }
}

$(document).ready(function(){
    var app = new App();
    app.init();
})
