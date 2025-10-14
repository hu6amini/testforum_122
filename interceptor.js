(function() {
    'use strict';
    console.log('🚀 Enhanced Interceptor started');
    
    // Domains to skip (already optimized)
    const skipDomains = [
        'cdn.jsdelivr.net',
        'res.cloudinary.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com'
    ];
    
    // Critical resources to never touch
    const criticalResources = [
        'css_main', // Forum's main CSS
        'jq.js',    // jQuery core
        'jqt.js'    // jQuery plugins
    ];
    
    function shouldIntercept(url, element) {
        // Skip already optimized domains
        if (skipDomains.some(domain => url.includes(domain))) {
            return false;
        }
        
        // Skip critical resources
        if (criticalResources.some(resource => url.includes(resource) || element.id === resource)) {
            return false;
        }
        
        // Skip elements that already have async/defer/module
        if (element.async || element.defer || element.getAttribute('type') === 'module') {
            return false;
        }
        
        return true;
    }
    
    function makeScriptAsync(script) {
        console.log('📜 Making script async:', script.src);
        script.async = true;
    }
    
    function makeCssPreload(link) {
        console.log('🎨 Converting CSS to preload:', link.href);
        
        // Create preload link
        const preload = document.createElement('link');
        preload.rel = 'preload';
        preload.as = 'style';
        preload.href = link.href;
        document.head.appendChild(preload);
        
        // Add onload to apply CSS after preload
        link.onload = function() {
            this.rel = 'stylesheet';
            this.onload = null;
        };
        
        // Remove original link and re-add with new behavior
        const newLink = link.cloneNode(false);
        newLink.rel = 'preload';
        newLink.as = 'style';
        newLink.onload = function() {
            this.rel = 'stylesheet';
        };
        link.parentNode.replaceChild(newLink, link);
    }
    
    // Process existing elements
    function processExistingElements() {
        // Scripts
        document.querySelectorAll('script[src]:not([async]):not([defer])').forEach(script => {
            if (shouldIntercept(script.src, script)) {
                makeScriptAsync(script);
            }
        });
        
        // CSS links
        document.querySelectorAll('link[rel="stylesheet"]:not([data-optimized])').forEach(link => {
            if (shouldIntercept(link.href, link) && link.id !== 'css_main') {
                makeCssPreload(link);
                link.setAttribute('data-optimized', 'true');
            }
        });
    }
    
    // MutationObserver for new elements
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    // New scripts
                    if (node.tagName === 'SCRIPT' && node.src && !node.async && !node.defer) {
                        if (shouldIntercept(node.src, node)) {
                            makeScriptAsync(node);
                        }
                    }
                    
                    // New CSS links
                    if (node.tagName === 'LINK' && node.rel === 'stylesheet' && !node.getAttribute('data-optimized')) {
                        if (shouldIntercept(node.href, node) && node.id !== 'css_main') {
                            makeCssPreload(node);
                            node.setAttribute('data-optimized', 'true');
                        }
                    }
                }
            });
        });
    });
    
    // Start intercepting
    processExistingElements();
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('✅ Enhanced Interceptor activated');
})();
