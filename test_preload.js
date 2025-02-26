function extractImageSize(src, callback) {
    let tempImg = new Image();
    tempImg.src = src;
    tempImg.onload = function () {
        callback(tempImg.width, tempImg.height);
    };
}

function prepareLazyImages() {
    document.querySelectorAll(".color img").forEach(img => {
        if (!img.classList.contains("lazyload")) {
            // Store original source and prevent loading
            let originalSrc = img.src;
            img.src = "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1' viewBox='0 0 1 1'%3E%3C/svg%3E"; // Placeholder SVG
            img.setAttribute("data-src", originalSrc); // Set the original source for lazy loading

            // Extract dimensions
            extractImageSize(originalSrc, (width, height) => {
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
