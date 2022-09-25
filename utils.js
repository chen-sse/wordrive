// get date from date object
function getDate(dateNumber) {
    let dateObj = new Date(dateNumber);
    const dateOptions = {
        year: "numeric",
        month: "long",
        day: "numeric"
    };
    return dateObj.toLocaleDateString("en-US", dateOptions);
}

// get time from date object
function getTime(dateNumber) {
    let dateObj = new Date(dateNumber);
    const timeOptions = {
        hour: "numeric",
        minute: "numeric",
        timeZoneName: "short"
    };
    let time = dateObj.toLocaleTimeString("en-US", timeOptions).replace("AM", "am").replace("PM", "pm");
    const timeTokens = time.split(" ");
    return `${timeTokens[0]}${timeTokens[1]} ${timeTokens[2]}`;
}

// generate the Cambridge dictionary URL of a given term
function getCambridgeURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url = "https://dictionary.cambridge.org/us/dictionary/english/"
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "-";
    }
    return url;
}

// generate the Collins dictionary URL of a given term
function getCollinsURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url = "https://www.collinsdictionary.com/us/dictionary/english/";
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "-";
    }
    return url;
}

// generate the Dictionary.com URL of a given term
function getDictionaryURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url = "https://www.dictionary.com/browse/";
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "%20";
    }
    return url;
}

// generate the Google search URL of a given term
function getGoogleURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url = "https://www.google.com/search?q=";
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "+";
    }
    return url;
}

// generate the Merriam-Webster dictionary URL of a given term
function getMerriamWebsterURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url = "https://www.merriam-webster.com/dictionary/";
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "%20";
    }
    return url;
}

// generate the OneLook URL of a given term
function getOneLookURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url =  "https://onelook.com/?w=";
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "+";
    }
    return url;
}

// generate the Oxford dictionary URL of a given term
function getOxfordURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url =  "https://www.oed.com/search?searchType=dictionary&q=";
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "+";
    }
    return url;
}

// generate the Wiktionary URL of a given term
function getWiktionaryURL(term) {
    // tokenize term (applies to multi-word queries)
    const searchTokens = term.match(/\S+/g);
    // construct URL
    let url = "https://en.wiktionary.org/wiki/"
    for (let j = 0; j < searchTokens.length; j++) {
        url += searchTokens[j];
        url += "_";
    }
    return url;
}

function getFaviconURL(url) {
    return "https://www.google.com/s2/favicons?sz=32&domain_url=" + url;
}

export {
    getDate,
    getTime,
    getFaviconURL,
    getCambridgeURL,
    getCollinsURL,
    getDictionaryURL,
    getGoogleURL,
    getMerriamWebsterURL,
    getOneLookURL,
    getOxfordURL,
    getWiktionaryURL
};