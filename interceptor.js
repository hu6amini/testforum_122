(function() {
    'use strict';
    console.log('🚀 Comprehensive interceptor started');
    
    // Scripts that should remain synchronous (critical)
    const criticalScripts = [
        'jq.js',           // jQuery core - many dependencies
        'jqt.js',          // jQuery plugins - dependencies
        'turnstile/v0/api.js' // Cloudflare - might need specific timing
    ];
    
    // CSS files that should remain as-is
    const criticalCSS = [
        'css_main',        // Forum main CSS (by ID)
        'modal.css',       // Already preloaded by you
        'lightgallery.min.css', // Already handled
        'slick.min.css',   // Already handled  
        'lite-yt-embed.min.css' // Already handled
    ];
    
    // Function to check if script should be async
    function shouldMakeAsync(src) {
        // Skip if already has async/defer/module
        if (src.async || src.defer || src.type === 'module') return false;
        
        // Skip critical scripts
        const isCritical = criticalScripts.some(pattern => src.src.includes(pattern));
        return !isCritical;
    }
    
    // Function to check if CSS should be preloaded
    function shouldPreloadCSS(link) {
        // Skip if already preloaded or has media="print" etc.
        if (link.rel.includes('preload') || link.media === 'print') return false;
        
        // Skip critical CSS (already handled or main CSS)
        const isCritical = criticalCSS.some(pattern => 
            link.id === pattern || link.href.includes(pattern)
        );
        return !isCritical;
    }
    
    // Process existing elements
    function processExistingElements() {
        // Process existing scripts
        document.querySelectorAll('script[src]').forEach(script => {
            if (shouldMakeAsync(script)) {
                console.log('📜 Making existing script async:', script.src);
                script.async = true;
                
                // Clone and replace for scripts that might have started loading
                if (script.parentNode) {
                    const newScript = document.createElement('script');
                    newScript.src = script.src;
                    newScript.async = true;
                    script.parentNode.replaceChild(newScript, script);
                }
            }
        });
        
        // Process existing CSS links (non-critical)
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            if (shouldPreloadCSS(link)) {
                console.log('🎨 Preloading non-critical CSS:', link.href);
                
                // Create preload
                const preload = document.createElement('link');
                preload.rel = 'preload';
                preload.as = 'style';
                preload.href = link.href;
                if (link.crossOrigin) preload.crossOrigin = link.crossOrigin;
                
                // Insert preload before the stylesheet
                link.parentNode.insertBefore(preload, link);
                
                // Add onload to switch rel after load
                preload.onload = () => {
                    link.media = 'all'; // Ensure it applies
                };
            }
        });
    }
    
    // MutationObserver for new elements
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                // Handle new scripts
                if (node.nodeName === 'SCRIPT' && node.src) {
                    if (shouldMakeAsync(node)) {
                        console.log('👀 Making new script async:', node.src);
                        node.async = true;
                    }
                }
                
                // Handle new CSS links
                if (node.nodeName === 'LINK' && node.rel === 'stylesheet') {
                    if (shouldPreloadCSS(node)) {
                        console.log('👀 Preloading new CSS:', node.href);
                        
                        const preload = document.createElement('link');
                        preload.rel = 'preload';
                        preload.as = 'style';
                        preload.href = node.href;
                        if (node.crossOrigin) preload.crossOrigin = node.crossOrigin;
                        
                        node.parentNode.insertBefore(preload, node);
                    }
                }
            });
        });
    });
    
    // Start processing
    processExistingElements();
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Comprehensive interceptor activated');
})();
