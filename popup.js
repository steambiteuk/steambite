/**
 * Steam GameBites - Popup Script
 * Settings and "I'm Feeling Lucky" button logic
 */

(function () {
    'use strict';

    // DOM Elements
    const currencySelect = document.getElementById('currency-select');
    const productSelect = document.getElementById('product-select');
    const badgeVisibleCheckbox = document.getElementById('badge-visible');
    const luckyButton = document.getElementById('lucky-btn');
    const productPreview = document.getElementById('product-preview');
    const previewIcon = document.getElementById('preview-icon');
    const previewName = document.getElementById('preview-name');
    const previewPrice = document.getElementById('preview-price');

    // Product icon mappings
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

    // Default settings
    const DEFAULT_SETTINGS = {
        selectedProduct: 'bigmac_us',
        selectedCurrency: 'USD',
        badgeVisible: true
    };

    let productsData = null;

    /**
     * Initialize popup
     */
    async function init() {
        try {
            await loadProducts();
            await loadSettings();
            setupEventListeners();
            updateProductPreview();
        } catch (error) {
            console.error('[GameBites Popup] Initialization error:', error);
        }
    }

    /**
     * Load product data
     */
    async function loadProducts() {
        try {
            const url = 'https://steambite.uk/products.json';
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to load products JSON: ' + response.status);
            productsData = await response.json();
            console.log('[GameBites Popup] Products loaded from remote server');

            populateProductSelect();
        } catch (error) {
            console.error('[GameBites Popup] Failed to load products:', error);
        }
    }

    /**
     * Populate product dropdown
     */
    function populateProductSelect() {
        if (!productsData || !productSelect) return;

        productSelect.innerHTML = '';

        for (const countryCode of Object.keys(productsData.countries)) {
            const country = productsData.countries[countryCode];

            // Create optgroup for each country
            const optgroup = document.createElement('optgroup');
            optgroup.label = `${country.flag} ${country.name}`;

            for (const item of country.items) {
                const option = document.createElement('option');
                option.value = item.id;
                option.textContent = `${item.label} (${item.price} ${item.currency})`;
                optgroup.appendChild(option);
            }

            productSelect.appendChild(optgroup);
        }
    }

    /**
     * Find product by ID
     */
    function findProductById(productId) {
        if (!productsData) return null;

        for (const countryCode of Object.keys(productsData.countries)) {
            const country = productsData.countries[countryCode];
            for (const item of country.items) {
                if (item.id === productId) {
                    return item;
                }
            }
        }
        return null;
    }

    /**
     * Update product preview
     */
    function updateProductPreview() {
        if (!productPreview || !productSelect) return;

        const productId = productSelect.value;
        const product = findProductById(productId);

        if (product) {
            const iconFile = PRODUCT_ICON_FILES[productId];
            if (iconFile) {
                previewIcon.src = `icons/${iconFile}`;
                previewIcon.alt = product.label;
            } else {
                previewIcon.src = 'icons/icon48.png';
                previewIcon.alt = 'Product';
            }

            previewName.textContent = product.label;
            previewPrice.textContent = `${product.price} ${product.currency}`;
            productPreview.style.display = 'flex';
        } else {
            productPreview.style.display = 'none';
        }
    }

    /**
     * Load settings
     */
    async function loadSettings() {
        return new Promise((resolve) => {
            chrome.storage.local.get(DEFAULT_SETTINGS, (result) => {
                // Currency select
                if (currencySelect) {
                    currencySelect.value = result.selectedCurrency || DEFAULT_SETTINGS.selectedCurrency;
                }

                // Product select
                if (productSelect) {
                    productSelect.value = result.selectedProduct || DEFAULT_SETTINGS.selectedProduct;
                }

                // Badge visibility
                if (badgeVisibleCheckbox) {
                    badgeVisibleCheckbox.checked = result.badgeVisible !== false;
                }

                resolve();
            });
        });
    }

    /**
     * Save settings
     */
    function saveSettings() {
        const settings = {
            selectedCurrency: currencySelect?.value || DEFAULT_SETTINGS.selectedCurrency,
            selectedProduct: productSelect?.value || DEFAULT_SETTINGS.selectedProduct,
            badgeVisible: badgeVisibleCheckbox?.checked !== false
        };

        chrome.storage.local.set(settings, () => {
            console.log('[GameBites Popup] Settings saved:', settings);
        });

        // Update preview
        updateProductPreview();
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        // Currency change
        if (currencySelect) {
            currencySelect.addEventListener('change', saveSettings);
        }

        // Product change
        if (productSelect) {
            productSelect.addEventListener('change', saveSettings);
        }

        // Badge visibility change
        if (badgeVisibleCheckbox) {
            badgeVisibleCheckbox.addEventListener('change', saveSettings);
        }

        // I'm Feeling Lucky button
        if (luckyButton) {
            luckyButton.addEventListener('click', handleLuckyClick);
        }
    }

    /**
     * Handle lucky button click
     * Opens a random Steam game page with 3618 + random 3-digit suffix
     */
    function handleLuckyClick() {
        // 3618 + random 3-digit number (000-999)
        const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const steamUrl = `https://store.steampowered.com/app/3618${randomSuffix}`;

        // Animation effect
        luckyButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            luckyButton.style.transform = '';
        }, 100);

        // Open in new tab
        chrome.tabs.create({ url: steamUrl });
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', init);

})();
