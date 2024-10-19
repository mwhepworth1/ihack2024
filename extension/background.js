
// Listen for messages from content scripts
const STORAGE_KEY = 'factsStorage';

// Clear factsStorage on extension launch
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.remove(STORAGE_KEY, () => {
        if (chrome.runtime.lastError) {
            console.error('Error clearing factsStorage on startup:', chrome.runtime.lastError);
        } else {
            console.log('factsStorage cleared on startup');
        }
    });
});

// Also clear factsStorage when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.local.remove(STORAGE_KEY, () => {
        if (chrome.runtime.lastError) {
            console.error('Error clearing factsStorage on install/update:', chrome.runtime.lastError);
        } else {
            console.log('factsStorage cleared on install/update');
        }
    });
});
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchFacts') {
        const currentUrl = request.url;

        // Check if the data for the current URL is already stored
        chrome.storage.local.get([STORAGE_KEY], (result) => {
            const storageData = result[STORAGE_KEY] || {};
            if (storageData[currentUrl]) {
                // Data is already available, send it back
                sendResponse({ success: true, data: storageData[currentUrl] });
            } else {
                // Data is not available, make the API call
                console.warn(chrome.storage.local.get('instructions').then(p => console.log(p.instructions)))
                fetch('http://localhost:5000/process', { // Replace with your API endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        custom_instructions: chrome.storage.local.get('instructions').then(p => console.log(p.instructions)),
                        message: request.text
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        // Store the fetched data
                        storageData[currentUrl] = data;
                        chrome.storage.local.set({ [STORAGE_KEY]: storageData }, () => {
                            sendResponse({ success: true, data: data });
                        });
                    })
                    .catch(error => {
                        console.error('Error fetching facts:', error);
                        sendResponse({ success: false, error: error });
                    });
            }
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});