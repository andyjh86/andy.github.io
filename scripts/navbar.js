/**
 * UNIVERSAL NAVBAR LOADER
 * 
 * Automatically loads the navbar from your homepage onto other pages.
 * Works anywhere - GitHub Pages, custom servers, local development, etc.
 * 
 * HOW IT WORKS:
 * 1. Homepage (index.html) has the navbar defined inline - this is your single source of truth
 * 2. Other pages have <div id="navbar-placeholder"></div>
 * 3. This script fetches the homepage, extracts the navbar, and injects it into the placeholder
 * 
 * REQUIREMENTS:
 * - Must run on http:// or https:// (use a local dev server, doesn't work with file://)
 * - Navbar element in homepage must have a way to identify it (default: <nav> tag)
 * 
 * CONFIGURATION:
 * - Change NAVBAR_SELECTOR if your navbar uses a different element/class
 * - Change PLACEHOLDER_ID if you want a different placeholder ID
 * - Change HOMEPAGE_PATH if your homepage is in a different location
 */

// ============================================================================
// CONFIGURATION (Change these if needed)
// ============================================================================

const NAVBAR_CONFIG = {
    // CSS selector to find the navbar in the homepage HTML
    // Change this if your navbar has a specific class or ID
    NAVBAR_SELECTOR: 'nav.navbar',  // Default: finds <nav class="navbar">
    
    // ID of the placeholder div on other pages
    PLACEHOLDER_ID: 'navbar-placeholder',
    
    // Relative path to homepage from any page
    // The script automatically calculates depth, but you can override:
    // '../index.html' for pages 1 level deep
    // '../../index.html' for pages 2 levels deep
    // Or set to 'auto' to let the script figure it out
    HOMEPAGE_PATH: 'auto',
    
    // Whether to show a fallback navbar if fetch fails
    SHOW_FALLBACK: true,
    
    // Delay before reinitializing framework components (ms)
    // Increase if your framework needs more time to load
    REINIT_DELAY: 100
};

// ============================================================================
// AUTO-DETECT HOMEPAGE PATH
// ============================================================================

function getHomepagePath() {
    // If user specified a path, use it
    if (NAVBAR_CONFIG.HOMEPAGE_PATH !== 'auto') {
        return NAVBAR_CONFIG.HOMEPAGE_PATH;
    }
    
    // Auto-detect based on current page depth
    const path = window.location.pathname;
    
    // Remove leading slash and trailing filename
    const pathWithoutFile = path.replace(/\/[^\/]*$/, '');
    
    // Count directory depth (number of slashes)
    const depth = (pathWithoutFile.match(/\//g) || []).length;
    
    // Build relative path to root
    // If we're at /services/index.html (depth 1), we need ../index.html
    // If we're at /services/sub/index.html (depth 2), we need ../../index.html
    const relativePath = '../'.repeat(Math.max(depth, 1)) + 'index.html';
    
    return relativePath;
}

const HOMEPAGE_URL = getHomepagePath();

// ============================================================================
// MAIN SCRIPT (No need to edit below this line)
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
    const placeholder = document.getElementById(NAVBAR_CONFIG.PLACEHOLDER_ID);
    
    // Only run if placeholder exists and is empty
    // This allows the homepage to have its navbar inline without interference
    if (!placeholder || placeholder.querySelector('nav')) {
        return; // Exit early - either no placeholder or navbar already exists
    }
    
    console.log('Loading navbar from:', HOMEPAGE_URL);
    
    // Fetch the homepage HTML
    fetch(HOMEPAGE_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return response.text();
        })
        .then(html => {
            // Parse the HTML string into a document
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Find the navbar element
            const navbar = doc.querySelector(NAVBAR_CONFIG.NAVBAR_SELECTOR);
            
            if (!navbar) {
                throw new Error(`Navbar not found using selector: ${NAVBAR_CONFIG.NAVBAR_SELECTOR}`);
            }
            
            // Insert the navbar HTML into the placeholder
            placeholder.innerHTML = navbar.outerHTML;
            
            console.log('Navbar loaded successfully');
            
            // Reinitialize any framework components after a short delay
            setTimeout(() => {
                reinitializeFrameworkComponents(placeholder);
            }, NAVBAR_CONFIG.REINIT_DELAY);
        })
        .catch(error => {
            console.error('Error loading navbar:', error);
            
            // Show fallback navbar if enabled
            if (NAVBAR_CONFIG.SHOW_FALLBACK) {
                showFallbackNavbar(placeholder);
            }
        });
});

/**
 * Reinitialize framework components (Bootstrap, etc.) after navbar injection
 * This is framework-agnostic and tries to detect what's available
 */
function reinitializeFrameworkComponents(container) {
    // Bootstrap 5 - Reinitialize dropdowns and collapse
    if (typeof bootstrap !== 'undefined') {
        // Reinitialize all dropdowns
        const dropdowns = container.querySelectorAll('[data-bs-toggle="dropdown"]');
        dropdowns.forEach(dropdown => {
            try {
                new bootstrap.Dropdown(dropdown);
            } catch (e) {
                console.warn('Could not initialize dropdown:', e);
            }
        });
        
        // Reinitialize collapse (burger menu)
        const collapses = container.querySelectorAll('[data-bs-toggle="collapse"]');
        collapses.forEach(collapse => {
            try {
                new bootstrap.Collapse(collapse, { toggle: false });
            } catch (e) {
                console.warn('Could not initialize collapse:', e);
            }
        });
    }
    
    // Foundation - Reinitialize if Foundation is present
    if (typeof Foundation !== 'undefined' && Foundation.reInit) {
        Foundation.reInit(container);
    }
    
    // Materialize - Reinitialize if Materialize is present
    if (typeof M !== 'undefined' && M.AutoInit) {
        M.AutoInit();
    }
    
    // jQuery-based frameworks - trigger custom event for manual reinitialization
    if (typeof jQuery !== 'undefined') {
        jQuery(container).trigger('navbar-loaded');
    }
    
    // Dispatch custom event for any custom initialization code
    const event = new CustomEvent('navbarLoaded', { 
        detail: { container: container },
        bubbles: true 
    });
    container.dispatchEvent(event);
}

/**
 * Show a simple fallback navbar if the main navbar fails to load
 */
function showFallbackNavbar(placeholder) {
    // Extract site name from <title> or use default
    const siteName = document.title.split('-')[0].trim() || 'Site';
    
    // Calculate path to home
    const homePath = HOMEPAGE_URL || '../index.html';
    
    placeholder.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-dark sticky-top" style="background-color: #1e293b; padding: 1rem;">
            <div class="container-fluid">
                <a class="navbar-brand" href="${homePath}" style="color: white; text-decoration: none; font-weight: bold;">
                    ${siteName}
                </a>
                <div style="color: #999; font-size: 0.9rem;">
                    Navigation temporarily unavailable
                </div>
            </div>
        </nav>
    `;
    
    console.info('Fallback navbar displayed.');
    console.info('Attempted to load from:', HOMEPAGE_URL);
    console.info('Check that the path is correct and you are running on a web server.');
}

/**
 * USAGE NOTES:
 * 
 * 1. HOMEPAGE (index.html):
 *    - Include your navbar directly in the HTML with class="navbar"
 *    - Include this script: <script src="./scripts/navbar.js"></script>
 * 
 * 2. OTHER PAGES (e.g., /about/index.html, /services/index.html):
 *    - Add placeholder: <div id="navbar-placeholder"></div>
 *    - Include this script with correct relative path:
 *      <script src="../scripts/navbar.js"></script>
 *    - Script will automatically calculate the path to homepage
 * 
 * 3. LOCAL DEVELOPMENT:
 *    - Must use a local web server (Live Server, Python, Node, etc.)
 *    - Cannot use file:// protocol due to CORS restrictions
 *    - Examples:
 *      Python: python -m http.server 8000
 *      Node: npx http-server
 *      VS Code: Live Server extension
 * 
 * 4. CUSTOMIZATION:
 *    - Edit NAVBAR_CONFIG at the top of this file
 *    - Change NAVBAR_SELECTOR if your navbar uses different markup
 *    - Set HOMEPAGE_PATH manually if auto-detection doesn't work:
 *      HOMEPAGE_PATH: '../index.html'  (for pages 1 level deep)
 *      HOMEPAGE_PATH: '../../index.html'  (for pages 2 levels deep)
 * 
 * 5. FRAMEWORK COMPATIBILITY:
 *    - Automatically detects and reinitializes: Bootstrap 5, Foundation, Materialize
 *    - Listen for 'navbarLoaded' event for custom initialization:
 *      document.addEventListener('navbarLoaded', function(e) {
 *          // Your custom initialization code here
 *          console.log('Navbar loaded into:', e.detail.container);
 *      });
 * 
 * 6. TROUBLESHOOTING:
 *    - Open browser console to see what path is being used
 *    - If auto-detection fails, set HOMEPAGE_PATH manually
 *    - Make sure you're using a web server, not file:// URLs
 *    - Check that your navbar has class="navbar" or update NAVBAR_SELECTOR
 */
