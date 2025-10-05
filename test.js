function createMobileMenu() { 
    // Check if we're on mobile and menu hasn't been transformed yet 
    if (!document.body.classList.contains('mobile') || document.querySelector('.mobile-menu-toggle')) { 
        return; 
    } 
    
    const menuWrap = document.querySelector('.menuwrap'); 
    const leftMenu = menuWrap.querySelector('.left'); 
    
    // Find elements to exclude from sidebar 
    const elementsToExclude = []; 
    const notificationsLink = leftMenu.querySelector('a[href="#notifications"]'); 
    const emojiLink = leftMenu.querySelector('.st-emoji-link-void'); 
    
    if (notificationsLink) { 
        elementsToExclude.push(notificationsLink.closest('li')); 
    } 
    if (emojiLink) { 
        elementsToExclude.push(emojiLink.closest('li')); 
    } 
    
    // Find members link from right menu 
    const rightMenu = menuWrap.querySelector('.right'); 
    const membersLink = rightMenu ? rightMenu.querySelector('a[href="/?act=Members"]') : null; 
    let membersLi = null; 
    if (membersLink) { 
        membersLi = membersLink.closest('li'); 
    } 
    
    // Create mobile menu structure using string concatenation 
    var mobileMenuHTML = '' + 
        '<div class="mobile-menu-container">' + 
        '<button class="mobile-menu-toggle" type="button">' + 
        '<i class="fa-regular fa-bars"></i>' + 
        '</button>' + 
        '<div class="mobile-sidebar-overlay"></div>' + 
        '<div class="mobile-sidebar">' + 
        '<div class="mobile-sidebar-header">' + 
        '<button class="mobile-sidebar-close" type="button">' + 
        '<i class="fa-regular fa-times"></i>' + 
        '</button>' + 
        '<h3>Menu</h3>' + 
        '</div>' + 
        '<div class="mobile-sidebar-content">' + 
        '<!-- Content will be populated dynamically -->' + 
        '</div>' + 
        '</div>' + 
        '</div>'; 
    
    // Insert mobile menu container before the left menu 
    leftMenu.insertAdjacentHTML('beforebegin', mobileMenuHTML); 
    
    // Hide the original left menu (but keep it in DOM) 
    leftMenu.style.display = 'none'; 
    
    // Remove right menu 
    if (rightMenu) { 
        rightMenu.remove(); 
    } 
    
    // Get references to the new mobile menu elements 
    const sidebar = document.querySelector('.mobile-sidebar'); 
    const sidebarContent = document.querySelector('.mobile-sidebar-content'); 
    const overlay = document.querySelector('.mobile-sidebar-overlay'); 
    const toggleBtn = document.querySelector('.mobile-menu-toggle'); 
    const closeBtn = document.querySelector('.mobile-sidebar-close'); 
    const mobileMenuContainer = document.querySelector('.mobile-menu-container'); 
    
    // Track sidebar state 
    let isSidebarOpen = false; 
    
    // Function to organize menu items into categories 
    function organizeMenuItems() { 
        const categories = []; 

        // Check if user is guest and add login form at the top
        if (document.body.classList.contains('guest')) {
            const loginLi = leftMenu.querySelector('li.login');
            if (loginLi) {
                const clonedLoginLi = loginLi.cloneNode(true);
                categories.unshift({
                    title: 'Sign In / Register',
                    items: [{
                        type: 'login',
                        html: clonedLoginLi.outerHTML,
                        originalElement: loginLi
                    }],
                    isLoginForm: true
                });
            }
        }
    
        // Process all list items from the original left menu 
        const listItems = leftMenu.querySelectorAll('li'); 
        listItems.forEach(li => { 
            // Skip excluded elements and login form (already processed)
            if (elementsToExclude.some(excludeItem => excludeItem === li) || li.classList.contains('login')) { 
                return; 
            } 
    
            const clonedLi = li.cloneNode(true); 
            const link = clonedLi.querySelector('a'); 
            const submenu = clonedLi.querySelector('ul'); 
    
            // Check if this is the user profile menu (contains avatar and nick) 
            const isUserProfileMenu = link && link.querySelector('.avatar') && link.querySelector('.nick'); 
    
            if (isUserProfileMenu) { 
                // User profile menu - create special category 
                const menuText = link.querySelector('.nick') ? link.querySelector('.nick').textContent.trim() : 'Profile'; 
    
                categories.unshift({ 
                    title: menuText, 
                    items: Array.from(submenu.querySelectorAll('li')).map(subLi => ({ 
                        type: 'link', 
                        html: subLi.outerHTML, 
                        originalElement: subLi 
                    })), 
                    isSubmenu: true, 
                    isUserProfile: true 
                }); 
            } else if (submenu && !isUserProfileMenu) { 
                // Menu with submenu - treat as category (but not user profile) 
                const menuText = link ? link.textContent.trim() : 'Menu'; 
    
                // Check if this is a submenu with alternative class 
                const isAlternativeSubmenu = li.classList.contains('submenu') && li.classList.contains('alternative'); 
    
                categories.push({ 
                    title: menuText, 
                    items: Array.from(submenu.querySelectorAll('li')).map(subLi => ({ 
                        type: 'link', 
                        html: subLi.outerHTML, 
                        originalElement: subLi 
                    })), 
                    isSubmenu: true, 
                    isAlternative: isAlternativeSubmenu 
                }); 
            } 
            // NOTE: We're intentionally skipping regular menu items without submenus 
            // They shouldn't appear in the sidebar at all 
        }); 
    
        // Add members link if found 
        if (membersLi) { 
            const clonedMembersLi = membersLi.cloneNode(true); 
            categories.push({ 
                title: 'Community', 
                items: [{ 
                    type: 'link', 
                    html: clonedMembersLi.outerHTML, 
                    originalElement: membersLi 
                }] 
            }); 
        } 
    
        return categories; 
    } 
    
    // Function to update sidebar with new content 
    function updateSidebarContent() { 
        // Clear existing sidebar content 
        sidebarContent.innerHTML = ''; 
    
        const categories = organizeMenuItems(); 
    
        categories.forEach(category => { 
            const categorySection = document.createElement('div'); 
            categorySection.className = 'mobile-menu-category'; 
            
            // Add special class for login form
            if (category.isLoginForm) {
                categorySection.classList.add('mobile-login-form');
            }

            const categoryTitle = document.createElement('div'); 
            categoryTitle.className = 'mobile-menu-category-title'; 
    
            // Add chevron icon for submenus (but not for login form)
            if (category.isSubmenu && !category.isLoginForm) { 
                categoryTitle.innerHTML = category.title + ' <i class="fa-regular fa-chevron-down mobile-submenu-chevron"></i>'; 
                categoryTitle.classList.add('mobile-submenu-title'); 
                categoryTitle.style.cursor = 'pointer'; 
    
                // Add click handler for submenu titles 
                categoryTitle.addEventListener('click', function() { 
                    const wasActive = categoryList.classList.contains('active'); 
    
                    // Close all other submenus 
                    sidebarContent.querySelectorAll('.mobile-menu-category-list').forEach(list => { 
                        list.classList.remove('active'); 
                    }); 
                    sidebarContent.querySelectorAll('.mobile-submenu-chevron').forEach(chevron => { 
                        chevron.classList.remove('active'); 
                    }); 
    
                    // Toggle current submenu 
                    if (!wasActive) { 
                        categoryList.classList.add('active'); 
                        this.querySelector('.mobile-submenu-chevron').classList.add('active'); 
                    } 
                }); 
            } else { 
                categoryTitle.textContent = category.title; 
                
                // Hide title for login form since it's self-explanatory
                if (category.isLoginForm) {
                    categoryTitle.style.display = 'none';
                }
            } 
    
            categorySection.appendChild(categoryTitle); 
    
            const categoryList = document.createElement('div'); 
            if (category.isLoginForm) {
                categoryList.className = 'mobile-login-content';
            } else {
                categoryList.className = 'mobile-menu-category-list'; 
            }
    
            // Add alternative class if needed 
            if (category.isAlternative) { 
                categoryList.classList.add('mobile-submenu-alternative'); 
            } 
    
            category.items.forEach(item => { 
                if (item.type === 'login') { 
                    // Handle login form separately
                    const tempDiv = document.createElement('div'); 
                    tempDiv.innerHTML = item.html; 
                    const loginContent = tempDiv.firstElementChild; 
                    
                    // Remove the li wrapper and get the form content directly
                    const formContent = loginContent.querySelector('form, .login_with');
                    if (formContent) {
                        categoryList.appendChild(formContent);
                    } else {
                        categoryList.appendChild(loginContent);
                    }
                    
                    // Re-initialize any login form scripts if needed
                    initializeLoginFormScripts(categoryList);
                    
                } else if (item.type === 'link') { 
                    const tempDiv = document.createElement('div'); 
                    tempDiv.innerHTML = item.html; 
                    const listItem = tempDiv.firstElementChild; 

                    // Fix for logout form
                    const logoutLink = listItem.querySelector('a[onclick*="Logout.submit"]');
                    if (logoutLink) {
                        const form = listItem.querySelector('form[name="Logout"]');
                        if (form) {
                            // Replace the onclick with direct form submission
                            logoutLink.onclick = function(e) {
                                e.preventDefault();
                                form.submit();
                                closeSidebar();
                                return false;
                            };
                        }
                    } else {
                        // Only add closeSidebar handler for NON-user-profile categories
                        if (!category.isUserProfile) {
                            const link = listItem.querySelector('a'); 
                            if (link) { 
                                link.addEventListener('click', function() { 
                                    closeSidebar(); 
                                }); 
                            }
                        }
                    }

                    categoryList.appendChild(listItem); 
                } 
            }); 
    
            categorySection.appendChild(categoryList); 
            sidebarContent.appendChild(categorySection); 
        }); 
    
        // Re-attach event listeners to sidebar links 
        attachSidebarLinkListeners(); 
    } 
    
    // Function to initialize login form scripts
    function initializeLoginFormScripts(loginContainer) {
        // Re-initialize the reCAPTCHA script for the login form
        const loginForm = loginContainer.querySelector('form#loginForm');
        if (loginForm && typeof grecaptcha !== 'undefined') {
            // The existing script should handle the reCAPTCHA, but we ensure it's bound
            console.log('Login form initialized in mobile menu');
        }
        
        // Re-initialize social login buttons
        const socialButtons = loginContainer.querySelectorAll('.login_with button[data-url]');
        socialButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const service = this.getAttribute('data-service');
                const url = this.getAttribute('data-url');
                
                document.cookie = "social-login=" + service + "; expires=Wed, 1 Jan 2030 00:00:00 GMT; path=/;";
                document.location.href = url;
            });
        });
        
        // Re-initialize login dropdown toggle
        const dropdownToggle = loginContainer.querySelector('.login-dropdown');
        const dropdown = loginContainer.querySelector('#login-dropdown');
        if (dropdownToggle && dropdown) {
            dropdownToggle.addEventListener('click', function(e) {
                e.preventDefault();
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            });
        }
    }
    
    // Function to attach click listeners to sidebar links 
    function attachSidebarLinkListeners() { 
        const sidebarLinks = sidebarContent.querySelectorAll('a'); 
        sidebarLinks.forEach(link => { 
            // Don't add click handler to submenu titles (they're handled separately) 
            if (!link.closest('.mobile-submenu-title')) { 
                // Skip user profile links - they already work normally
                const isUserProfileLink = link.closest('.mobile-menu-category')?.querySelector('.mobile-menu-category-title')?.textContent?.includes('-JuNioR-');
                if (!isUserProfileLink) {
                    // Skip logout links as they're already handled
                    if (!link.onclick || !link.onclick.toString().includes('Logout.submit')) {
                        link.addEventListener('click', closeSidebar); 
                    }
                } 
            } 
        }); 
    } 
    
    // Function to check for new menu items and update sidebar 
    function checkForNewMenuItems() { 
        const currentItems = leftMenu.querySelectorAll('li'); 
        let hasNewItems = false; 
    
        // Check if there are new items that aren't in our excluded list 
        currentItems.forEach(li => { 
            if (!elementsToExclude.includes(li) && !li.classList.contains('login')) { 
                // Check if this is a new item by looking for a data attribute 
                if (!li.hasAttribute('data-sidebar-processed')) { 
                    hasNewItems = true; 
                    li.setAttribute('data-sidebar-processed', 'true'); 
                } 
            } 
        }); 
    
        if (hasNewItems) { 
            updateSidebarContent(); 
        } 
    } 
    
    // Initialize sidebar content 
    updateSidebarContent(); 
    
    // Set up MutationObserver to watch for changes in the left menu 
    const leftMenuObserver = new MutationObserver(function(mutations) { 
        let shouldUpdate = false; 
    
        mutations.forEach(function(mutation) { 
            if (mutation.type === 'childList') { 
                // Check if any nodes were added 
                mutation.addedNodes.forEach(function(node) { 
                    if (node.nodeType === 1 && node.matches('li')) { // Element node and li element 
                        if (!elementsToExclude.includes(node) && !node.classList.contains('login')) { 
                            shouldUpdate = true; 
                        } 
                    } 
                }); 
            } 
        }); 
    
        if (shouldUpdate) { 
            updateSidebarContent(); 
        } 
    }); 
    
    // Start observing the left menu for changes 
    leftMenuObserver.observe(leftMenu, { 
        childList: true, 
        subtree: true 
    }); 
    
    // Also check periodically for any dynamic changes (fallback) 
    const dynamicCheckInterval = setInterval(checkForNewMenuItems, 1000); 
    
    // Sidebar control functions 
    function openSidebar() { 
        sidebar.classList.add('active'); 
        overlay.classList.add('active'); 
        document.body.style.overflow = 'hidden'; 
        isSidebarOpen = true; 
    
        // Force a content update when opening sidebar to ensure it's current 
        setTimeout(updateSidebarContent, 100); 
    } 
    
    function closeSidebar() { 
        sidebar.classList.remove('active'); 
        overlay.classList.remove('active'); 
        document.body.style.overflow = ''; 
        isSidebarOpen = false; 
    
        // Close all submenus when closing sidebar 
        sidebarContent.querySelectorAll('.mobile-menu-category-list').forEach(list => { 
            list.classList.remove('active'); 
        }); 
        sidebarContent.querySelectorAll('.mobile-submenu-chevron').forEach(chevron => { 
            chevron.classList.remove('active'); 
        }); 
    } 
    
    function toggleSidebar() { 
        if (isSidebarOpen) { 
            closeSidebar(); 
        } else { 
            openSidebar(); 
        } 
    } 
    
    // Event listener for hamburger button - toggles sidebar 
    toggleBtn.addEventListener('click', function(e) { 
        e.stopPropagation(); // Prevent event from bubbling to document 
        toggleSidebar(); 
    }); 
    
    // Event listener for close button 
    closeBtn.addEventListener('click', closeSidebar); 
    
    // Event listener for overlay - close when clicking outside 
    overlay.addEventListener('click', closeSidebar); 
    
    // Event listener for document - close when clicking outside sidebar 
    document.addEventListener('click', function(e) { 
        if (isSidebarOpen && !sidebar.contains(e.target) && !mobileMenuContainer.contains(e.target)) { 
            closeSidebar(); 
        } 
    }); 
    
    // Prevent sidebar clicks from closing the sidebar 
    sidebar.addEventListener('click', function(e) { 
        e.stopPropagation(); 
    }); 
    
    // Close sidebar when pressing Escape key 
    document.addEventListener('keydown', function(e) { 
        if (isSidebarOpen && e.key === 'Escape') { 
            closeSidebar(); 
        } 
    }); 
    
    // Clean up when page is unloaded 
    window.addEventListener('beforeunload', function() { 
        leftMenuObserver.disconnect(); 
        clearInterval(dynamicCheckInterval); 
    }); 
} 

// Initialize on DOM load 
document.addEventListener('DOMContentLoaded', function() { 
    createMobileMenu(); 
}); 

// Re-run if body class changes (if you have dynamic class changes) 
const observer = new MutationObserver(function(mutations) { 
    mutations.forEach(function(mutation) { 
        if (mutation.attributeName === 'class') { 
            createMobileMenu(); 
        } 
    }); 
}); 

observer.observe(document.body, { 
    attributes: true 
});
