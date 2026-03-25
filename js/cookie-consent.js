/**
 * Cookie Consent Manager
 * Manages user consent for Google Analytics and GetSiteControl
 */

(function() {
    'use strict';

    const CONSENT_STORAGE_KEY = 'cookie_consent';
    const CONSENT_GRANTED = 'granted';
    const CONSENT_DENIED = 'denied';

    /**
     * Check if user has given consent
     */
    function hasConsent() {
        const consent = localStorage.getItem(CONSENT_STORAGE_KEY);
        return consent === CONSENT_GRANTED;
    }

    /**
     * Check if user has made a choice
     */
    function hasConsentChoice() {
        return localStorage.getItem(CONSENT_STORAGE_KEY) !== null;
    }

    /**
     * Save user's consent choice
     */
    function saveConsent(consent) {
        localStorage.setItem(CONSENT_STORAGE_KEY, consent);

        // Set consent for 1 year
        const expiryDate = new Date();
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
        document.cookie = CONSENT_STORAGE_KEY + '=' + consent + '; expires=' + expiryDate.toUTCString() + '; path=/';
    }

    /**
     * Load Google Analytics
     */
    function loadGoogleAnalytics() {
        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
        m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', 'UA-86723734-1', 'auto');
        ga('send', 'pageview');

        console.log('Google Analytics loaded with user consent');
    }

    /**
     * Load GetSiteControl
     */
    function loadGetSiteControl() {
        (function (w,i,d,g,e,t,s) {w[d] = w[d]||[];t= i.createElement(g);
        t.async=1;t.src=e;s=i.getElementsByTagName(g)[0];s.parentNode.insertBefore(t, s);
        })(window, document, '_gscq','script','//widgets.getsitecontrol.com/59310/script.js');

        console.log('GetSiteControl loaded with user consent');
    }

    /**
     * Load all tracking scripts
     */
    function loadTrackingScripts() {
        loadGoogleAnalytics();
        loadGetSiteControl();
    }

    /**
     * Show consent banner
     */
    function showConsentBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.classList.add('show');
        }
    }

    /**
     * Hide consent banner
     */
    function hideConsentBanner() {
        const banner = document.querySelector('.cookie-consent-banner');
        if (banner) {
            banner.classList.remove('show');
        }
    }

    /**
     * Show cookie settings modal
     */
    function showCookieSettings() {
        const modal = document.querySelector('.cookie-settings-overlay');
        if (modal) {
            modal.classList.add('show');
        }
    }

    /**
     * Hide cookie settings modal
     */
    function hideCookieSettings() {
        const modal = document.querySelector('.cookie-settings-overlay');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    /**
     * Handle consent acceptance
     */
    function handleAccept() {
        saveConsent(CONSENT_GRANTED);
        loadTrackingScripts();
        hideConsentBanner();
        hideCookieSettings();
    }

    /**
     * Handle consent decline
     */
    function handleDecline() {
        saveConsent(CONSENT_DENIED);
        hideConsentBanner();
        hideCookieSettings();
        console.log('Tracking scripts declined by user');
    }

    /**
     * Load cookie consent HTML from external file
     */
    function loadConsentHTML() {
        return fetch('cookie-consent.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to load cookie consent HTML');
                }
                return response.text();
            })
            .then(html => {
                // Inject HTML into the page
                document.body.insertAdjacentHTML('beforeend', html);
                return true;
            })
            .catch(error => {
                console.error('Error loading cookie consent:', error);
                return false;
            });
    }

    /**
     * Initialize consent manager
     */
    function init() {
        // Load HTML first, then initialize
        loadConsentHTML().then(function(success) {
            if (!success) {
                console.error('Failed to initialize cookie consent system');
                return;
            }

            // Check if user has already made a choice
            if (hasConsentChoice()) {
                if (hasConsent()) {
                    loadTrackingScripts();
                }
            } else {
                // Show consent modal after a short delay
                setTimeout(showCookieSettings, 1000);
            }

            // Set up event listeners
            const acceptBtn = document.querySelector('.cookie-consent-accept');
            const declineBtn = document.querySelector('.cookie-consent-decline');
            const settingsAcceptBtn = document.querySelector('.cookie-settings-accept');
            const settingsDeclineBtn = document.querySelector('.cookie-settings-decline');
            const settingsLinks = document.querySelectorAll('.cookie-settings-link');

            if (acceptBtn) {
                acceptBtn.addEventListener('click', handleAccept);
            }

            if (declineBtn) {
                declineBtn.addEventListener('click', handleDecline);
            }

            if (settingsAcceptBtn) {
                settingsAcceptBtn.addEventListener('click', handleAccept);
            }

            if (settingsDeclineBtn) {
                settingsDeclineBtn.addEventListener('click', handleDecline);
            }

            settingsLinks.forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    showCookieSettings();
                });
            });
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose functions globally for manual control if needed
    window.CookieConsent = {
        grant: handleAccept,
        deny: handleDecline,
        reset: function() {
            localStorage.removeItem(CONSENT_STORAGE_KEY);
            document.cookie = CONSENT_STORAGE_KEY + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            location.reload();
        },
        showBanner: showConsentBanner,
        showSettings: showCookieSettings
    };

})();
