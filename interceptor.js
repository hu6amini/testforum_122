(function() {
    'use strict';
    console.log('🛡️ Safe Interceptor started');
    
    // ONLY target these specific host scripts
    const safeToAsync = [
        'cdn.forumfree.net/libs/handlebars/hb.js',
        'cdn.forumfree.net/internals/notifications/',
        'cdn.forumfree.net/libs/jquery.scrollbar/',
        'cdn.forumfree.net/libs/jquery.timeago/',
        'cdn.forumfree.net/libs/popperjs/',
        'cdn.forumfree.net/libs/tippyjs/'
    ];
    
    // NEVER touch these
    const neverTouch = [
        'cdn.jsdelivr.net',
        'script.forumcommunity.net',
        'jq.js',
        'jqt.js',
        'jquery.modal/modal.js'
    ];
    
    function safeIntercept() {
        // Handle scripts
        document.querySelectorAll('script[src]').forEach(script => {
            const src = script.src;
            const isSafe = safeToAsync.some(pattern => src.includes(pattern));
            const isDangerous = neverTouch.some(pattern => src.includes(pattern));
            
            if (isSafe && !isDangerous && !script.async && !script.defer) {
                console.log('🛡️ Safely making async:', src);
                script.async = true;
            }
        });
        
        // Handle CSS - preload non-critical ones
        document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
            const href = link.href;
            const isNonCritical = href.includes('jquery.modal/modal.css') || 
                                 href.includes('jquery.scrollbar/scrollbar.css');
            
            if (isNonCritical && link.id !== 'css_main') {
                console.log('🎨 Preloading non-critical CSS:', href);
                
                const preload = document.createElement('link');
                preload.rel = 'preload';
                preload.as = 'style';
                preload.href = href;
                document.head.appendChild(preload);
            }
        });
    }
    
    safeIntercept();
    new MutationObserver(safeIntercept).observe(document.documentElement, {
        childList: true,
        subtree: true
    });
})();
