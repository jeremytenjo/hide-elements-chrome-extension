// Get current domain from active tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = new URL(tabs[0].url);
  const domain = url.hostname;
  document.getElementById('domain').textContent = `Website: ${domain}`;
  loadSelectors(domain);
});

const selectorInput = document.getElementById('selectorInput');
const addBtn = document.getElementById('addBtn');
const selectorsList = document.getElementById('selectorsList');
const countDisplay = document.getElementById('count');
const clearAllBtn = document.getElementById('clearAllBtn');

let currentDomain = '';

// Get current domain
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = new URL(tabs[0].url);
  currentDomain = url.hostname;
});

// Load selectors for current domain
function loadSelectors(domain) {
  chrome.storage.local.get([domain], function (result) {
    const selectors = result[domain] || [];
    renderSelectors(selectors, domain);
  });
}

// Render the list of selectors
function renderSelectors(selectors, domain) {
  selectorsList.innerHTML = '';
  countDisplay.textContent = selectors.length;

  if (selectors.length === 0) {
    selectorsList.innerHTML =
      '<div class="empty-state">No selectors yet. Add one to get started!</div>';
    return;
  }

  selectors.forEach((selector, index) => {
    const item = document.createElement('div');
    item.className = 'selector-item';
    item.innerHTML = `
      <span>${selector}</span>
      <div class="selector-actions">
        <button class="btn-delete" data-index="${index}">Delete</button>
      </div>
    `;
    selectorsList.appendChild(item);
  });

  // Add event delegation for delete buttons
  document.querySelectorAll('.btn-delete').forEach((btn) => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-index'));
      deleteSelector(domain, index);
    });
  });
}

// Add new selector
addBtn.addEventListener('click', function () {
  addSelector();
});

selectorInput.addEventListener('keypress', function (e) {
  if (e.key === 'Enter') {
    addSelector();
  }
});

function addSelector() {
  const selector = selectorInput.value.trim();

  if (!selector) {
    alert('Please enter a CSS selector');
    selectorInput.focus();
    return;
  }

  // Validate CSS selector (basic check)
  try {
    document.querySelectorAll(selector);
  } catch (e) {
    alert('Invalid CSS selector: ' + e.message);
    return;
  }

  chrome.storage.local.get([currentDomain], function (result) {
    let selectors = result[currentDomain] || [];

    if (selectors.includes(selector)) {
      alert('This selector is already added');
      return;
    }

    selectors.push(selector);
    chrome.storage.local.set({ [currentDomain]: selectors }, function () {
      selectorInput.value = '';
      renderSelectors(selectors, currentDomain);

      // Apply to current tab
      applySelectorsToTab(selectors);
    });
  });
}

function deleteSelector(domain, index) {
  chrome.storage.local.get([domain], function (result) {
    let selectors = result[domain] || [];
    selectors.splice(index, 1);
    chrome.storage.local.set({ [domain]: selectors }, function () {
      renderSelectors(selectors, domain);

      // Reapply selectors to current tab
      applySelectorsToTab(selectors);
    });
  });
}

// Apply selectors to the current active tab
function applySelectorsToTab(selectors) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs
      .sendMessage(tabs[0].id, {
        action: 'applyHiding',
        selectors: selectors,
      })
      .catch(() => {
        // Content script may not be ready yet
      });
  });
}

// Clear all
clearAllBtn.addEventListener('click', function () {
  if (
    confirm(
      'Are you sure you want to clear all hidden elements for this website?'
    )
  ) {
    chrome.storage.local.set({ [currentDomain]: [] }, function () {
      renderSelectors([], currentDomain);
      applySelectorsToTab([]);
    });
  }
});
