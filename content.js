/**
 * Steam GameBites - Content Script
 * Compares Steam game prices with real-world products
 */

(function () {
  'use strict';

  // Default settings
  const DEFAULT_SETTINGS = {
    selectedProduct: 'bigmac_us',
    selectedCurrency: 'USD',
    badgeVisible: true
  };

  // Global state
  let settings = { ...DEFAULT_SETTINGS };
  let productsData = null;
  let exchangeRates = null;

  // Product icon mappings - SVG file names
  const PRODUCT_ICON_FILES = {
    'bigmac_us': 'bigmac.svg',
    'bigmac_ca': 'bigmac.svg',
    'latte_tall_us': 'latte.svg',
    'latte_tall_uk': 'latte.svg',
    'latte_tall_tr': 'latte.svg',
    'latte_cn': 'latte.svg',
    'latte_de': 'latte.svg',
    'latte_pl': 'latte.svg',
    'baozi_cn': 'baozi.svg',
    'doner_de': 'doner.svg',
    'meal_deal_uk': 'meal_deal.svg',
    'filter_coffee_ca': 'black_coffe.svg',
    'cheeseburger_au': 'cheeseburger.svg',
    'flat_white_au': 'latte.svg',
    'croissant_fr': 'croissant.svg',
    'cafe_creme_fr': 'latte.svg',
    'pao_de_queijo_br': 'pao_de_queijo.svg',
    'coffee_small_br': 'black_coffe.svg',
    'onigiri_jp': 'onigiri.svg',
    'green_tea_jp': 'green_tea.svg',
    'zapiekanka_pl': 'zapiekanka.svg',
    'simit_tr': 'simit.svg'
  };

  // Fallback emoji icons by type
  const PRODUCT_ICONS = {
    food: '🍔',
    drink: '☕',
    default: '📦'
  };

  /**
   * Initialize the extension
   */
  async function init() {
    // Only run on /app/ pages (exclude homepage, search, etc.)
    if (!window.location.pathname.startsWith('/app/')) {
      console.log('[GameBites] This page is not supported, only /app/* pages are supported');
      return;
    }

    try {
      // Load settings
      await loadSettings();

      // Load product data
      await loadProducts();

      // Fetch exchange rates
      await fetchExchangeRates();

      // Find price elements and inject badges
      injectBadges();

      // Listen for settings changes
      chrome.storage.onChanged.addListener(handleSettingsChange);

      console.log('[GameBites] Extension loaded successfully');
    } catch (error) {
      console.error('[GameBites] Initialization error:', error);
    }
  }

  /**
   * Load settings from chrome.storage
   */
  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
        settings = { ...DEFAULT_SETTINGS, ...result };
        resolve();
      });
    });
  }

  /**
   * Load product data from remote server
   */
  async function loadProducts() {
    try {
      const url = 'https://steambite.uk/products.json';
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to load products JSON: ' + response.status);
      productsData = await response.json();
      console.log('[GameBites] Product data loaded from remote server');
    } catch (error) {
      console.error('[GameBites] Failed to load product data:', error);
      throw error;
    }
  }

  /**
   * Fetch exchange rates from Frankfurter API
   */
  async function fetchExchangeRates() {
    try {
      const response = await fetch('https://api.frankfurter.app/latest?from=USD');
      if (!response.ok) throw new Error('Exchange rate API error');
      const data = await response.json();
      exchangeRates = { USD: 1, ...data.rates };
      console.log('[GameBites] Exchange rates updated:', exchangeRates);
    } catch (error) {
      console.error('[GameBites] Failed to fetch exchange rates:', error);
      // Fallback rates
      exchangeRates = { USD: 1, EUR: 0.92, TRY: 34.5, GBP: 0.79 };
    }
  }

  /**
   * Find the selected product from settings
   * @returns {Object|null} Selected product with country info
   */
  function getSelectedProduct() {
    if (!productsData) return null;

    for (const countryCode of Object.keys(productsData.countries)) {
      const country = productsData.countries[countryCode];
      const product = country.items.find(item => item.id === settings.selectedProduct);
      if (product) {
        return { ...product, countryCode, countryName: country.name, flag: country.flag };
      }
    }

    // If not found, return default Big Mac
    const usCountry = productsData.countries['US'];
    if (usCountry && usCountry.items.length > 0) {
      const bigmac = usCountry.items.find(item => item.id === 'bigmac_us') || usCountry.items[0];
      return { ...bigmac, countryCode: 'US', countryName: usCountry.name, flag: usCountry.flag };
    }

    return null;
  }

  /**
   * Parse price from Steam format
   * @param {string} priceText - Raw price text from Steam
   * @returns {Object|null} Parsed price with currency info
   */
  function parsePrice(priceText) {
    if (!priceText) return null;

    // Clean: handle formats like "$2.79 USD", "2,79€", "₺96.36"
    const cleaned = priceText.replace(/[^\d.,]/g, '').replace(',', '.');
    const price = parseFloat(cleaned);

    if (isNaN(price)) return null;

    // Detect currency
    let currency = 'USD';
    if (priceText.includes('€')) currency = 'EUR';
    else if (priceText.includes('₺') || priceText.includes('TL') || priceText.includes('TRY')) currency = 'TRY';
    else if (priceText.includes('£')) currency = 'GBP';
    else if (priceText.includes('¥')) currency = 'JPY';
    else if (priceText.includes('R$')) currency = 'BRL';
    else if (priceText.includes('A$') || priceText.includes('AU$')) currency = 'AUD';
    else if (priceText.includes('C$') || priceText.includes('CA$')) currency = 'CAD';
    else if (priceText.includes('zł')) currency = 'PLN';

    return { price, currency };
  }

  /**
   * Convert price to USD
   * @param {number} price - Price value
   * @param {string} fromCurrency - Source currency code
   * @returns {number} Price in USD
   */
  function convertToUSD(price, fromCurrency) {
    if (fromCurrency === 'USD' || !exchangeRates) return price;

    const rate = exchangeRates[fromCurrency];
    if (!rate) return price;

    return price / rate;
  }

  /**
   * Calculate how many products can be purchased
   * @param {number} gamePriceUSD - Game price in USD
   * @param {Object} product - Selected product data
   * @returns {Object|null} Calculation results
   */
  function calculate(gamePriceUSD, product) {
    if (!product || !exchangeRates) return null;

    // Convert product price to USD
    const productPriceUSD = convertToUSD(product.price, product.currency);

    // Calculate quantity
    const quantity = gamePriceUSD / productPriceUSD;

    // Game price in user's selected currency
    const gameInSelectedCurrency = gamePriceUSD * (exchangeRates[settings.selectedCurrency] || 1);

    return {
      quantity: quantity,
      quantityDisplay: formatQuantity(quantity),
      gamePriceUSD,
      gameInSelectedCurrency,
      productPriceLocal: product.price,
      productCurrency: product.currency,
      exchangeRate: exchangeRates[settings.selectedCurrency] || 1
    };
  }

  /**
   * Format quantity - rounding and fraction display
   * Only shows fractions for values below 1
   * @param {number} quantity - Raw quantity value
   * @returns {string} Formatted quantity string
   */
  function formatQuantity(quantity) {
    // 0.4-0.6 shows as "half"
    if (quantity >= 0.4 && quantity < 0.6) {
      return '½';
    }

    // 0.6-1 rounds to 1
    if (quantity >= 0.6 && quantity < 1) {
      return '1';
    }

    // 0.25-0.4 shows as ⅓
    if (quantity >= 0.25 && quantity < 0.4) {
      return '⅓';
    }

    // 0-0.25 shows as ¼
    if (quantity > 0 && quantity < 0.25) {
      return '¼';
    }

    // 0 returns 0 (free game)
    if (quantity === 0) {
      return '0';
    }

    // All other values use normal rounding
    return Math.round(quantity).toString();
  }

  /**
   * Create Badge HTML
   * Format: "[icon] 1 Latte (Tall)" - Original design compliant
   * @param {Object} calculation - Calculation results
   * @param {Object} product - Selected product
   * @param {string} priceText - Original price text
   * @returns {string} Badge HTML string
   */
  function createBadgeHTML(calculation, product, priceText) {
    // Get SVG icon or fallback to emoji
    const svgFile = PRODUCT_ICON_FILES[product.id];
    let iconHTML;

    if (svgFile) {
      const iconUrl = chrome.runtime.getURL(`icons/${svgFile}`);
      iconHTML = `<img src="${iconUrl}" alt="${product.label}" class="gamebites-badge-icon-img">`;
    } else {
      const emoji = PRODUCT_ICONS[product.type] || PRODUCT_ICONS.default;
      iconHTML = `<span class="gamebites-badge-icon">${emoji}</span>`;
    }

    // Check if currency conversion is needed
    const needsConversion = calculation.productCurrency !== 'USD';
    const currentRate = exchangeRates[calculation.productCurrency] || 1;

    return `
      <div class="gamebites-wrapper">
        <div class="gamebites-badge" data-gamebites="true">
          ${iconHTML}
          <span class="gamebites-badge-quantity">${calculation.quantityDisplay}</span>
          <span class="gamebites-badge-product">${product.label}</span>
          <button class="gamebites-badge-close" title="Close">×</button>
        </div>
        <div class="gamebites-tooltip" style="display: none;">
          <div class="gamebites-tooltip-header">
            <span class="gamebites-tooltip-header-icon">🧮</span>
            <span class="gamebites-tooltip-header-text">Calculation Details</span>
          </div>
          
          <div class="gamebites-tooltip-row">
            <span class="gamebites-tooltip-label">Game Price:</span>
            <span class="gamebites-tooltip-value">${priceText}</span>
          </div>
          
          <div class="gamebites-tooltip-row">
            <span class="gamebites-tooltip-label">In USD:</span>
            <span class="gamebites-tooltip-value">$${calculation.gamePriceUSD.toFixed(2)}</span>
          </div>
          
          ${needsConversion ? `
            <div class="gamebites-tooltip-divider"></div>
            <div class="gamebites-tooltip-row">
              <span class="gamebites-tooltip-label">Exchange Rate:</span>
              <span class="gamebites-tooltip-value highlight">1 USD = ${currentRate.toFixed(2)} ${calculation.productCurrency}</span>
            </div>
            <div class="gamebites-tooltip-row">
              <span class="gamebites-tooltip-label">Converted Price:</span>
              <span class="gamebites-tooltip-value highlight">${calculation.gameInSelectedCurrency.toFixed(2)} ${calculation.productCurrency}</span>
            </div>
          ` : ''}
          
          <div class="gamebites-tooltip-divider"></div>
          
          <div class="gamebites-tooltip-row">
            <span class="gamebites-tooltip-label">Product:</span>
            <span class="gamebites-tooltip-value">${product.label}</span>
          </div>
          <div class="gamebites-tooltip-row">
            <span class="gamebites-tooltip-label">Product Price:</span>
            <span class="gamebites-tooltip-value">${calculation.productPriceLocal.toFixed(2)} ${calculation.productCurrency}</span>
          </div>
          
          <div class="gamebites-tooltip-divider"></div>
          
          <div class="gamebites-tooltip-row">
            <span class="gamebites-tooltip-label">Formula:</span>
            <span class="gamebites-tooltip-value" style="font-size: 9px;">$${calculation.gamePriceUSD.toFixed(2)} ÷ $${(calculation.productPriceLocal / (needsConversion ? currentRate : 1)).toFixed(2)}</span>
          </div>
          
          <div class="gamebites-tooltip-row gamebites-tooltip-result">
            <span>Result:</span>
            <span>${calculation.quantityDisplay} ${product.label}</span>
          </div>
          <div class="gamebites-tooltip-row">
            <span class="gamebites-tooltip-label">Exact:</span>
            <span class="gamebites-tooltip-value">${calculation.quantity.toFixed(2)} units</span>
          </div>
          
          ${product.source ? `
            <div class="gamebites-tooltip-source">
              <a href="${product.source}" target="_blank" rel="noopener noreferrer">
                🔗 Price Source: ${new URL(product.source).hostname}
              </a>
              <span class="gamebites-branding">
                <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="" class="gamebites-branding-icon">
                ${productsData?.label || 'SteamBite'}
              </span>
            </div>
          ` : `
            <div class="gamebites-tooltip-source gamebites-branding-only">
              <span class="gamebites-branding">
                <img src="${chrome.runtime.getURL('icons/icon16.png')}" alt="" class="gamebites-branding-icon">
                ${productsData?.label || 'SteamBite'}
              </span>
            </div>
          `}
        </div>
      </div>
    `;
  }

  /**
   * Inject badges into the page
   */
  function injectBadges() {
    if (!settings.badgeVisible) return;

    const product = getSelectedProduct();
    if (!product) {
      return;
    }

    // Clear existing badges
    document.querySelectorAll('.gamebites-wrapper').forEach(el => el.remove());

    // Find Steam price elements
    const priceSelectors = [
      '.game_purchase_price',
      '.discount_final_price',
      '.salepreviewwidgets_StoreSalePriceBox_Wh0L8',
      '.Wh0L8' // New Steam UI
    ];

    priceSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(priceElement => {
        // Check if already processed
        if (priceElement.closest('.gamebites-wrapper')) return;
        if (priceElement.dataset.gamebiteProcessed) return;

        const priceText = priceElement.textContent;
        const parsed = parsePrice(priceText);

        if (!parsed || parsed.price <= 0) return;

        const gamePriceUSD = convertToUSD(parsed.price, parsed.currency);
        const calculation = calculate(gamePriceUSD, product);

        if (!calculation) return;

        // Add badge
        const badgeHTML = createBadgeHTML(calculation, product, priceText.trim());

        // Find the price block (discount_block or game_purchase_action_bg)
        const discountBlock = priceElement.closest('.discount_block')
          || priceElement.closest('.game_purchase_action_bg');

        if (discountBlock) {
          // Add badge just above the price block
          const wrapper = document.createElement('div');
          wrapper.innerHTML = badgeHTML;
          const badge = wrapper.firstElementChild;

          discountBlock.parentElement.insertBefore(badge, discountBlock);

          priceElement.dataset.gamebiteProcessed = 'true';

          // Add event listeners
          setupBadgeEvents(badge);
        }
      });
    });
  }

  /**
   * Setup badge event listeners
   * @param {HTMLElement} badgeWrapper - Badge wrapper element
   */
  function setupBadgeEvents(badgeWrapper) {
    const badge = badgeWrapper.querySelector('.gamebites-badge');
    const tooltip = badgeWrapper.querySelector('.gamebites-tooltip');
    const closeBtn = badgeWrapper.querySelector('.gamebites-badge-close');

    if (badge && tooltip) {
      badge.addEventListener('mouseenter', () => {
        tooltip.style.display = 'block';
      });

      badge.addEventListener('mouseleave', () => {
        tooltip.style.display = 'none';
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        badgeWrapper.style.display = 'none';
      });
    }
  }

  /**
   * Handle settings changes from storage
   * @param {Object} changes - Changed settings
   * @param {string} areaName - Storage area name
   */
  function handleSettingsChange(changes, areaName) {
    if (areaName !== 'local') return;

    let needsRefresh = false;

    for (const key of Object.keys(changes)) {
      if (key in settings) {
        settings[key] = changes[key].newValue;
        needsRefresh = true;
      }
    }

    if (needsRefresh) {
      // Refresh badges
      document.querySelectorAll('[data-gamebite-processed]').forEach(el => {
        delete el.dataset.gamebiteProcessed;
      });
      injectBadges();
    }
  }

  // Initialize when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Watch for dynamic content with MutationObserver
  const observer = new MutationObserver((mutations) => {
    let shouldInject = false;

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.querySelector && (
              node.querySelector('.game_purchase_price') ||
              node.querySelector('.discount_final_price') ||
              node.classList?.contains('game_purchase_price') ||
              node.classList?.contains('discount_final_price')
            )) {
              shouldInject = true;
              break;
            }
          }
        }
      }
      if (shouldInject) break;
    }

    if (shouldInject) {
      setTimeout(injectBadges, 100);
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

})();
