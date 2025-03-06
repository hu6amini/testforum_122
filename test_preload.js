 $(document).ready(function () {
    function applyReadMore(target) {
      $(target).readmore({
        speed: 382,
        collapsedHeight: 100,
        moreLink: '<a href="#">Read more</a>',
        lessLink: '<a href="#">Read less</a>'
      });
    }

    // Initial application
    applyReadMore('.quote');

    // MutationObserver to detect new .quote elements
    quot = quot || {}; // Ensure quot namespace exists
    quot.observe = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        if (mutation.type === 'childList') {
          $(mutation.addedNodes).each(function () {
            if ($(this).find('.quote').length) {
              applyReadMore($(this).find('.quote'));
            }
          });
        }
      });
    });

    // Start observing changes inside #ajaxObject (more specific)
    quot.observe.observe(document.getElementById('ajaxObject'), {
      childList: true,
      subtree: true
    });
  });
