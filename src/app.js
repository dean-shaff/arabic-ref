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
            <div class="scrollable-box">
                <div class="bottom-spacing"></div>
                ${scrollable.join("")}
            </div>`;
            return $(div)
                    .css("max-height", $(window).height())
                    .css("width",$("#word-list").width());
        })
        // ("#word-list").on("click", header, this.wordListClickCb(this));
        $("#search-area").append(function(){
            var div = `
            <div>
                <label for="search-input">Search in Arabic or English</label>
                <input placeholder="type word here..." id="search-input">
            </div>
            <div></div>
            `
            return $(div);
        })
        $("#search-area").on("keyup", "div input#search-input",this.searchKeyDownCb(this))

        $(window).on("resize", this.resizeCb(this))
    }

    this.wordListClickCb = function(self){

    }

    this.searchKeyDownCb = function(self){
        return function(event){
            var currentVal = $(this).val();
            if (currentVal == ""){
                $("#search-area div").next().html("");
                return;
            }
            var possibleMatches = self.searchDictionary(currentVal);
            var htmlMatches = [];
            var header = "h5"
            possibleMatches.forEach(function(e){
                htmlMatches.push(`<${header}>${e.join(", ")}</${header}>`)
            })
            $("#search-area div").next().html(function(){
                var div = `
                ${htmlMatches.join("")}
                `
                return $(div)
            })
        }
    }

    this.resizeCb = function(self){
        return function(){
            var newWordListHeight = $(window).height() - $("#main-title").height();
            $("#word-list").find("div").css("max-height", 0.9*newWordListHeight);
        }
    }

    this.generateWordListHTML = function(dictionary){
        var scrollable = [];
        Object.keys(dictionary).forEach(function(e){
            scrollable.push(
            `<h5 class="tooltip">${e} ${dictionary[e]['en']}
                <span class="tooltiptext">${dict_index[dictionary[e]["index"]]["category"]}</span>
            </h5>`) ;
        })
        return scrollable
    }

    /**
     * @function searchDictionary
     * @param  {String} keyword - The search string
     * @return {Array}  A list of words that have keyword in them
     */
    this.searchDictionary = function(keyword){
        var possibleMatches = [];
        // make a little function to search the individual dictionaries
        var searchDictionary = function(dictionary, key){
            Object.keys(dictionary).forEach(function(e){
                if (e.indexOf(keyword) !== -1){
                    possibleMatches.push(dictionary[e][key])
                }
            })
        }
        // Now apply searchDictionary to the english -> Arabic and Arabic -> English
        // dictionaries:
        searchDictionary(ar_to_en, "en");
        searchDictionary(en_to_ar, "ar");
        return possibleMatches;
    }
}

$(document).ready(function(){
    var app = new App();
    app.init();
})
