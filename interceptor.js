(function() {
  // List of rules for interception
  const rules = [
    {
      test: src => src.includes("cdn.forumfree.net/libs/handlebars/hb.js"),
      mode: "defer"
    },
    {
      test: src => src.includes("img.forumfree.net/src/jq.js"),
      mode: "defer"
    },
    {
      test: src => src.includes("img.forumfree.net/src/jqt.js"),
      mode: "defer"
    },
    {
      test: src => src.includes("cdn.forumfree.net/libs/jquery.modal/modal.js"),
      mode: "defer"
    },
    {
      test: src => src.includes("challenges.cloudflare.com/turnstile"),
      mode: "async"
    },
    {
      test: src => /www\.google\.com\/recaptcha\/api\.js\?render=/.test(src),
      mode: "async"
    }
  ];

  // Function to apply async/defer
  function applyMode(script, mode) {
    if (mode === "defer") {
      script.defer = true;
      script.async = false;
    } else if (mode === "async") {
      script.async = true;
      script.defer = false;
    }
  }

  // Watch DOM for script injections
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.tagName === "SCRIPT" && node.src) {
          for (const rule of rules) {
            if (rule.test(node.src)) {
              applyMode(node, rule.mode);
              // optional: console.log for debugging
              console.log(`[Observer] Updated script: ${node.src} → ${rule.mode}`);
              break;
            }
          }
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();