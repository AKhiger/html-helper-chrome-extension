chrome.runtime.onConnect.addListener((port) => {
    const extensionListener = (message, sender, sendResponse) => {
        console.log("Received message from extension:", message);
        // Handle the clean action from the panel
        if (message.action === "clean") {
            // Inject script to remove highlights and clean up in the inspected page
            chrome.scripting.executeScript({
                target: { tabId: sender.tab?.id || message.tabId }, // Ensure correct tab
                func: () => {
                    // Remove all highlights and 'inspect' attributes from matching elements
                    const highlightedElements = document.querySelectorAll('[inspect]');
                    highlightedElements.forEach((el) => {
                        el.style.backgroundColor = ''; // Reset highlight
                        el.removeAttribute('inspect'); // Remove the 'inspect' attribute
                    });
                    console.log('Search highlights and attributes have been cleared.');
                },
            }).then(() => {
                console.log("Cleanup script successfully executed on the inspected page.");
            }).catch((err) => {
                console.error("Error injecting cleanup script into inspected page:", err);
            });

            // Respond to the action
            sendResponse({ status: "success" });
        } else if (message.tabId && message.content) {
            // Existing logic for injecting and running code
            chrome.scripting.executeScript({
                target: { tabId: message.tabId },
                files: ["inserted-script.js"]
            }).then(() => {
                console.log("'inserted-script.js' injected successfully.");
                executeInjectedCode({ tabId: message.tabId, content: message.content });
            }).catch((err) => {
                console.error("Failed to inject 'inserted-script.js':", err);
            });
        } else {
            port.postMessage(message);
        }
    };

    chrome.runtime.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function (port) {
        chrome.runtime.onMessage.removeListener(extensionListener);
    });
});
/**
 * Function injected into the inspected page. This is where "code" is executed.
 * @param {string} content - JavaScript code as a string to be evaluated.
 */
// Updated executeInjectedCode function
function executeInjectedCode(formData) {
    // The function to inject and execute
    function injectedCode(formDataString) {
        // Ensure inserted-script.js logic is accessible
        if (typeof enumerateObjectsByCriteria !== 'function') {
            console.error("enumerateObjectsByCriteria is not defined!");
            return;
        }

        // Parse the formData
        const links = enumerateObjectsByCriteria(formDataString);
        console.log("Results from enumerateObjectsByCriteria:", links);

        // Send the result back to the extension (DevTools panel)
        chrome.runtime.sendMessage({ content: links });
    }

    // Use chrome.scripting.executeScript to inject and execute the function
    chrome.scripting.executeScript({
        target: { tabId: formData.tabId },
        func: injectedCode,
        args: [formData.content] // Pass the content as argument
    }).then(() => {
        console.log("Script successfully executed on the inspected page.");
    }).catch((err) => {
        console.error("Error executing script:", err);
    });
}