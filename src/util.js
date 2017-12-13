function Util(){

    /**
     * Given the raw dictionary from the cloud database (or from a local JSON file),
     * create some additional objects that are easier to search and iterate through.
     * @param {Array} dictionary - An array of Objects containing Arabic to English
     *      groups/pairs
     * @return {Object}
     */
    this.processDictionary = function(callbacks){
        return (dictionary)=>{
            console.log(dictionary)
            var enDict = {}
            var arDict = {}
            var indexDict = {}
            var keywordDict = {}

            dictionary.forEach((entry)=>{
                entry = entry.doc
                var ar = entry["ar"]
                var en = entry["en"]
                var id = entry["_id"]
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

    this.getDictionaryData = function(callbacks){
        if (callbacks == undefined){
            callbacks = [(data)=>{}]
        }else{
            if (callbacks.constructor !== Array){
                callbacks = [callbacks]
            }
        }
        $.ajax({
            crossDomain:true,
            type:"GET",
            data:{
                include_docs:true
            },
            url:"https://dshaff001.cloudant.com/arabic-ref/_all_docs",
            contentType:"text/plain",
            success: (data)=>{
                callbacks.forEach((callback)=>{
                    callback(data.rows)
                })
            }
        })


    }

    /**
     * If a string is passed, return $(string),
     * otherwise return the selector itself
     * @type {String/Object} selector -
     * @returns {Object} - JQuery selector
     */
    this.process$ = function(selector){
        if (selector.constructor == String){
            return $(selector)
        }else{
            return selector
        }

    }

    this.processOptions = function(options){
        if (options == null){
            options = {};
        }
        if ("id" in options){
            options.idAttr = `id="${options.id}"`
        }else{
            options.idAttr = ""
        }
        if ("forId" in options){
            options.forIdAttr = `for=${options.forId}`
        }else{
            options.forIdAttr = ""
        }
        if (!("class" in options)){
            options.class = "";
        }
        return options;
    }

    this.generateCheckBoxList = function(contents, options){
        options = this.processOptions(options)
        return () => {
            var div = [];
            contents.forEach((content)=>{
                var [display, id] = content ;
                if (id == null){
                    idAttr = ""
                }else{
                    idAttr = `id=${id}`
                }
                div.push(`<label>
                    <input ${idAttr} type="checkbox">
                    <span>${display}<span>
                </label>`)
            })
            return div.join("")
        }
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
        if ("labelText" in options){
            options.label = `<label>${options.labelText}</label>`
        }else{
            options.label=`<label></label>`
        }
        return () => {
            var div = [`<div class="u-full-width dropdown ${options.class}" ${options.idAttr}>
                    <div>
                        ${options.label}
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


    this.generateDropDownRow = function(content, options){
        options = this.processOptions(options)
        return () => {
            return `<div class="dropdown-element" value=${content[0]}>${content[1]}</div>`
        }
    }

    /**
     * [description]
     * @param  {[type]} content [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    this.generateToolTip = function(content, options){
        options = this.processOptions(options);
        if (content.constructor == Function){
            content = content()
        }
        return ()=>{return `<div class="tooltip ${options.class}" ${options.idAttr}>${content}</div>`}
    }

    this.generateLabel = function(labelText, options){
        options = this.processOptions(options);
        if (labelText == null){
            labelText = `<span class="placeholder"></span>`;
        }
        if ("span" in options){
            labelText += `<span>${options.span()}</span>`
        }
        return ()=>{return `<label ${options.idAttr} ${options.forIdAttr}>${labelText}</label>`}
    }

    this.generateRowInput = function(placeholder, value, options){
        options = this.processOptions(options)
        return ()=>{return`<input ${options.idAttr} class="u-full-width sched-input" placeholder="${placeholder}" value="${value}" type="text">`}
    }

    this.generateLabeledInput = function(labelText, placeholder, value, options){
        optionsInput = {}
        optionsLabel = {}
        Object.keys(options).forEach((key)=>{
            optionsInput[key] = options[key]
            if (key != "id"){
                optionsLabel[key] = options[key]
            }
        })
        return () => {
            var input = this.generateRowInput(placeholder, value, optionsInput)
            var label = this.generateLabel(labelText, optionsLabel)
            return label() + input()
        }
    }

    this.generatePlusButton = function(options){
        options = this.processOptions(options)
        return ()=>{return `<button ${options.idAttr} class="plus-button ${options.class}"><span>${octicons.plus.toSVG()}</span></button>`
        }
    }

    this.generateXButton = function(options){
        options = this.processOptions(options)
        return ()=>{return `<button ${options.idAttr} type="button" class="button-row button-x ${options.class}">${octicons.x.toSVG()}</button>`
        }
    }

    this.generateKebabButton = function(options){
        options = this.processOptions(options)
        return ()=>{return `<button ${options.idAttr} class="button-row kebab-button ${options.class}"><span>${octicons["kebab-vertical"].toSVG()}</span></button>`}
    }

    this.generateQuestionButton = function(options){
        options = this.processOptions(options)
        if ("link" in options){
            options.linkAttr = `onclick="window.open('${options.link}')"`
        }else{
            options.linkAttr = ""
        }
        return ()=>{return `<button ${options.idAttr} ${options.linkAttr} type="button" class="button-row button-question ${options.class}"><span>${octicons["question"].toSVG()}</span></button>`}
    }

    this.generateExpandButton = function(options){
        options = this.processOptions(options)
        return ()=>{return `<button ${options.idAttr} class="button-expand small up-caret ${options.class}"><span>${octicons["chevron-down"].toSVG()}</span></button>`}
    }

    this.generateButton = function(buttonText, options){
        options = this.processOptions(options)
        return ()=>{return `<button ${options.idAttr} class="${options.class}">${buttonText}</button>`}
    }

    this.generateSpinBox = function(options){
        options = this.processOptions(options)
        return ()=>{return `<div class="spin-box" ${options.idAttr}>
                <input type="text" class="sched-input">
                <button class="spin-box up"></button>
                <button class="spin-box down"></button>
        </div>`}
    }

    this.generateWordEntry = function(content, options){
        options = this.processOptions(options)
        return ()=>{
            return `<button ${options.idAttr} class="word-list-entry"><span>${content}</span></button>`
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

    // this.generateToolTip = function(content, options){
    //     options = this.processOptions(options)
    //     return ()=>{
    //         return `<div class="tooltip ${options.class}" ${options.idAttr}>${content}</div>`
    //     }
    // }
    /**
     * Create a row with columns of specified width.
     * Example usage:
     * util.generateRow([
     *      ["six",util.generateXButton()],
     *      ["six",util.generatePlusButton()]
     * ]{id:"cool-name",class:"my-class",columnOptions:{class:"tight-spacing"}})
     * @param  {Array} columns - array of arrays describing contents of
     * each of the columns
     * @param {Object} options - Because this function involves creating
     * rows _and_ columns, the options object is a little different. The main
     * fields, id, class, etc, get passed to the row. Each row can be
     * styled/modified by passing _another_ options object to the columnOptions
     * field in the options Object
     * @return {[type]}         [description]
     */
    this.generateRow = function(columns, options){
        options = this.processOptions(options)
        if (!("columnOptions" in options)){
            options.columnOptions = {}
        }
        columnOptions = this.processOptions(options.columnOptions)
        return () => {
            var div = [`<div class="row">`];
            if (columns.length == 1){
                div.push(columns[0]());
            }else{
                columns.forEach((column) => {
                    // First element is the width of the column
                    var nColumns = column[0];
                    var cb = column[1];
                    div.push(`<div class="${nColumns} columns ${columnOptions.class}">`)
                    div.push(cb())
                    div.push(`</div>`)
                })
            }
            div.push("</div>")
            return div.join("")
        }
    }

    /**
     * Given some list of callbacks for generating HTML for rows,
     * call them all, and stick them all together
     * @param  {Array} rows - Array of callbacks.
     * @return {String} - HTML for combined rows.
     */
    this.concatenateRows = function(rows){
        return ()=>{
            var div = [];
            rows.forEach((row) => {
                div.push(row())
            })
            return div.join("")
        }
    }

    /**
     * Given some row generated by this.generateRow, get the data
     * from the elements that have the class selector (defaults to "sched-input")
     * @param  {Object} row - The JQuery selector corresponding to the row
     * from which we'd like to get data
     * @param  {String} selector - A selector other than ".sched-input"
     * @return {Array} - An array with all the data from the row, in order
     * of appearance
     */
    this.getRowData = function(row, selector){
        if (selector == null){
            selector = ".sched-input"
        }
        var data = []
        $(row).find(selector).each(function(){
            data.push($(this).val())
        })
        return data;
    }

    /**
     * Given some panel, get all the data from elements inside the panel
     * with "sched-input" classes.
     * @param  {String/Object} selector - selector for panel
     * @return {Array} - Data inside panel
     */
    this.getPanelData = function(selector){
        selector = this.process$(selector)
        console.log(selector)
        var data = []
        selector.find(".sched-input").each((idx, elem)=>{
            // var id = $(elem).attr('id')
            var val = $(elem).val()
            if (val == ""){
                val = $(elem).attr("value")
            }
            data.push(val)
        })
        return data
    }


    /**
     * Setup a button whose caret is supposed to flip when clicked.
     * @param  {object} options - options object
     * @return {null}
     */
    this.expandButtonSetup = function(options){
        $(this).on("click", (event)=>{
            console.log("clicked")
            $(event.currentTarget).toggleClass("up-caret down-caret")
        })
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
        dropdownContent.on("click", "div", function(){
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

    this.spinBoxSetup = function(initialValue, increment){
        if (! initialValue){
            initialValue = 0.0
        }
        if (! increment){
            increment = 1.0
        }
        return function() {
            var parent = $(this);
            var upButton = parent.find(".spin-box.up")
            var downButton = parent.find(".spin-box.down")
            var input = parent.find("input")
            input.attr("value", initialValue);

            var upDownFactory = function(upDown){
                return function(){
                    var curVal = parseFloat(input.val(),10);
                    if (upDown == "up"){
                        var newVal = curVal + increment
                        input.val(newVal)
                        parent.trigger("change",newVal)
                    } else if (upDown == "down"){
                        var newVal = curVal - increment;
                        input.val(newVal);
                        parent.trigger("change", newVal)
                    }
                }
            }
            upButton.html(`<span>${octicons["chevron-up"].toSVG()}</span>`);
            downButton.html(`<span>${octicons["chevron-down"].toSVG()}</span>`);
            upButton.on("click", upDownFactory("up"))
            downButton.on("click", upDownFactory("down"))
            input.on("keyup", function(event){
                var curVal = $(this).val();
                var curValFloat = parseFloat(curVal, 10);
                if (curValFloat !== NaN){
                    input.val(curValFloat)
                    parent.trigger("change", curValFloat);
                }
            })
        }
    }

    this.toggleHide = function(self, id){
        return function(event){
            var div = $(`#${id}`)
            if (div.is(":visible")){
                div.hide();
            }else{
                div.show()
            }
        }
    }

    this.toggleHiddenForm = function(self, id){
        return (eventObject)=>{
            if (id == null){
                var hiddenRow = $(eventObject.currentTarget)
                                        .parent().parent().next().find(".tooltip");
            }else{
                var hiddenRow = $(`#${id}`);
            }
            hiddenRow.toggleClass("open closed")
        }
    }

    /**
     * Update the sched file object with some new data.
     * @param  {Object} schedFileObj - Instance of SchedFile
     * @return {function} - function that accepts paramData
     * as argument
     */
    this.updateSchedFile = function(schedFileObj){
        /**
         * Anonymous function that accepts paramData.
         * Simple iterates through paramData.data object, updating schedFileObj.
         * @param  {Object} paramData - Object with following structure:
         * {
         *      category: "category name",
         *      data: [
         *          {paramId: "sched param",
         *          value: "new value"}
         *      ]
         * }
         * @return {null}
         */
        return (paramData) => {
            console.log(`paramData.data: ${paramData.data}`)
            console.log(paramData.data)
            var category = paramData.category
            paramData.data.forEach((paramDatum) => {
                SchedFile.emitEvent("updateSchedParam",[paramDatum.paramId, category, paramDatum.value])
            })
        }
    }
}

var util = new Util();
