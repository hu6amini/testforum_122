        function prepareLazyImages() {
            const images = document.querySelectorAll(".post .color img[data-ffbsrc]");
            images.forEach(img => {
                const originalSrc = img.getAttribute("data-ffbsrc"); // Get the source from data-ffbsrc
                if (originalSrc) {
                    // Set a lightweight placeholder immediately
                    img.setAttribute("src", "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3C/svg%3E");
                    img.setAttribute("decoding", "async"); // Add decoding attribute

                    // Extract dimensions without blocking the main thread
                    const tempImg = new Image();
                    tempImg.src = originalSrc;
                    tempImg.onload = function () {
                        // Update the image with the correct dimensions and placeholder
                        img.setAttribute("width", tempImg.width);
                        img.setAttribute("height", tempImg.height);
                        img.setAttribute("src", "data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='" + tempImg.width + "' height='" + tempImg.height + "' viewBox='0 0 " + tempImg.width + " " + tempImg.height + "'%3E%3C/svg%3E");
                    };
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
