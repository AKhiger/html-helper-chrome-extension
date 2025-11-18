// This one acts in the context of the panel in the Dev Tools
//
// Can use
// chrome.devtools.*
// chrome.extension.*

var getFormData = function () {

    var data = {};
    var inputs = [].slice.call(document.getElementsByTagName('input'));
    inputs = inputs.concat([].slice.call(document.getElementsByTagName('textarea')));
    inputs = inputs.concat([].slice.call(document.getElementsByTagName('select')));

    [].forEach.call(
      inputs,
      function(el){
          //console.log(el);
          data[el.name] = el.value;
      }
    )
    console.log(data)
    return data;

};



// Event listener for the Clean button
document.getElementById("cleanresults").addEventListener("click", function () {
    // Clear the #results container in the panel
    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    // Notify the background script to clean up highlights in the inspected page
    try {
        chrome.runtime.sendMessage({ action: "clean" }, function (response) {
            if (response && response.status === "success") {
                console.log("Cleanup completed successfully in the inspected page.");
            }
            // Handle any runtime errors
            if (chrome.runtime.lastError) {
                console.error("Error while cleaning up:", chrome.runtime.lastError.message);
            }
        });

    } catch (e) {
        console.error("Failed to send cleanup command to the background script:", e);
    }
});
document.getElementById("executescript").addEventListener("click", function (e) {
    e.preventDefault();

    // Serialize form data
    const formObj = JSON.stringify(getFormData());
    console.log("Serialized form data:", formObj);

    // Send the data to the background script
    try {
        sendObjectToInspectedPage({
            action: "code", // Code to execute
            content: formObj // Pass serialized formObj as content
        });
    } catch (e) {
        console.error("Error while sending data to the background script:", e);
        alert("Failed to send data to the inspected page: " + e.message);
    }
}, false);

window.onload = function() {
    function goToSource(){
        chrome.devtools.inspectedWindow.eval('inspect($("a[href$=\'tab=wX\']"))');
    }




    [].forEach.call(
      document.querySelectorAll('.result-link'),
      function(el){
          el.addEventListener('click', function(e) {
              try{
                  chrome.devtools.inspectedWindow.eval('inspect($("[data-inspect$=\'tab=wX\']"))');
                  document.querySelector('#results').innerHTML =  (document.querySelector('.result-link').toString());
              }
              catch(e){
                  alert(e);
              }

          });
      })
};