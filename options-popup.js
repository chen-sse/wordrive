const SWEETALERT_WIDTH = "300px";
const SWEETALERT_HEIGHT = "450px";

let activeTabCheckbox = document.getElementById("activeTabCheckbox");
let lowercaseCheckbox = document.getElementById("lowercaseCheckbox");
let home = document.getElementById("home");
let clearAll = document.getElementById("clearAll");
let exportButton = document.getElementById("exportButton")

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
    homeHover.style.visibility = "visible"
    homeDiv.classList.add("footerButtonHover");
});
homeDiv.addEventListener("mouseout", () => {
    homeHover.style.visibility = "hidden"
    homeDiv.classList.remove("footerButtonHover");
});

/* make hover image and grab cursor appear when cursor
hovers over options button, remove it when cursor leaves
 */
let optionsDiv = document.getElementById("options")
optionsDiv.addEventListener("mouseover", () => {
    optionsHover.style.visibility = "visible"
    optionsDiv.classList.add("footerButtonHover");
});
optionsDiv.addEventListener("mouseout", () => {
    optionsHover.style.visibility = "hidden"
    optionsDiv.classList.remove("footerButtonHover");
});

function exportData() {
    chrome.storage.sync.get("wordBank", ({wordBank}) => {
        let builder = "Your Wordrive: \n\n";
        for (let i = 0; i < wordBank.length; i++) {
            // concatenate builder string
            let word = wordBank[i].text;
            let theUrl = wordBank[i].url;
            builder = builder + `WORD ${i + 1}: ${word} | URL: ${theUrl}` + "\n\n";
        }
        // instantiate blob w/ word bank and create url for it
        let listBlob = new Blob([builder], {type: "text/plain"});
        let fileUrl = URL.createObjectURL(listBlob);

        // send message to service worker to download file
        chrome.runtime.sendMessage({
            msg: "download",
            url: fileUrl
        });
    })
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

// restore saved user preferences
function restoreOptions() {
    chrome.storage.sync.get({
        // default values
        "activeTabChecked": false,
        "lowercaseChecked": true
    }, (options) => {
        activeTabCheckbox.checked = options.activeTabChecked;
        lowercaseCheckbox.checked = options.lowercaseChecked;
    });
}

document.addEventListener("DOMContentLoaded", restoreOptions);

clearAll.addEventListener("click", () => {
    document.documentElement.style.width = SWEETALERT_WIDTH;
    document.documentElement.style.height = SWEETALERT_HEIGHT;
    fireAlert();
});
exportButton.addEventListener("click", exportData);
home.addEventListener("click", () => {
    window.location.href = "popup.html";
});

// auto-save: update preferences on any checkbox click
activeTabCheckbox.addEventListener("click", () => {
    let activeTabChecked = activeTabCheckbox.checked;
    chrome.storage.sync.set({"activeTabChecked": activeTabChecked});
});
lowercaseCheckbox.addEventListener("click", () => {
    let lowercaseChecked = lowercaseCheckbox.checked;
    chrome.storage.sync.set({"lowercaseChecked": lowercaseChecked})
});