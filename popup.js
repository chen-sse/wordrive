let wordsDiv = document.getElementById("wordsDiv");
let clearAll = document.getElementById("clearAll");

function clearAllData(event) {
    chrome.storage.sync.set({"words": []});
    document.location.reload();
}

chrome.storage.sync.get("words", (data) => {
    // if word bank array has been initialized
    if (typeof data.words !== "undefined") {
        for (let i = 0; i < data.words.length; i++) {
            let word = document.createElement("p");
            word.innerText = data.words[i];
            wordsDiv.appendChild(word);
        }
    }
});

clearAll.addEventListener("click", clearAllData);