chrome.runtime.onInstalled.addListener(async () => {
    chrome.contextMenus.create({
        id: "contextMenu",
        title: "Add to Wordrive",
        contexts: ["selection"]
    });
})