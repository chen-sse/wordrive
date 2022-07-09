let wordsDiv = document.getElementById("wordsDiv");
let clearAll = document.getElementById("clearAll");
let refresh = document.getElementById("refresh");

function clearAllData(event) {
    chrome.storage.sync.set({"wordBank": []});
    document.location.reload();
}

function refreshData(event) {
    document.location.reload();
}

chrome.storage.sync.get("wordBank", (data) => {
    // if word bank array has been initialized
    if (typeof data.wordBank !== "undefined") {
        for (let i = 0; i < data.wordBank.length; i++) {
            let box = document.createElement("div");
            let word = document.createElement("span");
            let button = document.createElement("button");

            let wordUrl = data.wordBank[i].url;

            button.classList.add("edit");
            box.classList.add("entry");

            word.setAttribute("href", wordUrl);
            word.setAttribute("contenteditable", false);
            word.innerText = data.wordBank[i].text;
            button.innerHTML = "Edit";

            box.appendChild(button);
            box.appendChild(word);
            wordsDiv.appendChild(box);

            // click handler: tell background script to open hyperlink
            word.addEventListener("click", () => {
                // if not in edit mode
                if (word.isContentEditable === false) {
                    chrome.runtime.sendMessage({
                        msg: "new tab",
                        url: wordUrl
                    });
                }
            });

            // toggle edit/save button
            button.addEventListener("click", () => {
                // enter edit mode, generate 'Save' button
                if (word.isContentEditable === false) {
                    word.contentEditable = true;
                    button.innerHTML = "Save";
                } else {
                    // save changes
                    data.wordBank[i].text = word.innerText;
                    chrome.storage.sync.set({"wordBank": data.wordBank});

                    // reset to 'Edit' button
                    word.contentEditable = false;
                    button.innerHTML = "Edit";
                }
            });
        }
    }
});

clearAll.addEventListener("click", clearAllData);
refresh.addEventListener("click", refreshData);