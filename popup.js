let wordsDiv = document.getElementById("wordsDiv");
let wordAdder = document.getElementById("wordAdder");
let options = document.getElementById("options");

let addMode = false;

function refreshData(event) {
    document.location.reload();
}

function toggleButton(entryBox, wordContainer, editButton, data, i) {
    if (wordContainer.isContentEditable === false) {
        // enter edit mode, generate 'Save' button
        editButton.innerHTML = "Save";
    } else {
        // exit edit mode, save changes

        // if entry is an empty string, restore entry box to original word
        if (wordContainer.innerText.trim() === ""){
            wordContainer.innerText = data.wordBank[i].text;
            chrome.storage.sync.set({"wordBank": data.wordBank});
            editButton.innerHTML = "Edit";
        }

        // if entry is a non-empty string, set the entry to that string
        else {
            wordContainer.innerText = wordContainer.innerText.trim();
            data.wordBank[i].text = wordContainer.innerText.trim();
            chrome.storage.sync.set({"wordBank": data.wordBank});
            editButton.innerHTML = "Edit";
        }
    }

    wordContainer.setAttribute("contenteditable", !wordContainer.isContentEditable);
}

chrome.storage.sync.get("wordBank", (data) => {
    for (let i = 0; i < data.wordBank.length; i++) {
        /* init a div-span-button set for given word
           Note: an entryBox is the parent div for each entry;
           a wordContainer is the span displaying the word */
        let entryBox = document.createElement("div");
        let wordContainer = document.createElement("span");
        let editButton = document.createElement("button");
        let wordUrl = data.wordBank[i].url;

        // add classes to 'wordBox' and 'editButton'
        editButton.classList.add("editButton");
        entryBox.classList.add("entryBox");

        // init attribute 'contenteditable' to span element
        wordContainer.setAttribute("contenteditable", false);
        wordContainer.innerText = data.wordBank[i].text;
        editButton.innerHTML = "Edit";

        // make 'editButton' and 'wordContainer' children of 'entryBox'
        entryBox.appendChild(editButton);
        entryBox.appendChild(wordContainer);
        wordsDiv.appendChild(entryBox);

        // click handler: tell background script to open hyperlink
        wordContainer.addEventListener("click", () => {
            // if not in edit mode
            if (wordContainer.isContentEditable === false) {
                chrome.runtime.sendMessage({
                    msg: "new tab",
                    url: wordUrl
                });
            }
        });

        // save changes and exit edit mode with 'Enter'
        wordContainer.addEventListener("keydown", (event) => {
            if (event.code === "Enter") {
                toggleButton(entryBox, wordContainer, editButton, data, i);
            }
        });

        // toggle edit/save button on click
        editButton.addEventListener("click", () => {
            editButton.classList.add("beingEdited")
            toggleButton(entryBox, wordContainer, editButton, data, i);
        });
    }

    wordAdder.addEventListener("click", () => {
        // if not in edit mode, enter it
        if (!addMode) {
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
                addMode = false;

                // prevent event bubbling up to parent element
                event.stopPropagation();
            });

            // turn on edit mode
            addMode = true;
        }
    });
});

options.addEventListener("click", () => {
    window.location.href = "options-popup.html";
});