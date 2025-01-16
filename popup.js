document.getElementById('extractStory').addEventListener('click', async () => {
  const statusEl = document.getElementById('status');
  statusEl.textContent = 'Extracting story information...';
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('visualstudio.com')) {
      statusEl.textContent = 'Please navigate to an Azure DevOps work item page';
      return;
    }
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: "extractStory" });
    if (response.success) {
      await navigator.clipboard.writeText(response.data);
      statusEl.textContent = `Copied to clipboard: ${response.data}`;
    } else {
      statusEl.textContent = `Error: ${response.error || 'Could not find story information'}`;
    }
  } catch (error) {
    console.error('Extension error:', error);
    statusEl.textContent = 'Error: Please refresh the page and try again';
  }
});
