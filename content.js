// content.js
function getVisibleText(element) {
  return element?.textContent?.trim() || null;
}

function extractStoryNumber() {
  const storySelectors = [
    'a.bolt-link',
    '.body-xl',
    '[aria-label="ID Field"]',
    '.work-item-form-id'
  ];

  for (const selector of storySelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const match = getVisibleText(element)?.match(/\d+/);
      if (match) {
        console.log(`Found story number "${match[0]}" using selector "${selector}"`);
        return match[0];
      }
    }
  }
  return null;
}

function extractStoryTitle() {
  const titleSelectors = [
    'input.bolt-textfield-input[aria-label="Title field"]',
    'input[aria-label="Title field"]',
    '.work-item-form-title input',
    'input[placeholder="Enter title"]'
  ];

  for (const selector of titleSelectors) {
    const element = document.querySelector(selector);
    if (element && element.value) {
      console.log(`Found story title "${element.value.trim()}" using selector "${selector}"`);
      return element.value.trim();
    }
  }
  return null;
}

function extractDescription() {
  const descriptionSelectors = [
    '[aria-label="Description"] .ql-editor',
    '[aria-label="Description field"] .ql-editor',
    '.work-item-form-description .ql-editor',
    'div[role="textbox"][aria-label*="Description"]',
    '.rich-editor-container .ql-editor'
  ];

  for (const selector of descriptionSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.innerText?.trim() || element.textContent?.trim();
      if (text) {
        console.log(`Found description using selector "${selector}"`);
        return text;
      }
    }
  }
  return 'No description found';
}

function extractAcceptanceCriteria() {
  // Try dedicated Acceptance Criteria field first
  const criteriaSelectors = [
    '[aria-label="Acceptance Criteria"] .ql-editor',
    '[aria-label="Acceptance Criteria field"] .ql-editor',
    '.work-item-form-acceptance-criteria .ql-editor',
    'div[role="textbox"][aria-label*="Acceptance Criteria"]'
  ];

  for (const selector of criteriaSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      const text = element.innerText?.trim() || element.textContent?.trim();
      if (text) {
        console.log(`Found acceptance criteria using selector "${selector}"`);
        return text;
      }
    }
  }

  // Fallback: Search for "Acceptance Criteria" in description
  const description = extractDescription();
  const criteriaMatch = description.match(/(?:Acceptance Criteria|AC):?\s*\n?([\s\S]*?)(?:\n\n|$)/i);
  if (criteriaMatch && criteriaMatch[1]) {
    console.log('Found acceptance criteria in description');
    return criteriaMatch[1].trim();
  }

  return 'No acceptance criteria found';
}

function extractScreenshots() {
  const screenshots = [];

  // Look for images only in work item content areas (not UI/header elements)
  const imageSelectors = [
    'img[src*="attachments"]',
    '.ql-editor img',
    '.rich-editor-container img',
    '[aria-label="Description"] img',
    '[aria-label="Acceptance Criteria"] img'
  ];

  const seenUrls = new Set();

  // Patterns to exclude (profile pictures, avatars, UI elements)
  const excludePatterns = [
    /avatar/i,
    /profile/i,
    /MemberAvatars/i,
    /GraphProfile/i,
    /identityImage/i,
    /profileImage/i,
    /_apis.*avatars/i
  ];

  for (const selector of imageSelectors) {
    const images = document.querySelectorAll(selector);
    images.forEach(img => {
      const src = img.src;

      // Check if image should be excluded
      const shouldExclude = excludePatterns.some(pattern => pattern.test(src));

      // Also check image size - profile pics are typically small
      const isSmall = img.width < 100 && img.height < 100;

      if (src && !seenUrls.has(src) && src.startsWith('http') && !shouldExclude && !isSmall) {
        screenshots.push(src);
        seenUrls.add(src);
      }
    });
  }

  console.log(`Found ${screenshots.length} screenshot(s)`);
  return screenshots;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "extractStory") {
    (async () => {
      try {
        console.log('Starting main info extraction...');

        const storyNumber = extractStoryNumber();
        const storyTitle = extractStoryTitle();

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

  if (request.action === "extractFullStory") {
    (async () => {
      try {
        console.log('Starting full info extraction...');

        const storyNumber = extractStoryNumber();
        const storyTitle = extractStoryTitle();
        const description = extractDescription();
        const acceptanceCriteria = extractAcceptanceCriteria();
        const screenshots = extractScreenshots();

        if (!storyNumber || !storyTitle) {
          throw new Error(`Incomplete information found: ${JSON.stringify({
            storyNumber: storyNumber || 'not found',
            storyTitle: storyTitle || 'not found'
          })}`);
        }

        // Format as markdown
        const output = `# Story ${storyNumber}: ${storyTitle}

## Description
${description}

## Acceptance Criteria
${acceptanceCriteria}

## Screenshots
${screenshots.length > 0 ? `${screenshots.length} screenshot(s) downloaded to ~/Pictures/Screenshots/` : 'No screenshots found'}`;

        console.log('Full extraction complete');
        sendResponse({
          success: true,
          data: output,
          storyNumber: storyNumber,
          screenshots: screenshots
        });

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