const SWEETALERT_HEIGHT = "450px";
const SWEETALERT_WIDTH = "300px";

let activeTabCheckbox = document.getElementById("activeTabCheckbox");
let lowercaseCheckbox = document.getElementById("lowercaseCheckbox");
let clearAll = document.getElementById("clearAll");
let exportButton = document.getElementById("exportButton");
let homeButton = document.getElementById("home-button");
let exportToPDF = document.getElementById("exportToPDF");

// ref URL checkboxes
let cambridgeCheckbox = document.getElementById("cambridge-checkbox");
let collinsCheckbox = document.getElementById("collins-checkbox");
let dictionaryCheckbox = document.getElementById("dictionary-checkbox");
let googleCheckbox = document.getElementById("google-checkbox");
let merriamwebsterCheckbox = document.getElementById("merriamwebster-checkbox");
let onelookCheckbox = document.getElementById("onelook-checkbox");
let oxfordCheckbox = document.getElementById("oxford-checkbox");
let wiktionaryCheckbox = document.getElementById("wiktionary-checkbox");

function exportData() {
    chrome.storage.sync.get("wordBank", ({wordBank}) => {
        let builder = "Your Wordrive: \n\n";
        for (let i = 0; i < wordBank.length; i++) {
            // concatenate builder string
            let word = wordBank[i].text;
            let theUrls = wordBank[i].sourceUrls;

            builder += `WORD ${i + 1}: ${word}\nURLs:\n`;
            for (let j = 0; j < theUrls.length; j++) {
                builder += `${j + 1}) ${theUrls[j].url}\n`;
            }
            builder += "\n";
        }
        // instantiate blob w/ word bank and create url for it
        let listBlob = new Blob([builder], {type: "text/plain"});
        let txtUrl = URL.createObjectURL(listBlob);

        // send message to service worker to download file
        chrome.runtime.sendMessage({
            msg: "export to txt",
            fileUrl: txtUrl,
        });
    });
}

// fire SweetAlert that confirms Wordrive erasure request
async function fireAlert() {
    let firstResponse = await Swal.fire({
        title: "Are you sure you want to clear your Wordrive?",
        text: "You won't be able to undo this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    });
    if (firstResponse.isConfirmed) {
        // clear word bank
        chrome.storage.sync.set({"wordBank": []});

        let secondResponse = await Swal.fire(
            "Deleted!",
            "Your Wordrive has been cleared.",
            "success"
        );
        // reset popup after user response or dismissal
        if (secondResponse.isConfirmed || secondResponse.isDismissed) {
            document.location.reload();
        }
    }
    // reset popup if user cancels
    else if (firstResponse.isDismissed) {
        document.location.reload();
    }
}

exportToPDF.addEventListener("click", () => {
    let pdfExportHandler = document.createElement("script");
    pdfExportHandler.classList.add("pdf-script");
    pdfExportHandler.setAttribute("src", "vendor/pdf-kit/pdf-export-handler.js");
    document.getElementsByTagName("body")[0].appendChild(pdfExportHandler);
    chrome.runtime.sendMessage({
        msg: "export to pdf"
    });
});

// message listener: listens to messages from background script
chrome.runtime.onMessage.addListener((message) => {
    /* pdf download handler: delete all pdf-export-handler scripts from
    options.html */
    if (message.msg === "pdf download done") {
        let scriptArr = document.getElementsByClassName("pdf-script");
        for (let element of scriptArr) {
            element.remove();
        }
    }
    
    return true;
});

// restore saved user preferences
function restoreOptions() {
    chrome.storage.sync.get({
        // default values
        "activeTabChecked": false,
        "lowercaseChecked": true,
        "cambridgeChecked": false,
        "collinsChecked": false,
        "dictionaryChecked": false,
        "googleChecked": false,
        "merriamwebsterChecked": true,
        "onelookChecked": false,
        "oxfordChecked": false,
        "wiktionaryChecked": false
    }, (options) => {
        activeTabCheckbox.checked = options.activeTabChecked;
        lowercaseCheckbox.checked = options.lowercaseChecked;
        cambridgeCheckbox.checked = options.cambridgeChecked;
        collinsCheckbox.checked = options.collinsChecked;
        dictionaryCheckbox.checked = options.dictionaryChecked;
        googleCheckbox.checked = options.googleChecked;
        merriamwebsterCheckbox.checked = options.merriamwebsterChecked;
        onelookCheckbox.checked = options.onelookChecked;
        oxfordCheckbox.checked = options.oxfordChecked;
        wiktionaryCheckbox.checked = options.wiktionaryChecked;
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);

clearAll.addEventListener("click", () => {
    document.documentElement.style.width = SWEETALERT_WIDTH;
    document.documentElement.style.height = SWEETALERT_HEIGHT;
    fireAlert();
});
exportButton.addEventListener("click", exportData);

// auto-save: update preferences on any checkbox click
activeTabCheckbox.addEventListener("click", () => {
    let activeTabChecked = activeTabCheckbox.checked;
    chrome.storage.sync.set({"activeTabChecked": activeTabChecked});
});
lowercaseCheckbox.addEventListener("click", () => {
    let lowercaseChecked = lowercaseCheckbox.checked;
    chrome.storage.sync.set({"lowercaseChecked": lowercaseChecked});
});
cambridgeCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"cambridgeChecked": cambridgeCheckbox.checked});
});
collinsCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"collinsChecked": collinsCheckbox.checked});
});
dictionaryCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"dictionaryChecked": dictionaryCheckbox.checked});
});
googleCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"googleChecked": googleCheckbox.checked});
});
merriamwebsterCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"merriamwebsterChecked": merriamwebsterCheckbox.checked});
});
onelookCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"onelookChecked": onelookCheckbox.checked});
});
oxfordCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"oxfordChecked": oxfordCheckbox.checked});
});
wiktionaryCheckbox.addEventListener("click", () => {
    chrome.storage.sync.set({"wiktionaryChecked": wiktionaryCheckbox.checked});
});

// switch to home page
homeButton.addEventListener("click", () => {
    window.location.href = "home.html";
});

// Helper function
let domReady = (cb) => {
    document.readyState === 'interactive' || document.readyState === 'complete'
        ? cb()
        : document.addEventListener('DOMContentLoaded', cb);
};

domReady(() => {
    // Display body when DOM is loaded
    setTimeout(()=> {
        document.body.style.visibility = 'visible';
    }, 70)
});