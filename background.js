// create context menu
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "contextMenu",
        title: "Add to Wordrive",
        contexts: ["selection"]
    });
});

// click handler: add text to Wordrive
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // retrieve word bank and user capitalization preference (initialize default values for both)
    chrome.storage.sync.get({"wordBank": [], "lowercaseChecked": true}, async (data) => {
        let [currentTab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        // add new word object to array
        let selectedWord = info.selectionText.trim();
        data.wordBank.push({
            text: (data.lowercaseChecked === true)
                ? selectedWord.toLowerCase()
                : selectedWord,
            url: currentTab.url
        });
        // set key to updated array
        chrome.storage.sync.set({"wordBank": data.wordBank});
    });
});

// click handler: open hyperlink to original word URL
chrome.runtime.onMessage.addListener((request) => {
    if (request.msg === "new tab") {
        // retrieve user preference
        chrome.storage.sync.get({
            // default values
            activeTabChecked: false
        }, (settings) => {
            chrome.tabs.create({
                url: request.url,
                active: (settings.activeTabChecked) ? true : false
            });
        });
    }
});