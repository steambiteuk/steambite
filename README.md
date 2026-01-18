# SteamBite 🎮

A Chrome extension that compares Steam game prices with real-world products. Ever wondered how many Big Macs or Lattes a game costs? SteamBite shows you!

![SteamBite Logo](icons/icon128.png)

## Features ✨

- **Price Comparison**: Converts game prices to everyday products like Big Macs, Lattes, Croissants, and more
- **Multi-Currency Support**: Works with USD, EUR, TRY, GBP, JPY, CAD, AUD, BRL, PLN, and CNY
- **Real-time Exchange Rates**: Uses Frankfurter API for accurate currency conversion
- **Global Products**: Choose from products across different countries (US, UK, TR, JP, DE, FR, BR, AU, CA, CN, PL)
- **I'm Feeling Lucky**: Discover random Steam games with one click
- **Minimal & Clean UI**: Designed to blend seamlessly with Steam's interface

## Installation 🚀

### From Chrome Web Store
*Coming soon...*

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `steambite` folder
5. The extension is now ready to use!

## Usage 📖

1. Navigate to any game page on [Steam Store](https://store.steampowered.com/)
2. Look for the SteamBite badge next to the game price
3. Hover over the badge to see detailed calculation breakdown
4. Click the extension icon to change settings:
   - Select your preferred currency
   - Choose a comparison product
   - Toggle badge visibility

## Supported Products 🍔☕

| Country | Products |
|---------|----------|
| 🇺🇸 USA | Big Mac, Starbucks Latte |
| 🇬🇧 UK | Latte, Meal Deal |
| 🇹🇷 Turkey | Latte, Simit |
| 🇯🇵 Japan | Onigiri, Green Tea |
| 🇩🇪 Germany | Döner, Latte |
| 🇫🇷 France | Croissant, Café Crème |
| 🇧🇷 Brazil | Pão de Queijo, Coffee |
| 🇦🇺 Australia | Cheeseburger, Flat White |
| 🇨🇦 Canada | Big Mac, Filter Coffee |
| 🇨🇳 China | Baozi, Latte |
| 🇵🇱 Poland | Zapiekanka, Latte |

## Privacy 🔒

SteamBite respects your privacy:
- **No personal data collection**: We don't collect any personal information
- **No tracking**: No analytics or tracking scripts
- **Local storage only**: Your settings are stored locally in your browser
- **Open source**: All code is publicly available for review

For more details, see our [Privacy Policy](https://steambite.uk/privacy_policy.html).

## Permissions Explained 📋

| Permission | Purpose |
|------------|---------|
| `storage` | Save your settings locally |
| `activeTab` | Access the current tab to inject badges |
| `host_permissions` | Fetch exchange rates and product data |

## Contributing 🤝

Contributions are welcome! Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a pull request.

### Development Setup
1. Fork this repository
2. Clone your fork locally
3. Make your changes
4. Test thoroughly on Steam pages
5. Submit a pull request

### Adding New Products
Products are managed in a remote JSON file. If you'd like to suggest new products:
1. Open an issue with the product details
2. Include: name, price, currency, and source URL

## Tech Stack 🛠️

- **Manifest V3**: Latest Chrome extension standard
- **Vanilla JavaScript**: No frameworks, pure JS
- **Frankfurter API**: Real-time exchange rates
- **CSS3**: Modern styling with variables

## Project Structure 📁

```
steambite/
├── content.js      # Steam page injection logic
├── content.css     # Badge and tooltip styles
├── popup.html      # Extension popup UI
├── popup.js        # Popup functionality
├── popup.css       # Popup styles
├── manifest.json   # Extension configuration
├── icons/          # Extension icons and product SVGs
│   ├── icon16.png
│   ├── icon48.png
│   ├── icon128.png
│   └── *.svg       # Product icons
└── README.md       # This file
```

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- [Frankfurter API](https://www.frankfurter.app/) for exchange rate data
- [Steam](https://store.steampowered.com/) for the awesome platform
- All contributors who help improve this project

## Support 💬

- **Issues**: [GitHub Issues](https://github.com/steambiteuk/steambite/issues)
- **Website**: [steambite.uk](https://steambite.uk)
- **Email**: [info@steambite.uk](mailto:info@steambite.uk)

---

Made with ❤️ by the SteamBite Team
