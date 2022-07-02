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
            // create empty array
            chrome.storage.sync.set({"words": []});
            chrome.storage.sync.get("words", (updatedData) => {
                chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                    // add new word object to array
                    updatedData.words.push({
                        text: info.selectionText,
                        url: tabs[0].url
                    })
                    // set key to updated array
                    chrome.storage.sync.set({"words": updatedData.words});
                });
            });
        // if word bank array already exists
        } else {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                // add new word object to array
                data.words.push({
                    text: info.selectionText,
                    url: tabs[0].url
                });
                // set key to updated array
                chrome.storage.sync.set({"words": data.words});
            });
        }
    });
});