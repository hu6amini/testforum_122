document.addEventListener("DOMContentLoaded", function () {
    function extractImageSize(src, callback) {
        let tempImg = new Image();
        tempImg.src = src;
        tempImg.onload = function () {
            callback(tempImg.width, tempImg.height);
        };
    }

    function prepareLazyImages() {
        document.querySelectorAll(".color img:not(.lazyload)").forEach(img => {
            if (!img.hasAttribute("data-src")) {
                let originalSrc = img.src; // Store original source
                extractImageSize(originalSrc, (width, height) => {
                    // Set attributes for lazy loading
                    img.setAttribute("data-src", originalSrc);
                    img.setAttribute("src", `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}' viewBox='0 0 ${width} ${height}'%3E%3C/svg%3E`);
                    img.setAttribute("width", width);
                    img.setAttribute("height", height);
                    img.setAttribute("decoding", "async"); // Add decoding attribute
                    img.classList.add("lazyload"); // Add lazyload class
                });
            }
        });
    }

    // Call the function to prepare lazy images
    prepareLazyImages();
});
