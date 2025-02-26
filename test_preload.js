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

    // Immediately process images when the DOM is ready
    prepareLazyImages();

    // Use IntersectionObserver for lazy loading
    const lazyImages = document.querySelectorAll(".color img.lazyload");
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.getAttribute("data-src");
                img.removeAttribute("data-src");
                observer.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => {
        observer.observe(img);
    });
});
