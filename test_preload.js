$(document).ready(function() {
  function applyReadmore(target) {
    // Explicitly target .quote elements inside the target
    $(target).find(".quote").readmore({
      speed: 382,
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
  applyReadmore($(".color"));

  // MutationObserver to watch for dynamically added .color elements
  const quoteObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if ($(node).is(".color")) {
          applyReadmore($(node)); // Apply Readmore.js to newly added .color elements
        } else if ($(node).find(".color").length) {
          applyReadmore($(node).find(".color")); // If a parent contains .color elements, apply Readmore.js
        }
      });
    });
  });

  quoteObserver.observe(document.body, { childList: true, subtree: true });
});
