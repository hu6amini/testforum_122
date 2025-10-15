(function() {
    'use strict';
    const startTime = performance.now();
    console.log('🎯 Smart Interceptor started at:', startTime, 'ms');
    
    // Track all resources we've seen and modified
    window.interceptorTracker = {
        started: startTime,
        successful: [],
        skipped: [],
        failed: []
    };
    
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
        'css_main',
        'jq.js',
        'jqt.js', 
        'turnstile/v0/api.js',
        'handlebars/hb.js'
    ];
    
    // Record all CURRENT resources (so we can ignore them)
    const initialResources = new Set();
    
    // Capture all scripts currently in head
    document.querySelectorAll('head script[src]').forEach(script => {
        initialResources.add(script.src);
        window.interceptorTracker.skipped.push({
            type: 'script',
            url: script.src,
            reason: 'Already in head at startup',
            time: performance.now()
        });
    });
    
    // Capture all CSS currently in head  
    document.querySelectorAll('head link[rel="stylesheet"]').forEach(link => {
        initialResources.add(link.href);
        window.interceptorTracker.skipped.push({
            type: 'css',
            url: link.href,
            reason: 'Already in head at startup',
            time: performance.now()
        });
    });
    
    console.log(`📝 Ignoring ${initialResources.size} pre-existing resources`);
    
    function isNewResource(url) {
        return !initialResources.has(url);
    }
    
    function shouldIntercept(url, element) {
        // Skip if resource was already present at startup
        if (!isNewResource(url)) {
            return false;
        }
        
        // Skip our optimized domains
        if (skipDomains.some(domain => url.includes(domain))) {
            logSkipped(element, 'Optimized domain (jsdelivr/cloudinary)');
            return false;
        }
        
        // Skip critical resources
        if (criticalResources.some(resource => url.includes(resource))) {
            logSkipped(element, 'Critical resource');
            return false;
        }
        
        // Skip already async/defer/module
        if (element.async || element.defer || element.getAttribute('type') === 'module') {
            logSkipped(element, 'Already async/defer/module');
            return false;
        }
        
        // Skip if already loading
        if (isAlreadyLoading(element)) {
            logSkipped(element, 'Already loading');
            return false;
        }
        
        return true;
    }
    
    function isAlreadyLoading(element) {
        if (element.tagName === 'SCRIPT') {
            return element.complete || element.readyState !== 'uninitialized';
        }
        if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
            return element.sheet !== null;
        }
        return false;
    }
    
    function logSkipped(element, reason) {
        const url = element.src || element.href;
        const entry = {
            type: element.tagName.toLowerCase(),
            url: url,
            reason: reason,
            time: performance.now()
        };
        window.interceptorTracker.skipped.push(entry);
        console.log(`⏩ Skipped: ${reason} - ${url}`);
    }
    
    function logSuccess(element, action) {
        const url = element.src || element.href;
        const entry = {
            type: element.tagName.toLowerCase(),
            url: url,
            action: action,
            time: performance.now(),
            success: true
        };
        window.interceptorTracker.successful.push(entry);
        console.log(`✅ SUCCESS: ${action} - ${url}`);
    }
    
    function logFailed(element, action, error) {
        const url = element.src || element.href;
        const entry = {
            type: element.tagName.toLowerCase(),
            url: url,
            action: action,
            error: error,
            time: performance.now(),
            success: false
        };
        window.interceptorTracker.failed.push(entry);
        console.log(`❌ FAILED: ${action} - ${url}`, error);
    }
    
    function optimizeScript(script) {
        if (!shouldIntercept(script.src, script)) return false;
        
        try {
            // Mark as async
            script.async = true;
            
            // Verify the change was applied
            if (script.async) {
                logSuccess(script, 'Made script async');
                return true;
            } else {
                logFailed(script, 'Make script async', 'Async attribute not set');
                return false;
            }
        } catch (error) {
            logFailed(script, 'Make script async', error.message);
            return false;
        }
    }
    
    function optimizeCss(link) {
        if (!shouldIntercept(link.href, link)) return false;
        if (link.id === 'css_main') return false;
        
        try {
            convertCssToPreload(link);
            logSuccess(link, 'Converted CSS to preload');
            return true;
        } catch (error) {
            logFailed(link, 'Convert CSS to preload', error.message);
            return false;
        }
    }
    
    function convertCssToPreload(link) {
        const newLink = link.cloneNode(false);
        newLink.rel = 'preload';
        newLink.as = 'style';
        newLink.onload = function() {
            this.rel = 'stylesheet';
            console.log(`🔄 CSS loaded: ${this.href}`);
        };
        
        // Add noscript fallback
        const noscript = document.createElement('noscript');
        const fallbackLink = link.cloneNode(false);
        fallbackLink.rel = 'stylesheet';
        noscript.appendChild(fallbackLink);
        
        // Replace original
        link.parentNode.replaceChild(newLink, link);
        newLink.parentNode.insertBefore(noscript, newLink.nextSibling);
    }
    
    // Monitor for NEW resources only
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    // Small delay to let the element settle but catch it before loading
                    setTimeout(() => {
                        if (!node.parentNode) return;
                        
                        if (node.tagName === 'SCRIPT' && node.src && !node.async && !node.defer) {
                            optimizeScript(node);
                        }
                        
                        if (node.tagName === 'LINK' && node.rel === 'stylesheet' && 
                            !node.getAttribute('data-optimized') && node.id !== 'css_main') {
                            optimizeCss(node);
                            node.setAttribute('data-optimized', 'true');
                        }
                    }, 5); // Very short delay
                }
            });
        });
    });
    
    // Start observing for NEW elements
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });
    
    console.log('🛡️ Smart Interceptor activated - only targeting NEW resources');
    console.log('💡 Check window.interceptorTracker for detailed results');
    
    // Report results after 3 seconds
    setTimeout(() => {
        const tracker = window.interceptorTracker;
        console.log('📊 INTERCEPTOR FINAL REPORT:');
        console.log(`✅ Successful: ${tracker.successful.length}`);
        console.log(`⏩ Skipped: ${tracker.skipped.length}`); 
        console.log(`❌ Failed: ${tracker.failed.length}`);
        console.log('📋 Details:', tracker);
    }, 3000);
})();
