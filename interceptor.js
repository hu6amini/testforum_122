// interceptor.js - Debug version
(function() {
    'use strict';
    console.log('🔄 Interceptor started at:', performance.now(), 'ms');
    
    // Check for scripts already in the DOM
    const existingScripts = document.querySelectorAll('script[src]');
    console.log('📜 Scripts already in DOM:', existingScripts.length);
    existingScripts.forEach(script => {
        console.log('  -', script.src, 'async:', script.async, 'defer:', script.defer);
    });
    
    const scriptsToAsync = [
        'handlebars/hb.js',
        'jq.js',
        'jqt.js', 
        'jquery.modal/modal.js',
        'turnstile/v0/api.js',
        'recaptcha/api.js'
    ];
    
    // Method 1: Immediately modify existing scripts
    existingScripts.forEach(script => {
        const shouldAsync = scriptsToAsync.some(pattern => script.src.includes(pattern));
        if (shouldAsync && !script.async && !script.defer) {
            console.log('🎯 Converting existing script to async:', script.src);
            script.async = true;
            
            // For scripts that might have already started loading, clone them
            if (script.getAttribute('src') && script.parentNode) {
                const newScript = document.createElement('script');
                newScript.src = script.src;
                newScript.async = true;
                script.parentNode.replaceChild(newScript, script);
                console.log('♻️  Replaced with async version:', script.src);
            }
        }
    });
    
    // Method 2: MutationObserver for any new scripts
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeName === 'SCRIPT' && node.src) {
                    console.log('👀 New script detected:', node.src);
                    const shouldAsync = scriptsToAsync.some(pattern => node.src.includes(pattern));
                    
                    if (shouldAsync && !node.async && !node.defer) {
                        console.log('🎯 Making new script async:', node.src);
                        node.async = true;
                    }
                }
            });
        });
    });
    
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    console.log('✅ Interceptor fully activated');
})();
