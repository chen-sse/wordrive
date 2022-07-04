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
    chrome.storage.sync.get("words", (data) => {
        // if word bank array has not been initialized
        if (typeof data.words === "undefined") {
            // create empty array
            chrome.storage.sync.set({"words": []});
            chrome.storage.sync.get("words", (updatedData) => {
                chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                    chrome.storage.sync.get({"lowercase": true}, (settings) => {
                        // add new word object to array
                        updatedData.words.push({
                            text: (settings.lowercase === true) 
                            ? info.selectionText.toLowerCase() 
                            : info.selectionText,

                            url: tabs[0].url
                        });
                        // set key to updated array
                        chrome.storage.sync.set({"words": updatedData.words});
                    });
                });
            });
        // if word bank array already exists
        } else {
            chrome.tabs.query({active: true, lastFocusedWindow: true}, (tabs) => {
                chrome.storage.sync.get({"lowercase": true}, (settings) => {
                // add new word object to array
                data.words.push({
                    text: (settings.lowercase === true)
                    ? info.selectionText.toLowerCase()
                    : info.selectionText,
                    
                    url: tabs[0].url
                });
                // set key to updated array
                chrome.storage.sync.set({"words": data.words});
                });
            });
        }
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
            if (settings.activeTab === true) {
                chrome.tabs.create({url: request.url, active: true});
            } else {
                chrome.tabs.create({url: request.url, active: false});
            }
        });
    }
});