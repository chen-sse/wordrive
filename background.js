chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "contextMenu",
        title: "Add to Wordrive",
        contexts: ["selection"]
    });
})