// content.js
function getVisibleText(element) {
  return element?.textContent?.trim() || null;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractStory") {
    (async () => {
      try {
        console.log('Starting extraction...');
        
        // Log all potential story number locations
        const allLinks = document.querySelectorAll('a.bolt-link');
        console.log('Found links:', Array.from(allLinks).map(link => ({
          text: link.textContent,
          href: link.href
        })));

        // Log all potential title field locations
        const allInputs = document.querySelectorAll('input.bolt-textfield-input');
        console.log('Found inputs:', Array.from(allInputs).map(input => ({
          ariaLabel: input.getAttribute('aria-label'),
          value: input.value,
          placeholder: input.placeholder
        })));

        // Try multiple selectors for story number
        let storyNumber = null;
        const storySelectors = [
          'a.bolt-link',                    // Try bolt-link class
          '.body-xl',                       // Try body-xl class
          '[aria-label="ID Field"]',        // Try aria-label
          '.work-item-form-id'              // Try work-item-form-id class
        ];

        for (const selector of storySelectors) {
          const element = document.querySelector(selector);
          if (element) {
            console.log(`Found element with selector "${selector}":`, {
              element,
              text: getVisibleText(element)
            });
            
            const match = getVisibleText(element)?.match(/\d+/);
            if (match) {
              storyNumber = match[0];
              console.log(`Found story number "${storyNumber}" using selector "${selector}"`);
              break;
            }
          }
        }

        // Try multiple selectors for title
        let storyTitle = null;
        const titleSelectors = [
          'input.bolt-textfield-input[aria-label="Title field"]',
          'input[aria-label="Title field"]',
          '.work-item-form-title input',
          'input[placeholder="Enter title"]'
        ];

        for (const selector of titleSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            console.log(`Found element with selector "${selector}":`, {
              element,
              value: element.value
            });
            
            if (element.value) {
              storyTitle = element.value.trim();
              console.log(`Found story title "${storyTitle}" using selector "${selector}"`);
              break;
            }
          }
        }

        // Log final results
        console.log('Extraction results:', {
          storyNumber,
          storyTitle,
          documentTitle: document.title,
          url: window.location.href
        });

        if (!storyNumber || !storyTitle) {
          throw new Error(`Incomplete information found: ${JSON.stringify({
            storyNumber: storyNumber || 'not found',
            storyTitle: storyTitle || 'not found'
          })}`);
        }

        const output = `${storyNumber} - ${storyTitle}`;
        console.log('Final output:', output);
        sendResponse({ success: true, data: output });
        
      } catch (error) {
        console.error('Extraction error:', error);
        sendResponse({ 
          success: false, 
          error: error.message,
          details: {
            url: window.location.href,
            title: document.title
          }
        });
      }
    })();
    return true;
  }
});

// Notify when content script is loaded
console.log('Azure Story Extractor content script loaded', {
  url: window.location.href,
  title: document.title
});