// timing-checker.js - Run this first to see if interception is possible
(function() {
    'use strict';
    
    console.log('⏰ Timing Checker started at:', performance.now(), 'ms');
    
    // Check script loading states
    const scripts = document.querySelectorAll('script[src]');
    console.log('📜 Scripts found:', scripts.length);
    
    scripts.forEach((script, index) => {
        const state = {
            src: script.src,
            async: script.async,
            defer: script.defer, 
            complete: script.complete,
            readyState: script.readyState,
            loadingTime: performance.now()
        };
        console.log(`Script ${index}:`, state);
    });
    
    // Check CSS loading states
    const cssLinks = document.querySelectorAll('link[rel="stylesheet"]');
    console.log('🎨 CSS links found:', cssLinks.length);
    
    cssLinks.forEach((link, index) => {
        const state = {
            href: link.href,
            id: link.id,
            sheet: link.sheet, // null if not loaded yet
            loadingTime: performance.now()
        };
        console.log(`CSS ${index}:`, state);
    });
    
    // Monitor new resources for 5 seconds
    const resources = new Set();
    const resourceObserver = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
            if (!resources.has(entry.name)) {
                resources.add(entry.name);
                console.log('📥 Resource loaded:', entry.name, 'at', entry.startTime, 'ms');
            }
        });
    });
    
    resourceObserver.observe({entryTypes: ['resource']});
    
    setTimeout(() => {
        console.log('🛑 Timing check complete. Resources loaded:', resources.size);
        resourceObserver.disconnect();
    }, 5000);
})();
