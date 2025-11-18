console.log("HTML helper extension is loaded");

let objectsFound = [];
function enumerateObjectsByCriteria(formObj) {
    console.log("in enumerateObjectsByCriteria formObj:", formObj, typeof formObj); // Debug log

    // Parse formObj only if it is a string
    if (typeof formObj === "string") {
        try {
            formObj = JSON.parse(formObj);
        } catch (err) {
            console.error("Failed to parse formObj:", formObj, err);
            return "Invalid input data";
        }
    }

    if (!formObj || !formObj.tags) {
        console.error("Invalid formObj: Missing 'tags' property.");
        return "No criteria for search was received";
    }

    const inspectObjs = formObj.tags.split(",");
    const doesHave = formObj.have === "1";
    const attributeToInspect = formObj.attr;
    const attributeValue = formObj["attr-value"];
    let qSelector = "";

    console.log("Inspecting objects and attributes:", inspectObjs, doesHave, attributeToInspect, attributeValue); // Debug log

    for (let i = 0; i < inspectObjs.length; i++) {
        qSelector += inspectObjs[i];
        if (doesHave) {
            qSelector += attributeValue.trim()
                ? `[${attributeToInspect}~='${attributeValue.trim()}']`
                : `[${attributeToInspect}]`;
        } else {
            qSelector += `:not([${attributeToInspect}])`;
        }
        if (inspectObjs[i + 1]) {
            qSelector += ",";
        }
    }

    console.log("Constructed selector:", qSelector); // Debug log

    const oCollection = document.querySelectorAll(qSelector);
    if (oCollection.length < 1) {
        console.warn(`No elements matched the selector: ${qSelector}`);
        return `<h2 class='search-term no-results'>Your search term <i>'${qSelector}'</i> returned no results</h2>`;
    }

    let found = [`<h2 class='search-term'>Search term: '${qSelector}'</h2>`];

    oCollection.forEach((el, i) => {
        const strPos = el.outerHTML.indexOf(">");
        const str = el.outerHTML;

        found.push(
            `<a href='#'><xmp class='result-link' data-inspect='inspect${i}'>${str
                .substr(0, strPos + 1)
                .toLowerCase()}...</${el.tagName.toLowerCase()}></xmp></a>`
        );

        el.setAttribute("inspect", `inspect${i}`);
        el.style.backgroundColor = "yellow";
        objectsFound.push(el);
    });

    console.log("Successfully found matched elements:", found); // Debug log
    return found.join(" ");
}