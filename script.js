document.addEventListener('DOMContentLoaded', function() {
    // Determine the base path for loading HTML partials (header.html, footer.html)
    let basePath = '';
    const pathSegments = window.location.pathname.split('/').filter(segment => segment !== '');

    // Adjust basePath to correctly navigate to root from subdirectories
    // If the current path is like /academics/curriculum.html, we need ../
    // If the current path is like /academics/, we also need ../
    // If the current path is at the root (/, /index.html), basePath remains ''
    if (pathSegments.length > 0) {
        // Check if the last segment is a file (contains a dot) or a directory name
        const lastSegment = pathSegments[pathSegments.length - 1];
        if (lastSegment.includes('.') || (pathSegments.length > 1 && !lastSegment.includes('.'))) {
            basePath = '../';
        }
    }

    // Function to load HTML partials
    async function loadHTML(url, elementId) {
        try {
            const response = await fetch(basePath + url);
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
            const header = document.getElementById('header');
            const currentPathname = window.location.pathname;

            // Determine if the current page is index.html (at root or explicit index.html)
            const isIndexPage = currentPathname === '/' ||
                                 currentPathname.endsWith('/index.html') ||
                                 currentPathname.endsWith('/index.htm'); // Include .htm just in case

            if (header) { // Ensure header element exists
                let lastScrollY = window.scrollY;
                const scrollHideThreshold = 100; // Pixels to scroll down before hiding header

                // For all pages, header should always be in the 'scrolled' state visually unless at top of index.html
                if (!isIndexPage || window.scrollY > 100) {
                    header.classList.add('scrolled');
                }

                window.addEventListener('scroll', function() {
                    const currentScrollY = window.scrollY;

                    // Add/remove 'scrolled' class for background/shadow effect, only on index.html, else always scrolled
                    if (isIndexPage) {
                        if (currentScrollY > 100) {
                            header.classList.add('scrolled');
                        } else {
                            header.classList.remove('scrolled');
                        }
                    } else {
                        // For all other pages, ensure 'scrolled' class is always present
                        header.classList.add('scrolled');
                    }

                    // Hide/show header based on scroll direction
                    // If scrolling down AND past the hide threshold AND header is not already hidden
                    if (currentScrollY > lastScrollY && currentScrollY > scrollHideThreshold) {
                        header.classList.add('header-hidden');
                    }
                    // If scrolling up AND header is hidden OR scrolling up significantly
                    else if (currentScrollY < lastScrollY) {
                        header.classList.remove('header-hidden');
                    }

                    lastScrollY = currentScrollY;
                });
            }

            // --- Mobile Menu Functionality (Remains largely the same) ---
            const hamburgerMenu = document.getElementById('hamburgerMenu');
            const mobileNavOverlay = document.getElementById('mobileNavOverlay');
            const closeMobileNav = document.getElementById('closeMobileNav');
            const mobileNavLinks = document.querySelectorAll('#mobileNavOverlay .mobile-nav-link');

            function toggleMobileMenu() {
                if (mobileNavOverlay && hamburgerMenu && closeMobileNav) {
                    mobileNavOverlay.classList.toggle('active');
                    document.body.classList.toggle('no-scroll');

                    if (mobileNavOverlay.classList.contains('active')) {
                        hamburgerMenu.style.display = 'none';
                        closeMobileNav.style.display = 'block';
                    } else {
                        hamburgerMenu.style.display = 'block';
                        closeMobileNav.style.display = 'none';
                    }
                }
            }

            if (hamburgerMenu) {
                hamburgerMenu.addEventListener('click', toggleMobileMenu);
            }

            if (closeMobileNav) {
                closeMobileNav.addEventListener('click', toggleMobileMenu);
            }

            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    if (!link.dataset.target) { // If it's not a dropdown toggle
                        toggleMobileMenu();
                    }
                });
            });

            // --- Desktop Dropdown Menu Functionality (Remains largely the same) ---
            document.querySelectorAll('.nav-dropdown-toggle').forEach(item => {
                item.addEventListener('click', function(event) {
                    event.preventDefault();
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        if (menu !== this.nextElementSibling) {
                            menu.classList.remove('active');
                            menu.previousElementSibling.classList.remove('expanded');
                        }
                    });
                    this.nextElementSibling.classList.toggle('active');
                    this.classList.toggle('expanded');
                });
            });

            // Close dropdowns when clicking outside
            document.addEventListener('click', function(event) {
                // Ensure click is not inside a nav item or mobile overlay itself
                if (!event.target.closest('nav ul li') && !event.target.closest('#mobileNavOverlay')) {
                    document.querySelectorAll('.dropdown-menu').forEach(menu => {
                        menu.classList.remove('active');
                        const toggleButton = menu.previousElementSibling;
                        if (toggleButton && toggleButton.classList.contains('expanded')) {
                            toggleButton.classList.remove('expanded');
                        }
                    });
                }
            });

            // --- Mobile Navigation Dropdown Toggles (Remains largely the same) ---
            document.querySelectorAll('.mobile-nav-link').forEach(item => {
                item.addEventListener('click', function(event) {
                    const targetId = this.dataset.target;
                    const targetSubmenu = document.getElementById(targetId);

                    if (targetId && targetSubmenu) {
                        event.preventDefault();
                        document.querySelectorAll('.dropdown-menu').forEach(menu => {
                            if (menu.id !== targetId && menu.closest('#mobileNavOverlay')) {
                                menu.classList.remove('active');
                                const parentLink = document.querySelector(`[data-target="${menu.id}"]`);
                                if (parentLink) {
                                    parentLink.classList.remove('expanded');
                                }
                            }
                        });
                        targetSubmenu.classList.toggle('active');
                        this.classList.toggle('expanded');
                    } else if (this.getAttribute('href') && this.getAttribute('href').startsWith('#') && this.getAttribute('href') !== '#') {
                        // Handle anchor links within the same page
                        event.preventDefault();
                        const id = this.getAttribute('href').substring(1);
                        const targetElement = document.getElementById(id);
                        if (targetElement) {
                            targetElement.scrollIntoView({ behavior: 'smooth' });
                            if (mobileNavOverlay.classList.contains('active')) {
                                toggleMobileMenu();
                            }
                        }
                    }
                });
            });

            // --- Smooth scrolling for anchor links (Remains largely the same) ---
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function (e) {
                    const href = this.getAttribute('href');
                    const currentFile = currentPathname.split('/').pop();
                    const linkPath = (this.pathname || '').split('/').pop();

                    if (href.startsWith('#') && href !== '#' && (currentFile === linkPath || linkPath === '')) {
                        e.preventDefault();
                        const targetId = href;
                        if (targetId && targetId !== '#') {
                            document.querySelector(targetId).scrollIntoView({
                                behavior: 'smooth'
                            });
                            if (mobileNavOverlay.classList.contains('active')) {
                                toggleMobileMenu();
                            }
                        }
                    }
                });
            });

            // --- Handle links with hashes navigating to different pages (Remains largely the same) ---
            document.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    // Check if the link is an internal link to a different page with a hash
                    if (href && href.includes('#') && !href.startsWith('#')) {
                        const [path, hash] = href.split('#');
                        let normalizedCurrentPath = currentPathname.replace(basePath, '').replace(/^\/|\/$/g, '');
                        let normalizedLinkPath = path.replace(/^\/|\/$/g, '');

                        // Normalize index.html for comparison
                        if (normalizedCurrentPath === '' || normalizedCurrentPath.endsWith('index.html')) {
                            normalizedCurrentPath = 'index.html';
                        }
                        if (normalizedLinkPath === '' || normalizedLinkPath.endsWith('index.html')) {
                            normalizedLinkPath = 'index.html';
                        }

                        // If the target path is different from the current path, navigate
                        if (normalizedLinkPath !== normalizedCurrentPath) {
                            e.preventDefault();
                            window.location.href = href;
                        }
                    } else if (href === 'index.html' && basePath !== '') {
                        // Special handling for "Home" link when in a subdirectory
                        // If href is exactly 'index.html' and we are in a subdirectory (basePath is not empty),
                        // then we want to go to the root index.html
                        e.preventDefault();
                        window.location.href = basePath + 'index.html'; // Construct the path relative to the root
                    }
                });
            });

            // Initial state: Hide close button on page load
            if (closeMobileNav) {
                closeMobileNav.style.display = 'none';
            }
        });

    loadHTML('footer.html', 'footer-placeholder');
});