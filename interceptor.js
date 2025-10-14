// Add this to monitor if scripts break anything
(function() {
    'use strict';
    
    let originalJQuery = window.jQuery;
    let original$ = window.$;
    let originalHandlebars = window.Handlebars;
    
    // Monitor for jQuery availability
    const checkDependencies = setInterval(() => {
        if (document.readyState === 'complete') {
            clearInterval(checkDependencies);
            
            const missing = [];
            if (!window.jQuery) missing.push('jQuery');
            if (!window.Handlebars) missing.push('Handlebars');
            if (typeof window.turnstile === 'undefined') missing.push('Cloudflare Turnstile');
            if (typeof window.grecaptcha === 'undefined') missing.push('reCAPTCHA');
            
            if (missing.length > 0) {
                console.error('Missing dependencies after async loading:', missing);
            } else {
                console.log('All dependencies loaded successfully');
            }
            
            // Test forum functionality
            setTimeout(() => {
                const brokenUI = [];
                // Test common forum elements
                if (!document.querySelector('.post') && document.body.innerHTML.includes('post')) {
                    brokenUI.push('Post rendering');
                }
                if (!document.querySelector('form') && document.forms.length === 0) {
                    brokenUI.push('Form functionality');
                }
                
                if (brokenUI.length > 0) {
                    console.warn('Possible UI issues:', brokenUI);
                }
            }, 1000);
        }
    }, 100);
})();
