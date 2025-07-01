document.addEventListener('DOMContentLoaded', function() {
    // Function to load HTML partials
    async function loadHTML(url, elementId) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            document.getElementById(elementId).innerHTML = data;
        } catch (error) {
            console.error(`Could not load ${url}:`, error);
        }
    }

    // Load header and footer
    loadHTML('header.html', 'header-placeholder')
        .then(() => {
            // Once header is loaded, attach its specific event listeners
            // Header scroll effect
            window.addEventListener('scroll', function() {
                const header = document.getElementById('header');
                if (header) { // Check if header exists before adding/removing class
                    if (window.scrollY > 100) {
                        header.classList.add('scrolled');
                    } else {
                        header.classList.remove('scrolled');
                    }
                }
            });

            // Mobile Menu Functionality (Ensure these elements exist after header is loaded)
            const hamburgerMenu = document.getElementById('hamburgerMenu');
            const mobileNavOverlay = document.getElementById('mobileNavOverlay');
            const closeMobileNav = document.getElementById('closeMobileNav');
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-overlay .mobile-nav-link');

            function toggleMobileMenu() {
                if (mobileNavOverlay && hamburgerMenu) {
                    mobileNavOverlay.classList.toggle('active');
                    hamburgerMenu.querySelector('i').classList.toggle('fa-bars');
                    hamburgerMenu.querySelector('i').classList.toggle('fa-times');
                    document.body.classList.toggle('no-scroll');
                }
            }

            if (hamburgerMenu) {
                hamburgerMenu.addEventListener('click', toggleMobileMenu);
            }
            if (closeMobileNav) {
                closeMobileNav.addEventListener('click', toggleMobileMenu);
            }

            // Close mobile menu when a direct link (without submenu) is clicked
            mobileNavLinks.forEach(link => {
                if (!link.dataset.target) {
                    link.addEventListener('click', () => {
                        if (mobileNavOverlay && mobileNavOverlay.classList.contains('active')) {
                            toggleMobileMenu();
                        }
                    });
                }
            });

            // Mobile submenu toggle (accordion behavior)
            document.querySelectorAll('.mobile-nav-link[data-target]').forEach(toggle => {
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    const targetId = this.dataset.target;
                    const targetSubmenu = document.getElementById(targetId);
                    
                    document.querySelectorAll('.mobile-nav-overlay .dropdown-menu.active').forEach(openSubmenu => {
                        if (openSubmenu.id !== targetId) {
                            openSubmenu.classList.remove('active');
                            openSubmenu.previousElementSibling.classList.remove('expanded');
                        }
                    });

                    if (targetSubmenu) {
                        targetSubmenu.classList.toggle('active');
                    }
                    this.classList.toggle('expanded');
                });
            });

            // Smooth scrolling for anchor links (if any) - ensure this is here if needed for internal anchors
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    if (targetId && targetId !== '#') {
                        document.querySelector(targetId).scrollIntoView({
                            behavior: 'smooth'
                        });
                    }
                });
            });
        });

    loadHTML('footer.html', 'footer-placeholder');
});