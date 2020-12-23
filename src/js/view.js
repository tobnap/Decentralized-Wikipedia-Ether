$(window).on('load', function(){
    var loader = $("#loader");
    var content = $("#content");

    getFile(location.search.substring(1)).then(function (data) {
        console.log(data);
        content.html(marked(data));

        loader.hide();
        content.show();
    });
});