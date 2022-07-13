let wordsDiv = document.getElementById("wordsDiv");
let refresh = document.getElementById("refresh");
let wordAdder = document.getElementById("wordAdder");
let settings = document.getElementById("settings");

let editMode = false;

function refreshData(event) {
    document.location.reload();
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

        // init attribute 'contenteditable' to span element
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

    wordAdder.addEventListener("click", () => {
        // if not in edit mode, enter it
        if (!editMode) {
            // create inputs, labels, and button
            let word = document.createElement("input");
            let url = document.createElement("input");
            let wordLabel = document.createElement("label");
            let urlLabel = document.createElement("label");
            let save = document.createElement("button");

            // edit innerHTML
            wordAdder.innerHTML = "";
            wordLabel.innerHTML = "Word: ";
            urlLabel.innerHTML = "URL: ";
            save.innerHTML = "Save";

            // update DOM tree
            wordAdder.appendChild(wordLabel);
            wordAdder.appendChild(word);
            wordAdder.appendChild(urlLabel);
            wordAdder.appendChild(url);
            wordAdder.appendChild(save);

            // set attributes
            word.setAttribute("id", "word");
            word.setAttribute("type", "text");
            url.setAttribute("id", "url");
            url.setAttribute("type", "url");
            wordLabel.setAttribute("for", "word");
            urlLabel.setAttribute("for", "url");

            save.addEventListener("click", (event) => {
                // save new word and url
                data.wordBank.push({
                    text: word.value.trim(),
                    url: url.value.trim()
                });
                chrome.storage.sync.set({"wordBank": data.wordBank});

                // refresh popup
                refreshData();
                
                // revert to original button
                wordAdder.innerHTML = "+ ... add new word to Wordrive ...";

                // turn off edit mode
                editMode = false;

                // prevent event bubbling up to parent element
                event.stopPropagation();
            });

            // turn on edit mode
            editMode = true;
        }
    });
});

refresh.addEventListener("click", refreshData);
settings.addEventListener("click", () => {
    window.location.href = "options-popup.html";
});