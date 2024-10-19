// HTML content as a template string
const bubbleHTML = `
<div id="bubble-container">
    <img src="${chrome.runtime.getURL('assets/img/icon-transparent-square.png')}" />
    <div id="close-button">&times;</div>
    <div id="bubble-content">
        <h1>Truthy found these facts:</h1>
        <ol id="facts-list">
            <!-- Facts will be inserted here -->
        </ol>
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
    width: 400px; /* Adjust the width as needed */
    height: 200px; /* Adjust the height as needed */
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

#bubble-container #bubble-content ol {
    list-style-type: decimal;
    margin-left: 20px;
    margin-top: 3px;
    font-size: 1.2rem;
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
            //fetchFacts();
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
function getCurrentPageUrl() {
    const url = new URL(window.location.href);
    return url.hostname + url.pathname;
}

// Function to check if the extension is enabled for the current page
function checkExtensionEnabled(callback) {
    const pageUrl = getCurrentPageUrl();
    chrome.storage.local.get([pageUrl], (data) => {
        callback(data[pageUrl] || false);
    });
}

// Function to fetch facts from the API
function fetchFacts() {
    const factsList = document.getElementById('facts-list');
    factsList.innerHTML = '<li>Loading...</li>'; // Show loading message

    fetch('https://api.example.com/facts') // Replace with your API endpoint
        .then(response => response.json())
        .then(data => {
            factsList.innerHTML = ''; // Clear loading message
            data.facts.forEach(fact => {
                const listItem = document.createElement('li');
                listItem.textContent = fact;
                factsList.appendChild(listItem);
            });
        })
        .catch(error => {
            factsList.innerHTML = '<li>Error loading facts</li>';
            console.error('Error fetching facts:', error);
        });
}

// Inject the bubble HTML content and CSS styles if the extension is enabled
checkExtensionEnabled((isEnabled) => {
    if (isEnabled) {
        injectHTMLContent(bubbleHTML, bubbleCSS);
        addEventListeners();
    }
});