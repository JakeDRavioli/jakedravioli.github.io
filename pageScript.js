// =================================================================
//                      PAGESCRIPT.JS (v3.3 - Manual Effect Triggering)
// =================================================================

// --- THEME CONFIGURATION ---
const GLOBAL_DEFAULT_THEME = 'default';
const THEME_STORAGE_KEY = 'user-selected-theme';
const ALL_THEME_CLASSES = [
    'light-theme', 'halloween-theme', 'synthwave-theme', 'terminal-theme',
    'midnight-theme', 'navy-gold-theme', 'christmas-theme', 'easter-theme',
    'new-years-theme', 'autumn-theme',"legacy-theme","cursed-theme"
];


const pfpTooltips = {
    'default': 'Hi there! :)',
    'light-theme': 'Ow. My retinas. They hurt.',
    'legacy-theme': 'so retro......',
    'cursed-theme': 'what have you done...',
    'terminal-theme': 'hi lol.',
    'synthwave-theme': 'vibin\' ravioli',
    'halloween-theme': 'YOUR TAKING TOO LONG',
    'christmas-theme': 'festive ravioli',
    "new-years-theme": "festive ravioli but for another reason entirely",
    "easter-theme": "bunny",
    "autumn-theme": "best season, change my mind",
    "navy-gold-theme": "the most 'out there' theme",
    "midnight-theme": "it's the poster boy!"
};


// =================================================================
//                  SEASONAL EFFECTS MANAGER
// =================================================================

const seasonalEffectsManager = {
    EFFECTS_STORAGE_KEY: 'seasonal-effects-enabled',
    isInitialized: false,
    currentEffectInterval: null,
    newYearCheckInterval: null,
    effectsContainer: null,
    styleElement: null,

    // All the CSS from seasonal.html is now stored here, plus the new toggle switch styles.
    css: `
        #seasonal-effects-package{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999;}
        .seasonal-item{position:absolute;user-select:none;}
        .halloween-item{bottom:-100px;animation:rise-up linear infinite;}
        @keyframes rise-up{0%{transform:translateY(0) rotate(0deg);opacity:1;}100%{transform:translateY(-120vh) rotate(360deg);opacity:0;}}
        .snowflake,.snow-circle{top:-50px;animation-timing-function:linear;animation-iteration-count:infinite;}
        .snowflake{color:#fff;}
        .snow-circle{background-color:white;border-radius:50%;}
        @keyframes fall{0%{transform:translate(0px,0);opacity:1;}100%{transform:translate(100px,105vh);opacity:0;}}
        @keyframes fall-sway{0%{transform:translate(0px,0);opacity:1;}100%{transform:translate(-100px,105vh);opacity:0;}}
        .flutter-item{top:-50px;animation:flutter linear infinite;}
        @keyframes flutter{0%{transform:translate(0,0) rotateZ(0deg) rotateY(0deg);opacity:1;}100%{transform:translate(100px,105vh) rotateZ(360deg) rotateY(720deg);opacity:0;}}
        .firework-shell{position:absolute;bottom:0;width:5px;height:15px;border-radius:50%;animation:launch ease-out infinite;}
        @keyframes launch{0%{transform:translateY(0);opacity:1;}50%{opacity:1;}100%{transform:translateY(-80vh);opacity:0;}}
        .firework-particle{position:absolute;width:5px;height:5px;border-radius:50%;animation:explode .8s ease-out forwards;}
        @keyframes explode{0%{transform:translate(0,0) scale(1);opacity:1;}100%{transform:var(--explode-transform) scale(0);opacity:0;}}
        #new-year-message{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0);color:white;font-size:3rem;font-weight:bold;text-shadow:0 0 15px black;text-align:center;z-index:10000;animation:pop-in-message .5s .5s ease-out forwards;}
        @keyframes pop-in-message{0%{transform:translate(-50%,-50%) scale(0);opacity:0;}100%{transform:translate(-50%,-50%) scale(1);opacity:1;}}
        .confetti{position:absolute;opacity:0;animation:confetti-fall 3s ease-out forwards;}
        @keyframes confetti-fall{0%{transform:translateY(-20vh) rotateZ(0deg);opacity:1;}100%{transform:translateY(120vh) rotateZ(720deg);opacity:0;}}
        .screen-flash{position:fixed;top:0;left:0;width:100%;height:100%;opacity:0;animation:flash-effect .7s ease-out;z-index:9998;}
        @keyframes flash-effect{0%,100%{opacity:0;}50%{opacity:.2;}}
        .theme-option-box-fullwidth{grid-column:1 / -1;display:flex;justify-content:space-between;align-items:center;padding:12px;border-radius:10px;background-color:var(--color-accent-tertiary);color:var(--color-text-main);border:1px solid var(--color-accent-tertiary-light);}
        .switch{position:relative;display:inline-block;width:50px;height:28px;}
        .switch input{opacity:0;width:0;height:0;}
        .slider{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background-color:#444;transition:.4s;}
        .slider:before{position:absolute;content:"";height:20px;width:20px;left:4px;bottom:4px;background-color:white;transition:.4s;}
        input:checked+.slider{background-color:var(--color-accent-primary);}
        input:focus+.slider{box-shadow:0 0 1px var(--color-accent-primary);}
        input:checked+.slider:before{transform:translateX(22px);}
        .slider.round{border-radius:34px;}
        .slider.round:before{border-radius:50%;}
    `,

    // --- Effect Creation Functions ---
    createHalloweenItems() { const items = ['🎃', '🍬', '🍭', '👻']; const item = document.createElement('div'); item.className = 'seasonal-item halloween-item'; item.innerHTML = items[Math.floor(Math.random() * items.length)]; item.style.left = `${Math.random() * 100}vw`; item.style.fontSize = `${Math.random() * 1.7 + 0.8}rem`; item.style.animationDuration = `${Math.random() * 7 + 5}s`; this.effectsContainer.appendChild(item); setTimeout(() => item.remove(), 12000); },
    createWinterItems() { const item = document.createElement('div'); item.className = 'seasonal-item'; if (Math.random() > 0.75) { item.classList.add('snowflake'); item.innerHTML = '❄️'; item.style.fontSize = `${Math.random() * 1.3 + 0.5}rem`; } else { item.classList.add('snow-circle'); const size = Math.random() * 12 + 3; item.style.width = `${size}px`; item.style.height = `${size}px`; } item.style.left = `${Math.random() * 100}vw`; item.style.animationDuration = `${Math.random() * 13 + 7}s`; item.style.animationName = Math.random() > 0.5 ? 'fall' : 'fall-sway'; item.style.opacity = Math.random() * 0.7 + 0.3; this.effectsContainer.appendChild(item); setTimeout(() => item.remove(), 20000); },
    createFlutterItem(type) { const items = type === 'spring' ? ['🌸', '💮'] : ['🍂', '🍁']; const item = document.createElement('div'); item.className = 'seasonal-item flutter-item'; item.innerHTML = items[Math.floor(Math.random() * items.length)]; item.style.left = `${Math.random() * 100}vw`; item.style.fontSize = `${Math.random() * 1 + 0.7}rem`; item.style.animationDuration = `${Math.random() * 10 + 8}s`; this.effectsContainer.appendChild(item); setTimeout(() => item.remove(), 18000); },
    createFirework() { const colors = ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec', '#3a86ff']; const shell = document.createElement('div'); shell.className = 'firework-shell'; const color = colors[Math.floor(Math.random() * colors.length)]; shell.style.background = `linear-gradient(to top, ${color}, transparent)`; shell.style.left = `${Math.random() * 80 + 10}vw`; const duration = Math.random() * 1.5 + 1; shell.style.animationDuration = `${duration}s`; shell.style.animationDelay = `${Math.random() * 2}s`; this.effectsContainer.appendChild(shell); setTimeout(() => { const explosionY = '20vh'; const explosionX = shell.style.left; shell.remove(); const particleCount = Math.floor(Math.random() * 30) + 20; for (let i = 0; i < particleCount; i++) { const particle = document.createElement('div'); particle.className = 'firework-particle'; particle.style.left = explosionX; particle.style.top = explosionY; particle.style.backgroundColor = color; const angle = Math.random() * 360; const distance = Math.random() * 80 + 40; const x = Math.cos(angle * (Math.PI / 180)) * distance; const y = Math.sin(angle * (Math.PI / 180)) * distance; particle.style.setProperty('--explode-transform', `translate(${x}px, ${y}px)`); this.effectsContainer.appendChild(particle); setTimeout(() => particle.remove(), 800); } }, duration * 1000 + parseFloat(shell.style.animationDelay || 0) * 1000); },
    triggerNewYearCelebration(force = false) { this.stopCurrentEffect(); const year = new Date().getFullYear(); const storageKey = `newYearShown-${year}`; if (localStorage.getItem(storageKey) && !force) return; const flashColors = ['#ffbe0b', '#ff006e', '#3a86ff']; flashColors.forEach((color, index) => { setTimeout(() => { const flash = document.createElement('div'); flash.className = 'screen-flash'; flash.style.backgroundColor = color; this.effectsContainer.appendChild(flash); setTimeout(() => flash.remove(), 700); }, index * 300); }); const message = document.createElement('div'); message.id = 'new-year-message'; message.innerHTML = `Happy New Year!<br>${year}`; this.effectsContainer.appendChild(message); const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800']; for (let i = 0; i < 250; i++) { const confetti = document.createElement('div'); const size = Math.random() * 8 + 8; confetti.className = 'confetti'; confetti.style.width = `${size}px`; confetti.style.height = `${size}px`; confetti.style.left = `${Math.random() * 100}vw`; confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]; confetti.style.animationDelay = `${Math.random() * 0.5}s`; confetti.style.transform = `rotate(${Math.random() * 360}deg)`; this.effectsContainer.appendChild(confetti); } if (!force) { localStorage.setItem(storageKey, 'true'); } setTimeout(() => { if (message.parentElement) { this.effectsContainer.innerHTML = ''; } }, 6000); },

    // --- Effect Control ---
    startEffect(effectName) {
        this.stopCurrentEffect();
        const effectFunctions = {
            halloween: { create: this.createHalloweenItems.bind(this), interval: 500 },
            winter: { create: this.createWinterItems.bind(this), interval: 200 },
            spring: { create: () => this.createFlutterItem('spring'), interval: 400 },
            autumn: { create: () => this.createFlutterItem('autumn'), interval: 500 },
            newyear: { create: this.createFirework.bind(this), interval: 300 },
        };

        const effect = effectFunctions[effectName];
        if (effect && effect.interval) {
            this.currentEffectInterval = setInterval(effect.create, effect.interval);
        }
    },
    
    stopCurrentEffect() {
        if (this.currentEffectInterval) clearInterval(this.currentEffectInterval);
        if (this.newYearCheckInterval) clearInterval(this.newYearCheckInterval);
        this.currentEffectInterval = null;
        this.newYearCheckInterval = null;
        if (this.effectsContainer) this.effectsContainer.innerHTML = '';
    },

    cleanupLocalStorage() { const now = new Date(); if (now.getMonth() !== 0 || now.getDate() !== 1) { Object.keys(localStorage).forEach(key => { if (key.startsWith('newYearShown-')) { localStorage.removeItem(key); } }); } },

    autoEnableEffect() {
        const themeDetails = getAutomaticThemeDetails();
        this.runEffectForTheme(themeDetails.theme);
    },
    
    runEffectForTheme(themeName) {
        if (localStorage.getItem(this.EFFECTS_STORAGE_KEY) === 'false' || !this.isInitialized) {
            this.stopCurrentEffect();
            return;
        }

        let activeEffect = null;
        switch (themeName) {
            case 'autumn-theme': activeEffect = 'autumn'; break;
            case 'halloween-theme': activeEffect = 'halloween'; break;
            case 'christmas-theme': activeEffect = 'winter'; break;
            case 'new-years-theme': activeEffect = 'newyear'; break;
            case 'easter-theme': activeEffect = 'spring'; break;
            default:
                this.stopCurrentEffect();
                return;
        }

        const now = new Date();
        if (themeName === 'new-years-theme' && now.getMonth() === 0 && now.getDate() === 1) {
            this.triggerNewYearCelebration();
        } else if (activeEffect) {
            this.startEffect(activeEffect);
        }
    },

    start() {
        if (this.isInitialized || localStorage.getItem(this.EFFECTS_STORAGE_KEY) === 'false') {
            return;
        }
        this.isInitialized = true;
        const packageDiv = document.createElement('div');
        packageDiv.id = 'seasonal-effects-package';
        packageDiv.innerHTML = '<div id="effects-container"></div>';
        document.body.appendChild(packageDiv);
        this.effectsContainer = document.querySelector('#effects-container');
        this.cleanupLocalStorage();
        this.autoEnableEffect();
    },

    stop() {
        this.stopCurrentEffect();
        const packageDiv = document.getElementById('seasonal-effects-package');
        if (packageDiv) packageDiv.remove();
        this.isInitialized = false;
    },

    initialize() {
        if (document.getElementById('seasonal-effects-styles')) return;
        this.styleElement = document.createElement('style');
        this.styleElement.id = 'seasonal-effects-styles';
        this.styleElement.textContent = this.css;
        document.head.appendChild(this.styleElement);
    }
};

// =================================================================
//                  CORE INITIALIZATION & THEME LOGIC
// =================================================================

function ensureUtf8MetaTag() {
    if (!document.querySelector('meta[charset="UTF-8"]')) {
        const meta = document.createElement('meta');
        meta.setAttribute('charset', 'UTF-8');
        document.head.prepend(meta);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ensureUtf8MetaTag();
    loadAndApplyTheme();
    initializeAutoThemeListener();

    if (window.location.hash === '#contacts') {
        const contactsSection = document.getElementById('contacts');
        if (contactsSection) {
            contactsSection.classList.add('highlight-flash');
            setTimeout(() => contactsSection.classList.remove('highlight-flash'), 6000);
        }
    }
    includeHTML();
    initializeSite();
    
    seasonalEffectsManager.initialize(); 
    if (localStorage.getItem(seasonalEffectsManager.EFFECTS_STORAGE_KEY) !== 'false') {
        seasonalEffectsManager.start();
    }
});

function getAutomaticThemeDetails() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const year = today.getFullYear();
    const dateString = today.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });

    if ((month === 8 && day >= 15) || (month === 9) || (month === 10 && day <= 15)) return { theme: 'autumn-theme', reason: `The current theme is Autumn because today's date is ${dateString}.` };
    if ((month === 10 && day >= 16) || (month === 11 && day <= 1)) return { theme: 'halloween-theme', reason: `The current theme is Halloween because today's date is ${dateString}.` };
    if ((month === 11 && day >= 2) || (month === 12 && day <= 27)) return { theme: 'christmas-theme', reason: `The current theme is Christmas because today's date is ${dateString}.` };
    if ((month === 12 && day >= 28) || (month === 1 && day <= 10)) return { theme: 'new-years-theme', reason: `The current theme is New Year's because today's date is ${dateString}.` };
    
    const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), easterMonth = Math.floor((h + l - 7 * m + 114) / 31), easterDay = ((h + l - 7 * m + 114) % 31) + 1;
    const easterDate = new Date(year, easterMonth - 1, easterDay), easterStart = new Date(easterDate), easterEnd = new Date(easterDate);
    easterStart.setDate(easterDate.getDate() - 8);
    easterEnd.setDate(easterDate.getDate() + 8);
    if (today >= easterStart && today <= easterEnd) return { theme: 'easter-theme', reason: `The current theme is Easter because today's date is ${dateString}.` };

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? { theme: 'default', reason: "The default dark theme is active based on your system's preference." } : { theme: 'light-theme', reason: "The light theme is active based on your system's preference." };
}

function applyTheme(theme) {
    const body = document.body;
    body.classList.remove(...ALL_THEME_CLASSES);

    let finalTheme = theme;

    if (theme === 'auto') {
        const autoDetails = getAutomaticThemeDetails();
        finalTheme = autoDetails.theme;
        if (finalTheme !== 'default') {
             body.classList.add(finalTheme);
        }
    } else if (theme && theme !== 'default') {
        body.classList.add(theme);
    }
    const pfpElement = document.getElementById('profile-picture');
    if (pfpElement) {
        const tooltipText = pfpTooltips[theme] || pfpTooltips['default'];
        pfpElement.setAttribute('title', tooltipText);
    }
    seasonalEffectsManager.runEffectForTheme(finalTheme);
}

function loadAndApplyTheme() {
    if (window.location.href.includes('rebellioustakeover')) {
        applyTheme('default');
        return;
    }
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        const automaticTheme = getAutomaticThemeDetails();
        applyTheme(automaticTheme.theme);
    }
}

function handleSystemThemeChange() {
    if (localStorage.getItem(THEME_STORAGE_KEY) === 'auto') {
        applyTheme('auto');
    }
}

function initializeAutoThemeListener() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.removeEventListener('change', handleSystemThemeChange);
    mediaQuery.addEventListener('change', handleSystemThemeChange);
}

// =================================================================
//                  SITE INITIALIZATION & MODULAR FUNCTIONS
// =================================================================

function initializeSite() {
    const siteInitializer = setInterval(() => {
        if (document.querySelectorAll('[include-html]').length === 0) {
            clearInterval(siteInitializer);
            initializeMobileMenu();
            updateDynamicInfo();
            document.querySelectorAll('[data-typewriter]').forEach(initializeTypewriter);
            initializeDonateModal();
            initializeThemeSwitcher();
            initializeDrawerTooltip(); // *** ADD THIS LINE ***
        }
    }, 100);
}

// *** ADD THIS NEW FUNCTION ***
function initializeDrawerTooltip() {
    const pfpContainer = document.getElementById('pfp-container');
    const pfpImage = document.getElementById('profile-picture');
    const tooltipContainer = document.getElementById('mobile-tooltip-container');
    const tooltipTextElement = document.getElementById('mobile-tooltip-text');

    if (pfpContainer && pfpImage && tooltipContainer && tooltipTextElement) {
        pfpContainer.addEventListener('click', () => {
            if (!pfpContainer.classList.contains('drawer-open')) {
                const currentTitle = pfpImage.getAttribute('title');
                if (currentTitle) {
                    tooltipTextElement.textContent = currentTitle;
                }
            }
            pfpContainer.classList.toggle('drawer-open');
        });
    }
}
// *** END OF NEW FUNCTION ***

function includeHTML() {
    var z, i, elmnt, file, xhttp;
    z = document.getElementsByTagName("*");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        file = elmnt.getAttribute("include-html");
        if (file) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function() {
                if (this.readyState == 4) {
                    if (this.status == 200) { elmnt.innerHTML = this.responseText; }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    elmnt.removeAttribute("include-html");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            return;
        }
    }
}

function initializeMobileMenu() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    if (!hamburgerBtn || !mobileNavOverlay) return;
    const toggleMenu = () => {
        const isActive = hamburgerBtn.classList.contains('active');
        hamburgerBtn.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = isActive ? '' : 'hidden';
    };
    hamburgerBtn.addEventListener('click', toggleMenu);
    mobileNavOverlay.addEventListener('click', (e) => { if (e.target === mobileNavOverlay) toggleMenu(); });
    mobileNavOverlay.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { if (mobileNavOverlay.classList.contains('active')) toggleMenu(); }));
}

function updateDynamicInfo() {
    const yearElement = document.getElementById('copyright-year');
    if (yearElement) yearElement.textContent = new Date().getFullYear();
    const ageElement = document.getElementById('age');
    if (ageElement) {
        const age = Math.floor((Date.now() - 1113264000000) / (1000 * 60 * 60 * 24 * 365.25));
        ageElement.textContent = age;
    }
}

function initializeTypewriter(el) {
    const initialDelay = parseInt(el.dataset.initialDelay) || 0;
    const runOnce = el.dataset.runOnce === 'true';
    const normalWords = el.dataset.typewriter.split(',');
    const rareWords = el.dataset.rareWords?.split(',') || [];
    let currentWord = (rareWords.length > 0 && Math.random() < 0.1) ? rareWords[Math.floor(Math.random() * rareWords.length)] : normalWords[Math.floor(Math.random() * normalWords.length)];
    let charIndex = 0, isDeleting = false, isWaiting = true;
    el.innerHTML = `<span>&nbsp;</span><span class="typewriter-cursor"></span>`;
    const run = () => {
        let timeout;
        if (isWaiting) { isWaiting = false; timeout = 100; }
        else if (isDeleting) { charIndex--; timeout = 25; }
        else { charIndex++; timeout = 50; }
        const textToDisplay = (typeof currentWord === 'string') ? currentWord.substring(0, charIndex) : '';
        el.innerHTML = `<span>${textToDisplay || '&nbsp;'}</span><span class="typewriter-cursor"></span>`;
        if (!isWaiting && !isDeleting && charIndex === (currentWord?.length || 0)) {
            if (runOnce) { el.innerHTML = `<span>${currentWord}</span>`; return; }
            isDeleting = true; isWaiting = true; timeout = 2000;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false; isWaiting = true;
            currentWord = (rareWords.length > 0 && Math.random() < 0.1) ? rareWords[Math.floor(Math.random() * rareWords.length)] : normalWords[Math.floor(Math.random() * normalWords.length)];
            timeout = 500;
        }
        setTimeout(run, timeout);
    };
    setTimeout(run, initialDelay);
}

function initializeDonateModal() {
    const modal = document.getElementById('donate-modal');
    const openBtns = [document.getElementById('open-donate-button'), document.getElementById('open-donate-button-mobile')];
    const closeBtn = document.querySelector('.close-donate-modal');
    if (!modal || !closeBtn) return;
    const openModal = (e) => { e.preventDefault(); modal.classList.add('active'); };
    const closeModal = () => modal.classList.remove('active');
    openBtns.forEach(btn => btn?.addEventListener('click', openModal));
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && modal.classList.contains('active')) closeModal(); });
}

function initializeThemeSwitcher() {
    if (window.location.href.includes('rebellioustakeover')) {
        const openBtn = document.getElementById('open-theme-switcher'), openBtnMobile = document.getElementById('open-theme-switcher-mobile');
        if (openBtn) openBtn.style.display = 'none';
        if (openBtnMobile) openBtnMobile.style.display = 'none';
        return;
    }
    const modal = document.getElementById('theme-switcher-modal'), openBtns = [document.getElementById('open-theme-switcher'), document.getElementById('open-theme-switcher-mobile')], closeBtn = document.querySelector('.close-theme-switcher'), themeOptions = document.querySelectorAll('.theme-option-box[data-theme]'), autoThemeBtn = document.getElementById('auto-theme-btn'), effectsToggle = document.getElementById('seasonal-effects-toggle');
    if (!modal || !closeBtn || !autoThemeBtn) return;
    const openModal = (e) => {
        e.preventDefault();
        const description = modal.querySelector('p');
        const oldReason = description.querySelector('.theme-reason');
        if (oldReason) oldReason.remove();
        const automaticTheme = getAutomaticThemeDetails();
        const reasonSpan = document.createElement('small');
        reasonSpan.className = 'theme-reason';
        reasonSpan.style.cssText = 'display:block; margin-top:10px; color:var(--color-text-dark);';
        reasonSpan.textContent = localStorage.getItem(THEME_STORAGE_KEY) ? 'Your chosen theme is currently active.' : automaticTheme.reason;
        description.appendChild(reasonSpan);
        modal.classList.add('active');
    };
    const closeModal = () => modal.classList.remove('active');
    openBtns.forEach(btn => btn?.addEventListener('click', openModal));
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && modal.classList.contains('active')) closeModal(); });
    themeOptions.forEach(option => option.addEventListener('click', (e) => {
        e.preventDefault();
        const selectedTheme = e.currentTarget.dataset.theme;
        localStorage.setItem(THEME_STORAGE_KEY, selectedTheme);
        applyTheme(selectedTheme);
        closeModal();
    }));
    autoThemeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(THEME_STORAGE_KEY);
        const automaticTheme = getAutomaticThemeDetails();
        applyTheme(automaticTheme.theme);
        closeModal();
    });
    // --- New Effects Toggle Logic ---
    if (effectsToggle) {
        effectsToggle.checked = localStorage.getItem(seasonalEffectsManager.EFFECTS_STORAGE_KEY) !== 'false';
        effectsToggle.addEventListener('change', () => {
            if (effectsToggle.checked) {
                localStorage.setItem(seasonalEffectsManager.EFFECTS_STORAGE_KEY, 'true');
                seasonalEffectsManager.start();
                // [FIXED] Re-run the effect logic based on the currently applied theme
                const currentTheme = [...document.body.classList].find(c => ALL_THEME_CLASSES.includes(c)) || 'default';
                seasonalEffectsManager.runEffectForTheme(currentTheme);
            } else {
                localStorage.setItem(seasonalEffectsManager.EFFECTS_STORAGE_KEY, 'false');
                seasonalEffectsManager.stop();
            }
        });
    }
}