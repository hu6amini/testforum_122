document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".color img").forEach(function (img) {
        if (img.complete && img.naturalWidth && img.naturalHeight) {
            var width = img.naturalWidth;
            var height = img.naturalHeight;
            var src = img.src;

            // Only process if not already lazyloaded
            if (!img.classList.contains("lazyload")) {
                img.setAttribute("data-src", src);
                img.setAttribute("width", width);
                img.setAttribute("height", height);
                img.setAttribute("decoding", "async");
                img.classList.add("lazyload");

                // Set placeholder SVG to avoid layout shifts
                img.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "' viewBox='0 0 " + width + " " + height + "'%3E%3C/svg%3E";
            }
        }
    });
});
