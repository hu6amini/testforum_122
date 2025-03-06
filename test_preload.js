function applyReadMoreToQuotes() {
    $('.quote').not('.tiptap .ProseMirror .quote').readmore({
      speed: 300,
      collapsedHeight: 100,
    });
  }

  // Run on existing elements
  applyReadMoreToQuotes();

  // MutationObserver to track added .quote elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Ensure it's an element
          if ($(node).is('.quote') && !$(node).closest('.tiptap .ProseMirror').length) {
            $(node).readmore({ speed: 300, collapsedHeight: 100 });
          }
          // Check inside added elements
          $(node).find('.quote').not('.tiptap .ProseMirror .quote').each(function () {
            $(this).readmore({ speed: 300, collapsedHeight: 100 });
          });
        }
      });
    });
  });

  // Observe changes in the body
  observer.observe(document.body, { childList: true, subtree: true });
