// create context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "contextMenu",
        title: "Add to Wordrive",
        contexts: ["selection"],
    });
});

// click handler: add text to Wordrive
chrome.contextMenus.onClicked.addListener((info, tab) => {
    chrome.storage.sync.get({"words": []}, (data) => {
        chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
            // retrieve user preference
            chrome.storage.sync.get({"lowercase": true}, (settings) => {
                // add new word object to array
                let word = info.selectionText.trim();
                data.words.push({
                    text: (settings.lowercase === true)
                    ? word.toLowerCase()
                    : word,

                    url: tabs[0].url
                });
                // set key to updated array
                chrome.storage.sync.set({"words": data.words});
            });
        });
    });
});

// click handler: open hyperlink to original word URL
chrome.runtime.onMessage.addListener((request) => {
    if (request.msg === "new tab") {
        // retrieve user preference
        chrome.storage.sync.get({
            // default values
            activeTab: false
        }, (settings) => {
            chrome.tabs.create({
                url: request.url,
                active: (settings.activeTab) ? true : false
            });
        });
    }
});