// ============================================================
// AFS LOADER — SINGLE FILE FOR ALL PAGES
// ============================================================

function loadAFSScript() {

    const adContainer = document.getElementById("afscontainer1");
    if (!adContainer) return;

    // Prevent duplicate loading
    if (window.afsLoaded) return;
    window.afsLoaded = true;

    // Bootstrap _googCsa queue BEFORE script loads
    window._googCsa = window._googCsa || function() {
        (_googCsa.q = _googCsa.q || []).push(arguments);
    };
    _googCsa.t = Date.now();

    // Load script async
    var script = document.createElement("script");
    script.src = "https://www.google.com/adsense/search/ads.js";
    script.async = true;

    script.onload = function() {
        runAFSAds(false);
    };

    document.head.appendChild(script);
}


// ============================================================
// QUERY BUILDER
// ============================================================
//
// Priority:
//   1. If URL has ?kw=  →  use kw value (search/listing page)
//   2. If category exists (detail page)  →  use category
//   3. Fallback  →  "events near me"
//
// On retry: use broader fallback
// ============================================================

function buildAFSQuery(isRetry) {

    // --- Check if page has kw= in URL ---
    var urlParams = new URLSearchParams(window.location.search);
    var kwValue = (urlParams.get("kw") || "").trim();

    // --- Get category from hidden input (detail pages) ---
    var category = (document.getElementById("cat_name_ad")?.value || "").trim();

    // --- RETRY: use broader fallback ---
    if (isRetry) {
        if (kwValue) return kwValue;       // retry with raw kw (no modification)
        return "events near me";           // broadest fallback
    }

    // --- PRIMARY: kw= in URL (search/listing pages) ---
    if (kwValue) {
        return kwValue;
    }

    // --- SECONDARY: category from detail page ---
    if (category) {
        return category;
    }

    // --- FALLBACK ---
    return "events near me";
}


// ============================================================
// RUN ADS
// ============================================================

function runAFSAds(isRetry) {

    var query = buildAFSQuery(isRetry);

    // --- Determine if this is a search page (has kw= param) ---
    var urlParams = new URLSearchParams(window.location.search);
    var isSearchPage = urlParams.has("kw");

    // --- Page Options ---
    var pageOptions = {
        pubId: "pub-8525015516580200",
        query: query,
        hl: "en",
        adLoadedCallback: function(containerName, adsLoaded) {
            console.log("AFS adsLoadedCallback → " + containerName + ", adsLoaded: " + adsLoaded);
        }
    };

    // Only set resultsPageQueryParam for search/listing pages with kw=
    if (isSearchPage) {
        pageOptions.resultsPageQueryParam = "kw";
    }

    // --- Ad Block ---
    var adblock1 = {
        container: "afscontainer1",
        number: 2,
        styleId: "4287184448"
    };

    // --- Call AFS ---
    _googCsa('ads', pageOptions, adblock1);

    // Check fill after 1.8s
    setTimeout(function() { checkAFSFill(isRetry); }, 1800);
}


// ============================================================
// CHECK FILL + RETRY
// ============================================================

function checkAFSFill(isRetry) {

    var adContainer = document.getElementById("afscontainer1");
    if (!adContainer) return;

    var hasAds = adContainer.querySelector("iframe");

    if (hasAds) {
        // Ads loaded successfully
        return;
    }

    // 🔁 Retry once with broader query
    if (!isRetry) {
        console.log("AFS retry triggered");
        runAFSAds(true);
        return;
    }

    // ❌ No fill after retry — hide ad container
    console.log("AFS no fill — hiding container");
    adContainer.style.display = "none";
}
