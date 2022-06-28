// create context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "contextMenu",
        title: "Add to Wordrive",
        contexts: ["selection"],
    });
});

// click handler--add text to Wordrive
chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.storage.sync.get("words", (data) => {
        // if word bank array has not been initialized
        if (typeof data.words === "undefined") {
            chrome.storage.sync.set({"words": []});
            chrome.storage.sync.get("words", (updatedData) => {
                updatedData.words.push(info.selectionText);
                chrome.storage.sync.set({"words": updatedData.words});
            });
        // if word bank array already exists
        } else {
            data.words.push(info.selectionText);
            chrome.storage.sync.set({"words": data.words});
        }
    });
});