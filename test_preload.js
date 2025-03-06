$(document).ready(function() {
  function applyReadmore(target) {
    $(target).find(".color .quote").not(".ve-content.color .quote").readmore({
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

  // Apply Readmore.js to initial elements, explicitly excluding .ve-content.color .quote
  applyReadmore(document);

  // MutationObserver to watch for dynamically added .color elements
  const quoteObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if ($(node).is(".color")) {
          applyReadmore(node); // Apply Readmore.js to newly added .color elements
        } else if ($(node).find(".color .quote").not(".ve-content.color .quote").length) {
          applyReadmore(node); // If a parent contains .color elements, apply Readmore.js
        }
      });
    });
  });

  quoteObserver.observe(document.body, { childList: true, subtree: true });
});
