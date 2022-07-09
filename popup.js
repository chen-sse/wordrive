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
            let box = document.createElement("div");
            let word = document.createElement("a");
            let button = document.createElement("button");

            let wordUrl = data.words[i].url;

            button.classList.add("edit");
            box.classList.add("entry");

            word.setAttribute("href", wordUrl);
            word.innerText = data.words[i].text;
            button.innerHTML = "Edit";

            box.appendChild(button);
            box.appendChild(word);
            wordsDiv.appendChild(box);

            // click handler: tell background script to open hyperlink
            word.addEventListener("click", () => {
                chrome.runtime.sendMessage({
                    msg: "new tab",
                    url: wordUrl
                });
            });
        }
    }
});

clearAll.addEventListener("click", clearAllData);
refresh.addEventListener("click", refreshData);