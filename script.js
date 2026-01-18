document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SCROLL REVEAL (Fade-in elements) ---
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(element => {
        observer.observe(element);
    });

    // --- 2. NAVBAR SCROLL EFFECT ---
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });

    // --- 3. ROBUST HORIZONTAL SCROLL & PARALLAX ---
    const scrollSection = document.querySelector('.horizontal-scroll-section');
    const stickyWrapper = document.querySelector('.sticky-wrapper');
    const mvGrid = document.querySelector('.mv-grid');
    const background = document.querySelector('.global-parallax');

    // State variables to sync "Resize" logic with "Scroll" logic
    let scrollState = {
        isVisible: false,
        trackHeight: 0,      // The scrollable vertical distance (drag distance)
        contentWidth: 0,     // Total width of MV cards
        viewportWidth: 0,
        buffer: 100          // Pixel buffer to prevent "fast exit" jumps
    };

    // A. CALCULATE DIMENSIONS (Responsive Friction)
    function setDimensions() {
        if (scrollSection && mvGrid) {
            // Disable on mobile
            if (window.innerWidth < 768) {
                scrollState.isVisible = false;
                scrollSection.style.height = 'auto';
                mvGrid.style.transform = 'none';
                return;
            }

            scrollState.isVisible = true;
            scrollState.viewportWidth = window.innerWidth;
            scrollState.contentWidth = mvGrid.scrollWidth;

            // distance to move horizontally
            const distToMove = scrollState.contentWidth - scrollState.viewportWidth;

            // Friction: Higher = Slower/Heavier scroll. 
            // 3.0 is good, but you can lower to 2.5 for "lighter" feel if needed.
            const friction = 3.0;

            // Calculate the ACTIVE scroll distance (The "Track")
            scrollState.trackHeight = distToMove * friction;

            // Total height = Active Track + 1 Screen Height (for the sticky duration)
            // REMOVED: The extra 'buffer' which caused the dead zone.
            const totalSectionHeight = scrollState.trackHeight + window.innerHeight;

            scrollSection.style.height = `${totalSectionHeight}px`;
        }
    }

    // B. SCROLL UPDATE LOOP (Smoothed)
    function updateVisuals() {
        const scrollY = window.scrollY;

        // 1. Parallax
        if (background) {
            const speed = parseFloat(background.getAttribute('data-speed')) || 0.1;
            background.style.transform = `translateY(${-scrollY * speed}px)`;
        }

        // 2. Horizontal Scroll
        if (scrollState.isVisible) {
            const sectionRect = scrollSection.getBoundingClientRect();
            const sectionTop = sectionRect.top;

            // Logic: The sticky container is active when sectionTop is between 0 and -trackHeight
            // We verify "is the section currently sticking?"

            if (sectionTop <= 0 && sectionTop > -scrollState.trackHeight) {
                // Calculate Progress precisely
                // 0 = Start, 1 = End
                const progress = Math.abs(sectionTop) / scrollState.trackHeight;

                // Map progress to Horizontal Distance
                const maxTranslate = scrollState.contentWidth - scrollState.viewportWidth;
                const translateX = progress * maxTranslate;

                mvGrid.style.transform = `translateX(-${translateX}px)`;

            } else if (sectionTop > 0) {
                // Not reached yet -> Reset
                mvGrid.style.transform = `translateX(0px)`;
            } else if (sectionTop <= -scrollState.trackHeight) {
                // Passed it -> Lock to end
                const maxTranslate = scrollState.contentWidth - scrollState.viewportWidth;
                mvGrid.style.transform = `translateX(-${maxTranslate}px)`;
            }
        }
    }

    // Initialize
    setDimensions();

    // Listeners
    window.addEventListener('resize', setDimensions);

    // High Performance Scroll Loop
    let isTicking = false;
    window.addEventListener('scroll', () => {
        if (!isTicking) {
            window.requestAnimationFrame(() => {
                updateVisuals();
                isTicking = false;
            });
            isTicking = true;
        }
    }, { passive: true });
    // --- 4. THEME TOGGLE LOGIC ---
    const themeToggleBtn = document.getElementById('theme-toggle');
    const sunIcon = document.querySelector('.sun-icon');
    const moonIcon = document.querySelector('.moon-icon');

    // Function to update icon visibility
    function updateIcons(isLightMode) {
        if (isLightMode) {
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'block';
        } else {
            sunIcon.style.display = 'block';
            moonIcon.style.display = 'none';
        }
    }

    // Function to update embed themes
    function updateEmbeds(isLightMode) {
        // Spotify
        const spotifyFrame = document.querySelector('.spotify iframe');
        if (spotifyFrame) {
            let src = spotifyFrame.src;
            // Spotify: theme=0 is dark. We'll try removing it or switching to white for light mode.
            // Using regex to replace or append.
            if (isLightMode) {
                // Switch to light (remove theme=0 or set theme=white if supported, verifying with remove first as per research)
                // Actually research said &theme=white might work. Let's try replacing theme=0 with theme=white.
                if (src.includes('theme=0')) {
                    src = src.replace('theme=0', 'theme=white');
                } else if (!src.includes('theme=white')) {
                    src += '&theme=white';
                }
            } else {
                // Switch to dark
                if (src.includes('theme=white')) {
                    src = src.replace('theme=white', 'theme=0');
                } else if (!src.includes('theme=0')) {
                    src += '&theme=0';
                }
            }
            if (spotifyFrame.src !== src) spotifyFrame.src = src;
        }

        // Apple Music
        const appleFrame = document.querySelector('.apple iframe');
        if (appleFrame) {
            let src = appleFrame.src;
            // Apple Music: Append/Update theme parameter
            const newTheme = isLightMode ? 'light' : 'dark';

            // Check if theme param exists
            if (src.includes('theme=')) {
                src = src.replace(/theme=[a-z]+/, `theme=${newTheme}`);
            } else {
                // Append it. Check if it has other params (it currently doesn't, but safe to check)
                const separator = src.includes('?') ? '&' : '?';
                src += `${separator}theme=${newTheme}`;
            }
            if (appleFrame.src !== src) appleFrame.src = src;
        }
    }

    // Check for saved user preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;

    // Apply initial theme
    if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
        document.body.classList.add('light-theme');
        updateIcons(true);
        updateEmbeds(true);
    } else {
        updateIcons(false);
        updateEmbeds(false);
    }

    // Event Listener
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const isLightMode = document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
            updateIcons(isLightMode);
            updateEmbeds(isLightMode);
        });
    }
});