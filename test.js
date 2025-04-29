(function () {
  console.log("📌 [Script Start] Document readyState: " + document.readyState);
  var logTime = function () {
    return new Date().toISOString().split("T")[1];
  };

  // Event Timing Logs
  document.addEventListener("DOMContentLoaded", function () {
    console.log("⏰ DOMContentLoaded at " + logTime());
  });

  window.addEventListener("load", function () {
    console.log("✅ Window load event at " + logTime());
  });

  var trackedEvents = ["pageshow", "ajaxComplete", "ajaxSuccess"];
  trackedEvents.forEach(function (evt) {
    window.addEventListener(evt, function () {
      console.log("📡 Event \"" + evt + "\" triggered at " + logTime());
    });
  });

  // Initial Image Check
  var logImageStatus = function (img, reason) {
    console.log("🖼️ [" + reason + "] Image detected:", {
      src: img.src,
      dataSrc: img.getAttribute("data-src"),
      lazyload: img.classList.contains("lazyload"),
      width: img.getAttribute("width"),
      height: img.getAttribute("height"),
      decoding: img.getAttribute("decoding"),
      visible: !!(img.offsetWidth || img.offsetHeight),
      time: logTime()
    });
  };

  var checkImages = function (label) {
    var imgs = document.querySelectorAll("img");
    console.log("🔍 Checking all images (" + label + "): found " + imgs.length);
    imgs.forEach(function (img) {
      logImageStatus(img, label);
    });
  };

  // MutationObserver Setup
  var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) {
          if (node.tagName === "IMG") {
            logImageStatus(node, "Mutation IMG");
          } else {
            var imgs = node.querySelectorAll && node.querySelectorAll("img");
            if (imgs && imgs.length) {
              imgs.forEach(function (img) {
                logImageStatus(img, "Mutation IMG in subtree");
              });
            }
          }
        }
      });
    });
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });

  // Run periodic checks
  var intervalCount = 0;
  var maxIntervals = 10;
  var interval = setInterval(function () {
    checkImages("Interval Check");
    intervalCount++;
    if (intervalCount >= maxIntervals) {
      clearInterval(interval);
      console.log("⏹️ Stopped periodic checks");
    }
  }, 1000);

  // Final check after full load
  window.addEventListener("load", function () {
    setTimeout(function () {
      checkImages("Post-load final check");
    }, 500);
  });
})();
