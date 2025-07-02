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
            const hamburgerMenu = document.getElementById('hamburgerMenu'); // The hamburger button
            const mobileNavOverlay = document.getElementById('mobileNavOverlay'); //
            const closeMobileNav = document.getElementById('closeMobileNav'); // The cross button
            const mobileNavLinks = document.querySelectorAll('.mobile-nav-overlay a'); // All links in overlay

            function toggleMobileMenu() {
                if (mobileNavOverlay && hamburgerMenu && closeMobileNav) {
                    mobileNavOverlay.classList.toggle('active');
                    document.body.classList.toggle('no-scroll');

                    // Toggle visibility of hamburger and close icons
                    if (mobileNavOverlay.classList.contains('active')) {
                        hamburgerMenu.style.display = 'none'; // Hide hamburger
                        closeMobileNav.style.display = 'block'; // Show cross
                    } else {
                        // This block should only execute if the screen size is mobile
                        // The media query in CSS will handle initial display of hamburgerMenu
                        // For the close button, we explicitly hide it
                        hamburgerMenu.style.display = ''; // Reset to default (block via CSS media query)
                        closeMobileNav.style.display = 'none'; // Hide cross
                    }
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
                // Only add click listener for closing if the link does NOT have a data-target
                if (!link.closest('.dropdown-menu')) { // Exclude links within dropdowns too, as they should just open submenus
                    link.addEventListener('click', () => {
                        // Ensure it's not a submenu toggle itself
                        if (!link.hasAttribute('data-target') && mobileNavOverlay.classList.contains('active')) {
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
                            // Find the parent mobile-nav-link that controls this submenu and remove 'expanded' class
                            const controllingLink = document.querySelector(`.mobile-nav-link[data-target="${openSubmenu.id}"]`);
                            if (controllingLink) {
                                controllingLink.classList.remove('expanded');
                            }
                        }
                    });

                    if (targetSubmenu) {
                        targetSubmenu.classList.toggle('active');
                    }
                    this.classList.toggle('expanded');
                });
            });

            // Smooth scrolling for anchor links
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    if (targetId && targetId !== '#') {
                        document.querySelector(targetId).scrollIntoView({
                            behavior: 'smooth'
                        });
                        // Close mobile menu after smooth scroll
                        if (mobileNavOverlay.classList.contains('active')) {
                            toggleMobileMenu();
                        }
                    }
                });
            });

            // Initial state: Hide close button on page load
            if (closeMobileNav) {
                closeMobileNav.style.display = 'none';
            }
            // Ensure hamburger is visible on mobile on load.
            // This relies on the CSS media query for .hamburger-menu
            // and the display setting in the toggleMobileMenu function.
        });

    loadHTML('footer.html', 'footer-placeholder');
});