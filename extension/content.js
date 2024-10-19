// HTML content as a template string
const bubbleHTML = `
<div id="bubble-container">
    <img src="${chrome.runtime.getURL('assets/img/icon-transparent-square.png')}" />
    <div id="close-button">&times;</div>
    <div id="bubble-content" style="height: 115px">
        <h1>Truthy found these facts:</h1>
        <ul id="facts-list">
            <!-- Facts will be inserted here -->
        </ul>
        <p>Click to hide</p>
    </div>
</div>
`;

// CSS styles as a template string
const bubbleCSS = `
@import url("https://fonts.googleapis.com/css2?family=Archivo+Black&family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap");

#bubble-container {
    position: fixed;
    bottom: 20px;
    right: 0px;
    width: 60px;
    height: 45px;
    cursor: pointer;
    z-index: 1000;
    background-color: rgba(0, 0, 0, 0.5);
    border-top-left-radius: 20px;
    border-bottom-left-radius: 20px;
    font-family: 'Poppins', sans-serif !important; 
    transition: width 0.3s, height 0.3s; /* Add transition for smooth expansion */
}

#bubble-container.expanded {
    width: 500px; /* Adjust the width as needed */
    height: 300px; /* Adjust the height as needed */
    background-color: rgba(0, 0, 0, 0.5);
}

#bubble-container #bubble-content {
    display: none;
}

#bubble-container.expanded #bubble-content {
    display: block;
    color: #fff;
    padding: 10px;
}

#bubble-container #bubble-content h1 {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #fff;
    text-align: center;
}

#bubble-container #bubble-content ul {
    list-style-type: decimal;
    margin-left: 20px;
    margin-top: 3px;
    font-size: 1rem;
}

#bubble-container #bubble-content p {
    font-size: 0.8rem;
    position: absolute;
    bottom: 10px;
    width: 100%;
    text-align: center;
    color: #fff;
}

#bubble-container img {
    width: 45px;
    height: 45px;
    margin-right: 10px;
    margin-left: 7.5px;
    padding: 5px;
}

#close-button {
    position: absolute;
    top: -5px;
    left: -5px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: rgba(255, 0, 0, 0.75);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 16px;
}
`;

// Function to inject HTML content
function injectHTMLContent(htmlContent, cssContent) {
    const style = document.createElement('style');
    style.textContent = cssContent;
    document.head.appendChild(style);

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    document.body.appendChild(tempDiv.firstElementChild);
}

// Function to add event listeners
function addEventListeners() {
    // Add click event to the bubble container
    const bubbleContainer = document.getElementById('bubble-container');
    bubbleContainer.addEventListener('click', () => {
        bubbleContainer.classList.toggle('expanded');
        const bubbleImage = bubbleContainer.querySelector('img');
        bubbleImage.style.display = bubbleContainer.classList.contains('expanded') ? 'none' : 'block';

        if (bubbleContainer.classList.contains('expanded')) {
            fetchFacts();
        }
    });

    // Add click event to the close button to hide the bubble
    const closeButton = document.getElementById('close-button');
    closeButton.addEventListener('click', (e) => {
        e.stopPropagation();
        bubbleContainer.style.display = 'none';
    });
}

// Function to get the current page URL
function getCurrentPageHostname() {
    const url = new URL(window.location.href);
    return url.hostname;
}

// Function to check if the extension is enabled for the current page
function checkExtensionEnabled(callback) {
    const hostname = getCurrentPageHostname();
    chrome.storage.local.get([hostname], (data) => {
        callback(data[hostname] || false);
    });
}

// Function to extract text content from specific HTML elements
function extractTextContent() {
    // Specify the elements to extract text from within the body tag
    const body = document.querySelector('body');
    const elements = body.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li');

    // Collect text content from the specified elements
    let textContent = '';
    elements.forEach(element => {
        textContent += element.textContent.trim() + ' ';
    });

    // Remove any remaining HTML tags using a regular expression
    textContent = textContent.replace(/<[^>]*>/g, '');

    // Return the collected text content as a single string
    return textContent.trim();
}
// Function to fetch facts from the API via background.js
function fetchFacts() {
    const factsList = document.getElementById('facts-list');
    factsList.innerHTML = '<li>Loading...</li>'; // Show loading message

    const currentUrl = window.location.href;
    const filteredPageContent = extractTextContent();

    chrome.runtime.sendMessage({ action: 'fetchFacts', url: currentUrl, text: filteredPageContent }, (response) => {
        if (chrome.runtime.lastError) {
            console.error('Error sending message:', chrome.runtime.lastError);
            factsList.innerHTML = '<li>Error loading facts</li>';
            return;
        }
        
        if (response.success) {
            let facts = response.data.response;
            let factItems = facts.split(/[•*]/).map(fact => fact.trim()).filter(fact => fact);
            factItems.shift();

            factsList.innerHTML = ''; // Clear loading message
            let itemCount = 0;
            factItems.forEach(fact => {
                const listItem = document.createElement('li');
                itemCount++;
                listItem.textContent = `${itemCount}. ${fact}`;
                factsList.appendChild(listItem);
            });

            // Set the height and make the list scrollable
            factsList.style.height = '200px';
            factsList.style.overflowY = 'auto';
        } else {
            factsList.innerHTML = '<li>Error loading facts</li>';
            console.error('Error fetching facts:', response.error);
        }
    });
};

// Inject the bubble HTML content and CSS styles if the extension is enabled
checkExtensionEnabled((isEnabled) => {
    if (isEnabled) {
        injectHTMLContent(bubbleHTML, bubbleCSS);
        addEventListeners();
    }
});