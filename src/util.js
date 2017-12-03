function Util(){

    this.processOptions = function(options){
        if (options == null){
            options = {}
        }
        if ("id" in options){
            options.idAttr = `id=${options.id}`
        }else{
            options.idAttr = ""
        }
        if (!("class" in options)){
            options.class = ""
        }
        return options
    }

    /**
     * generate a drop down div, with some content.
     * @param  {Array} contents - the content of the drop down.
     * @param  {Object} options - options object
     * @return {function} - A callable that will return the HTML of the
     * dropdown div
     */
    this.generateDropDown = function(contents, options){
        options = this.processOptions(options)
        return () => {
            var div = [`<div class="u-full-width dropdown ${options.class}" ${options.idAttr}>
                    <div>
                        <div class="button dropdown-display"><span></span></div>
                        <button type="button"><span></span></button>
                    </div>`];
            div.push(`<div class="dropdown-content">`)
            contents.forEach((elem) =>{
                var [value, display] = elem ;
                if (display == null){
                    display = value ;
                }
                div.push(`<div value=${value}>${display}</div>`)
            })
            div.push("</div></div>")
            return div.join("")
        }
    }


    /**
     * Generate a scrollable box, with some contents
     * @param  {Array} contents - Contents of the scrollable box
     *      HTML should already be in place.
     * @param  {Object} options - options object
     * @return {function} - function that returns HTML of scrollable box.
     */
    this.generateScrollableBox = function(contents, options){
        options = this.processOptions(options)
        return ()=>{
            return `<div class="scrollable-box-container">
                <div class="scrollable-box">
                <div ${options.idAttr}>
                ${contents.join("")}
                </div>
            </div>
            </div>`;
        }
    }

    this.generateWordEntry = function(content, options){
        options = this.processOptions(options)
        return ()=>{
            return `<button ${options.idAttr} class="word-list-entry">${content}</button>`
        }
    }

    this.generateToolTip = function(content, options){
        options = this.processOptions(options)
        return ()=>{
            return `<div class="tooltip ${options.class}" ${options.idAttr}>${content}</div>`
        }
    }
    
    /**
     * @function dropDownSetup
     * setup a dropdown div
     * @return {[type]} [description]
     */
    this.dropDownSetup = function(options){
        var parent = $(this);
        var dropdownContent = parent.find(".dropdown-content")
        var firstContent = dropdownContent.find("div").first()
        parent.attr("value", firstContent.attr("value"));
        parent.find("div .dropdown-display span").html(firstContent.html());
        parent.find("button").on("click", function(){
            if (dropdownContent.is(":visible")){
                dropdownContent.hide()
            }else{
                dropdownContent.show()
            }
        })
        parent.find("button span").html(octicons["chevron-down"].toSVG());
        dropdownContent.find("div").on("click", function(){
            dropdownContent.hide()
            var val = $(this).attr("value")
            parent.attr("value",val)
            parent.find("div .dropdown-display span").html($(this).html())
            parent.trigger("change", val)
        })
        if (options){
            if ("callback" in options){
                parent.on("change", options.callback)
            }
        }
    }

}

var util = new Util()
