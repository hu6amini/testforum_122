(function() {
    'use strict';
    console.log('🎯 Optimized Interceptor started at:', performance.now(), 'ms');
    
    // Domains to skip (already optimized by us)
    const skipDomains = [
        'cdn.jsdelivr.net',
        'res.cloudinary.com',
        'fonts.googleapis.com',
        'fonts.gstatic.com',
        'cdnjs.cloudflare.com'
    ];
    
    // Critical resources to never touch
    const criticalResources = [
        'css_main', // Forum's main CSS
        'jq.js',    // jQuery core
        'jqt.js',   // jQuery plugins
        'turnstile/v0/api.js', // Cloudflare protection
        'handlebars/hb.js' // Template engine
    ];
    
    // Late-injected scripts we CAN optimize
    const targetScripts = [
        'jquery.modal/modal.js',
        'jquery.scrollbar/jquery.scrollbar.js', 
        'jquery.timeago/jquery.timeago.en.js',
        'popperjs/popper.js',
        'tippyjs/tippy.js',
        'internals/notifications/plugin_v3.js'
    ];
    
    // Non-critical CSS that can be preloaded
    const nonCriticalCss = [
        'jquery.modal/modal.css',
        'jquery.scrollbar/jquery.scrollbar.css',
        'lightgallery-js/lightgallery.min.css',
        'slick-carousel/slick.min.css',
        'lite-youtube-embed/lite-yt-embed.min.css'
    ];
    
    function shouldIntercept(url, element) {
        // Skip already optimized domains
        if (skipDomains.some(domain => url.includes(domain))) {
            return false;
        }
        
        // Skip critical resources
        if (criticalResources.some(resource => url.includes(resource))) {
            return false;
        }
        
        // Skip elements that already have async/defer/module
        if (element.async || element.defer || element.getAttribute('type') === 'module') {
            return false;
        }
        
        // Check if already loading/loaded
        if (isAlreadyLoading(element)) {
            console.log('⏩ Skipping - already loading:', url);
            return false;
        }
        
        return true;
    }
    
    function isAlreadyLoading(element) {
        if (element.tagName === 'SCRIPT') {
            return element.complete || 
                   element.readyState === 'loading' || 
                   element.readyState === 'interactive' ||
                   element.readyState === 'complete';
        }
        
        if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
            return element.sheet !== null; // CSSOM created = loaded
        }
        
        return false;
    }
    
    function optimizeScript(script) {
        if (!shouldIntercept(script.src, script)) return false;
        
        // Check if it's one of our target late-injected scripts
        const isTargetScript = targetScripts.some(pattern => script.src.includes(pattern));
        
        if (isTargetScript) {
            console.log('✅ Making target script async:', script.src);
            script.async = true;
            return true;
        }
        
        // For other non-critical scripts, be more aggressive
        console.log('⚡ Making non-critical script async:', script.src);
        script.async = true;
        return true;
    }
    
    function optimizeCss(link) {
        if (!shouldIntercept(link.href, link)) return false;
        if (link.id === 'css_main') return false;
        
        // Check if it's non-critical CSS that can be preloaded
        const isNonCritical = nonCriticalCss.some(pattern => link.href.includes(pattern));
        
        if (isNonCritical) {
            console.log('🎨 Converting non-critical CSS to preload:', link.href);
            convertCssToPreload(link);
            return true;
        }
        
        return false;
    }
    
    function convertCssToPreload(link) {
        const newLink = link.cloneNode(false);
        newLink.rel = 'preload';
        newLink.as = 'style';
        newLink.onload = function() {
            this.rel = 'stylesheet';
            console.log('🔄 CSS applied after preload:', this.href);
        };
        
        // Add noscript fallback for non-JS users
        const noscript = document.createElement('noscript');
        const fallbackLink = link.cloneNode(false);
        fallbackLink.rel = 'stylesheet';
        noscript.appendChild(fallbackLink);
        
        // Replace the original link
        link.parentNode.replaceChild(newLink, link);
        newLink.parentNode.insertBefore(noscript, newLink.nextSibling);
    }
    
    // Process only safe-to-modify elements
    function processSafeElements() {
        let optimized = 0;
        
        // Only process scripts that are NOT complete yet
        document.querySelectorAll('script[src]:not([async]):not([defer]):not([complete])').forEach(script => {
            if (optimizeScript(script)) optimized++;
        });
        
        // Only process CSS that hasn't loaded yet
        document.querySelectorAll('link[rel="stylesheet"]:not([data-optimized])').forEach(link => {
            if (link.sheet === null && optimizeCss(link)) {
                link.setAttribute('data-optimized', 'true');
                optimized++;
            }
        });
        
        console.log(`📊 Initial optimization: ${optimized} resources optimized`);
    }
    
    // Watch for NEW elements only
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    // Small delay to ensure element is settled but not yet loading
                    setTimeout(() => {
                        if (!node.parentNode) return; // Element was removed
                        
                        if (node.tagName === 'SCRIPT' && node.src && !node.async && !node.defer) {
                            optimizeScript(node);
                        }
                        
                        if (node.tagName === 'LINK' && node.rel === 'stylesheet' && !node.getAttribute('data-optimized')) {
                            if (node.sheet === null) { // Not loaded yet
                                optimizeCss(node);
                                node.setAttribute('data-optimized', 'true');
                            }
                        }
                    }, 10);
                }
            });
        });
    });
    
    // Start optimization
    processSafeElements();
    
    // Observe for new resources
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('🛡️ Optimized Interceptor activated - targeting late-injected resources');
})();
