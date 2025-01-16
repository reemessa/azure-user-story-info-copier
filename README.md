# Azure DevOps Story Extractor

A Chrome extension that extracts user story numbers and titles from Azure DevOps work items. The extension copies the story information to your clipboard in a formatted string: `[Story Number] - [Story Title]`.

## Features

- Quick extraction of story number and title from Azure DevOps work items
- One-click copy to clipboard
- Works with Visual Studio Team Services (visualstudio.com) URLs
- Real-time status updates
- Error handling with clear messages

## Installation

### From Source
1. Clone this repository
```bash
git clone [your-repo-url]
cd azure-devops-story-extractor
```

2. Open Chrome and navigate to chrome://extensions/

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked"

5. Select the directory containing the extension files

### Project Structure
```
azure-devops-story-extractor/
├── manifest.json        # Extension configuration
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── content.js          # Content script for extracting story info
├── images/             # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── README.md
```

## Usage

1. Navigate to an Azure DevOps work item page (URL pattern: `*.visualstudio.com/*/_workitems/edit/*`)

2. Click the extension icon in your Chrome toolbar

3. Click the "Extract Story Info" button

4. The story number and title will be automatically copied to your clipboard in the format:
   ```
   [Story Number] : [Story Title]
   ```

5. If there's an error, the extension will display a helpful message explaining what went wrong

## Development

### Prerequisites
- Google Chrome
- Basic understanding of Chrome Extension development
- Text editor or IDE

### Making Changes
1. Make your desired changes to the code
2. Go to chrome://extensions/
3. Click the refresh icon on your extension
4. Test the changes on an Azure DevOps work item page

## Permissions

This extension requires the following permissions:
- `activeTab`: To access the current tab's content
- `scripting`: To inject content scripts
- `clipboardWrite`: To copy extracted information to clipboard
- Host permissions for `*.visualstudio.com`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

[Your chosen license]

## Support

For issues, questions, or contributions, please open an issue in the GitHub repository.

## Disclaimer

This extension is not affiliated with, endorsed by, or connected to Microsoft, Azure DevOps, or Visual Studio Team Services. All product names, logos, and brands are property of their respective owners.
