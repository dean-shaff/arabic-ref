
/**
 * Configure Jquery with some custom elements
 * @param  {Object} $ - Jquery
 * @return {null}
 */
(function($){

    $.fn.dropDownSetup = function(options){

        var settings = $.extend({
            callback: null,
            editable: false
        }, options)

        var setDisplay = (elem) => {
            if (! settings.editable){
                this.find("div .dropdown-display span").html($(elem).html());
            }else{
                this.find("div input.dropdown-display")
                    .attr("value", $(elem).html())
            }
        }

        var dropdownContent = this.find(".dropdown-content")
        var firstContent = dropdownContent.find("div").first()
        this.attr("value", firstContent.attr("value"))
        setDisplay(firstContent)

        this.find("button").on("click", function(){
            if (dropdownContent.is(":visible")){
                dropdownContent.hide()
            }else{
                dropdownContent.show()
            }
        })

        this.find("button span").html(octicons["chevron-down"].toSVG());
        dropdownContent.on("click", "div", (evt) => {
            dropdownContent.hide()
            var val = $(evt.currentTarget).attr("value")
            this.attr("value",val)
            setDisplay(evt.currentTarget)
            this.trigger("change", val)
        })

        if (settings.callback != null){
            this.on("change", settings.callback)
        }
        return this
    };

    $.fn.spinBoxSetup = function(options){
        var settings = $.extend({
            initialValue: 0.0,
            increment: 1.0,
            callback: null
        },options)

        var upButton = this.find(".spin-box.up")
        var downButton = this.find(".spin-box.down")
        var input = this.find("input")
        input.attr("value", settings.initialValue);

        var upDownFactory = function(upDown){
            return (evt)=>{
                var curVal = parseFloat(input.val(),10);
                if (upDown == "up"){
                    var newVal = curVal + settings.increment
                    input.val(newVal)
                    $(this).trigger("change",newVal)
                } else if (upDown == "down"){
                    var newVal = curVal - settings.increment;
                    input.val(newVal);
                    $(this).trigger("change", newVal)
                }
            }
        }
        upButton.html(`<span>${octicons["chevron-up"].toSVG()}</span>`);
        downButton.html(`<span>${octicons["chevron-down"].toSVG()}</span>`);
        upButton.on("click", upDownFactory("up"))
        downButton.on("click", upDownFactory("down"))
        input.on("keyup", (evt)=>{
            var curVal = $(evt.currentTarget).val();
            var curValFloat = parseFloat(curVal, 10);
            if (curValFloat !== NaN){
                input.val(curValFloat)
                this.trigger("change", curValFloat);
            }
        })
        return this
    }

    $.fn.expandButtonSetup = function(){
        this.on("click", (evt)=>{
            $(evt.currentTarget).toggleClass("up-caret down-caret")
        })
        return this
    }

})(jQuery);

/**
 * Add some elements to esh
 * @return {null}
 */
(function(w){
    w.addElement("checkBoxList",(contents)=>{
        var div = []
        contents.forEach((content)=>{
            var [display, id] = content ;
            div.push(w.label(
                Willis.concatElem([
                    w.input([display,"","checkbox"],{id:id}),
                    w.span(display)
                ])()
            ))
        })
        return div.join("")
    })

    w.addElement("scrollableBox",(contents)=>{
        return `<div class="scrollable-box-container">
                    <div class="scrollable-box">
                        <div>
                            ${contents.join("")}
                        </div>
                    </div>
                </div>`
    })

    w.addElement("wordEntry",(content)=>{
        return `<button class="word-list-entry"><span>${content}</span></button>`
    })

    w.addElement("dropDownRow", ([value, html])=>{
        return `<div class="dropdown-element" value="${value}">${html}</div>`
    })

    var generateDropDownContent = (contents)=>{
        var dropDownContent = []
        contents.forEach((elem) =>{
            var [value, display] = elem ;
            if (display == null){
                display = value ;
            }
            dropDownContent.push(w.dropDownRow([value, display]))
        })
        return dropDownContent
    }

    w.addElement("dropDown", ([contents,labelOptions])=>{
        var dropDownContent = generateDropDownContent(contents)
        var div = w.div([
                    w.label(labelOptions.labelText),
                    w.div([
                        w.div(w.span(""),{class:["button", "dropdown-display"]}),
                        w.button(w.span(""),{type:"button"})
                    ]),
                    w.div(dropDownContent.join(""),{class:"dropdown-content"})],
        {class:"u-full-width dropdown"})
        return div
    })

    w.addElement("editableDropDown", (contents)=>{
        var dropDownContent = generateDropDownContent(contents)
        var div = w.div([
            w.div([
                w.input(["",""],{class:["dropdown-display"]}),
                w.button(w.span(""),{type:"button"})
            ]),
            w.div(dropDownContent.join(""),{class:"dropdown-content"})
        ],{class:"u-full-width dropdown"})
        return div
    })

    w.addElement("toolTip", (content)=>{
        return w.div(content, {class:"tooltip"})
    })

    w.addElement("rowInput", ([placeholder, value])=>{
        return w.input([placeholder,value,"text"],{class:["u-full-width", "sched-input"]})
    })
    w.addElement("plusButton",w.button(w.span(octicons.plus.toSVG()),{class:["button-row", "button-plus"]}))
    w.addElement("xButton",w.button(w.span(octicons.x.toSVG()),{class:["button-row", "button-x"]}))
    w.addElement("kebabButton",w.button(w.span(octicons["kebab-vertical"].toSVG()),{class:["button-row", "button-kebab"]}))
    w.addElement("questionButton",(link)=>{
        if (link != undefined){
            var linkAttr = `onclick="window.open('${link}')"`
        }else{
            var linkAttr = ""
        }
        return `<button ${linkAttr} type="button", class="button-row button-question"><span>${octicons["question"].toSVG()}</span></button>`
    })
    w.addElement("expandButton",w.button(w.span(octicons["chevron-down"].toSVG()),{class:"button-expand small up-caret"}))
    w.addElement("spinBox",w.div(Willis.concatElem([
        w.input(["","","text"],{class:"sched-input"}),
        w.button("",{class:"spin-box up"}),
        w.button("",{class:"spin-box down"})
    ])(),{class:"spin-box"}))
}(w))
