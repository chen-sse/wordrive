const SAVE_DISPLAY_TIME = 2000;

// save options to Chrome sync
function saveOptions() {
    let activeTab = document.getElementById("activeTab").checked;
    let lowercase = document.getElementById("lowercase").checked;

    chrome.storage.sync.set({
        "activeTab": activeTab,
        "lowercase": lowercase
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
        "activeTab": false,
        "lowercase": true
    }, (settings) => {
        document.getElementById("activeTab").checked = settings.activeTab;
        document.getElementById("lowercase").checked = settings.lowercase;
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);