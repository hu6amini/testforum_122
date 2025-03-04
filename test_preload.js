$(document).ready(function () {
  function applyReadmore(target) {
    $(target)
      .find(".quote")
      .not(".ve-content.color .quote") // Exclude .quote elements inside .ve-content.color
      .readmore({
        speed: 150,
        collapsedHeight: 170,
        moreLink: '<a href="#" class="quote-expand">Show More...</a>',
        lessLink: "",
        beforeToggle: function (trigger, element, expanded) {
          if (!expanded) {
            // Move the "Show More" link inside the .quote at the bottom
            $(element).append($(trigger));
          }
        },
        afterToggle: function (trigger, element, expanded) {
          if (expanded) {
            $(trigger).remove(); // Remove the "Show More" button after expanding
          }
        },
      });
  }

  // Apply Readmore.js to initial .color elements
  applyReadmore($(".color"));

  // MutationObserver to watch for dynamically added .color elements
  const quoteObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if ($(node).is(".color")) {
          applyReadmore($(node)); // Apply Readmore.js to newly added .color elements
        } else if ($(node).find(".color").length) {
          applyReadmore($(node).find(".color")); // If a parent contains .color elements, apply Readmore.js
        }
      });
    });
  });

  // Start observing the document body for added nodes
  quoteObserver.observe(document.body, { childList: true, subtree: true });
});
