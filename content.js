// Content script that runs on all websites
// This script injects CSS to hide elements based on saved selectors

const domain = new URL(window.location.href).hostname;
let styleElement = null;

// Initialize hiding on page load
function initializeHiding() {
  chrome.storage.local.get([domain], function (result) {
    const selectors = result[domain] || [];
    applyHiding(selectors);
  });
}

// Apply hiding based on selectors
function applyHiding(selectors) {
  // Remove old style element if it exists
  if (styleElement) {
    styleElement.remove();
  }

  if (selectors.length === 0) {
    return;
  }

  // Create style element with all selectors
  styleElement = document.createElement('style');
  styleElement.id = 'hide-elements-style';
  styleElement.type = 'text/css';

  const css = selectors
    .map((selector) => {
      return `${selector} { display: none !important; }`;
    })
    .join('\n');

  styleElement.textContent = css;

  // Insert into document head or html
  if (document.head) {
    document.head.appendChild(styleElement);
  } else if (document.documentElement) {
    document.documentElement.appendChild(styleElement);
  } else {
    // Fallback: try again after a short delay
    setTimeout(() => {
      if (document.head) {
        document.head.appendChild(styleElement);
      }
    }, 100);
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'applyHiding') {
    applyHiding(request.selectors);
    sendResponse({ status: 'applied' });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHiding);
} else {
  initializeHiding();
}

// Also apply when body is available (for document_start)
if (!document.body && !document.head) {
  const observer = new MutationObserver(() => {
    if (document.body || document.head) {
      initializeHiding();
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { childList: true });
}
