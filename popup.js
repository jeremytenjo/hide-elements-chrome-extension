// Get current domain from active tab
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = new URL(tabs[0].url);
  const domain = url.hostname;
  document.getElementById('domain').textContent = `Website: ${domain}`;
  loadRules(domain);
});

const selectorInput = document.getElementById('selectorInput');
const addBtn = document.getElementById('addBtn');
const selectorsList = document.getElementById('selectorsList');
const countDisplay = document.getElementById('count');
const clearAllBtn = document.getElementById('clearAllBtn');

const jsCodeInput = document.getElementById('jsCodeInput');
const addJsBtn = document.getElementById('addJsBtn');
const scriptsList = document.getElementById('scriptsList');
const jsCountDisplay = document.getElementById('jsCount');
const clearJsBtn = document.getElementById('clearJsBtn');

let currentDomain = '';

// Tab switching
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', function () {
    const tabName = this.getAttribute('data-tab');
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  // Hide all tabs
  document.querySelectorAll('.tab-content').forEach((tab) => {
    tab.classList.remove('active');
  });

  // Remove active class from all buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.remove('active');
  });

  // Show selected tab
  document.getElementById(`${tabName}-tab`).classList.add('active');

  // Add active class to clicked button
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

  // Set focus
  if (tabName === 'css') {
    selectorInput.focus();
  } else {
    jsCodeInput.focus();
  }
}

// Get current domain
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  const url = new URL(tabs[0].url);
  currentDomain = url.hostname;
});

// Load rules for current domain
function loadRules(domain) {
  chrome.storage.local.get(
    { [`css_${domain}`]: [], [`js_${domain}`]: [] },
    function (result) {
      const cssSelectors = result[`css_${domain}`] || [];
      const jsScripts = result[`js_${domain}`] || [];
      renderSelectors(cssSelectors, domain);
      renderScripts(jsScripts, domain);
    },
  );
}

// Render CSS selectors
function renderSelectors(selectors, domain) {
  selectorsList.innerHTML = '';
  countDisplay.textContent = selectors.length;

  if (selectors.length === 0) {
    selectorsList.innerHTML =
      '<div class="empty-state">No CSS rules yet. Add one to get started!</div>';
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

// Render JavaScript scripts
function renderScripts(scripts, domain) {
  scriptsList.innerHTML = '';
  jsCountDisplay.textContent = scripts.length;

  if (scripts.length === 0) {
    scriptsList.innerHTML =
      '<div class="empty-state">No scripts yet. Add one to get started!</div>';
    return;
  }

  scripts.forEach((code, index) => {
    const item = document.createElement('div');
    item.className = 'script-item';
    const preview = code.length > 100 ? code.substring(0, 100) + '...' : code;
    item.innerHTML = `
      <div class="script-preview">${escapeHtml(preview)}</div>
      <div class="selector-actions">
        <button class="btn-delete" data-script-index="${index}">Delete</button>
      </div>
    `;
    scriptsList.appendChild(item);
  });

  // Add event delegation for delete buttons
  document.querySelectorAll('[data-script-index]').forEach((btn) => {
    btn.addEventListener('click', function () {
      const index = parseInt(this.getAttribute('data-script-index'));
      deleteScript(domain, index);
    });
  });
}

// Helper function to escape HTML
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Add new CSS selector
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

  chrome.storage.local.get([`css_${currentDomain}`], function (result) {
    let selectors = result[`css_${currentDomain}`] || [];

    if (selectors.includes(selector)) {
      alert('This selector is already added');
      return;
    }

    selectors.push(selector);
    chrome.storage.local.set(
      { [`css_${currentDomain}`]: selectors },
      function () {
        selectorInput.value = '';
        renderSelectors(selectors, currentDomain);
        applyRulesToTab();
      },
    );
  });
}

// Add new JavaScript
addJsBtn.addEventListener('click', function () {
  addScript();
});

jsCodeInput.addEventListener('keydown', function (e) {
  // Allow Ctrl+Enter or Cmd+Enter to submit
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    addScript();
  }
});

function addScript() {
  const code = jsCodeInput.value.trim();

  if (!code) {
    alert('Please enter JavaScript code');
    jsCodeInput.focus();
    return;
  }

  // Basic validation
  try {
    new Function(code);
  } catch (e) {
    alert('Invalid JavaScript code: ' + e.message);
    return;
  }

  chrome.storage.local.get([`js_${currentDomain}`], function (result) {
    let scripts = result[`js_${currentDomain}`] || [];

    if (scripts.includes(code)) {
      alert('This script is already added');
      return;
    }

    scripts.push(code);
    chrome.storage.local.set({ [`js_${currentDomain}`]: scripts }, function () {
      jsCodeInput.value = '';
      renderScripts(scripts, currentDomain);
      applyRulesToTab();
    });
  });
}

// Delete selector
function deleteSelector(domain, index) {
  chrome.storage.local.get([`css_${domain}`], function (result) {
    let selectors = result[`css_${domain}`] || [];
    selectors.splice(index, 1);
    chrome.storage.local.set({ [`css_${domain}`]: selectors }, function () {
      renderSelectors(selectors, domain);
      applyRulesToTab();
    });
  });
}

// Delete script
function deleteScript(domain, index) {
  chrome.storage.local.get([`js_${domain}`], function (result) {
    let scripts = result[`js_${domain}`] || [];
    scripts.splice(index, 1);
    chrome.storage.local.set({ [`js_${domain}`]: scripts }, function () {
      renderScripts(scripts, domain);
      applyRulesToTab();
    });
  });
}

// Apply rules to the current active tab
function applyRulesToTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.storage.local.get(
      { [`css_${currentDomain}`]: [], [`js_${currentDomain}`]: [] },
      function (result) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            action: 'applyRules',
            selectors: result[`css_${currentDomain}`] || [],
            scripts: result[`js_${currentDomain}`] || [],
          })
          .catch(() => {
            // Content script may not be ready yet
          });
      },
    );
  });
}

// Clear all CSS rules
clearAllBtn.addEventListener('click', function () {
  if (
    confirm('Are you sure you want to clear all CSS rules for this website?')
  ) {
    chrome.storage.local.set({ [`css_${currentDomain}`]: [] }, function () {
      loadRules(currentDomain);
      applyRulesToTab();
    });
  }
});

// Clear all scripts
clearJsBtn.addEventListener('click', function () {
  if (confirm('Are you sure you want to clear all scripts for this website?')) {
    chrome.storage.local.set({ [`js_${currentDomain}`]: [] }, function () {
      loadRules(currentDomain);
      applyRulesToTab();
    });
  }
});
