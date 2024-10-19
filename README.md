# I-Hack 2024 Project

A hackathon project by Matthew Hepworth and James Chase.

## Overview

This project consists of two main components:
1. **Chrome Extension**: Enhances the user experience during the I-Hack 2024 event by providing various features and functionalities.
2. **API Server**: Supports the functionality of the Chrome Extension by providing various endpoints to interact with the extension and manage its features.

## Chrome Extension

The Chrome Extension is designed to identify truths within articles that are from sources known to contain bias of any kind. The idea is that it can objectively present the facts from interpretation.

### Installation

To install the Chrome Extension locally, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ihack2024.git
    ```
2. Navigate to the extension directory:
    ```sh
    cd ihack2024/extension
    ```
3. Open Chrome and navigate to `chrome://extensions/`.
4. Enable "Developer mode" by clicking the toggle switch in the top right corner.
5. Click the "Load unpacked" button and select the `extension` directory.

### Usage

Once the extension is installed, you can access its features directly from the Chrome toolbar.

## API Server

The API Server is designed to support the functionality of the Chrome Extension. It provides various endpoints to interact with the extension and manage its features.

### Installation

To install and run the API server locally, follow these steps:

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/ihack2024.git
    ```
2. Navigate to the API directory:
    ```sh
    cd ihack2024/api
    ```
3. Install dependencies:
    ```sh
    npm install
    ```
4. Start the server:
    ```sh
    node app.js
    ```

### Usage

Once the server is running, you can access the API at `http://localhost:5000`.

## License

This project is licensed under the MIT License.