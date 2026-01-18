# Contributing to SteamBite

First off, thank you for considering contributing to SteamBite! It's people like you that make SteamBite such a great tool.

## Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Be respectful and inclusive
- Be patient and welcoming
- Be collaborative
- Be considerate

## How Can I Contribute?

### Reporting Bugs 🐛

Before creating bug reports, please check the existing issues to avoid duplicates.

When creating a bug report, please include:
- **Clear title** describing the issue
- **Step-by-step reproduction** instructions
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Browser version** and OS
- **Extension version**

### Suggesting Enhancements 💡

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:
- Use a **clear and descriptive title**
- Provide a **detailed description** of the proposed feature
- **Explain why** this enhancement would be useful
- Include **mockups or examples** if possible

### Pull Requests 🔧

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following our coding style
4. **Test thoroughly** on Steam game pages
5. **Commit** with clear, descriptive messages:
   ```bash
   git commit -m "Add: brief description of change"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Open a **Pull Request** against `main`

## Development Setup

### Prerequisites
- Google Chrome browser
- Basic knowledge of JavaScript, HTML, CSS
- Understanding of Chrome Extension APIs

### Getting Started

1. Clone your fork:
   ```bash
   git clone https://github.com/steambiteuk/steambite.git
   cd steambite
   ```

2. Load the extension in Chrome:
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `steambite` folder

3. Test on Steam:
   - Go to any game page on [store.steampowered.com](https://store.steampowered.com/)
   - Verify badges appear correctly

### Making Changes

1. Edit files as needed
2. Reload the extension in `chrome://extensions/`
3. Refresh Steam pages to see changes

## Coding Style Guidelines

### JavaScript

- Use **ES6+** features
- Use **strict mode** (`'use strict';`)
- Use **camelCase** for variables and functions
- Use **UPPER_CASE** for constants
- Add **JSDoc comments** for all functions:
  ```javascript
  /**
   * Description of what the function does
   * @param {string} paramName - Description of parameter
   * @returns {type} Description of return value
   */
  function functionName(paramName) {
    // implementation
  }
  ```
- Handle errors gracefully with try-catch
- Avoid global variables - use IIFEs or modules

### CSS

- Use **descriptive class names** with `.gamebites-` prefix
- Use **CSS variables** for colors and reusable values
- Keep selectors **specific but not overly nested**
- Add comments for complex styles

### HTML

- Use **semantic HTML5** elements
- Include **proper accessibility** attributes
- Keep markup **clean and well-indented**

## Commit Messages

Follow these conventions:
- `Add:` for new features
- `Fix:` for bug fixes
- `Update:` for changes to existing features
- `Remove:` for removed features
- `Docs:` for documentation changes
- `Style:` for formatting, styling changes
- `Refactor:` for code refactoring
- `Test:` for adding/updating tests

Example:
```
Add: Support for Japanese Yen currency conversion
```

## Testing Checklist

Before submitting a PR, verify:
- [ ] Extension loads without errors
- [ ] Badges display correctly on game pages
- [ ] Popup opens and settings work
- [ ] Currency conversion is accurate
- [ ] No console errors
- [ ] Works with discounted games
- [ ] Close button works on badges
- [ ] Settings persist after browser restart

## Product Data

Product data is hosted at `https://steambite.uk/products.json`. To suggest new products:

1. Open an issue with:
   - Product name
   - Price and currency
   - Country/region
   - Source URL for price verification
   - Icon (optional)

2. We'll review and add approved products to the data file

## Questions?

Feel free to open an issue with the `question` label if you have any questions about contributing.

---

Thank you for contributing! 🎮
