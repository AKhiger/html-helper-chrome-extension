# TagScout

**TagScout** is a powerful Chrome DevTools extension that helps developers visually identify and debug HTML elements based on specific criteria. It allows you to search for tags, filter by attribute presence (or absence), and check specific attribute values—all directly within the Chrome DevTools panel.

## Features

- **Advanced Tag Search**: Search for multiple HTML tags simultaneously (e.g., `input, table, a`).
- **Attribute Filtering**: Filter elements that *have* or *don't have* a specific attribute.
- **Value Matching**: precise search by matching attribute values.
- **Visual Highlighting**: Instantly highlights matched elements on the page with a clear outline.
- **Interactive Results**: Click on any result in the list to inspect the element in the Elements panel.
- **Clean Interface**: Modern, dark-themed UI that fits perfectly with Chrome DevTools.

## Installation (Developer Mode)

Since this extension is in development (or if you are running from source), you can install it using Chrome's Developer Mode:

1.  **Clone or Download** this repository to your local machine.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Toggle the **Developer mode** switch in the top-right corner.
4.  Click the **Load unpacked** button in the top-left.
5.  Select the folder containing the extension files (the root of this repository).

## How to Use

1.  Open Chrome DevTools (`F12` or `Cmd+Opt+I` on Mac, `Ctrl+Shift+I` on Windows/Linux) on any webpage.
2.  Look for the **"TagScout"** tab in the DevTools panel (you might need to click the `>>` overflow menu if you have many tabs).
3.  **Configure your search**:
    *   **HTML Tags**: Enter the tags you want to find (comma-separated).
    *   **Condition**: Choose whether the element should "Has attribute" or "Doesn't have attribute".
    *   **Attribute Name**: Enter the attribute to check (e.g., `id`, `class`, `data-testid`).
    *   **Attribute Value**: (Optional) specific value to match.
4.  Click **Inspect!** to run the search.
5.  Results will appear in the list below. Click an item to jump to it in the Elements panel.
6.  Click **Clean** to remove highlights and clear results.

## Development

The project is built with standard web technologies (HTML, CSS, JavaScript) and uses the Chrome DevTools API.

-   `manifest.json`: Extension configuration.
-   `devtools.js`: Entry point that creates the DevTools panel.
-   `panel.html` & `panel.js`: The main interface and logic for the tool.
-   `panel.css`: Styling for the interface.
