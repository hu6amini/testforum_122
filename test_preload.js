function applyReadMore() {
    $('.quote').not('.tiptap.ProseMirror .quote').readmore({
      speed: 300,
      collapsedHeight: 100
    });
  }

  // Apply Readmore.js on initial load
  $(document).ready(applyReadMore);

  // MutationObserver to detect new .quote elements
  const quo = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an element
          // Use jQuery to filter for new .quote elements
          const newQuotes = $(node).find('.quote').add(node).filter('.quote').not('.tiptap.ProseMirror .quote');
          if (newQuotes.length) {
            newQuotes.readmore({
              speed: 300,
              collapsedHeight: 100
            });
          }
        }
      });
    });
  });

  // Observe the specific container where AJAX content is added (e.g., #ajaxObject)
  const ajaxContainer = document.getElementById('ajaxObject');
  if (ajaxContainer) {
    quo.observe(ajaxContainer, { childList: true, subtree: true });
  }

  // Also continue observing the body to catch other dynamic content
  quo.observe(document.body, { childList: true, subtree: true });
