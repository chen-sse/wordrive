const SAVE_DISPLAY_TIME = 2000;

// save options to Chrome sync
function saveOptions() {
    let activeTab = document.getElementById("activeTab").checked;

    chrome.storage.sync.set({
        "activeTab": activeTab
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
        "activeTab": false
    }, (settings) => {
        document.getElementById("activeTab").checked = settings.activeTab;
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);