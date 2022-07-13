const SAVE_DISPLAY_TIME = 2000;
let activeTabCheckbox = document.getElementById("activeTabCheckbox");
let lowercaseCheckbox = document.getElementById("lowercaseCheckbox");
let home = document.getElementById("home");
let clearAll = document.getElementById("clearAll");
let exportButton = document.getElementById("exportButton")

function clearAllData(event) {
    chrome.storage.sync.set({"wordBank": []});
    document.location.reload();
}

function exportData(event) {
    chrome.storage.sync.get("wordBank", ({wordBank}) => {
        let builder = "Your Wordrive: \n\n";
        for (let i = 0; i < wordBank.length; i++) {
            // concatenate builder string
            let word = wordBank[i].text;
            let theUrl = wordBank[i].url;
            builder = builder + `WORD ${i + 1}: ${word} | URL: ${theUrl}` + "\n\n";
        }
        // instantiate blob w/ word bank and create url for it
        let listBlob = new Blob([builder], {type: "text/plain"});
        let fileUrl = URL.createObjectURL(listBlob);

        // send message to service worker to download file
        chrome.runtime.sendMessage({
            msg: "download",
            url: fileUrl
        }, () => {
            // revoke url from browser storage
            URL.revokeObjectURL(fileUrl);
        });
    })
}

// save options to Chrome sync
function saveOptions() {
    let activeTabChecked = activeTabCheckbox.checked;
    let lowercaseChecked = lowercaseCheckbox.checked;

    chrome.storage.sync.set({
        "activeTabChecked": activeTabChecked,
        "lowercaseChecked": lowercaseChecked
    }, () => {
        let status = document.getElementById("status");
        status.innerHTML = "Options saved.";
        setTimeout(() => {
            status.innerHTML = "";
        }, SAVE_DISPLAY_TIME);
    });
}

// restore saved user preferences
function restoreOptions() {
    chrome.storage.sync.get({
        // default values
        "activeTabChecked": false,
        "lowercaseChecked": true
    }, (options) => {
        activeTabCheckbox.checked = options.activeTabChecked;
        lowercaseCheckbox.checked = options.lowercaseChecked;
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);

clearAll.addEventListener("click", clearAllData);
exportButton.addEventListener("click", exportData);
home.addEventListener("click", () => {
    window.location.href = "popup.html";
});