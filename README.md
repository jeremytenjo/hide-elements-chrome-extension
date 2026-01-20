# Hide Elements Chrome Extension

A simple yet powerful Chrome extension that allows you to hide unwanted elements from any website persistently.

## Features

✨ **Easy to Use**

- Clean, intuitive interface for managing hidden elements and JavaScript injections
- Add CSS selectors and custom JavaScript with a single click
- Works on any website

🎯 **Persistent Hiding & Code Injection**

- Your hidden elements and injected scripts are saved per website
- Automatically applied when you revisit the site
- Never lose your configurations

📋 **Manage Multiple Rules**

- Add multiple CSS selectors and JavaScript scripts for a single website
- Switch between CSS and JavaScript modes with tabbed interface
- View all active rules at a glance
- Delete individual rules anytime
- Clear all rules with one click

🚀 **JavaScript Injection**

- Execute custom JavaScript code on any website
- Full access to DOM APIs and browser APIs
- Modify page behavior, content, and styling programmatically
- Perfect for automation, data extraction, and advanced customization

💾 **Local Storage**

- All data stored locally on your device
- No data sent to external servers
- Your privacy is protected

## How to Use

### Installation

1. **Load the Extension**
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" (top right corner)
   - Click "Load unpacked"
   - Select the `hide-elements-chrome-extension` folder

2. **Start Using**
   - Click the extension icon in your Chrome toolbar
   - The popup will show the current website domain
   - Start adding CSS selectors to hide elements

### Adding Selectors

#### Method 1: Simple Class/ID

```
.advertisement      // Hide all elements with class "advertisement"
#popup-ad          // Hide element with ID "popup-ad"
```

#### Method 2: Complex Selectors

```
div.ads            // Hide divs with class "ads"
article > .header  // Hide headers inside articles
.video-player, .video-ad  // Multiple selectors (comma-separated)
```

#### Method 3: Attribute Selectors

```
[data-ad-slot]     // Hide elements with data-ad-slot attribute
a[href*="tracking"] // Hide links containing "tracking" in href
```

### Injecting JavaScript

The extension now supports custom JavaScript injection! Switch to the **JavaScript** tab in the popup to add scripts.

#### Method 1: Simple DOM Manipulation

```javascript
// Change background color
document.body.style.backgroundColor = 'lightblue';

// Hide an element programmatically
document.querySelector('.ads').style.display = 'none';
```

#### Method 2: Console Logging & Debugging

```javascript
// Log messages to console
console.log('Script injected successfully!');
console.table(document.querySelectorAll('.article'));
```

#### Method 3: Advanced Automation

```javascript
// Auto-scroll to bottom
window.scrollTo(0, document.body.scrollHeight);

// Remove all tracking pixels
document.querySelectorAll('img[src*="tracking"]').forEach((el) => el.remove());

// Modify page title
document.title = 'New Title';
```

#### Method 4: Event Listeners

```javascript
// Click all "Load More" buttons
document.querySelectorAll('button.load-more').forEach((btn) => btn.click());

// Log every link click
document.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    console.log('Clicked:', e.target.href);
  }
});
```

### Examples

**Hide YouTube Recommendations:**

```
.yt-spec-shelf-item
ytd-rich-item-renderer
```

**Hide Twitter/X Ads:**

```
[data-testid="tweet"][data-has-birdwatch]
.r-1adg3q6 // Promoted tweets
```

**Hide Blog Sidebars:**

```
.sidebar
.related-posts
.ad-section
```

## CSS Selector Cheat Sheet

| Selector   | Example        | Matches                           |
| ---------- | -------------- | --------------------------------- |
| Class      | `.banner`      | Elements with class "banner"      |
| ID         | `#modal`       | Element with ID "modal"           |
| Type       | `div`          | All div elements                  |
| Attribute  | `[data-ad]`    | Elements with data-ad attribute   |
| Descendant | `div .ad`      | .ad inside div                    |
| Child      | `div > .ad`    | .ad directly inside div           |
| Multiple   | `.ad, .banner` | Elements matching either selector |

## How It Works

1. **Storage**: Your selectors and scripts are stored per domain using Chrome's `storage.local` API
   - CSS selectors: `css_example.com`
   - JavaScript code: `js_example.com`
2. **Content Script**: When you visit a website, the extension injects both:
   - CSS rules to hide specified elements
   - JavaScript code to execute custom logic
3. **Persistent**: Settings are automatically loaded when you revisit the site
4. **Real-time Updates**: Changes in the popup are immediately applied to the current page

## Files Structure

```
hide-elements-chrome-extension/
├── manifest.json       # Extension configuration
├── popup.html         # Popup UI
├── popup.js           # Popup logic and interaction
├── content.js         # Script that runs on websites
├── background.js      # Background service worker
└── icons/             # Extension icons
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Technical Details

- **Manifest Version**: 3 (Latest Chrome extension standard)
- **Permissions**:
  - `storage` - To persist your settings
  - `activeTab` - To get current website
  - `scripting` - For content script execution
  - `<all_urls>` - To work on all websites

## Tips & Tricks

💡 **Use Chrome DevTools to Find Selectors**

1. Right-click on an element → "Inspect"
2. Look at the HTML to find class names or IDs
3. Copy the selector and paste it in the extension

💡 **Test Selectors Before Adding**

1. Open DevTools Console (F12)
2. Run `document.querySelectorAll('.your-selector')`
3. If elements appear in the selection, it will work!

💡 **Be Specific**

- Use more specific selectors to avoid hiding unintended elements
- Test your selectors in DevTools first

💡 **JavaScript Code Validation**

- The extension validates JavaScript syntax before saving
- Test your code in DevTools Console first to ensure it works
- Use `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux) to quickly submit scripts

💡 **Keyboard Shortcuts**

- **CSS Tab**: Press `Enter` to add a selector
- **JavaScript Tab**: Press `Cmd+Enter` (Mac) or `Ctrl+Enter` (Windows/Linux) to add a script

💡 **Common JavaScript Patterns**

```javascript
// Wait for element to load
setTimeout(() => {
  document.querySelector('.lazy-element').style.display = 'none';
}, 2000);

// Query and modify multiple elements
document.querySelectorAll('.item').forEach((item) => {
  item.style.opacity = '0.5';
});

// Access window and global APIs
fetch('https://api.example.com/data')
  .then((r) => r.json())
  .then(console.log);
```

## Privacy & Security

- ✅ No data is sent to external servers
- ✅ All settings stored locally on your device
- ✅ No tracking or analytics
- ✅ Open source and transparent

## Troubleshooting

**Selector not working?**

- Ensure the selector is valid CSS syntax
- The element might be dynamically loaded - try refreshing the page
- Use DevTools to inspect and verify the element exists

**Script not executing?**

- Verify the JavaScript syntax is valid (extension validates before saving)
- Check the browser console (F12) for any errors
- Some websites may have CSP (Content Security Policy) restrictions
- Refresh the page after adding a script

**Changes not applied?**

- Refresh the webpage
- Close and reopen the extension popup
- Check that the rule is active in the list

**Extension not showing?**

- Ensure it's loaded in `chrome://extensions/`
- The icon should appear in your toolbar

## Version History

### 2.0.0 - JavaScript Injection

- Added custom JavaScript injection capability
- New tabbed interface for CSS and JavaScript management
- Support for executing code on websites
- Separate storage and management for CSS rules and scripts
- Enhanced validation for JavaScript syntax

### 1.0.0 - Initial Release

- Add and manage CSS selectors per website
- Persistent hiding across page reloads
- Clean, intuitive UI
- Local storage of settings

## Support

For issues or suggestions, check the code and make sure selectors are valid CSS.

---

Enjoy a cleaner web browsing experience! 🎉
