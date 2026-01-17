document.addEventListener('DOMContentLoaded', () => {
    // Scroll Reveal Animation
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Only animate once
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.scroll-reveal');
    revealElements.forEach(element => {
        observer.observe(element);
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            // Scrolled State: Blurred & Slightly Tinted
            navbar.style.background = 'rgba(5, 5, 5, 0.2)';
            navbar.style.backdropFilter = 'blur(5px)';
            navbar.style.webkitBackdropFilter = 'blur(5px)';
            navbar.style.padding = '1rem 3rem';
            navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.1)';
        } else {
            // Top State: Fully Transparent
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'blur(0px)';
            navbar.style.webkitBackdropFilter = 'blur(0px)';
            navbar.style.padding = '2rem 3rem';
            navbar.style.borderBottom = '1px solid transparent';
        }
    });
    // Navbar Scroll Effect continued...


    // Horizontal Scroll Trigger
    const scrollSection = document.querySelector('.horizontal-scroll-section');
    const stickyWrapper = document.querySelector('.sticky-wrapper');
    const mvGrid = document.querySelector('.mv-grid');

    if (scrollSection && stickyWrapper && mvGrid) {
        window.addEventListener('scroll', () => {
            const sectionRect = scrollSection.getBoundingClientRect();
            const sectionTop = sectionRect.top;
            const sectionHeight = scrollSection.offsetHeight;
            const windowHeight = window.innerHeight;

            // Check if section is in view
            if (sectionTop <= 0 && sectionTop > -(sectionHeight - windowHeight)) {
                // Calculate how far we've scrolled into the section
                const scrolledDistance = Math.abs(sectionTop);

                // Max scrollable vertical distance
                const maxScroll = sectionHeight - windowHeight;

                // Horizontal scrollable width (track width - viewport width)
                // We use stickyWrapper.clientWidth to account for any potential scrollbars relative to the container
                const scrollWidth = mvGrid.scrollWidth - stickyWrapper.clientWidth;

                // Map vertical progress to horizontal offset
                // Using a slight ease for smoother feel could be nice, but direct mapping is more responsive
                const progress = scrolledDistance / maxScroll;
                const translateX = progress * scrollWidth;

                mvGrid.style.transform = `translateX(-${translateX}px)`;
            }
        });
    }

    // Parallax Effect
    const background = document.querySelector('.global-parallax');
    if (background) {
        // Get the speed from the data-speed attribute (0.3)
        const speed = background.getAttribute('data-speed');

        // Calculate the movement
        const yPos = -(window.pageYOffset * speed);

        // Apply the movement using transform for better performance
        background.style.transform = `translateY(${yPos}px)`;
    }
});
