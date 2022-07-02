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

            word.setAttribute("href", data.words[i].url);
            word.innerText = data.words[i].text;
            wordsDiv.appendChild(word);
            wordsDiv.appendChild(newline);
        }
    }
});

clearAll.addEventListener("click", clearAllData);
refresh.addEventListener("click", refreshData);