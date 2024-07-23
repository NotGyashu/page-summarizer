
# Chrome Extension for Text Summarization

This Chrome extension uses Cohere AI to summarize text from web pages. It divides the text into manageable chunks, sends them for summarization, and displays the summarized text in the UI.

## Features

- Extracts text from the current webpage.
- Summarizes the text using Cohere AI.
- Handles large texts by dividing them into chunks.
- Displays the summarized text in real-time.

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/chrome-text-summarizer.git
   cd chrome-text-summarizer
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Build the project:**

   ```bash
   npm run build
   ```

4. **Load the extension in Chrome:**

   - Open Chrome and go to `chrome://extensions/`.
   - Enable "Developer mode" by clicking the toggle switch in the top right corner.
   - Click the "Load unpacked" button and select the `build` directory.

## Usage

1. **Activate the extension:**

   - Click on the extension icon in the Chrome toolbar.
   - Click on the "Summarize" button to start the summarization process.
   - The summarized text will be displayed in the extension popup.

## Configuration

- Ensure you have a valid Cohere AI API key.
- The API key should be added to the `utility/setapi.js` file.
    ```js
     const codeKey = "YOUR_COHERE_AI_KEY"
    ```

## Contributing

1. **Fork the repository.**
2. **Create a new branch:**
   ```bash
   git checkout -b feature-branch
   ```
3. **Make your changes and commit them:**
   ```bash
   git commit -m 'Add some feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature-branch
   ```
5. **Submit a pull request.**


