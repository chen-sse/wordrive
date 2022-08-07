import { getDate, getTime, getDictionaryURL } from "./utils.js";

let options = document.getElementById("options");
let wordsDiv = document.getElementById("wordsDiv");
let wordAdder = document.getElementById("wordAdder");
let search = document.getElementById("search");

let addMode = false;
let entryBoxes = [];

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
            let entry = data.wordBank[i];
            if (wordInput === entry.text) {
                newWord = false;
                duplicateIndex = i;

                // if empty URL, don't add (set 'newUrl = false')
                if (urlInput !== "") {
                    for (let j = 0; j < entry.sourceUrls.length; j++) {
                        if (urlInput === entry.sourceUrls[j]) {
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
                    sourceUrls: (urlInput === "")
                        ? []
                        : [urlInput],
                    refUrls: [getDictionaryURL(wordInput)],
                    date: getDate(),
                    time: getTime(),
                    notes: ""
                });
            } else {
                if (newUrl) {
                    data.wordBank[duplicateIndex].sourceUrls.push(urlInput);
                }
            }

            chrome.storage.sync.set({"wordBank": data.wordBank});
        }
                    
        // refresh popup
        document.location.reload();

        // turn off add mode
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

    // if not in edit mode, enter it and generate 'Save' button
    if (container.isContentEditable === false) {
        box.classList.add("entryBoxEditMode");
        button.innerHTML = "Save";
    // if in edit mode, exit it and save changes
    } else {
        // if entry is an empty string, restore entry box to original word/URL
        if (container.innerText === "") {
            container.innerText = (type === "word")
                                ? data.wordBank[wordIndex].text
                                : data.wordBank[wordIndex].sourceUrls[urlIndex];
        // if entry is a non-empty string, set the entry to that string
        } else {
            // if edited entry is a word
            if (type === "word") {
                // update array to reflect entered word
                data.wordBank[wordIndex].text = container.innerText;

                // compute indices of words that match entered word
                let firstIndex = data.wordBank.findIndex((element) => {
                    return (element.text === container.innerText) ? true : false;
                });
                let lastIndex = data.wordBank.length - 1 - data.wordBank.slice().reverse().findIndex((element) => {
                    return (element.text === container.innerText) ? true : false;
                });

                // if entered word is duplicate
                if (firstIndex !== lastIndex) {
                    // merge URLs from duplicate entry to current entry, then remove duplicate entry
                    for (const url of data.wordBank[wordIndex].sourceUrls) {
                        if (firstIndex === wordIndex) {
                            if (!data.wordBank[lastIndex].sourceUrls.includes(url)) {
                                data.wordBank[lastIndex].sourceUrls.push(url);
                            }
                        } else {
                            if (!data.wordBank[firstIndex].sourceUrls.includes(url)) {
                                data.wordBank[firstIndex].sourceUrls.push(url);
                            }
                        }
                    }
                    data.wordBank.splice(wordIndex, 1);

                    // refresh popup
                    document.location.reload();
                }
            // if edited entry is a URL
            } else {
                // update array to reflect entered URL
                data.wordBank[wordIndex][type][urlIndex] = container.innerText;

                // compute indices of URLs that match entered URL
                let firstIndex = data.wordBank[wordIndex][type].findIndex((element) => {
                    return (element === container.innerText) ? true : false;
                });
                let lastIndex = data.wordBank[wordIndex][type].length - 1 - data.wordBank[wordIndex][type].slice().reverse().findIndex((element) => {
                    return (element === container.innerText) ? true : false;
                });

                // remove duplicate URL, if it exists, then reload popup
                if (firstIndex !== lastIndex) {
                    data.wordBank[wordIndex][type].splice(firstIndex, 1);
                    document.location.reload();
                }
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

// actively return matching Wordrive entries on user input
search.addEventListener("keyup", () => {
    let filter = search.value.toLowerCase().trim();

    chrome.storage.sync.get("wordBank", (data) => {
        for (let i = 0; i < data.wordBank.length; i++) {
            let entry = data.wordBank[i];
            if (entry.text.indexOf(filter) > -1) {
                entryBoxes[i].style.display = "";
            } else {
                entryBoxes[i].style.display = "none";
            }
        }
    });
});

chrome.storage.sync.get("wordBank", (data) => {
    for (let i = 0; i < data.wordBank.length; i++) {
        let entry = data.wordBank[i];

        /* init a div-span-button set for given word
           Note: an 'entryBox' is the parent div for each entry;
           a 'wordContainer' is the span displaying the word */
        let entryBox = document.createElement("div");
        let wordContainer = document.createElement("span");
        let wordEditButton = document.createElement("button");
        entryBoxes.push(entryBox);

        // add classes to 'entryBox,' 'wordContainer,' and 'wordEditButton'
        entryBox.classList.add("entryBox");
        wordContainer.classList.add("container");
        wordEditButton.classList.add("editButton");

        // init attribute 'contenteditable' to span element
        wordContainer.setAttribute("contenteditable", false);
        wordContainer.innerText = entry.text;
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
                // if off, turn URL mode on and create dropdown
                if (!entryBox.classList.contains("url-mode-on")) {
                    // remove any existing dropdown
                    if (document.getElementsByClassName("dropdown").length !== 0) {
                        document.getElementsByClassName("url-mode-on")[0].classList.remove("url-mode-on");
                        document.getElementsByClassName("dropdown")[0].remove();
                    }

                    // init dropdown
                    let dropdown = document.createElement("div");
                    dropdown.classList.add("dropdown");
                    entryBox.insertAdjacentElement("afterend", dropdown);
    
                    // insert timestamp
                    let timestamp = document.createElement("div");
                    timestamp.innerHTML = `Added at ${entry.time} on ${entry.date}`;
                    dropdown.appendChild(timestamp);

                    // insert source URLs
                    let sourceUrls = document.createElement("div");
                    sourceUrls.innerHTML = "Found at:";
                    dropdown.appendChild(sourceUrls);
                    for (let j = 0; j < entry.sourceUrls.length; j++) {
                        let wordUrl = entry.sourceUrls[j];
    
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
    
                        /* make 'urlEditButton' and 'urlContainer' children of 'urlBox'
                        and append 'urlBox' to 'sourceUrls' */
                        urlBox.appendChild(urlEditButton);
                        urlBox.appendChild(urlContainer);
                        sourceUrls.appendChild(urlBox);
    
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
                                wordUrl = toggleButton(urlBox, urlContainer, urlEditButton, data, i, j, "sourceUrls");
                            }
                        });

                        // toggle edit/save button on click
                        urlEditButton.addEventListener("click", (event) => {
                            urlEditButton.classList.add("beingEdited");
                            wordUrl = toggleButton(urlBox, urlContainer, urlEditButton, data, i, j, "sourceUrls");
    
                            // prevent URL from opening ('urlBox' parent click event)
                            event.stopPropagation();
                        });
                    }

                    // insert reference URLs
                    let refUrls = document.createElement("div");
                    refUrls.innerHTML = "Reference:";
                    dropdown.appendChild(refUrls);
                    for (let j = 0; j < entry.refUrls.length; j++) {
                        let refUrl = entry.refUrls[j];
    
                        /* init a div-span-button set for given URL
                        Note: a refBox is the parent div for each entry;
                        a refContainer is the span displaying the URL */
                        let refBox = document.createElement("div");
                        let refContainer = document.createElement("span");
                        let refEditButton = document.createElement("button");
    
                        // add classes to 'refBox,' 'refContainer,' and 'refEditButton'
                        refBox.classList.add("entryBox");
                        refContainer.classList.add("container");
                        refEditButton.classList.add("editButton");
    
                        // init attribute 'contenteditable' to span element
                        refContainer.setAttribute("contenteditable", false);
                        refContainer.innerText = refUrl;
                        refEditButton.innerHTML = "Edit";
    
                        /* make 'refEditButton' and 'refContainer' children of 'refBox'
                        and append 'refBox' to 'refUrls' */
                        refBox.appendChild(refEditButton);
                        refBox.appendChild(refContainer);
                        refUrls.appendChild(refBox);
    
                        // click handler: tell background script to open hyperlink
                        refBox.addEventListener("click", () => {
                            // only open URL if not in URL edit mode
                            if (refContainer.isContentEditable === false) {
                                chrome.runtime.sendMessage({
                                    msg: "new tab",
                                    url: refUrl
                                });
                            }
                        });

                        // save changes and exit edit mode with 'Enter'
                        refContainer.addEventListener("keydown", (event) => {
                            if (event.code === "Enter") {
                                refUrl = toggleButton(refBox, refContainer, refEditButton, data, i, j, "refUrls");
                            }
                        });

                        // toggle edit/save button on click
                        refEditButton.addEventListener("click", (event) => {
                            refEditButton.classList.add("beingEdited");
                            refUrl = toggleButton(refBox, refContainer, refEditButton, data, i, j, "refUrls");
    
                            // prevent URL from opening ('urlBox' parent click event)
                            event.stopPropagation();
                        });
                    }

                    // insert notes
                    let notes = document.createElement("div");
                    let notesBox = document.createElement("div");

                    notes.innerHTML = "Notes:";
                    entry.notes = entry.notes.trim();
                    if (entry.notes === "") {
                        notesBox.innerHTML = "Write notes...";
                    } else {
                        notesBox.innerHTML = entry.notes;
                    }
                    
                    notesBox.setAttribute("contenteditable", true);
                    notesBox.setAttribute("id", "notesBox");

                    dropdown.appendChild(notes);
                    notes.appendChild(notesBox);

                    notesBox.addEventListener("keyup", () => {
                        entry.notes = notesBox.innerText;
                        chrome.storage.sync.set({"wordBank": data.wordBank});
                    });

                    // toggle URL mode on
                    entryBox.classList.add("url-mode-on");
                // if on, turn URL mode off and remove dropdown
                } else {
                    document.getElementsByClassName("dropdown")[0].remove();
                    entryBox.classList.remove("url-mode-on");
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
            let isValidURL = true;

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

            // set classes
            urlInput.classList.add("url-input");

            // check for valid URL input--disable save button if invalid
            urlInput.addEventListener("keyup", () => {
                urlInput.value = urlInput.value.trim();
                isValidURL = urlInput.checkValidity();

                if (isValidURL) {
                    save.disabled = false;
                } else {
                    save.disabled = true;
                }
            });

            // save changes and exit add mode by clicking 'Save' button
            save.addEventListener("click", (event) => {
                addEntries(wordInput.value, urlInput.value, event);
            });

            // save changes and exit add mode with 'Enter' if URL is valid
            wordInput.addEventListener("keydown", (event) => {
                if (event.code === "Enter") {
                    if (isValidURL) {
                        addEntries(wordInput.value, urlInput.value, null);
                    }
                }
            });
            urlInput.addEventListener("keydown", (event) => {
                if (event.code === "Enter") {
                    if (isValidURL) {
                        addEntries(wordInput.value, urlInput.value, null);
                    }
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