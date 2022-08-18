// fetch date from local machine
function getDate() {
    const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    return new Date().toLocaleDateString("en-US", dateOptions);
}

// fetch time from local machine
function getTime() {
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short"
    };
    let time = new Date().toLocaleTimeString("en-US", timeOptions).replace("AM", "am").replace("PM", "pm");
    const timeTokens = time.split(" ");
    return `${timeTokens[0]}${timeTokens[1]} ${timeTokens[2]}`;
}

// generate the Merriam-Webster dictionary URL of a given term
function getDictionaryURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct dictionary URL
    let dictionaryUrl = "https://www.merriam-webster.com/dictionary/";
    for (let j = 0; j < searchTokens.length; j++) {
        dictionaryUrl += searchTokens[j];
        dictionaryUrl += "%20";
    }
    return dictionaryUrl;
}

function getFaviconURL(url) {
    return "https://www.google.com/s2/favicons?sz=32&domain_url=" + url;
}

export { getDate, getTime, getDictionaryURL, getFaviconURL };