let wordsDiv = document.getElementById("wordsDiv");
let clearAll = document.getElementById("clearAll");
let refresh = document.getElementById("refresh");

function clearAllData(event) {
    chrome.storage.sync.set({"words": []});
    document.location.reload();
}

function refreshData(event) {
    document.location.reload();
}

chrome.storage.sync.get("words", (data) => {
    // if word bank array has been initialized
    if (typeof data.words !== "undefined") {
        for (let i = 0; i < data.words.length; i++) {
            let word = document.createElement("a");
            let newline = document.createElement("br");
            let wordUrl = data.words[i].url;

            word.setAttribute("href", wordUrl);
            word.innerText = data.words[i].text;

            // click handler: tell background script to open hyperlink
            word.addEventListener("click", () => {
                chrome.runtime.sendMessage({
                    msg: "new tab",
                    url: wordUrl
                });
            });

            wordsDiv.appendChild(word);
            wordsDiv.appendChild(newline);
        }
    }
});

clearAll.addEventListener("click", clearAllData);
refresh.addEventListener("click", refreshData);