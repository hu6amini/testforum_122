(function() {
    'use strict';
    console.log('🎯 DOM-Replacement Interceptor started at:', performance.now(), 'ms');
    
    const skipDomains = ['cdn.jsdelivr.net', 'res.cloudinary.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com'];
    const criticalResources = ['css_main', 'jq.js', 'jqt.js', 'turnstile/v0/api.js', 'handlebars/hb.js'];
    const targetScripts = ['jquery.modal/modal.js', 'jquery.scrollbar/jquery.scrollbar.js', 'jquery.timeago/jquery.timeago.en.js', 'popperjs/popper.js', 'tippyjs/tippy.js', 'internals/notifications/plugin_v3.js'];
    
    function shouldIntercept(url, element) {
        if (skipDomains.some(domain => url.includes(domain))) return false;
        if (criticalResources.some(resource => url.includes(resource))) return false;
        if (element.async || element.defer || element.getAttribute('type') === 'module') return false;
        return true;
    }
    
    function optimizeScript(script) {
        if (!shouldIntercept(script.src, script)) return false;
        if (script.complete || script.readyState === 'loading') {
            console.log('⏩ Too late to replace:', script.src);
            return false;
        }
        
        console.log('🔄 Replacing render-blocking script:', script.src);
        
        const newScript = document.createElement('script');
        newScript.src = script.src;
        newScript.async = true;
        
        // Copy attributes
        for (let attr of script.attributes) {
            if (!['async', 'defer', 'src'].includes(attr.name)) {
                newScript.setAttribute(attr.name, attr.value);
            }
        }
        
        if (script.parentNode) {
            script.parentNode.replaceChild(newScript, script);
        }
        
        return true;
    }
    
    function processScripts() {
        let replaced = 0;
        document.querySelectorAll('script[src]:not([async]):not([defer])').forEach(script => {
            if (optimizeScript(script)) replaced++;
        });
        console.log(`📊 Scripts replaced: ${replaced}`);
    }
    
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1 && node.tagName === 'SCRIPT' && node.src) {
                    setTimeout(() => {
                        if (node.parentNode && !node.async && !node.defer) {
                            optimizeScript(node);
                        }
                    }, 10);
                }
            });
        });
    });
    
    processScripts();
    observer.observe(document.head, { childList: true, subtree: true });
    observer.observe(document.body, { childList: true, subtree: true });
})();
