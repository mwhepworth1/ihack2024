function resizeTextarea() {
    const textarea = document.getElementById('custom-instructions');
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
}

function getCurrentPageUrl(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const url = new URL(tabs[0].url);
        callback(url.hostname + url.pathname);
    });
}

document.getElementById('custom-instructions').addEventListener('input', () => {
    const instructions = document.getElementById('custom-instructions').value;
    chrome.storage.local.set({ instructions });
});

document.getElementById('toggle-page').addEventListener('change', () => {
    const isEnabled = document.getElementById('toggle-page').checked;
    getCurrentPageUrl((pageUrl) => {
        chrome.storage.local.set({ [pageUrl]: isEnabled });
    });
});

document.addEventListener('DOMContentLoaded', () => {
    getCurrentPageUrl((pageUrl) => {
        chrome.storage.local.get([pageUrl, 'instructions'], (data) => {
            document.getElementById('toggle-page').checked = data[pageUrl] || false;
            document.getElementById('custom-instructions').value = data.instructions || '';
        });
    });

    const textarea = document.getElementById('custom-instructions');
    if (textarea.value) {
        resizeTextarea();
    }
});

document.getElementById('custom-instructions').addEventListener('input', resizeTextarea);