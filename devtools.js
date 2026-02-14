// Create a tab in the devtools area
chrome.devtools.panels.create(
    "TagScout",
    "icon128.png",
    "panel.html",
    function (panel) {
        console.log("TagScout panel created");
    }
);