$(document).ready(function () {
    $("#Post").sceditor({
        format: "bbcode",
        style: "https://cdnjs.cloudflare.com/ajax/libs/sceditor/3.2.0/themes/content/default.min.css",
        toolbar: "bold,italic,underline|left,center,right|quote,code|image,link,unlink|source",
        resizeEnabled: true,
        plugins: "bbcode", // Ensures BBCode mode
        toolbarExclude: "source" // Hides the source button (optional)
    }).sceditor("instance").sourceMode(true); // Forces source mode (BBCode only)
});
