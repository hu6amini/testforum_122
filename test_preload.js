$(document).ready(function() {
    function applyReadMore() {
      $('div[align="center"] .quote').readmore({
        speed: 382,
        collapsedHeight: 100
      });
    }

    // Apply Readmore.js initially
    applyReadMore();

    // MutationObserver to detect changes
    quot = quot || {}; // Ensure quot namespace exists
    quot.observe = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          applyReadMore(); // Reapply Readmore.js when new content is added
        }
      });
    });

    // Start observing the body for changes
    quot.observe.observe(document.body, { childList: true, subtree: true });
  });
