$(document).ready(function () {
    $("#Post").sceditor({
        format: "bbcode",
        style: "https://cdnjs.cloudflare.com/ajax/libs/sceditor/3.2.0/themes/content/default.min.css",
        toolbar: "bold,italic,underline|left,center,right|quote,code|image,link,unlink|source",
        resizeEnabled: true,
        icons: null // Disable default icons so we can use custom ones
    });

    // Wait for SCEditor to initialize before replacing icons
    setTimeout(function () {
        $(".sceditor-button-bold div").html('<i class="fa-regular fa-bold"></i>');
        $(".sceditor-button-italic div").html('<i class="fa-regular fa-italic"></i>');
        $(".sceditor-button-underline div").html('<i class="fa-regular fa-underline"></i>');
        $(".sceditor-button-code div").html('<i class="fa-solid fa-code"></i>');
        $(".sceditor-button-image div").html('<i class="fa-regular fa-image"></i>');
        $(".sceditor-button-link div").html('<i class="fa-solid fa-link"></i>');
        $(".sceditor-button-unlink div").html('<i class="fa-solid fa-unlink"></i>');
        $(".sceditor-button-quote div").html('<i class="fa-solid fa-quote-left"></i>');
    }, 100);
});
