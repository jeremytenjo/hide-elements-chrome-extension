// Background service worker for the Hide Elements extension
// Handles storage and communication between popup and content scripts

chrome.runtime.onInstalled.addListener(() => {
  console.log('Hide Elements extension installed');
});

// Clean up storage for removed sites (optional)
chrome.tabs.onRemoved.addListener(() => {
  // Extension cleanup if needed
});
