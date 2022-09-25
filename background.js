import {
    getDate,
    getTime,
    getFaviconURL,
    getCambridgeURL,
    getCollinsURL,
    getDictionaryURL,
    getGoogleURL,
    getMerriamWebsterURL,
    getOneLookURL,
    getOxfordURL,
    getWiktionaryURL
} from "./utils.js";

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
        "lowercaseChecked": true,
        "cambridgeChecked": false,
        "collinsChecked": false,
        "dictionaryChecked": false,
        "googleChecked": false,
        "merriamwebsterChecked": true,
        "onelookChecked": false,
        "oxfordChecked": false,
        "wiktionaryChecked": false
    }, (data) => {
        chrome.storage.sync.set(data);
    });
});

// click handler: add text to Wordrive
chrome.contextMenus.onClicked.addListener((info) => {
    // retrieve word bank and user capitalization preference (initialize default values for both)
    chrome.storage.sync.get([
        "wordBank", 
        "lowercaseChecked",
        "cambridgeChecked",
        "collinsChecked",
        "dictionaryChecked",
        "googleChecked",
        "merriamwebsterChecked",
        "onelookChecked",
        "oxfordChecked",
        "wiktionaryChecked"
    ], async (data) => {
        let [currentTab] = await chrome.tabs.query({active: true, lastFocusedWindow: true});
        // add new word object to array if selected text isn't whitespace
        if (typeof(info.selectionText) !== "undefined") {
            let selectedWord = info.selectionText.trim();
            let newWord = true;
            let newUrl = true;

            for (let i = 0; i < data.wordBank.length; i++) {
                let entry = data.wordBank[i];

                // check if word is already in word bank
                if (entry.text.toLowerCase() === selectedWord.toLowerCase()) {
                    for (let j = 0; j < entry.sourceUrls.length; j++) {
                        // check if URL is already in URL list
                        if (currentTab.url === entry.sourceUrls[j].url) {
                            newUrl = false;
                            break;
                        }
                    }
                    newWord = false;
                    // if URL is not duplicate, add to URL list
                    if (newUrl) {
                        let dateNumber = new Date().getTime();
                        entry.sourceUrls.push({
                            url: currentTab.url,
                            icon: getFaviconURL(currentTab.url),
                            title: "",
                            fetched: false,
                            userEdited: false,
                            date: dateNumber
                        });
                        break;
                    }
                }
            }
            // if word is not duplicate, add to word bank
            if (newWord) {
                let refUrls = [];
                let refUrlObjs = [];
                let dateNumber = new Date().getTime();

                // push all default reference URLs
                if (data.cambridgeChecked) {
                    refUrls.push(getCambridgeURL(selectedWord));
                }
                if (data.collinsChecked) {
                    refUrls.push(getCollinsURL(selectedWord));
                }
                if (data.dictionaryChecked) {
                    refUrls.push(getDictionaryURL(selectedWord));
                }
                if (data.googleChecked) {
                    refUrls.push(getGoogleURL(selectedWord));
                }
                if (data.merriamwebsterChecked) {
                    refUrls.push(getMerriamWebsterURL(selectedWord));
                }
                if (data.onelookChecked) {
                    refUrls.push(getOneLookURL(selectedWord));
                }
                if (data.oxfordChecked) {
                    refUrls.push(getOxfordURL(selectedWord));
                }
                if (data.wiktionaryChecked) {
                    refUrls.push(getWiktionaryURL(selectedWord));
                }

                // generate ref URL obj array
                refUrls.forEach((url) => {
                    refUrlObjs.push({
                        url: url,
                        icon: getFaviconURL(url),
                        title: "",
                        fetched: false,
                        userEdited: false,
                        date: dateNumber
                    });
                });

                // push new word object to word bank
                data.wordBank.push({
                    text: (data.lowercaseChecked === true)
                        ? selectedWord.toLowerCase()
                        : selectedWord,
                    sourceUrls: [{
                        url: currentTab.url,
                        icon: getFaviconURL(currentTab.url),
                        title: "",
                        fetched: false,
                        userEdited: false,
                        date: dateNumber
                    }],
                    refUrls: refUrlObjs,
                    date: dateNumber,
                    notes: [],
                    starred: false,
                });
            }
            // set key to updated array
            chrome.storage.sync.set({"wordBank": data.wordBank}, () => {
                if (chrome.runtime.lastError) {
                    console.warn("Uh-oh..." + chrome.runtime.lastError.message);
                }
            });
        }
    });
});

// message listener: listens to messages from content scripts
chrome.runtime.onMessage.addListener((message) => {
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
    // export to PDF click handler: download .pdf file of word list
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

    return true;
});