// Content script that runs on all websites
// This script injects CSS to hide elements and executes JavaScript based on saved rules

const domain = new URL(window.location.href).hostname;
let styleElement = null;
let injectedScripts = new Map();

// Initialize hiding and scripts on page load
function initializeRules() {
  chrome.storage.local.get(
    { [`css_${domain}`]: [], [`js_${domain}`]: [] },
    function (result) {
      const cssSelectors = result[`css_${domain}`] || [];
      const jsScripts = result[`js_${domain}`] || [];
      applyHiding(cssSelectors);
      applyJavaScript(jsScripts);
    },
  );
}

// Apply hiding based on CSS selectors
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

// Apply JavaScript code injection
function applyJavaScript(scripts) {
  // Remove previously injected scripts
  injectedScripts.forEach((scriptElement) => {
    if (scriptElement.parentNode) {
      scriptElement.remove();
    }
  });
  injectedScripts.clear();

  if (scripts.length === 0) {
    return;
  }

  // Inject each script
  scripts.forEach((code, index) => {
    try {
      const scriptElement = document.createElement('script');
      scriptElement.id = `injected-script-${index}`;
      scriptElement.textContent = code;
      scriptElement.type = 'text/javascript';

      if (document.head) {
        document.head.appendChild(scriptElement);
      } else if (document.documentElement) {
        document.documentElement.appendChild(scriptElement);
      }

      injectedScripts.set(index, scriptElement);
    } catch (error) {
      console.error('Error injecting script:', error);
    }
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'applyHiding') {
    applyHiding(request.selectors);
    sendResponse({ status: 'applied' });
  } else if (request.action === 'applyJavaScript') {
    applyJavaScript(request.scripts);
    sendResponse({ status: 'applied' });
  } else if (request.action === 'applyRules') {
    applyHiding(request.selectors || []);
    applyJavaScript(request.scripts || []);
    sendResponse({ status: 'applied' });
  }
});

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeRules);
} else {
  initializeRules();
}

// Also apply when body is available (for document_start)
if (!document.body && !document.head) {
  const observer = new MutationObserver(() => {
    if (document.body || document.head) {
      initializeRules();
      observer.disconnect();
    }
  });
  observer.observe(document.documentElement, { childList: true });
}
