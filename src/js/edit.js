$(window).on('load', function(){
    App.init();

    $('#pageName').text(location.search.substring(1).split(/\s*\-\s*/g)[1]);

    var loader = $("#loader");
    var content = $("#content");

    getFile(location.search.substring(1).split(/\s*\-\s*/g)[0]).then(function (data) {
        $('#editbox').append(data);

        loader.hide();
        content.show();
    });
});