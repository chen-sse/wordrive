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
chrome.contextMenus.onClicked.addListener((info) => {
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
                    for (let j = 0; j < data.wordBank[i].sourceUrls.length; j++) {
                        // check if URL is already in URL list
                        if (currentTab.url === data.wordBank[i].sourceUrls[j]) {
                            newUrl = false;
                            break;
                        }
                    }
                    newWord = false;
                    // if URL is not duplicate, add to URL list
                    if (newUrl) {
                        data.wordBank[i].sourceUrls.push(currentTab.url);
                        break;
                    }
                }
            }
            // if word is not duplicate, add to word bank
            if (newWord) {
                // format timestamp
                const dateOptions = {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                };
                const timeOptions = {
                    hour: "numeric",
                    minute: "numeric",
                    timeZoneName: "short"
                };
                let date = new Date().toLocaleDateString("en-US", dateOptions);
                let time = new Date().toLocaleTimeString("en-US", timeOptions);
                time = time.replace("AM", "am").replace("PM", "pm");
                const timeTokens = time.split(" ");
                time = `${timeTokens[0]}${timeTokens[1]} ${timeTokens[2]}`;

                // construct default Merriam-Webster reference URL
                const searchTokens = selectedWord.match(/\S+/g);
                let dictionaryUrl = "https://www.merriam-webster.com/dictionary/";
                for (let j = 0; j < searchTokens.length; j++) {
                    dictionaryUrl += searchTokens[j];
                    dictionaryUrl += "%20";
                }

                // push new word object to word bank
                data.wordBank.push({
                    text: (data.lowercaseChecked === true)
                        ? selectedWord.toLowerCase()
                        : selectedWord,
                    sourceUrls: [currentTab.url],
                    refUrls: [dictionaryUrl],
                    date: date,
                    time: time,
                    notes: ""
                });
            }
            // set key to updated array
            chrome.storage.sync.set({"wordBank": data.wordBank});
        }
    });
});

// message listener: listens to messages from content scripts
chrome.runtime.onMessage.addListener( (message, sendResponse) => {
    // export button click handler: download .txt file of word list
    if (message.msg === "export to txt") {
        chrome.downloads.download({
            filename: "wordlist.txt",
            url: message.fileUrl
        });
    }
    // word url click handler: open hyperlink to original word URL
    else if (message.msg === "new tab") {
        // retrieve user preference
        chrome.storage.sync.get("activeTabChecked", (options) => {
            chrome.tabs.create({
                url: message.url,
                active: (options.activeTabChecked) ? true : false
            });
        });
    }

    else if (message.msg === "pdf ready") {
        chrome.downloads.download({
            filename: "wordlist.pdf",
            url: message.fileUrl
        }).then((id) => {
            // notify options script that pdf download is done
            chrome.runtime.sendMessage({
                msg: "pdf download done",
                downloadId: id
            });
        });
    }
});