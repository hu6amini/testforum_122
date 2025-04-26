(function() {
    // Hide content until processing is done
    document.documentElement.style.visibility = 'hidden';
    
    const imageDimensionsCache = new Map();
    let isProcessing = false;
    
    // Check if image should be skipped
    const shouldSkipImage = function(img) {
        return img.closest(".slick_carousel") || 
               img.closest("#st-visual-editor") || 
               img.closest(".send") ||
               img.hasAttribute("data-src") || 
               img.classList.contains("lazyload") || 
               img.getAttribute("decoding") === "async" || 
               img.src.indexOf("data:") === 0;
    };
    
    // Create SVG placeholder (string concatenation version)
    const createPlaceholder = function(width, height) {
        return 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'' + 
               (width || 100) + '\' height=\'' + (height || 100) + 
               '\' viewBox=\'0 0 ' + (width || 100) + ' ' + (height || 100) + 
               '\'%3E%3C/svg%3E';
    };
    
    // Convert image to lazyload format with placeholder
    const convertToLazyload = function(img, src, width, height) {
        img.src = createPlaceholder(width, height); // Critical: set placeholder first
        img.setAttribute('data-src', src);
        img.classList.add('lazyload');
        img.setAttribute('decoding', 'async');
        
        if (width && height) {
            img.setAttribute('width', width);
            img.setAttribute('height', height);
        }
    };
    
    // Process single image
    const processImage = function(img) {
        if (shouldSkipImage(img)) return;
        
        var src = img.src;
        if (!src || src.indexOf('data:') === 0) return;
        
        if (imageDimensionsCache.has(src)) {
            var dimensions = imageDimensionsCache.get(src);
            convertToLazyload(img, src, dimensions.width, dimensions.height);
            return;
        }
        
        var loader = new Image();
        loader.onload = function() {
            imageDimensionsCache.set(src, {
                width: loader.naturalWidth,
                height: loader.naturalHeight
            });
            convertToLazyload(img, src, loader.naturalWidth, loader.naturalHeight);
        };
        loader.onerror = function() {
            convertToLazyload(img, src);
        };
        loader.src = src;
    };
    
    // Process all images with debounce
    const processAllImages = function() {
        if (isProcessing) return;
        isProcessing = true;
        
        var images = document.querySelectorAll('img:not([data-src]):not(.lazyload)');
        for (var i = 0; i < images.length; i++) {
            processImage(images[i]);
        }
        
        document.documentElement.style.visibility = 'visible';
        isProcessing = false;
    };
    
    // MutationObserver for dynamic content
    var observer = new MutationObserver(function(mutations) {
        for (var m = 0; m < mutations.length; m++) {
            var addedNodes = mutations[m].addedNodes;
            for (var n = 0; n < addedNodes.length; n++) {
                var node = addedNodes[n];
                if (node.nodeType === 1) {
                    if (node.tagName === 'IMG') {
                        processImage(node);
                    } else if (node.querySelectorAll) {
                        var childImages = node.querySelectorAll('img:not([data-src]):not(.lazyload)');
                        for (var c = 0; c < childImages.length; c++) {
                            processImage(childImages[c]);
                        }
                    }
                }
            }
        }
    });
    
    // Initialize based on ready state
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', processAllImages);
    } else {
        processAllImages();
    }
    
    // Observe document for changes
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    // Event listeners for common updates
    var events = ['ajaxComplete', 'ajaxSuccess', 'load', 'pageshow'];
    for (var e = 0; e < events.length; e++) {
        window.addEventListener(events[e], processAllImages, { passive: true });
    }
})();
