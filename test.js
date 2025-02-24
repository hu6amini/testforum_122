$(document).ready(function () {
    var $post = $("#Post");
    $post.attr("placeholder", "Write your reply..."); // Set placeholder

    var editor = $post.sceditor({
        format: "bbcode",
        style: "https://cdnjs.cloudflare.com/ajax/libs/sceditor/3.2.0/themes/content/default.min.css",
        toolbar: "bold,italic,underline,strikethrough|subscript,superscript|left,center,right,justify|" +
            "font,size,color,emoticon,removeformat|cut,copy,paste|bulletlist,orderedlist,table|" +
            "code,quote,spoiler|image,link,unlink,youtube|" +
            "ltr,rtl",
        resizeEnabled: true,
        plugins: "bbcode",
        toolbarExclude: "source"
    }).sceditor("instance");

    editor.sourceMode(true);

    // Sync the content in real-time
    editor.bind("keyup blur nodechanged", function () {
        $post.val(editor.val()); // Update the textarea content
    });
});
