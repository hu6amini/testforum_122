$(document).ready(function() {
  function applyReadmore(target) {
    $(target).find(".quote").readmore({
      speed: 618,
      collapsedHeight: 170,
      moreLink: '<button type="button">Show More...</button>', // Use a button instead of an anchor
      lessLink: '', // You can also customize the "Show Less" button if needed
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
