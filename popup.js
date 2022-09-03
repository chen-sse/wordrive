import { getDate, getTime, getDictionaryURL, getFaviconURL } from "./utils.js";

let DELETE_TIMEOUT = 1500;

let options = document.getElementById("options");
let wordsDiv = document.getElementById("wordsDiv");
let wordAdder = document.getElementById("wordAdder");
let searchInput = document.getElementById("search-input");
let tabHeader = document.getElementById("tab-header");
let entryContainers = [];
let recentsTab = {
    tabElement: document.getElementById("recents-tab"),
    tabWrapper: document.getElementById("recents-tab-wrapper"),
    activeColor: "#C1E6AE",
    activeClass: "recents-active",
    inactiveClass: "recents-inactive"
}
let viewAllTab = {
    tabElement: document.getElementById("view-all-tab"),
    tabWrapper: document.getElementById("view-all-tab-wrapper"),
    activeColor: "#B1B1F9",
    activeClass: "view-all-active",
    inactiveClass: "view-all-inactive"
}
let starredTab = {
    tabElement: document.getElementById("starred-tab"),
    tabWrapper: document.getElementById("starred-tab-wrapper"),
    activeColor: "#F8D651",
    activeClass: "starred-active",
    inactiveClass: "starred-inactive"
}

// change active class applied to tab-bar (tab bar cannot be inactive)
function changeTabBarStatus (tab) {
    let constituentOne = document.getElementById("tab-bar-constituent1");
    constituentOne.setAttribute("class", "");
    constituentOne.style.fill = tab.activeColor;
    let constituentTwo = document.getElementById("tab-bar-constituent2");
    constituentTwo.setAttribute("class", "");
    constituentTwo.style.fill = tab.activeColor;
    let tabBarElement = document.getElementById("tab-bar");
    tabBarElement.style.zIndex = "10";
}

// boolean 'activate' -- true if tab is to be activated, false if it is to be deactivated
function changeTabStatus (tab, activate) {
    let svgElements = tab.tabWrapper.children;
    for (let i = 0; i < svgElements.length; i++) {
        let elementClass = svgElements[i].getAttribute("class");
        // apply activity class to element if it is not part of icon graphic
        if (elementClass.indexOf("icon-graphic") === -1) {
            if (activate) {
                // if inactive class applied to element, remove it
                svgElements[i].classList.remove(tab.inactiveClass);
                svgElements[i].classList.add(tab.activeClass);
                // apply class to tab SVG element (necessary for proper tab overlap)
                tab.tabElement.classList.remove(tab.inactiveClass);
                tab.tabElement.classList.add(tab.activeClass);
            } else {
                svgElements[i].classList.remove(tab.activeClass);
                svgElements[i].classList.add(tab.inactiveClass);
                // remove class from tab SVG element (necessary for proper tab overlap)
                tab.tabElement.classList.remove(tab.activeClass);
                tab.tabElement.classList.add(tab.inactiveClass);
            }
        } else { break; }
    }
}

// activate one tab and deactivate others
function changeAllTabStatuses (activeTab, inactiveTabOne, inactiveTabTwo) {
    // activate clicked tab
    changeTabStatus(activeTab, true);
    // deactivate other tabs
    changeTabStatus(inactiveTabOne, false);
    changeTabStatus(inactiveTabTwo, false);
}
// activate recents tab and display relevant entries
document.getElementById("recents-tab-wrapper").addEventListener('click', (event) => {
    recentsTab.tabElement.style.zIndex = "10";
    changeAllTabStatuses(recentsTab, viewAllTab, starredTab);
    viewAllTab.tabElement.style.zIndex = "5";
    starredTab.tabElement.style.zIndex = "1";
    // apply recents active class to tab bar
    changeTabBarStatus(recentsTab);
    // change text of tab-header
    tabHeader.innerText = "R E C E N T";
    // load recent entries
    clearAllEntries();
    loadEntries("recents");
});

// activate view-all tab and display relevant entries
document.getElementById("view-all-tab-wrapper").addEventListener('click', () => {
    viewAllTab.tabElement.style.zIndex = "10"
    changeAllTabStatuses(viewAllTab, recentsTab, starredTab);
    recentsTab.tabElement.style.zIndex = "1";
    starredTab.tabElement.style.zIndex = "1";
    // apply view-all active class to tab bar
    changeTabBarStatus(viewAllTab);
    // change text of tab-header
    tabHeader.innerText = "A L L";
    // load all entries
    clearAllEntries();
    loadEntries("view-all");
});
// activate starred tab and display relevant entries
document.getElementById("starred-tab-wrapper").addEventListener('click', () => {
    starredTab.tabElement.style.zIndex = "10";
    changeAllTabStatuses(starredTab, recentsTab, viewAllTab);
    recentsTab.tabElement.style.zIndex = "5";
    viewAllTab.tabElement.style.zIndex = "1";
    // apply starred active class to tab bar
    changeTabBarStatus(starredTab);
    // change text of tab-header
    tabHeader.innerText = "S T A R R E D";
    // load starred entries
    clearAllEntries();
    loadEntries("starred");
});


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
function addEntries(wordInput, urlInput, type, event) {
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
                    for (let j = 0; j < entry[type].length; j++) {
                        if (urlInput === entry[type][j].url) {
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
                let dictionaryUrl = getDictionaryURL(wordInput);

                data.wordBank.push({
                    text: wordInput,
                    sourceUrls: (urlInput === "")
                        ? []
                        : [{
                            url: urlInput,
                            icon: getFaviconURL(urlInput),
                            title: "",
                            fetched: false
                        }],
                    refUrls: [{
                        url: dictionaryUrl,
                        icon: getFaviconURL(dictionaryURL),
                        title: "",
                        fetched: false
                    }],
                    date: getDate(),
                    time: getTime(),
                    notes: ""
                });
            } else if (newUrl) {
                data.wordBank[duplicateIndex][type].push({
                    url: urlInput,
                    icon: getFaviconURL(urlInput),
                    title: "",
                    fetched: false
                });
            }

            chrome.storage.sync.set({"wordBank": data.wordBank});
        }
                    
        // refresh popup
        document.location.reload();

        // prevent word adder from reloading ('wordAdder' parent click event), if applicable
        if (event !== null) {
            event.stopPropagation();
        }
    });
}

// fetch the HTML title of a specified URL
async function getTitle(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, "text/html");
        return (typeof(doc.title !== "undefined")) ? doc.title : "";
    } catch (error) {
        return null;
    }
}

// remove any existing dropdown
function removeDropdown() {
    if (document.getElementsByClassName("dropdown").length !== 0) {
        document.getElementsByClassName("url-mode-on")[0].classList.remove("url-mode-on");
        document.getElementsByClassName("dropdown")[0].remove();
    }
}

// toggle edit/save button and save edits to Wordrive
function toggleButton(box, container, button, data, wordIndex) {
    // trim container text
    container.innerText = container.innerText.trim();

    // if not in edit mode, enter it and generate 'Save' button
    if (container.isContentEditable === false) {
        box.classList.add("entryContainerEditMode");
        button.innerHTML = "Save";
    // if in edit mode, exit it and save changes
    } else {
        // if entry is an empty string, restore entry box to original word
        if (container.innerText === "") {
            container.innerText = data.wordBank[wordIndex].text;
        // if entry is a non-empty string, set the entry to that string
        } else {
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
                for (const urlObj of data.wordBank[wordIndex].sourceUrls) {
                    if (firstIndex === wordIndex) {
                        // for each urlObj, check if there exists another urlObj in sourceUrls with URL equal to urlObj.url
                        if (!data.wordBank[lastIndex].sourceUrls.some((e) => (e.url === urlObj.url))) {
                            data.wordBank[lastIndex].sourceUrls.push({
                                url: urlObj.url,
                                icon: getFaviconURL(urlObj.url),
                                title: "",
                                fetched: false
                            });
                        }
                    } else {
                        if (!data.wordBank[firstIndex].sourceUrls.some((e) => (e.url === urlObj.url))) {
                            data.wordBank[firstIndex].sourceUrls.push({
                                url: urlObj.url,
                                icon: getFaviconURL(urlObj.url),
                                title: "",
                                fetched: false
                            });
                        }
                    }
                }
                data.wordBank.splice(wordIndex, 1);

                // refresh popup
                document.location.reload();
            }

            chrome.storage.sync.set({"wordBank": data.wordBank});
        }

        button.innerHTML = "Edit";
        box.classList.remove("entryContainerEditMode");
    }

    // toggle 'contenteditable' permission
    container.setAttribute("contenteditable", !container.isContentEditable);

    // return the contents of input box
    return container.innerText;
}

// actively return matching Wordrive entries on user input
searchInput.addEventListener("keyup", () => {
    // remove any existing dropdown
    removeDropdown();

    let filter = searchInput.value.toLowerCase().trim();
    chrome.storage.sync.get("wordBank", (data) => {
        for (let i = 0; i < data.wordBank.length; i++) {
            let entry = data.wordBank[i];
            if (entry.text.toLowerCase().indexOf(filter) > -1) {
                entryContainers[i].style.display = "";
            } else {
                entryContainers[i].style.display = "none";
            }
        }
    });
});

// by default, load recents
loadEntries("recents");

// load Wordrive entries
function loadEntries (tab) {
    chrome.storage.sync.get("wordBank", (data) => {
        let addMode = false;

        // ** PART ONE: fetch and save titles
        for (let i = 0; i < data.wordBank.length; i++) {
            let entry = data.wordBank[i];

            // fetch source URL titles
            for (let j = 0; j < entry.sourceUrls.length; j++) {
                let sourceUrl = entry.sourceUrls[j];
                (async () => {
                    // if URL has never been successfully fetched
                    if (!sourceUrl.fetched) {
                        // set title to hostname by default
                        sourceUrl.title = new URL(sourceUrl.url).hostname;
                        // fetch title
                        let title = await getTitle(sourceUrl.url);
                        // if fetch succeeded, mark URL as successfully fetched
                        if (title !== null) {
                            sourceUrl.fetched = true;
                            // set title to fetched title if fetched title isn't empty/undefined
                            if (title !== "") {
                                sourceUrl.title = title;
                            }
                        }
                        // sync changes
                        chrome.storage.sync.set({"wordBank": data.wordBank});
                    }
                })()
            }

            // fetch reference URL titles
            for (let j = 0; j < entry.refUrls.length; j++) {
                let refUrl = entry.refUrls[j];
                (async () => {
                    // if URL has never been successfully fetched
                    if (refUrl.fetched !== true) {
                        // set title to hostname by default
                        refUrl.title = new URL(refUrl.url).hostname;
                        // fetch title
                        let title = await getTitle(refUrl.url);
                        // if fetch succeeded, mark URL as successfully fetched
                        if (title !== null) {
                            refUrl.fetched = true;
                            // set title to fetched title if fetched title isn't empty/undefined
                            if (title !== "") {
                                refUrl.title = title;
                            }
                        }
                        // sync changes
                        chrome.storage.sync.set({"wordBank": data.wordBank});
                    }
                })()
            }
        }

        // ** PART TWO: generate entries
        let counter = 0;
        for (let i = 0; i < data.wordBank.length; i++) {
            let entry = data.wordBank[i];
            let isRecent = false;
            // entry is recent if it is one of last 5 words in list
            if (i > data.wordBank.length - 6) isRecent = true;
            // if in starred mode and entry is not starred, do not generate entry
            if (tab === "starred" && entry.starred === false) {
                continue;
            }
            // if in recents mode and entry is not recent, do not generate entry
            else if (tab == "recents" && isRecent === false) {
                continue;
            // else generate all entries (view-all mode)
            } else {
                // init entry container and child elements
                let entryWrapper = document.createElement("div");
                let entryContainer = document.createElement("div");
                let entryNumber = document.createElement("span");
                let entryDropdownArrow = document.createElement("img");
                let wordContainer = document.createElement("span");
                let entryStar = document.createElement("input");
                let entryCheckbox = document.createElement("input");
                let entryStarLabel = document.createElement("label");
                let entryCheckboxLabel = document.createElement("label");
                let testInput = document.createElement("input");
                testInput.setAttribute("type", "checkbox");
                testInput.setAttribute("id", "thing");
                let testLabel = document.createElement("label");
                testLabel.setAttribute("for", "thing");
                entryContainers.push(entryContainer);

                // apply classes
                entryWrapper.classList.add("entry-wrapper");
                entryContainer.classList.add("entry-container");
                entryNumber.classList.add("entry-number");
                entryDropdownArrow.classList.add("entry-dropdown-arrow");
                entryStar.classList.add("entry-star");
                entryCheckbox.classList.add("entry-checkbox");
                entryStarLabel.classList.add("entry-star-label");
                entryCheckboxLabel.classList.add("entry-checkbox-label");

                // init attributes and properties
                wordContainer.setAttribute("contenteditable", false);
                wordContainer.innerText = entry.text;
                let entryNum = counter + 1;
                entryNumber.innerText = entryNum.toString();
                counter++;
                entryDropdownArrow.setAttribute("src", "images/entry-dropdown-arrow.svg");
                entryStar.setAttribute("type", "checkbox");
                entryCheckbox.setAttribute("type", "checkbox");

                // link labels and inputs (create 'for' and 'id' pairs between checkbox label and input)
                let esID = `entry-star-${entryNum}`;
                entryStar.setAttribute("id", esID);
                entryStarLabel.setAttribute("for", esID);
                let ecID = `entry-checkbox-${entryNum}`;
                entryCheckbox.setAttribute("id", ecID);
                entryCheckboxLabel.setAttribute("for", ecID);

                // star entry if previously starred
                entryStar.checked = entry.starred;

                // update DOM
                entryContainer.appendChild(entryDropdownArrow);
                entryContainer.appendChild(entryNumber); //naturally appends to unused space right of word
                entryContainer.appendChild(wordContainer);
                entryContainer.appendChild(entryCheckbox);
                entryContainer.appendChild(entryCheckboxLabel);
                entryContainer.appendChild(entryStar);
                entryContainer.appendChild(entryStarLabel);
                wordsDiv.appendChild(entryContainer);

                // save starred preference
                entryStar.addEventListener("click", () => {
                    entry.starred = entryStar.checked;
                    chrome.storage.sync.set({"wordBank": data.wordBank});
                });

                entryStar.addEventListener("mouseover", () => {
                    const unstarHoverURL = "images/entry-star-unstar-hover.svg";
                    const starHoverURL = "images/entry-star-star-hover.svg";
                    if (entryStar.checked) {
                        entryStar.style.backgroundImage = `url(${unstarHoverURL})`;
                        entryStar.style.backgroundPosition
                    }
                })

                // save changes and exit edit mode with 'Enter'
                wordContainer.addEventListener("keydown", (event) => {
                    if (event.code === "Enter") {
                        toggleButton(entryContainer, wordContainer, wordEditButton, data, i);
                    }
                });

                // toggle URL drop-down menu on click
                entryContainer.addEventListener("click", () => {
                    // only toggle dropdown if not in word edit mode
                    if (wordContainer.isContentEditable === false) {
                        // if off, turn URL mode on and create dropdown
                        if (!entryContainer.classList.contains("url-mode-on")) {
                            // remove any existing dropdown
                            removeDropdown();

                            // toggle URL mode on
                            entryContainer.classList.add("url-mode-on");

                            // init mode booleans and arrays
                            let sourceUrlAddMode = false;
                            let refUrlAddMode = false;
                            let editMode = false;
                            let textDivs = [];
                            let subtractButtons = [];
                            let subtractClickedObjects = [];
                            let urlObjs = [];
                            let timeoutIDs = [];

                            function subtractButtonCallback(subtractButton, subtractClicked, urlBox, url, array) {
                                if (!subtractClicked.clicked) {
                                    subtractButton.setAttribute("src", "images/delete-icon.svg");
                                    subtractButton.classList.add("delete-icon");
                                    subtractClicked.clicked = true;

                                    // set delete button timeout
                                    let timeoutID = setTimeout(() => {
                                        subtractClicked.clicked = false;
                                        subtractButton.setAttribute("src", "images/subtract-icon.svg");
                                        subtractButton.classList.remove("delete-icon");
                                    }, DELETE_TIMEOUT);
                                    timeoutIDs.push(timeoutID);
                                } else {
                                    // hide current URL
                                    urlBox.style.display = "none";

                                    // delete current URL
                                    let deleteIndex = entry[array].findIndex((element) => {
                                        return (element.url === url.url) ? true : false;
                                    });
                                    entry[array].splice(deleteIndex, 1);
                                    chrome.storage.sync.set({"wordBank": data.wordBank});
                                }
                            }

                            // init dropdown
                            let dropdown = document.createElement("div");
                            dropdown.classList.add("dropdown");
                            entryContainer.insertAdjacentElement("afterend", dropdown);

                            // insert timestamp
                            let timestamp = document.createElement("div");
                            timestamp.innerHTML = `Added at ${entry.time} on ${entry.date}`;
                            dropdown.appendChild(timestamp);

                            // insert edit icon
                            let editIcon = document.createElement("img");
                            editIcon.setAttribute("src", "images/edit-icon.svg");
                            editIcon.classList.add("edit-save-icon");
                            timestamp.appendChild(editIcon);

                            // insert source URLs
                            let sourceUrls = document.createElement("div");
                            sourceUrls.innerHTML = "Found at:";
                            dropdown.appendChild(sourceUrls);
                            for (let j = 0; j < entry.sourceUrls.length; j++) {
                                let sourceUrl = entry.sourceUrls[j];
                                let subtractClicked = {clicked: false};
                                subtractClickedObjects.push(subtractClicked);

                                /* init a div-span set for given URL;
                                urlBox is the parent div for each entry */
                                let urlBox = document.createElement("div");
                                let iconDiv = document.createElement("div");
                                let textDiv = document.createElement("div");
                                let buttonDiv = document.createElement("div");

                                // add classes
                                urlBox.classList.add("entryContainer");
                                urlBox.classList.add("url-box");
                                iconDiv.classList.add("icon-div");
                                textDiv.classList.add("text-div");
                                buttonDiv.classList.add("button-div");

                                // create icon and set properties
                                let icon = document.createElement("img");
                                icon.classList.add("icon");
                                icon.setAttribute("src", sourceUrl.icon);

                                // create subtract button and set properties
                                let subtractButton = document.createElement("img");
                                subtractButton.classList.add("icon");
                                subtractButton.setAttribute("src", "images/subtract-icon.svg");
                                subtractButton.style.display = "none";
                                subtractButtons.push(subtractButton);

                                // set label properties
                                textDiv.setAttribute("contenteditable", false);
                                textDiv.setAttribute("data-url", sourceUrl.url);
                                textDiv.innerText = sourceUrl.title;
                                textDivs.push({
                                    textDiv: textDiv,
                                    array: "sourceUrls"
                                });

                                // update DOM
                                urlBox.appendChild(iconDiv);
                                urlBox.appendChild(textDiv);
                                urlBox.appendChild(buttonDiv);
                                iconDiv.appendChild(icon);
                                buttonDiv.appendChild(subtractButton);
                                sourceUrls.appendChild(urlBox);

                                // click handlers: tell background script to open hyperlink
                                iconDiv.addEventListener("click", () => {
                                    // only open URL if not in URL edit mode
                                    if (!editMode) {
                                        chrome.runtime.sendMessage({
                                            msg: "new tab",
                                            url: sourceUrl.url
                                        });
                                    }
                                });
                                textDiv.addEventListener("click", () => {
                                    // only open URL if not in URL edit mode
                                    if (!editMode) {
                                        chrome.runtime.sendMessage({
                                            msg: "new tab",
                                            url: sourceUrl.url
                                        });
                                    }
                                });

                                // package URL-specific variables into object
                                urlObjs.push({
                                    subtractButton: subtractButton,
                                    subtractClicked: subtractClicked,
                                    urlBox: urlBox,
                                    url: sourceUrl,
                                    array: "sourceUrls"
                                });
                            }

                            // insert source URL adder
                            let sourceUrlAdder = document.createElement("div");
                            let sourceUrlAdderLabel = document.createElement("span");

                            // add 'sourceUrlAdder' properties
                            sourceUrlAdder.classList.add("container");
                            sourceUrlAdder.classList.add("adder");
                            sourceUrlAdder.style.display = "none";

                            // set source URL adder label
                            sourceUrlAdderLabel.innerHTML = "+ Add source URL...";

                            // update DOM
                            sourceUrls.appendChild(sourceUrlAdder);
                            sourceUrlAdder.appendChild(sourceUrlAdderLabel);

                            // create source URL adder elements
                            // create inputs, labels, and buttons
                            let sourceTitleInput = document.createElement("input");
                            let sourceUrlInput = document.createElement("input");
                            let sourceTitleLabel = document.createElement("label");
                            let sourceUrlLabel = document.createElement("label");
                            let sourceCancel = document.createElement("button");
                            let sourceSave = document.createElement("button");
                            let sourceIsValidURL = true;

                            // hide source URL adder elems--only display when source URL add mode is toggled on
                            sourceTitleInput.style.display = "none";
                            sourceUrlInput.style.display = "none";
                            sourceTitleLabel.style.display = "none";
                            sourceUrlLabel.style.display = "none";
                            sourceCancel.style.display = "none";
                            sourceSave.style.display = "none";

                            // edit innerHTML
                            sourceTitleLabel.innerHTML = "Title: ";
                            sourceUrlLabel.innerHTML = "URL: ";
                            sourceCancel.innerHTML = "Cancel";
                            sourceSave.innerHTML = "Save";

                            // update DOM tree
                            sourceUrlAdder.appendChild(sourceTitleLabel);
                            sourceUrlAdder.appendChild(sourceTitleInput);
                            sourceUrlAdder.appendChild(sourceUrlLabel);
                            sourceUrlAdder.appendChild(sourceUrlInput);
                            sourceUrlAdder.appendChild(sourceCancel);
                            sourceUrlAdder.appendChild(sourceSave);

                            // set attributes
                            sourceTitleInput.setAttribute("id", "sourceUrlAdder-title");
                            sourceTitleInput.setAttribute("type", "text");
                            sourceUrlInput.setAttribute("id", "sourceUrlAdder-url");
                            sourceUrlInput.setAttribute("type", "url");
                            sourceTitleLabel.setAttribute("for", "sourceUrlAdder-title");
                            sourceUrlLabel.setAttribute("for", "sourceUrlAdder-url");

                            // set classes
                            sourceTitleInput.classList.add("input");
                            sourceUrlInput.classList.add("input");
                            sourceUrlInput.classList.add("url-input");

                            // check for valid URL input--disable save button if invalid
                            sourceUrlInput.addEventListener("keyup", () => {
                                sourceUrlInput.value = sourceUrlInput.value.trim();
                                sourceIsValidURL = sourceUrlInput.checkValidity();
                                sourceSave.disabled = (sourceIsValidURL) ? false : true;
                            });

                            // cancel pending changes and exit URL add mode by clicking 'Cancel' button
                            sourceCancel.addEventListener("click", (event) => {
                                // hide source URL adder elems
                                sourceTitleInput.style.display = "none";
                                sourceUrlInput.style.display = "none";
                                sourceTitleLabel.style.display = "none";
                                sourceUrlLabel.style.display = "none";
                                sourceCancel.style.display = "none";
                                sourceSave.style.display = "none";

                                // reset source URL adder label
                                sourceUrlAdderLabel.style.display = "";

                                // turn off source URL add mode
                                sourceUrlAddMode = false;

                                // prevent click event from firing on parent div 'sourceUrlAdder'
                                event.stopPropagation();
                            });

                            // save changes and exit URL add mode by clicking 'Save' button
                            sourceSave.addEventListener("click", () => {
                                addEntries(entry.text, sourceUrlInput.value, "sourceUrls", null);
                            });

                            // save changes and exit URL add mode with 'Enter' if URL is valid
                            sourceTitleInput.addEventListener("keydown", (event) => {
                                if (event.code === "Enter" && sourceIsValidURL) {
                                    addEntries(entry.text, sourceUrlInput.value, "sourceUrls", null);
                                }
                            });
                            sourceUrlInput.addEventListener("keydown", (event) => {
                                if (event.code === "Enter" && sourceIsValidURL) {
                                    addEntries(entry.text, sourceUrlInput.value, "sourceUrls", null);
                                }
                            });

                            sourceUrlAdder.addEventListener("click", () => {
                                // if not in source URL add mode, enter it
                                if (!sourceUrlAddMode) {
                                    // hide source URL adder label
                                    sourceUrlAdderLabel.style.display = "none";

                                    // reveal source URL adder elems
                                    sourceTitleInput.style.display = "";
                                    sourceUrlInput.style.display = "";
                                    sourceTitleLabel.style.display = "";
                                    sourceUrlLabel.style.display = "";
                                    sourceCancel.style.display = "";
                                    sourceSave.style.display = "";

                                    // turn on source URL add mode
                                    sourceUrlAddMode = true;
                                }
                            });

                            // insert reference URLs
                            let refUrls = document.createElement("div");
                            refUrls.innerHTML = "Reference:";
                            dropdown.appendChild(refUrls);
                            for (let j = 0; j < entry.refUrls.length; j++) {
                                let refUrl = entry.refUrls[j];
                                let subtractClicked = {clicked: false};
                                subtractClickedObjects.push(subtractClicked);

                                /* init a div-span set for given URL;
                                urlBox is the parent div for each entry */
                                let urlBox = document.createElement("div");
                                let iconDiv = document.createElement("div");
                                let textDiv = document.createElement("div");
                                let buttonDiv = document.createElement("div");

                                // add classes
                                urlBox.classList.add("entryContainer");
                                urlBox.classList.add("url-box");
                                iconDiv.classList.add("icon-div");
                                textDiv.classList.add("text-div");
                                buttonDiv.classList.add("button-div");

                                // create icon and set properties
                                let icon = document.createElement("img");
                                icon.classList.add("icon");
                                icon.setAttribute("src", refUrl.icon);

                                // create subtract button and set properties
                                let subtractButton = document.createElement("img");
                                subtractButton.classList.add("icon");
                                subtractButton.setAttribute("src", "images/subtract-icon.svg");
                                subtractButton.style.display = "none";
                                subtractButtons.push(subtractButton);

                                // set label properties
                                textDiv.setAttribute("contenteditable", false);
                                textDiv.setAttribute("data-url", refUrl.url);
                                textDiv.innerText = refUrl.title;
                                textDivs.push({
                                    textDiv: textDiv,
                                    array: "refUrls"
                                });

                                // update DOM
                                urlBox.appendChild(iconDiv);
                                urlBox.appendChild(textDiv);
                                urlBox.appendChild(buttonDiv);
                                iconDiv.appendChild(icon);
                                buttonDiv.appendChild(subtractButton);
                                refUrls.appendChild(urlBox);

                                // click handlers: tell background script to open hyperlink
                                iconDiv.addEventListener("click", () => {
                                    // only open URL if not in URL edit mode
                                    if (!editMode) {
                                        chrome.runtime.sendMessage({
                                            msg: "new tab",
                                            url: refUrl.url
                                        });
                                    }
                                });
                                textDiv.addEventListener("click", () => {
                                    // only open URL if not in URL edit mode
                                    if (!editMode) {
                                        chrome.runtime.sendMessage({
                                            msg: "new tab",
                                            url: refUrl.url
                                        });
                                    }
                                });

                                // package URL-specific variables into object
                                urlObjs.push({
                                    subtractButton: subtractButton,
                                    subtractClicked: subtractClicked,
                                    urlBox: urlBox,
                                    url: refUrl,
                                    array: "refUrls"
                                });
                            }

                            // insert reference URL adder
                            let refUrlAdder = document.createElement("div");
                            let refUrlAdderLabel = document.createElement("span");

                            // add 'refUrlAdder' properties
                            refUrlAdder.classList.add("container");
                            refUrlAdder.classList.add("adder");
                            refUrlAdder.style.display = "none";

                            // set reference URL adder label
                            refUrlAdderLabel.innerHTML = "+ Add reference URL...";

                            // update DOM
                            refUrls.appendChild(refUrlAdder);
                            refUrlAdder.appendChild(refUrlAdderLabel);

                            // create reference URL adder elements
                            // create inputs, labels, and buttons
                            let refTitleInput = document.createElement("input");
                            let refUrlInput = document.createElement("input");
                            let refTitleLabel = document.createElement("label");
                            let refUrlLabel = document.createElement("label");
                            let refCancel = document.createElement("button");
                            let refSave = document.createElement("button");
                            let refIsValidURL = true;

                            // hide reference URL adder elems--only display when reference URL add mode is toggled on
                            refTitleInput.style.display = "none";
                            refUrlInput.style.display = "none";
                            refTitleLabel.style.display = "none";
                            refUrlLabel.style.display = "none";
                            refCancel.style.display = "none";
                            refSave.style.display = "none";

                            // edit innerHTML
                            refTitleLabel.innerHTML = "Title: ";
                            refUrlLabel.innerHTML = "URL: ";
                            refCancel.innerHTML = "Cancel";
                            refSave.innerHTML = "Save";

                            // update DOM tree
                            refUrlAdder.appendChild(refTitleLabel);
                            refUrlAdder.appendChild(refTitleInput);
                            refUrlAdder.appendChild(refUrlLabel);
                            refUrlAdder.appendChild(refUrlInput);
                            refUrlAdder.appendChild(refCancel);
                            refUrlAdder.appendChild(refSave);

                            // set attributes
                            refTitleInput.setAttribute("id", "refUrlAdder-title");
                            refTitleInput.setAttribute("type", "text");
                            refUrlInput.setAttribute("id", "refUrlAdder-url");
                            refUrlInput.setAttribute("type", "url");
                            refTitleLabel.setAttribute("for", "refUrlAdder-title");
                            refUrlLabel.setAttribute("for", "refUrlAdder-url");

                            // set classes
                            refTitleInput.classList.add("input");
                            refUrlInput.classList.add("input");
                            refUrlInput.classList.add("url-input");

                            // check for valid URL input--disable save button if invalid
                            refUrlInput.addEventListener("keyup", () => {
                                refUrlInput.value = refUrlInput.value.trim();
                                refIsValidURL = refUrlInput.checkValidity();
                                refSave.disabled = (refIsValidURL) ? false : true;
                            });

                            // cancel pending changes and exit URL add mode by clicking 'Cancel' button
                            refCancel.addEventListener("click", (event) => {
                                // hide reference URL adder elems
                                refTitleInput.style.display = "none";
                                refUrlInput.style.display = "none";
                                refTitleLabel.style.display = "none";
                                refUrlLabel.style.display = "none";
                                refCancel.style.display = "none";
                                refSave.style.display = "none";

                                // reset reference URL adder label
                                refUrlAdderLabel.style.display = "";

                                // turn off reference URL add mode
                                refUrlAddMode = false;

                                // prevent click event from firing on parent div 'refUrlAdder'
                                event.stopPropagation();
                            });

                            // save changes and exit URL add mode by clicking 'Save' button
                            refSave.addEventListener("click", () => {
                                addEntries(entry.text, refUrlInput.value, "refUrls", null);
                            });

                            // save changes and exit URL add mode with 'Enter' if URL is valid
                            refTitleInput.addEventListener("keydown", (event) => {
                                if (event.code === "Enter" && refIsValidURL) {
                                    addEntries(entry.text, refUrlInput.value, "refUrls", null);
                                }
                            });
                            refUrlInput.addEventListener("keydown", (event) => {
                                if (event.code === "Enter" && refIsValidURL) {
                                    addEntries(entry.text, refUrlInput.value, "refUrls", null);
                                }
                            });

                            refUrlAdder.addEventListener("click", () => {
                                // if not in reference URL add mode, enter it
                                if (!refUrlAddMode) {
                                    // hide reference URL adder label
                                    refUrlAdderLabel.style.display = "none";

                                    // reveal reference URL adder elems
                                    refTitleInput.style.display = "";
                                    refUrlInput.style.display = "";
                                    refTitleLabel.style.display = "";
                                    refUrlLabel.style.display = "";
                                    refCancel.style.display = "";
                                    refSave.style.display = "";

                                    // turn on reference URL add mode
                                    refUrlAddMode = true;
                                }
                            });

                            // insert notes
                            let notes = document.createElement("div");
                            let notesBox = document.createElement("div");

                            notes.innerHTML = "Notes:";
                            entry.notes = entry.notes.trim();
                            notesBox.innerHTML = (entry.notes === "") ? "Write notes..." : entry.notes;

                            notesBox.setAttribute("contenteditable", true);
                            notesBox.setAttribute("id", "notesBox");

                            dropdown.appendChild(notes);
                            notes.appendChild(notesBox);

                            notesBox.addEventListener("keyup", () => {
                                entry.notes = notesBox.innerText;
                                chrome.storage.sync.set({"wordBank": data.wordBank});
                            });

                            // add subtract button click handlers--verify on first click, delete on second click
                            urlObjs.forEach((urlObj) => {
                                urlObj.subtractButton.addEventListener("click", function () {
                                    subtractButtonCallback(urlObj.subtractButton, urlObj.subtractClicked, urlObj.urlBox, urlObj.url, urlObj.array);
                                });
                            });

                            // toggle edit mode on 'editIcon' click
                            editIcon.addEventListener("click", () => {
                                if (!editMode) {
                                    editIcon.setAttribute("src", "images/save-icon.svg");
                                    sourceUrlAdder.style.display = "";
                                    refUrlAdder.style.display = "";

                                    subtractButtons.forEach((subtractButton) => {
                                        subtractButton.style.display = "";
                                    });

                                    textDivs.forEach((textDiv) => {
                                        textDiv.textDiv.setAttribute("contenteditable", "true");
                                        textDiv.textDiv.addEventListener("keyup", () => {
                                            let originalUrl = textDiv.textDiv.getAttribute("data-url");
                                            let updateIndex = entry[textDiv.array].findIndex((element) => {
                                                return (element.url === originalUrl) ? true : false;
                                            });
                                            entry[textDiv.array][updateIndex].title = textDiv.textDiv.innerText;
                                            entry[textDiv.array][updateIndex].fetched = true;
                                            chrome.storage.sync.set({"wordBank": data.wordBank});
                                        });
                                        textDiv.textDiv.addEventListener("keydown", (event) => {
                                            if (event.code === "Enter") {
                                                event.preventDefault();
                                                document.activeElement.blur();
                                            }
                                        });

                                        // hide subtract button while editing title
                                        textDiv.textDiv.addEventListener("focus", () => {
                                            textDiv.textDiv.nextSibling.style.display = "none";
                                        });
                                        textDiv.textDiv.addEventListener("blur", () => {
                                            textDiv.textDiv.nextSibling.style.display = "";
                                        });
                                    });
                                } else {
                                    editIcon.setAttribute("src", "images/edit-icon.svg");
                                    sourceUrlAdder.style.display = "none";
                                    refUrlAdder.style.display = "none";

                                    subtractButtons.forEach((subtractButton) => {
                                        subtractButton.style.display = "none";
                                        subtractButton.setAttribute("src", "images/subtract-icon.svg");
                                        subtractButton.classList.remove("delete-icon");
                                    });
                                    subtractClickedObjects.forEach((subtractClicked) => {
                                        subtractClicked.clicked = false;
                                    });

                                    // remove subtract button event listeners
                                    urlObjs.forEach((urlObj) => {
                                        urlObj.subtractButton.removeEventListener("click", function () {
                                            subtractButtonCallback(urlObj.subtractButton, urlObj.subtractClicked, urlObj.urlBox, urlObj.url, urlObj.array);
                                        });
                                    });

                                    // clear delete button timeouts
                                    timeoutIDs.forEach((timeoutID) => {
                                        clearTimeout(timeoutID);
                                    });
                                    timeoutIDs = [];
                                }

                                editMode = !editMode;
                            });
                            // if on, turn URL mode off and remove dropdown
                        } else {
                            document.getElementsByClassName("dropdown")[0].remove();
                            entryContainer.classList.remove("url-mode-on");
                        }
                    }
                });
            }
        }

        // create add mode elements
        // create inputs, labels, and button
        let wordInput = document.createElement("input");
        let urlInput = document.createElement("input");
        let wordLabel = document.createElement("label");
        let urlLabel = document.createElement("label");
        let cancel = document.createElement("button");
        let save = document.createElement("button");
        let isValidURL = true;

        // hide word adder elems--only display when word add mode is toggled on
        wordInput.style.display = "none";
        urlInput.style.display = "none";
        wordLabel.style.display = "none";
        urlLabel.style.display = "none";
        cancel.style.display = "none";
        save.style.display = "none";

        // edit innerHTML
        wordLabel.innerHTML = "Word: ";
        urlLabel.innerHTML = "URL: ";
        cancel.innerHTML = "Cancel";
        save.innerHTML = "Save";

        // update DOM tree
        wordAdder.appendChild(wordLabel);
        wordAdder.appendChild(wordInput);
        wordAdder.appendChild(urlLabel);
        wordAdder.appendChild(urlInput);
        wordAdder.appendChild(cancel);
        wordAdder.appendChild(save);

        // set attributes
        wordInput.setAttribute("id", "wordAdder-word");
        wordInput.setAttribute("type", "text");
        urlInput.setAttribute("id", "wordAdder-url");
        urlInput.setAttribute("type", "url");
        wordLabel.setAttribute("for", "wordAdder-word");
        urlLabel.setAttribute("for", "wordAdder-url");

        // set classes
        wordInput.classList.add("input");
        urlInput.classList.add("input");
        urlInput.classList.add("url-input");

        // check for valid URL input--disable save button if invalid
        urlInput.addEventListener("keyup", () => {
            urlInput.value = urlInput.value.trim();
            isValidURL = urlInput.checkValidity();
            save.disabled = (isValidURL) ? false : true;
        });

        cancel.addEventListener("click", (event) => {
            // hide word adder elems
            wordInput.style.display = "none";
            urlInput.style.display = "none";
            wordLabel.style.display = "none";
            urlLabel.style.display = "none";
            cancel.style.display = "none";
            save.style.display = "none";

            // reset word adder label
            wordAdderLabel.style.display = "";

            // turn off add mode
            addMode = false;

            // prevent click event from firing on parent div 'wordAdder'
            event.stopPropagation();
        });

        // save changes and exit add mode by clicking 'Save' button
        save.addEventListener("click", (event) => {
            addEntries(wordInput.value, urlInput.value, "sourceUrls", event);
        });

        // save changes and exit add mode with 'Enter' if URL is valid
        wordInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && isValidURL) {
                addEntries(wordInput.value, urlInput.value, "sourceUrls", null);
            }
        });
        urlInput.addEventListener("keydown", (event) => {
            if (event.code === "Enter" && isValidURL) {
                addEntries(wordInput.value, urlInput.value, "sourceUrls", null);
            }
        });

        wordAdder.addEventListener("click", () => {
            // if not in add mode, enter it
            if (!addMode) {
                // hide word adder label
                wordAdderLabel.style.display = "none";

                // reveal word adder elems
                wordInput.style.display = "";
                urlInput.style.display = "";
                wordLabel.style.display = "";
                urlLabel.style.display = "";
                cancel.style.display = "";
                save.style.display = "";

                // turn on word add mode
                addMode = true;
            }
        });
    });
}

function clearAllEntries() {
    document.querySelectorAll(".entry-container").forEach(e => e.remove());
    document.querySelectorAll(".dropdown").forEach(e => e.remove());
}

// switch to options page
options.addEventListener("click", () => {
    window.location.href = "options-popup.html";
});