$(document).ready(function() {
  function applyReadmore(target) {
    // Apply Readmore.js to the target .quote element
    $(target).readmore({
      speed: 618,
      collapsedHeight: 170,
      moreLink: '<a href="#">Show More...</a>',
      lessLink: '',
      afterToggle: function(trigger, element, expanded) {
        if (expanded) {
          $(trigger).remove(); // Removes the "Show More" button after expanding
        }
      }
    });
  }

  // Apply Readmore.js to initial .quote elements inside .color
  $(".color .quote").each(function() {
    applyReadmore($(this));
  });

  // MutationObserver to watch for dynamically added .color elements
  const quoteObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        // Check if the added node is a .color element or contains .color elements
        if ($(node).is(".color") || $(node).find(".color").length) {
          // Find .quote elements inside .color and apply Readmore.js to them
          $(node).find(".color .quote").each(function() {
            applyReadmore($(this));
          });
        }
      });
    });
  });

  quoteObserver.observe(document.body, { childList: true, subtree: true });
});
