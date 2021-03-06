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

// add word and/or URL to Wordrive (through manual word adder)
function addEntries(wordInput, urlInput, event) {
    let newWord = true;
    let newUrl = true;
    let duplicateIndex = null;

    // trim word and URL inputs
    wordInput = wordInput.trim();
    urlInput = urlInput.trim();

    // check for duplicate words/URLs
    chrome.storage.sync.get("wordBank", (data) => {
        for (let i = 0; i < data.wordBank.length; i++) {
            if (wordInput === data.wordBank[i].text) {
                newWord = false;
                duplicateIndex = i;

                // if empty URL, don't add (set 'newUrl = false')
                if (urlInput !== "") {
                    for (let j = 0; j < data.wordBank[i].urls.length; j++) {
                        if (urlInput === data.wordBank[i].urls[j]) {
                            newUrl = false;
                        }
                    }
                } else {
                    newUrl = false;
                }
            }
        }

        // save word and/or URL, if not duplicate and not empty
        if (wordInput !== "") {
            if (newWord) {
                data.wordBank.push({
                    text: wordInput,
                    urls: (urlInput === "")
                        ? []
                        : [urlInput]
                });
            } else {
                if (newUrl) {
                    data.wordBank[duplicateIndex].urls.push(urlInput);
                }
            }

            chrome.storage.sync.set({"wordBank": data.wordBank});
        }
                    
        // refresh popup
        document.location.reload();

        // turn off edit mode
        addMode = false;

        // prevent word adder from reloading ('wordAdder' parent click event), if applicable
        if (event !== null) {
            event.stopPropagation();
        }
    });
}

// toggle edit/save button and save edits to Wordrive
function toggleButton(box, container, button, data, wordIndex, urlIndex, type) {
    // trim container text
    container.innerText = container.innerText.trim();

    if (container.isContentEditable === false) {
        // enter edit mode, generate 'Save' button
        box.classList.add("entryBoxEditMode");
        button.innerHTML = "Save";
    } else {
        // exit edit mode, save changes
        // if entry is an empty string, restore entry box to original word/URL
        if (container.innerText === "") {
            container.innerText = (type === "word")
                                ? data.wordBank[wordIndex].text
                                : data.wordBank[wordIndex].urls[urlIndex];
        }
        // if entry is a non-empty string, set the entry to that string
        else {
            if (type === "word") {
                data.wordBank[wordIndex].text = container.innerText;
            } else {
                data.wordBank[wordIndex].urls[urlIndex] = container.innerText;
            }
            chrome.storage.sync.set({"wordBank": data.wordBank});
        }

        button.innerHTML = "Edit";
        box.classList.remove("entryBoxEditMode");
    }

    // toggle 'contenteditable' permission
    container.setAttribute("contenteditable", !container.isContentEditable);

    // return the contents of input box
    return container.innerText;
}

chrome.storage.sync.get("wordBank", (data) => {
    for (let i = 0; i < data.wordBank.length; i++) {
        /* init a div-span-button set for given word
           Note: an 'entryBox' is the parent div for each entry;
           a 'wordContainer' is the span displaying the word */
        let entryBox = document.createElement("div");
        let wordContainer = document.createElement("span");
        let wordEditButton = document.createElement("button");

        // add classes to 'entryBox,' 'wordContainer,' and 'wordEditButton'
        entryBox.classList.add("entryBox");
        wordContainer.classList.add("container");
        wordEditButton.classList.add("editButton");

        // init attribute 'contenteditable' to span element
        wordContainer.setAttribute("contenteditable", false);
        wordContainer.innerText = data.wordBank[i].text;
        wordEditButton.innerHTML = "Edit";

        // make 'wordEditButton' and 'wordContainer' children of 'entryBox'
        entryBox.appendChild(wordEditButton);
        entryBox.appendChild(wordContainer);
        wordsDiv.appendChild(entryBox);

        // save changes and exit edit mode with 'Enter'
        wordContainer.addEventListener("keydown", (event) => {
            if (event.code === "Enter") {
                toggleButton(entryBox, wordContainer, wordEditButton, data, i, null, "word");
            }
        });

        wordContainer.addEventListener("click", (event) => {
            // only open URL if not in word edit mode
            if (wordContainer.isContentEditable === false) {
                // tokenize word entry
                let searchTokens = data.wordBank[i].text.match(/\S+/g);

                // construct dictionary URL
                let dictionaryUrl = "https://www.merriam-webster.com/dictionary/";
                for (let j = 0; j < searchTokens.length; j++) {
                    dictionaryUrl += searchTokens[j];
                    dictionaryUrl += "%20";
                }

                // tell background script to open dictionary URL
                chrome.runtime.sendMessage({
                    msg: "new tab",
                    url: dictionaryUrl
                });
            }

            // prevent URL drop-down menu from firing ('entryBox' parent click event)
            event.stopPropagation();
        });

        // toggle edit/save button on click
        wordEditButton.addEventListener("click", (event) => {
            wordEditButton.classList.add("beingEdited");
            toggleButton(entryBox, wordContainer, wordEditButton, data, i, null, "word");

            // prevent URL drop-down menu from firing ('entryBox' parent click event)
            event.stopPropagation();
        });

        // toggle URL drop-down menu on click
        entryBox.addEventListener("click", () => {
            // only toggle dropdown if not in word edit mode 
            if (wordContainer.isContentEditable === false) {
                if (entryBox.classList.toggle("url-mode-on")) {
                    // init 'dropdown' that contains every 'urlBox'
                    let dropdown = document.createElement("div");
                    dropdown.setAttribute("id", `dropdown${i}`);
                    dropdown.classList.add("dropdown");
                    entryBox.insertAdjacentElement("afterend", dropdown);
    
                    for (let j = 0; j < data.wordBank[i].urls.length; j++) {
                        let wordUrl = data.wordBank[i].urls[j];
    
                        /* init a div-span-button set for given URL
                        Note: a urlBox is the parent div for each entry;
                        a urlContainer is the span displaying the URL */
                        let urlBox = document.createElement("div");
                        let urlContainer = document.createElement("span");
                        let urlEditButton = document.createElement("button");
    
                        // add classes to 'urlBox,' 'urlContainer,' and 'urlEditButton'
                        urlBox.classList.add("entryBox");
                        urlContainer.classList.add("container");
                        urlEditButton.classList.add("editButton");
    
                        // init attribute 'contenteditable' to span element
                        urlContainer.setAttribute("contenteditable", false);
                        urlContainer.innerText = wordUrl;
                        urlEditButton.innerHTML = "Edit";
    
                        // make 'editButton' and 'wordContainer' children of 'entryBox'
                        urlBox.appendChild(urlEditButton);
                        urlBox.appendChild(urlContainer);
                        dropdown.appendChild(urlBox);
    
                        // click handler: tell background script to open hyperlink
                        urlBox.addEventListener("click", () => {
                            // only open URL if not in URL edit mode
                            if (urlContainer.isContentEditable === false) {
                                chrome.runtime.sendMessage({
                                    msg: "new tab",
                                    url: wordUrl
                                });
                            }
                        });

                        // save changes and exit edit mode with 'Enter'
                        urlContainer.addEventListener("keydown", (event) => {
                            if (event.code === "Enter") {
                                wordUrl = toggleButton(urlBox, urlContainer, urlEditButton, data, i, j, "url");
                            }
                        });

                        // toggle edit/save button on click
                        urlEditButton.addEventListener("click", (event) => {
                            urlEditButton.classList.add("beingEdited");
                            wordUrl = toggleButton(urlBox, urlContainer, urlEditButton, data, i, j, "url");
    
                            // prevent URL from opening ('urlBox' parent click event)
                            event.stopPropagation();
                        });
                    }
                } else {
                    // remove 'dropdown' associated with given 'entryBox'
                    document.getElementById(`dropdown${i}`).remove();
                }
            }
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
                addEntries(wordInput.value, urlInput.value, event);
            });

            // save changes and exit add mode with 'Enter'
            wordInput.addEventListener("keydown", (event) => {
                if (event.code === "Enter") {
                    addEntries(wordInput.value, urlInput.value, null);
                }
            });
            urlInput.addEventListener("keydown", (event) => {
                if (event.code === "Enter") {
                    addEntries(wordInput.value, urlInput.value, null);
                }
            });

            // turn on edit mode
            addMode = true;
        }
    });
});

options.addEventListener("click", () => {
    window.location.href = "options-popup.html";
});