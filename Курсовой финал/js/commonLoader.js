// --- START OF FILE js/commonLoader.js ---
document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    const loadHTML = async (url, element) => {
        if (!element) return;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} for ${url}`);
            }
            const html = await response.text();
            element.innerHTML = html;

            if (url.includes('_header.html')) {
               setTimeout(initializeHeaderLogic, 0);
            }

        } catch (error) {
            console.error(`Could not load HTML from ${url}:`, error);
            element.innerHTML = `<p style="color:red; text-align: center; padding: 10px;">Не удалось загрузить компонент (${url}).</p>`;
        }
    };

    Promise.all([
        loadHTML('_header.html', headerPlaceholder),
        loadHTML('_footer.html', footerPlaceholder)
    ]).catch(error => {
        console.error("Error loading header/footer components:", error);
    });

});

function initializeHeaderLogic() {
     console.log('Attempting to initialize header logic...');
    const header = document.getElementById('main-header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const mobileMenu = document.querySelector('.mobile-menu');

     if (!header) {
         console.error("Header initialization failed: #main-header not found.");
         return;
     }
      if (!mobileMenuToggle) {
         console.error("Header initialization failed: .mobile-menu-toggle not found.");
     }
      if (!mobileMenu) {
         console.error("Header initialization failed: .mobile-menu not found.");
     }
     if (!mobileMenuClose) {
          console.error("Header initialization failed: .mobile-menu-close not found.");
     }

     console.log('Header elements:', { header, mobileMenuToggle, mobileMenu, mobileMenuClose });

     let isScrolling;
     function handleScroll() {
         if (window.scrollY > 50) {
             header.classList.add('scrolled');
         } else {
             header.classList.remove('scrolled');
         }
     }

     function toggleMobileMenu() {
          if (!mobileMenu || !mobileMenuToggle) return;
         console.log('Toggling mobile menu');
         mobileMenu.classList.toggle('open');
         document.body.classList.toggle('no-scroll', mobileMenu.classList.contains('open'));
         const isExpanded = mobileMenu.classList.contains('open');
         mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
     }

     window.addEventListener('scroll', handleScroll, { passive: true });
     handleScroll();

     if (mobileMenuToggle && mobileMenu && mobileMenuClose) {
          console.log('Adding menu toggle listeners.');
         mobileMenuToggle.addEventListener('click', toggleMobileMenu);
         mobileMenuClose.addEventListener('click', toggleMobileMenu);

         mobileMenu.querySelectorAll('a').forEach(link => {
             link.addEventListener('click', () => {
                 if (mobileMenu.classList.contains('open')) {
                     console.log('Closing menu on link click');
                     toggleMobileMenu();
                 }
             });
         });

     } else {
          console.warn('Could not add menu toggle listeners because some elements were not found.');
     }
     console.log('Header logic initialization complete.');
}
// --- END OF FILE js/commonLoader.js ---