let activeTabCheckbox = document.getElementById("activeTabCheckbox");
let lowercaseCheckbox = document.getElementById("lowercaseCheckbox");

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

// auto-save: update preferences on any checkbox click
activeTabCheckbox.addEventListener("click", () => {
    let activeTabChecked = activeTabCheckbox.checked;
    chrome.storage.sync.set({"activeTabChecked": activeTabChecked});
});
lowercaseCheckbox.addEventListener("click", () => {
    let lowercaseChecked = lowercaseCheckbox.checked;
    chrome.storage.sync.set({"lowercaseChecked": lowercaseChecked})
});