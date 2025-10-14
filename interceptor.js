(function() {
    'use strict';
    
    let interceptedCount = 0;
    let missedCount = 0;
    
    function interceptResource(element, type) {
        const url = element.src || element.href;
        
        // Check if already too late
        if ((type === 'script' && element.complete) || 
            (type === 'css' && element.sheet)) {
            console.warn(`⏰ Too late for ${type}:`, url);
            missedCount++;
            return false;
        }
        
        console.log(`✅ Intercepted ${type}:`, url);
        interceptedCount++;
        
        if (type === 'script') {
            element.async = true;
        } else if (type === 'css') {
            // CSS preload logic
        }
        
        return true;
    }
    
    function reportResults() {
        console.log(`📊 Interception Results: ${interceptedCount} successful, ${missedCount} missed`);
        if (missedCount > 0) {
            console.warn('💡 Consider moving interceptor earlier in <head>');
        }
    }
    
    // Run interception
    document.querySelectorAll('script[src]').forEach(s => interceptResource(s, 'script'));
    document.querySelectorAll('link[rel="stylesheet"]').forEach(l => interceptResource(l, 'css'));
    
    // Report after a short delay
    setTimeout(reportResults, 100);
})();
