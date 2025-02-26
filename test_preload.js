(function() {
    function extractImageSize(src, callback) {
        let tempImg = new Image();
        tempImg.src = src;
        tempImg.onload = function () {
            callback(tempImg.width, tempImg.height);
        };
        tempImg.onerror = function () {
            console.error('Failed to load image:', src);
        };
    }

    function prepareLazyImages(images) {
        images.forEach(img => {
            const originalSrc = img.getAttribute("data-ffbsrc"); // Get the source from data-ffbsrc
            if (originalSrc && !img.hasAttribute("width")) {
                extractImageSize(originalSrc, function (width, height) {
                    // Set attributes for lazy loading
                    img.setAttribute("width", width);
                    img.setAttribute("height", height);
                    img.setAttribute("decoding", "async"); // Add decoding attribute
                });
            }
        });
    }

    function processImages() {
        const images = document.querySelectorAll(".color img[data-ffbsrc]");
        prepareLazyImages(images);
    }

    // Start processing images immediately
    processImages();

    // Observe changes in the document
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                const images = document.querySelectorAll(".color img[data-ffbsrc]");
                prepareLazyImages(images);
            }
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
