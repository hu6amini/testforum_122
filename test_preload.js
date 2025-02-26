document.addEventListener("DOMContentLoaded", function() {
    function extractImageSize(src, callback) {
        let tempImg = new Image();
        tempImg.src = src;
        tempImg.onload = function () {
            callback(tempImg.width, tempImg.height);
        };
    }

    function prepareLazyImages() {
        const images = document.querySelectorAll(".color img[data-ffbsrc]:not(.lazyload)");
        images.forEach(img => {
            let originalSrc = img.getAttribute("data-ffbsrc"); // Get the source from data-ffbsrc
            if (originalSrc) {
                extractImageSize(originalSrc, function (width, height) {
                    // Set attributes for lazy loading
                    img.setAttribute("data-src", originalSrc);
                    img.setAttribute("src", "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "' viewBox='0 0 " + width + " " + height + "'%3E%3C/svg%3E");
                    img.setAttribute("width", width);
                    img.setAttribute("height", height);
                    img.setAttribute("decoding", "async"); // Add decoding attribute
                    img.classList.add("lazyload"); // Add lazyload class
                });
            }
        });
    }

    // Debounce function to limit the frequency of calls
    function debounce(func, wait) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Debounced version of prepareLazyImages
    const debouncedPrepareLazyImages = debounce(prepareLazyImages, 100);

    // Initial call to process images
    debouncedPrepareLazyImages();

    // Observe changes in the document
    const observer = new MutationObserver(debouncedPrepareLazyImages);
    observer.observe(document.body, { childList: true, subtree: true });
});
