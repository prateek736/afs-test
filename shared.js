/**
 * Shared AFS Test Utilities
 * Reused across all test pages on adtest.10times.com
 */

const AFS_CONFIG = {
  pubId: "pub-8525015516580200",
  styleId: "4287184448",
  containerId: "afscontainer1",
  scriptSrc: "https://www.google.com/adsense/search/ads.js",
  adNumber: 2,
  adtest: "on",
};

let scriptLoaded = false;

function log(msg) {
  const el = document.getElementById("debug-log");
  const line = `[${new Date().toISOString()}] ${msg}`;
  console.log(line);
  if (el) {
    el.textContent += line + "\n";
  }
}

function initAFS() {
  // Bootstrap _googCsa queue before script loads
  window._googCsa = window._googCsa || function () {
    (_googCsa.q = _googCsa.q || []).push(arguments);
  };
  _googCsa.t = Date.now();
  log("_googCsa bootstrapped");
}

function loadAFSScript(callback) {
  if (scriptLoaded) {
    log("Script already loaded, skipping duplicate load");
    if (callback) callback();
    return;
  }

  const script = document.createElement("script");
  script.src = AFS_CONFIG.scriptSrc;
  script.async = true;

  script.onload = function () {
    scriptLoaded = true;
    log("ads.js loaded successfully");
    if (callback) callback();
  };

  script.onerror = function () {
    log("ERROR: Failed to load ads.js");
  };

  document.head.appendChild(script);
  log("ads.js script appended (async)");
}

/**
 * Run AFS ads
 * @param {string} query - The search query to send
 * @param {object} extraPageOptions - Additional pageOptions (e.g. resultsPageQueryParam)
 */
function runAFS(query, extraPageOptions) {
  // Clear container
  const container = document.getElementById(AFS_CONFIG.containerId);
  if (container) {
    container.innerHTML = "";
    container.style.minHeight = "120px";
    log("Container cleared and minHeight set");
  }

  // Display current query in UI
  const queryDisplay = document.getElementById("current-query");
  if (queryDisplay) {
    queryDisplay.textContent = query;
  }

  // Build page options
  const pageOptions = Object.assign(
    {
      pubId: AFS_CONFIG.pubId,
      query: query,
      adtest: AFS_CONFIG.adtest,
      adsafe: "high",
      hl: "en",
      channel: "afs-test",
      adLoadedCallback: function (containerName, adsLoaded) {
        log(
          "adsLoadedCallback → container: " +
            containerName +
            ", adsLoaded: " +
            adsLoaded
        );
      },
    },
    extraPageOptions || {}
  );

  // Ad unit options
  const adUnitOptions = {
    container: AFS_CONFIG.containerId,
    number: AFS_CONFIG.adNumber,
    styleId: AFS_CONFIG.styleId,
  };

  log("Calling _googCsa('ads', ...) with query: " + JSON.stringify(query));
  log("pageOptions: " + JSON.stringify(pageOptions));
  log("adUnitOptions: " + JSON.stringify(adUnitOptions));

  // Initialize and load
  initAFS();
  loadAFSScript(function () {
    _googCsa("ads", pageOptions, adUnitOptions);
    log("_googCsa('ads', ...) called");

    // Debug: check iframe height after 1 second
    setTimeout(function () {
      const iframes = document.querySelectorAll(
        "#" + AFS_CONFIG.containerId + " iframe"
      );
      if (iframes.length > 0) {
        iframes.forEach(function (iframe, i) {
          log(
            "iframe[" +
              i +
              "] height: " +
              iframe.offsetHeight +
              "px, width: " +
              iframe.offsetWidth +
              "px"
          );
        });
      } else {
        log("No iframes found in container after 1s");
      }
    }, 1000);
  });
}

// Helper to read URL params
function getUrlParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}
