// Handle Main Info extraction
document.getElementById('extractStory').addEventListener('click', async () => {
  await extractStoryInfo(false);
});

// Handle Full Info extraction
document.getElementById('extractFullStory').addEventListener('click', async () => {
  await extractStoryInfo(true);
});

async function extractStoryInfo(fullInfo) {
  const statusEl = document.getElementById('status');
  statusEl.textContent = fullInfo ? 'Extracting full story information...' : 'Extracting story information...';

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab.url.includes('visualstudio.com')) {
      statusEl.textContent = 'Please navigate to an Azure DevOps work item page';
      return;
    }

    const action = fullInfo ? "extractFullStory" : "extractStory";
    const response = await chrome.tabs.sendMessage(tab.id, { action });

    if (response.success) {
      await navigator.clipboard.writeText(response.data);

      // Handle screenshot downloads if in full info mode
      if (fullInfo && response.screenshots && response.screenshots.length > 0) {
        statusEl.textContent = `Downloading ${response.screenshots.length} screenshot(s)...`;
        await downloadScreenshots(response.screenshots, response.storyNumber);
        statusEl.textContent = `Copied to clipboard! Downloaded ${response.screenshots.length} screenshot(s)`;
      } else if (fullInfo) {
        statusEl.textContent = `Copied to clipboard! No screenshots found.`;
      } else {
        statusEl.textContent = `Copied to clipboard!`;
      }
    } else {
      statusEl.textContent = `Error: ${response.error || 'Could not find story information'}`;
    }
  } catch (error) {
    console.error('Extension error:', error);
    statusEl.textContent = 'Error: Please refresh the page and try again';
  }
}

async function downloadScreenshots(screenshots, storyNumber) {
  const timestamp = Date.now();

  for (let i = 0; i < screenshots.length; i++) {
    const url = screenshots[i];
    const filename = `story-${storyNumber}-screenshot-${i + 1}-${timestamp}.png`;

    try {
      await chrome.downloads.download({
        url: url,
        filename: `Pictures/Screenshots/${filename}`,
        saveAs: false
      });
    } catch (error) {
      console.error(`Failed to download screenshot ${i + 1}:`, error);
    }
  }
}
