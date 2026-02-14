// panel.js — Runs in the DevTools panel context
// Uses chrome.devtools.inspectedWindow.eval() to interact with the inspected page.
// This avoids all the complexity of background script messaging.

/**
 * Collect form data from the inspection form.
 */
function getFormData() {
    const data = {};
    const form = document.querySelector(".inspection-form");
    const elements = form.querySelectorAll("input, textarea, select");
    elements.forEach((el) => {
        data[el.name] = el.value;
    });
    return data;
}

/**
 * Escape a string for safe injection into eval'd code.
 */
function escapeForEval(str) {
    return str
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/\n/g, "\\n")
        .replace(/\r/g, "\\r");
}

/**
 * Build the CSS selector from the form data.
 * Returns the selector string or null if invalid.
 */
function buildSelector(formData) {
    if (!formData.tags || !formData.tags.trim()) {
        return null;
    }

    const tags = formData.tags.split(",").map((t) => t.trim()).filter(Boolean);
    const doesHave = formData.have === "1";
    const attr = formData.attr ? formData.attr.trim() : "";
    const attrValue = formData["attr-value"] ? formData["attr-value"].trim() : "";

    if (!attr) {
        return null;
    }

    const selectors = tags.map((tag) => {
        if (doesHave) {
            return attrValue
                ? `${tag}[${attr}~='${attrValue}']`
                : `${tag}[${attr}]`;
        } else {
            return `${tag}:not([${attr}])`;
        }
    });

    return selectors.join(", ");
}

/**
 * HTML-encode a string for safe display.
 */
function htmlEncode(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Display results in the panel.
 * @param {string} selector - The CSS selector used
 * @param {Array} elements - Array of {tag, openTag, index} objects
 */
function displayResults(selector, elements) {
    const results = document.getElementById("results");

    if (!elements || elements.length === 0) {
        results.innerHTML = `
      <div class="search-term no-results">
        Your search term <i>${htmlEncode(selector)}</i> returned no results
      </div>`;
        return;
    }

    let html = `
    <div class="search-term">
      Search: <i>${htmlEncode(selector)}</i>
    </div>
    <div class="result-count">${elements.length} element${elements.length !== 1 ? "s" : ""} found</div>`;

    elements.forEach((el) => {
        html += `<a href="#" class="result-item" data-inspect="inspect${el.index}">${htmlEncode(el.openTag)}</a>`;
    });

    results.innerHTML = html;

    // Attach click handlers to inspect elements in the Elements panel
    results.querySelectorAll(".result-item").forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const inspectId = link.getAttribute("data-inspect");
            chrome.devtools.inspectedWindow.eval(
                `inspect(document.querySelector("[data-htmlhelper='${inspectId}']"))`,
                (result, exceptionInfo) => {
                    if (exceptionInfo) {
                        console.error("Error inspecting element:", exceptionInfo);
                    }
                }
            );
        });
    });
}

/**
 * Run the search on the inspected page.
 */
function runSearch() {
    const formData = getFormData();
    const selector = buildSelector(formData);

    if (!selector) {
        document.getElementById("results").innerHTML =
            '<div class="search-term no-results">Please enter HTML tags and an attribute name to search.</div>';
        return;
    }

    // Build the code to run in the inspected page context
    const code = `
    (function() {
      var selector = '${escapeForEval(selector)}';
      var elements;
      try {
        elements = document.querySelectorAll(selector);
      } catch(e) {
        return { error: 'Invalid selector: ' + e.message };
      }

      var results = [];
      for (var i = 0; i < elements.length; i++) {
        var el = elements[i];
        var outerHtml = el.outerHTML;
        var closeIndex = outerHtml.indexOf('>');
        var openTag = outerHtml.substring(0, closeIndex + 1).toLowerCase();
        // Truncate very long open tags
        if (openTag.length > 200) {
          openTag = openTag.substring(0, 200) + '...>';
        }

        // Mark element for later inspection and highlight
        el.setAttribute('data-htmlhelper', 'inspect' + i);
        el.style.outline = '2px solid #b48ead';
        el.style.outlineOffset = '-1px';
        el.style.backgroundColor = 'rgba(180, 142, 173, 0.15)';

        results.push({
          tag: el.tagName.toLowerCase(),
          openTag: openTag,
          index: i
        });
      }

      return { selector: selector, elements: results };
    })()
  `;

    // Show loading state
    document.getElementById("results").innerHTML =
        '<div class="search-term"><span class="spinner"></span>Searching...</div>';

    chrome.devtools.inspectedWindow.eval(code, (result, exceptionInfo) => {
        if (exceptionInfo) {
            console.error("Eval error:", exceptionInfo);
            document.getElementById("results").innerHTML =
                `<div class="search-term no-results">Error: ${htmlEncode(exceptionInfo.value || exceptionInfo.description || "Unknown error")}</div>`;
            return;
        }

        if (result && result.error) {
            document.getElementById("results").innerHTML =
                `<div class="search-term no-results">${htmlEncode(result.error)}</div>`;
            return;
        }

        if (result) {
            displayResults(result.selector, result.elements);
        }
    });
}

/**
 * Clean highlights from the inspected page and clear the results panel.
 */
function cleanResults() {
    const code = `
    (function() {
      var elements = document.querySelectorAll('[data-htmlhelper]');
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.outline = '';
        elements[i].style.outlineOffset = '';
        elements[i].style.backgroundColor = '';
        elements[i].removeAttribute('data-htmlhelper');
      }
      return elements.length;
    })()
  `;

    chrome.devtools.inspectedWindow.eval(code, (result, exceptionInfo) => {
        if (exceptionInfo) {
            console.error("Error cleaning up:", exceptionInfo);
        } else {
            console.log(`Cleaned ${result} elements`);
        }
    });

    document.getElementById("results").innerHTML = "";
}

// ── Event Listeners ─────────────────────────────────────────

document.getElementById("executescript").addEventListener("click", (e) => {
    e.preventDefault();
    runSearch();
});

document.getElementById("cleanresults").addEventListener("click", () => {
    cleanResults();
});

// Allow pressing Enter in any input to trigger search
document.querySelector(".inspection-form").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
        e.preventDefault();
        runSearch();
    }
});