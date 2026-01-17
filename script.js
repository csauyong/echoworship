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
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(5, 5, 5, 0.2)';
            navbar.style.backdropFilter = 'blur(5px)';
            navbar.style.webkitBackdropFilter = 'blur(5px)';
            navbar.style.padding = '1rem 3rem';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'blur(0px)';
            navbar.style.webkitBackdropFilter = 'blur(0px)';
            navbar.style.padding = '2rem 3rem';
            navbar.style.borderBottom = '1px solid transparent';
        }
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
    // A. CALCULATE DIMENSIONS (Responsive Friction)
    function setDimensions() {
        if (scrollSection && mvGrid) {
            // FIX for Mobile: Disable JS scroll logic entirely
            if (window.innerWidth < 768) {
                scrollState.isVisible = false;
                scrollSection.style.height = 'auto'; // Reset to auto
                mvGrid.style.transform = 'none'; // Clear any JS transform
                return;
            }

            scrollState.isVisible = true;
            scrollState.viewportWidth = window.innerWidth;
            scrollState.contentWidth = mvGrid.scrollWidth;

            // Calculate how far we physically need to move horizontally
            const distToMove = scrollState.contentWidth - scrollState.viewportWidth;

            // Desktop (Wheel) needs "weight" (1px move = 3px scroll)
            const friction = 3.0;

            // Calculate the required vertical height
            // We multiply the distance by friction, then add the viewport (for sticky), plus a buffer
            scrollState.trackHeight = (distToMove * friction);
            const totalSectionHeight = scrollState.trackHeight + window.innerHeight + scrollState.buffer;

            // Apply height to CSS
            scrollSection.style.height = `${totalSectionHeight}px`;
        }
    }

    // B. SCROLL UPDATE LOOP
    function updateVisuals() {
        // Stop if not visible (mobile)
        if (!scrollState.isVisible) return;

        const scrollY = window.scrollY;

        // 1. Parallax (Simple & Clean)
        if (background) {
            const speed = parseFloat(background.getAttribute('data-speed')) || 0.1;
            background.style.transform = `translateY(${-scrollY * speed}px)`;
        }

        // 2. Horizontal Scroll
        if (scrollState.isVisible) {
            const sectionRect = scrollSection.getBoundingClientRect();
            const sectionTop = sectionRect.top;

            // Check if we are in the active zone
            // We use trackHeight (calculated above) to know exactly when to stop
            if (sectionTop <= 0 && sectionTop > -(scrollState.trackHeight + scrollState.buffer)) {

                // Calculate Progress
                // "How many pixels have we scrolled?" / "How many pixels allow movement?"
                let progress = Math.abs(sectionTop) / scrollState.trackHeight;

                // Clamp progress between 0 and 1
                // This prevents the "fast exit" by freezing the cards for the last few pixels (the buffer)
                if (progress > 1) progress = 1;

                // Move the grid
                const translateX = progress * (scrollState.contentWidth - scrollState.viewportWidth);
                mvGrid.style.transform = `translateX(-${translateX}px)`;

            } else if (sectionTop > 0) {
                // Before section: Reset to 0
                // mvGrid.style.transform = `translateX(0px)`;
            } else {
                // After section: Lock to end
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
});