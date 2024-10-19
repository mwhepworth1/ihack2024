// Function to get the current page hostname
function getCurrentPageHostname(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        callback(url.hostname);
    });
}

// Event listener for the toggle-page checkbox
document.getElementById('toggle-page').addEventListener('change', () => {
    const isEnabled = document.getElementById('toggle-page').checked;
    getCurrentPageHostname((hostname) => {
        chrome.storage.local.set({ [hostname]: isEnabled });
    });
});

// Event listener for the custom-instructions textarea
document.getElementById('custom-instructions').addEventListener('input', () => {
    const instructions = document.getElementById('custom-instructions').value;
    chrome.storage.local.set({ instructions });
});

// Event listener for DOMContentLoaded to load settings
document.addEventListener('DOMContentLoaded', () => {
    getCurrentPageHostname((hostname) => {
        chrome.storage.local.get([hostname, 'instructions'], (data) => {
            document.getElementById('toggle-page').checked = data[hostname] || false;
            document.getElementById('custom-instructions').value = data.instructions || '';
        });
    });

    const textarea = document.getElementById('custom-instructions');
    if (textarea.value) {
        resizeTextarea();
    }
});