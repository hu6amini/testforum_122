(function() {
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

  function applyMode(script, mode) {
    if (mode === "defer") {
      script.defer = true;
      script.async = false;
    } else if (mode === "async") {
      script.async = true;
      script.defer = false;
    }
  }

  function processScript(script) {
    if (script && script.src) {
      for (const rule of rules) {
        if (rule.test(script.src)) {
          applyMode(script, rule.mode);
          console.log(`[Observer] Updated script: ${script.src} → ${rule.mode}`);
          break;
        }
      }
    }
  }

  // 🔹 Step 1: scan already-loaded scripts
  document.querySelectorAll("script[src]").forEach(processScript);

  // 🔹 Step 2: watch for dynamically injected ones
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.tagName === "SCRIPT") {
          processScript(node);
        }
      }
    }
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true
  });
})();
