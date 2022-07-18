let options = document.getElementById("options");
let wordsDiv = document.getElementById("wordsDiv");
let wordAdder = document.getElementById("wordAdder");

let addMode = false;

// hide hover images 'homeHover' and 'optionsHover'
let homeHover = document.getElementById("homeHover");
homeHover.style.visibility = "hidden";
let optionsHover = document.getElementById("optionsHover");
optionsHover.style.visibility = "hidden";

/* make hover image and grab cursor appear when cursor
hovers over home button, remove it when cursor leaves
 */
let homeDiv = document.getElementById("home");
homeDiv.addEventListener("mouseover", () => {
    homeHover.style.visibility = "visible";
    homeDiv.classList.add("footerButtonHover");
});
homeDiv.addEventListener("mouseout", () => {
    homeHover.style.visibility = "hidden";
    homeDiv.classList.remove("footerButtonHover");
});

/* make hover image and grab cursor appear when cursor
hovers over options button, remove it when cursor leaves
 */
let optionsDiv = document.getElementById("options")
optionsDiv.addEventListener("mouseover", () => {
    optionsHover.style.visibility = "visible";
    optionsDiv.classList.add("footerButtonHover");
});
optionsDiv.addEventListener("mouseout", () => {
    optionsHover.style.visibility = "hidden";
    optionsDiv.classList.remove("footerButtonHover");
});

function toggleButton(entryBox, wordContainer, editButton, data, i) {
    if (wordContainer.isContentEditable === false) {
        // enter edit mode, generate 'Save' button
        entryBox.classList.add("entryBoxEditMode");
        editButton.innerHTML = "Save";
        entryBox.classList.add("entryBoxEditMode");
    } else {
        // exit edit mode, save changes
        // if entry is an empty string, restore entry box to original word
        if (wordContainer.innerText.trim() === "") {
            wordContainer.innerText = data.wordBank[i].text;
        }
        // if entry is a non-empty string, set the entry to that string
        else {
            wordContainer.innerText = wordContainer.innerText.trim();
            data.wordBank[i].text = wordContainer.innerText.trim();
            chrome.storage.sync.set({"wordBank": data.wordBank});
        }

        editButton.innerHTML = "Edit";
        entryBox.classList.remove("entryBoxEditMode");
    }

    wordContainer.setAttribute("contenteditable", !wordContainer.isContentEditable);
}

chrome.storage.sync.get("wordBank", (data) => {
    for (let i = 0; i < data.wordBank.length; i++) {
        /* init a div-span-button set for given word
           Note: an 'entryBox' is the parent div for each entry;
           a 'wordContainer' is the span displaying the word */
        let entryBox = document.createElement("div");
        let wordContainer = document.createElement("span");
        let editButton = document.createElement("button");
        let wordUrl = data.wordBank[i].url;

        // add classes to 'entryBox' and 'editButton'
        entryBox.classList.add("entryBox");
        editButton.classList.add("editButton");

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

        // toggle URL drop-down menu on click
        entryBox.addEventListener("click", () => {
            if (entryBox.classList.toggle("url-mode-on")) {
                // init 'dropdown' that contains every 'urlBox'
                let dropdown = document.createElement("div");
                dropdown.setAttribute("id", `dropdown${i}`);

                /* init a div-span-button set for given URL
                Note: a urlBox is the parent div for each entry;
                a urlContainer is the span displaying the URL */
                let urlBox = document.createElement("div");
                let urlContainer = document.createElement("span");
                let urlEditButton = document.createElement("button");

                // add classes to 'urlBox' and 'urlEditButton'
                urlBox.classList.add("entryBox");
                urlContainer.classList.add("urlContainer");
                urlEditButton.classList.add("editButton");

                // init attribute 'contenteditable' to span element
                urlContainer.setAttribute("contenteditable", false);
                urlContainer.innerText = data.wordBank[i].url;

                // make 'editButton' and 'wordContainer' children of 'entryBox'
                urlBox.appendChild(urlEditButton);
                urlBox.appendChild(urlContainer);
                dropdown.appendChild(urlBox);

                entryBox.insertAdjacentElement("afterend", dropdown);

            } else {
                // remove 'dropdown' associated with given 'entryBox'
                document.getElementById(`dropdown${i}`).remove();
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
            let wordInput = document.createElement("input");
            let urlInput = document.createElement("input");
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
            wordAdder.appendChild(wordInput);
            wordAdder.appendChild(urlLabel);
            wordAdder.appendChild(urlInput);
            wordAdder.appendChild(save);

            // set attributes
            wordInput.setAttribute("id", "word");
            wordInput.setAttribute("type", "text");
            urlInput.setAttribute("id", "url");
            urlInput.setAttribute("type", "url");
            wordLabel.setAttribute("for", "word");
            urlLabel.setAttribute("for", "url");

            save.addEventListener("click", (event) => {
                // save new word and url
                if (wordInput.value.trim() !== "") {
                    data.wordBank.push({
                        text: wordInput.value.trim(),
                        url: urlInput.value.trim()
                    });
                    chrome.storage.sync.set({"wordBank": data.wordBank});
                }

                // refresh popup
                document.location.reload();

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