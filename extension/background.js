
// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchFacts') {
        const currentUrl = request.url;

        // Check if the data for the current URL is already stored
        chrome.storage.local.get([currentUrl], (result) => {
            if (result[currentUrl]) {
                // Data is already available, send it back
                sendResponse({ success: true, data: result[currentUrl] });
            } else {
                // Data is not available, make the API call
                fetch('http://localhost:5000/process', { // Replace with your API endpoint
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        custom_instructions: chrome.storage.local.get('instructions').then(p => console.log(p.instructions)),
                        message: `The Electoral College, established in 1787, is an antiquated system that undermines the democratic principle of "one person, one vote." By allocating electoral votes based on state populations and granting all of a state's votes to the candidate who wins its popular vote, this mechanism disproportionately amplifies the influence of smaller states and can result in a candidate winning the presidency without securing the national popular vote . This distortion was evident in the 2000 and 2016 elections, where the Electoral College outcomes contradicted the popular vote. While some argue that the Electoral College prevents "tyranny of the majority," it simultaneously enables a tyranny of the minority, where the will of the people is subverted by a system designed for a different era`
                    })
                })
                    .then(response => response.json())
                    .then(data => {
                        // Store the fetched data
                        chrome.storage.local.set({ [currentUrl]: data }, () => {
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