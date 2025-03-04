$(document).ready(function() {
  function applyReadmore(target) {
    $(target).find(".quote").readmore({
      speed: 382,
      collapsedHeight: 170,
      moreLink: function() {
        return '<button type="button" class="show-more-btn">Show More...</button>'; // "Show More" button as child
      },
      lessLink: '', // Removes the "Show Less" button if you don't need it
      afterToggle: function(trigger, element, expanded) {
        if (expanded) {
          $(trigger).remove(); // Removes the "Show More" button after expanding
        }
      }
    });
  }

  // Apply Readmore.js to initial elements
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
