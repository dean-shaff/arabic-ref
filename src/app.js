function App(){
    this.init = function(){
        this.setupUI();
    }

    this.setupUI = function(){
        $("#main-widget").append(function(){
            var scrollable = [];
            Object.keys(ar_to_en).forEach(function(e){
                scrollable.push(`<h3>${e} ${ar_to_en[e]}</h3>`) ;
            })
            var div = `<div class="scrollable-box">${scrollable.join("")}</div>`;
            return $(div).css("max-height", $(window).height());
        })
    }
}

$(document).ready(function(){
    var app = new App();
    app.init();
})
