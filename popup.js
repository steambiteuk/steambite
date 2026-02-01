/**
 * Steam GameBites - Popup Script
 * Settings, Custom Value, and "I'm Feeling Lucky" button logic
 */

(function () {
    'use strict';

    // DOM Elements
    const currencySelect = document.getElementById('currency-select');
    const productSelect = document.getElementById('product-select');
    const luckyButton = document.getElementById('lucky-btn');
    
    // Product preview elements
    const productPreviewInline = document.getElementById('product-preview-inline');
    const inlinePreviewIcon = document.getElementById('inline-preview-icon');
    const inlinePreviewName = document.getElementById('inline-preview-name');
    const inlinePreviewPrice = document.getElementById('inline-preview-price');
    
    // Custom value elements
    const customValueSection = document.getElementById('custom-value-section');
    const customValueToggle = document.getElementById('custom-value-toggle');
    const customToggle = document.getElementById('custom-toggle');
    const customValueBody = document.getElementById('custom-value-body');
    const customIconInput = document.getElementById('custom-icon');
    const customNameInput = document.getElementById('custom-name');
    const customPriceInput = document.getElementById('custom-price');
    const customCurrencySelect = document.getElementById('custom-currency');
    
    // Badge toggle elements
    const badgeToggleGroup = document.getElementById('badge-toggle-group');
    const badgeToggle = document.getElementById('badge-toggle');
    
    // Form groups for disabling
    const currencyGroup = document.getElementById('currency-group');
    const productGroup = document.getElementById('product-group');
    const luckySection = document.querySelector('.lucky-section');

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
        badgeVisible: true,
        isCustomMode: false,
        customIcon: '🍕',
        customName: 'My Item',
        customPrice: '100',
        customCurrencyCode: 'TRY'
    };

    let productsData = null;
    let isCustomMode = false;

    /**
     * Initialize popup
     */
    async function init() {
        try {
            await loadProducts();
            await loadSettings();
            setupEventListeners();
            updateProductPreview();
            updateUI();
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
     * Update product preview (inline style)
     */
    function updateProductPreview() {
        if (!productPreviewInline || !productSelect) return;

        const productId = productSelect.value;
        const product = findProductById(productId);

        if (product) {
            const iconFile = PRODUCT_ICON_FILES[productId];
            if (iconFile) {
                inlinePreviewIcon.src = `icons/${iconFile}`;
                inlinePreviewIcon.alt = product.label;
                inlinePreviewIcon.style.display = 'block';
            } else {
                // Use emoji fallback
                inlinePreviewIcon.style.display = 'none';
            }

            inlinePreviewName.textContent = product.label;
            inlinePreviewPrice.textContent = `${product.price} ${product.currency}`;
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
                isCustomMode = result.isCustomMode || false;

                // Custom value inputs
                if (customIconInput) {
                    customIconInput.value = result.customIcon || DEFAULT_SETTINGS.customIcon;
                }
                if (customNameInput) {
                    customNameInput.value = result.customName || DEFAULT_SETTINGS.customName;
                }
                if (customPriceInput) {
                    customPriceInput.value = result.customPrice || DEFAULT_SETTINGS.customPrice;
                }
                if (customCurrencySelect) {
                    customCurrencySelect.value = result.customCurrencyCode || DEFAULT_SETTINGS.customCurrencyCode;
                }

                // Badge toggle
                if (badgeToggle) {
                    if (result.badgeVisible !== false) {
                        badgeToggle.classList.add('active');
                    } else {
                        badgeToggle.classList.remove('active');
                    }
                }

                resolve();
            });
        });
    }

    /**
     * Update UI based on custom mode state
     */
    function updateUI() {
        if (isCustomMode) {
            customValueSection.classList.add('active');
            customToggle.classList.add('active');
            customValueBody.style.display = 'block';
            customValueBody.classList.add('animate');
            
            // Disable standard controls
            currencyGroup.classList.add('disabled');
            productGroup.classList.add('disabled');
            luckySection.classList.add('disabled');
        } else {
            customValueSection.classList.remove('active');
            customToggle.classList.remove('active');
            customValueBody.style.display = 'none';
            customValueBody.classList.remove('animate');
            
            // Enable standard controls
            currencyGroup.classList.remove('disabled');
            productGroup.classList.remove('disabled');
            luckySection.classList.remove('disabled');
        }
    }

    /**
     * Save settings
     */
    function saveSettings() {
        const settings = {
            selectedCurrency: currencySelect?.value || DEFAULT_SETTINGS.selectedCurrency,
            selectedProduct: productSelect?.value || DEFAULT_SETTINGS.selectedProduct,
            badgeVisible: badgeToggle?.classList.contains('active') !== false,
            isCustomMode: isCustomMode,
            customIcon: customIconInput?.value || DEFAULT_SETTINGS.customIcon,
            customName: customNameInput?.value || DEFAULT_SETTINGS.customName,
            customPrice: customPriceInput?.value || DEFAULT_SETTINGS.customPrice,
            customCurrencyCode: customCurrencySelect?.value || DEFAULT_SETTINGS.customCurrencyCode
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
            productSelect.addEventListener('change', () => {
                updateProductPreview();
                saveSettings();
            });
        }

        // Custom value toggle
        if (customValueToggle) {
            customValueToggle.addEventListener('click', () => {
                isCustomMode = !isCustomMode;
                updateUI();
                saveSettings();
            });
        }

        // Custom value inputs
        if (customIconInput) {
            customIconInput.addEventListener('input', saveSettings);
        }
        if (customNameInput) {
            customNameInput.addEventListener('input', saveSettings);
        }
        if (customPriceInput) {
            customPriceInput.addEventListener('input', saveSettings);
        }
        if (customCurrencySelect) {
            customCurrencySelect.addEventListener('change', saveSettings);
        }

        // Badge toggle
        if (badgeToggleGroup) {
            badgeToggleGroup.addEventListener('click', () => {
                badgeToggle.classList.toggle('active');
                saveSettings();
            });
        }

        // I'm Feeling Lucky button
        if (luckyButton) {
            luckyButton.addEventListener('click', handleLuckyClick);
        }
    }

    /**
     * Handle lucky button click
     * Selects a random product from the list
     */
    function handleLuckyClick() {
        if (isCustomMode || !productsData) return;

        // Collect all products
        const allProducts = [];
        for (const countryCode of Object.keys(productsData.countries)) {
            const country = productsData.countries[countryCode];
            for (const item of country.items) {
                allProducts.push(item);
            }
        }

        if (allProducts.length === 0) return;

        // Pick a random product
        const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
        
        // Update select
        productSelect.value = randomProduct.id;
        
        // Update preview and save
        updateProductPreview();
        saveSettings();

        // Animation effect
        luckyButton.style.transform = 'scale(0.95)';
        setTimeout(() => {
            luckyButton.style.transform = '';
        }, 100);
    }

    // Initialize on DOM load
    document.addEventListener('DOMContentLoaded', init);

})();
