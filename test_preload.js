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
          const newQuotes = $(node).find('.quote').addBack('.quote').not('.tiptap.ProseMirror .quote');
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

  // Observe the entire document body for changes using quo.observe
  quo.observe(document.body, { childList: true, subtree: true });
