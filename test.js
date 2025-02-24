$(document).ready(function () {
    var $post = $("#Post");
    $post.attr("placeholder", "Write your reply..."); // Set placeholder

    $post.sceditor({
        format: "bbcode",
        style: "https://cdnjs.cloudflare.com/ajax/libs/sceditor/3.2.0/themes/content/default.min.css",
        toolbar: "bold,italic,underline|left,center,right|quote,code|image,link,unlink|source",
        resizeEnabled: true,
        plugins: "bbcode",
        toolbarExclude: "source"
    }).sceditor("instance").sourceMode(true);
});
