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
        "activeTabChecked": false,
        "lowercaseChecked": true 
    }, (data) => {
        chrome.storage.sync.set(data);
    });
});

// click handler: add text to Wordrive
chrome.contextMenus.onClicked.addListener((info, tab) => {
    // retrieve word bank and user capitalization preference (initialize default values for both)
    chrome.storage.sync.get(["wordBank", "lowercaseChecked"], async (data) => {
        let [currentTab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        // add new word object to array if selected text isn't whitespace
        if (typeof(info.selectionText) !== "undefined") {
            let selectedWord = info.selectionText.trim();
            let newWord = true;
            let newUrl = true;

            for (let i = 0; i < data.wordBank.length; i++) {
                // check if word is already in word bank
                if (data.wordBank[i].text.toLowerCase() === selectedWord.toLowerCase()) {
                    for (let j = 0; j < data.wordBank[i].urls.length; j++) {
                        // check if URL is already in URL list
                        if (currentTab.url === data.wordBank[i].urls[j]) {
                            newUrl = false;
                            break;
                        }
                    }
                    newWord = false;
                    // if URL is not duplicate, add to URL list
                    if (newUrl) {
                        data.wordBank[i].urls.push(currentTab.url);
                        break;
                    }
                }
            }
            // if word is not duplicate, add to word bank
            if (newWord) {
                data.wordBank.push({
                    text: (data.lowercaseChecked === true)
                        ? selectedWord.toLowerCase()
                        : selectedWord,
                    urls: [currentTab.url]
                });
            }
            // set key to updated array
            chrome.storage.sync.set({"wordBank": data.wordBank});
        }
    });
});

// message listener: listens to messages from content scripts
chrome.runtime.onMessage.addListener(async (request) => {
    // export button click handler: download .txt file of word list
    if (request.msg === "download") {
        chrome.downloads.download({
            filename: "wordlist.txt",
            url: request.url
        });
    }
    // word url click handler: open hyperlink to original word URL
    else if (request.msg === "new tab") {
        // retrieve user preference
        chrome.storage.sync.get("activeTabChecked", (options) => {
            chrome.tabs.create({
                url: request.url,
                active: (options.activeTabChecked) ? true : false
            });
        });
    }
    
});