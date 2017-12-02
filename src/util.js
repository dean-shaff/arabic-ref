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

}

var util = new Util()
