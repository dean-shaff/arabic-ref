function App(){
    this.init = function(){
        this.setupUI();
        this.resizeCb(this)();
    }

    this.setupUI = function(){
        var self = this ;
        $("#word-list").append(function(){
            var scrollable = self.generateWordListHTML(ar_to_en);
            var div = `
            <div class="scrollable-box-container">
                <div class="scrollable-box">
                <div id="word-list-contents">
                ${scrollable.join("")}
                </div>
            </div>
            </div>`;
            return $(div)
                    .css("max-height", $(window).height())
                    .css("width",$("#word-list").width());
        })
        $("#word-list-contents").on("click",".word-list-entry", this.wordListClickCb(this));
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

        $(window).on("resize", this.resizeCb(this))
    }

    this.wordListClickCb = function(self){
        return function(){
            var wordText = $(this).find("h5").html().split(" | ");
            var en_word = wordText[0];
            var ar_word = wordText[1];
            $("#word-decription").html(function(){
                var html = "";
                var arabic = en_to_ar[en_word]['ar'];
                html += `<h5>${en_word}</h5>`;
                var fos7a = arabic['fos7a'];
                html += `<h5> فصحى : ${fos7a}</h5>`
                if ("3mia" in arabic){
                    html += `<h5>عامية : ${arabic['3mia']}</h5>`;
                }
                return $(html);
            })
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
            scrollable.push(
            `<span class="word-list-entry"><h5>${contents}</h5></span><div class="word-description"></div>`) ;
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
