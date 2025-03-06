$(document).ready(function() {
  function applyReadmore(target) {
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

    // Prevent default action of the "Show More" link
    $(target).find(".quote").on("click", "a[href='#']", function(event) {
      event.preventDefault(); // Stop the link from scrolling to the top
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
