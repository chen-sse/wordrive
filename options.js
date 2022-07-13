const SAVE_DISPLAY_TIME = 2000;
let activeTabCheckbox = document.getElementById("activeTabCheckbox");
let lowercaseCheckbox = document.getElementById("lowercaseCheckbox");

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