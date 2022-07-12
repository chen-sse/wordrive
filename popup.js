let wordsDiv = document.getElementById("wordsDiv");
let clearAll = document.getElementById("clearAll");
let refresh = document.getElementById("refresh");
let exportButton = document.getElementById("exportButton")

function clearAllData(event) {
    chrome.storage.sync.set({"wordBank": []});
    document.location.reload();
}

function refreshData(event) {
    document.location.reload();
}

function exportData(event) {
    chrome.storage.sync.get("wordBank", ({wordBank}) => {
        let builder = "Your Wordrive: \n\n"
        for (let i = 0; i<wordBank.length; i++) {
            // concatenate builder string
            let word = wordBank[i].text;
            let theUrl = wordBank[i].url;
            builder = builder + `WORD ${i+1}: ${word} | URL: ${theUrl}` + "\n\n";
            console.log(builder);
        }
        // instantiate blob w/ word bank and create url for it
        let listBlob = new Blob([builder], {type: "text/plain"});
        let fileUrl = URL.createObjectURL(listBlob);
        console.log(fileUrl)

        // send message to service worker to download file
        chrome.runtime.sendMessage({
            msg: "download",
            url: fileUrl
        }, () => {
            // revoke url from browser storage
            URL.revokeObjectURL(fileUrl);
        });
    })
}

function toggleButton(word, button, data, i) {
    // enter edit mode, generate 'Save' button
    if (word.isContentEditable === false) {
        button.innerHTML = "Save";
    } else {
        // save changes
        data.wordBank[i].text = word.innerText;
        chrome.storage.sync.set({"wordBank": data.wordBank});
        button.innerHTML = "Edit";
    }

    word.setAttribute("contenteditable", !word.isContentEditable);
}

chrome.storage.sync.get("wordBank", (data) => {
    for (let i = 0; i < data.wordBank.length; i++) {
        // init a div-span-button set for given word (box div as parent element)
        let box = document.createElement("div");
        let word = document.createElement("span");
        let button = document.createElement("button");
        let wordUrl = data.wordBank[i].url;

        // add classes to 'box' and 'button'
        button.classList.add("edit");
        box.classList.add("entry");

        // init attributes 'contenteditable' to span element
        word.setAttribute("contenteditable", false);
        word.innerText = data.wordBank[i].text;
        button.innerHTML = "Edit";

        // make 'button' and 'word' children of 'box'
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

        // save changes and exit edit mode with 'Enter'
        word.addEventListener("keydown", (event) => {
            if (event.code === "Enter") {
                toggleButton(word, button, data, i);
            }
        });

        // toggle edit/save button on click
        button.addEventListener("click", () => {
            toggleButton(word, button, data, i);
        });
    }
});

clearAll.addEventListener("click", clearAllData);
refresh.addEventListener("click", refreshData);
exportButton.addEventListener("click", exportData);
