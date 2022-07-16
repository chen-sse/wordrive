chrome.runtime.onInstalled.addListener(() => {
    // create context menu
    chrome.contextMenus.create({
        id: "contextMenu",
        title: "Add to Wordrive",
        contexts: ["selection"]
    });

    // set default values
    chrome.storage.sync.get({
        "wordBank": [],
        "lowercaseChecked": true, 
        "activeTabChecked": false
    }, (data) => {
        chrome.storage.sync.set(data);
    });
});

// click handler: add text to Wordrive
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // retrieve word bank and user capitalization preference (initialize default values for both)
    chrome.storage.sync.get(["wordBank", "lowercaseChecked"], async (data) => {
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

// message listener: listens to messages from content scripts
chrome.runtime.onMessage.addListener(async (request) => {
    // word url click handler: open hyperlink to original word URL
    if (request.msg === "new tab") {
        // retrieve user preference
        chrome.storage.sync.get("activeTabChecked", (options) => {
            chrome.tabs.create({
                url: request.url,
                active: (options.activeTabChecked) ? true : false
            });
        });
    }
    // export button click handler: download .txt file of word list
    else if (request.msg === "download") {
        chrome.downloads.download({
            filename: "wordlist.txt",
            url: request.url
        });
    }
    // inject scripts into active tab to trigger SweetAlert popup
    else if (request.msg === "confirm") {
        // get current tab
        let [activeTab] = await chrome.tabs.query({
            active: true,
            lastFocusedWindow: true
        });
        // if active tab is an internal chrome page, fire alert in popup instead of current tab
        if (activeTab.url.indexOf("chrome://") === 0) {
            chrome.runtime.sendMessage({msg: "redirect"});
        } else {
            chrome.scripting.executeScript({
                target: {tabId: activeTab.id},
                files: [
                    "vendor/sweetalert2/dist/sweetalert2.all.min.js",
                    "confirm.js"
                ]
            });
        }
    }
    // clear word bank
    else if (request.msg === "clear") {
        chrome.storage.sync.set({"wordBank": []});
    }
});