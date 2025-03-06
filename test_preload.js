function applyReadMore(targetElements) {
    targetElements.each(function () {
      let $this = $(this);
      if (!$this.data('readmore-applied')) {  // Ensure Readmore.js is applied only once
        $this.readmore({
          speed: 300,
          collapsedHeight: 100,
          blockCSS: false // Prevents unwanted jumps by disabling default display:block
        }).data('readmore-applied', true); // Mark as applied
      }
    });
  }

  // Apply Readmore.js on initial load
  $(document).ready(() => applyReadMore($('.quote').not('.tiptap.ProseMirror .quote')));

  // MutationObserver to detect new .quote elements
  const quo = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) { // Ensure it's an element
          // Select new .quote elements only, excluding .tiptap.ProseMirror
          const newQuotes = $(node).find('.quote').add(node).filter('.quote').not('.tiptap.ProseMirror .quote');
          if (newQuotes.length) {
            applyReadMore(newQuotes);

            // Force reflow to ensure animation works
            newQuotes.css('display'); // Trigger reflow
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
