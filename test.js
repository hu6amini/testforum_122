$(document).ready(function() {
    var editor = $("#Post").sceditor({
        format: "bbcode",
        style: "https://cdnjs.cloudflare.com/ajax/libs/sceditor/3.2.0/themes/modern.min.css",
        toolbar: "bold,italic,underline|left,center,right|quote,code|image,link,unlink|source",
        resizeEnabled: true,
    });

    // Real-time sync with the hidden textarea
    editor.change(function() {
        var updatedContent = editor.val(); // Get the editor content
        $("#Post").val(updatedContent); // Update the hidden textarea value
        // Optionally, save to local storage like your existing logic
        localStorage.setItem('t63080656', updatedContent.trim());
    });
});
