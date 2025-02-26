function extractImageSize(src, callback) {
    let tempImg = new Image();
    tempImg.src = src;
    tempImg.onload = function () {
        callback(tempImg.width, tempImg.height);
    };
}

function prepareLazyImages() {
    const images = document.querySelectorAll(".post .color img[data-ffbsrc]");
    images.forEach(img => {
        let originalSrc = img.getAttribute("data-ffbsrc"); // Get the source from data-ffbsrc
        if (originalSrc) {
            extractImageSize(originalSrc, function (width, height) {
                // Set attributes for proper sizing and lazy loading
                img.setAttribute("src", "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "' viewBox='0 0 " + width + " " + height + "'%3E%3C/svg%3E"); // Set placeholder SVG
                img.setAttribute("width", width); // Set width attribute
                img.setAttribute("height", height); // Set height attribute
                img.setAttribute("decoding", "async"); // Add decoding attribute
            });
        }
    });
}

// Process images immediately without waiting for DOMContentLoaded
prepareLazyImages();

// Optional: Use MutationObserver to handle dynamically added images
const postContainer = document.querySelector(".post"); // Adjust selector if needed
if (postContainer) {
    const observer = new MutationObserver(() => {
        prepareLazyImages();
    });
    observer.observe(postContainer, { childList: true, subtree: true });
}
