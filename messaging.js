(function createChannel() {
    const port = chrome.runtime.connect({
        name: "HTML Helper" // Given a Name
    });

    // Listen to messages from the background service worker
    port.onMessage.addListener((message) => {
        const resultsContainer = document.querySelector('#results');
        if (resultsContainer) {
            resultsContainer.innerHTML = ""; // Clear previous results
            resultsContainer.innerHTML = message.content;

            document.querySelectorAll('.result-link').forEach((el) => {
                el.addEventListener('click', (e) => {
                    const inspectionPoint = e.target.getAttribute("data-inspect");
                    // Use inspectedWindow to inspect elements safely
                    chrome.devtools.inspectedWindow.eval(
                        `inspect(document.querySelector("[inspect='${inspectionPoint}']"))`
                    );
                    e.preventDefault();
                });
            });
        }
    });
})();

function sendObjectToInspectedPage(message) {
    message.tabId = chrome.devtools.inspectedWindow.tabId;
    try {
        chrome.runtime.sendMessage(message);
    } catch (e) {
        console.error("Error sending message to inspected page:", e);
        alert(e); // Show error in UI
    }
}