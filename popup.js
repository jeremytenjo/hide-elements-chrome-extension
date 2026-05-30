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

function normalizeSelectors(rawSelectors) {
  return (rawSelectors || []).map((entry) => {
    if (typeof entry === 'string') {
      return { selector: entry, enabled: true };
    }
    return {
      selector: entry.selector,
      enabled: entry.enabled !== false,
    };
  });
}

// Get current domain
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = new URL(tabs[0].url);
  currentDomain = url.hostname;
});

// Load selectors for current domain
function loadSelectors(domain) {
  chrome.storage.local.get([domain], function (result) {
    const selectors = normalizeSelectors(result[domain] || []);
    renderSelectors(selectors, domain);
  });
}

// Render the list of selectors
function renderSelectors(selectors, domain) {
  selectorsList.innerHTML = '';
  countDisplay.textContent = selectors.filter((item) => item.enabled).length;

  if (selectors.length === 0) {
    selectorsList.innerHTML =
      '<div class="empty-state">No selectors yet. Add one to get started!</div>';
    return;
  }

  selectors.forEach((entry, index) => {
    const item = document.createElement('div');
    item.className = 'selector-item';
    item.innerHTML = `
      <span class="selector-text ${entry.enabled ? '' : 'selector-disabled'}">${
        entry.selector
      }</span>
      <div class="selector-actions">
        <label class="toggle-switch" title="Enable/disable selector">
          <input type="checkbox" class="selector-toggle" data-index="${index}" ${
            entry.enabled ? 'checked' : ''
          } />
          <span class="toggle-slider"></span>
        </label>
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

  document.querySelectorAll('.selector-toggle').forEach((toggle) => {
    toggle.addEventListener('change', function () {
      const index = parseInt(this.getAttribute('data-index'));
      toggleSelector(domain, index, this.checked);
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
    let selectors = normalizeSelectors(result[currentDomain] || []);

    if (selectors.some((item) => item.selector === selector)) {
      alert('This selector is already added');
      return;
    }

    selectors.push({ selector, enabled: true });
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
    let selectors = normalizeSelectors(result[domain] || []);
    selectors.splice(index, 1);
    chrome.storage.local.set({ [domain]: selectors }, function () {
      renderSelectors(selectors, domain);

      // Reapply selectors to current tab
      applySelectorsToTab(selectors);
    });
  });
}

function toggleSelector(domain, index, enabled) {
  chrome.storage.local.get([domain], function (result) {
    let selectors = normalizeSelectors(result[domain] || []);
    if (!selectors[index]) {
      return;
    }

    selectors[index].enabled = enabled;
    chrome.storage.local.set({ [domain]: selectors }, function () {
      renderSelectors(selectors, domain);
      applySelectorsToTab(selectors);
    });
  });
}

// Apply selectors to the current active tab
function applySelectorsToTab(selectors) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (!tabs[0]?.id) {
      return;
    }

    // Try message passing first (content script already injected)
    chrome.tabs.sendMessage(
      tabs[0].id,
      { action: 'applyHiding', selectors: selectors },
      () => {
        if (chrome.runtime.lastError) {
          // Content script not available — apply CSS directly via scripting API
          chrome.scripting
            .executeScript({
              target: { tabId: tabs[0].id },
              func: (selectorsToApply) => {
                const existing = document.getElementById('hide-elements-style');
                if (existing) existing.remove();

                const active = selectorsToApply.filter(
                  (s) => s.enabled && s.selector,
                );
                if (active.length === 0) return;

                const style = document.createElement('style');
                style.id = 'hide-elements-style';
                style.textContent = active
                  .map((s) => `${s.selector} { display: none !important; }`)
                  .join('\n');
                (document.head || document.documentElement).appendChild(style);
              },
              args: [selectors],
            })
            .catch(() => {
              void chrome.runtime.lastError;
            });
        }
      },
    );
  });
}

// Clear all
clearAllBtn.addEventListener('click', function () {
  if (
    confirm(
      'Are you sure you want to clear all hidden elements for this website?',
    )
  ) {
    chrome.storage.local.set({ [currentDomain]: [] }, function () {
      renderSelectors([], currentDomain);
      applySelectorsToTab([]);
    });
  }
});
