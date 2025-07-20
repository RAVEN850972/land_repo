// Global Variables
let lastScrollTop = 0;
let scrollDirection = 'down';
let lastScrollTime = 0;

// Mobile Detection
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Preloader functionality
function initializePreloader() {
    const preloader = document.getElementById('preloader');
    const progressFill = document.getElementById('progress-fill');
    const progressPercent = document.getElementById('progress-percent');
    
    if (!preloader || !progressFill || !progressPercent) return;
    
    let progress = 0;
    const increment = Math.random() * 3 + 2; // Random increment between 2-5
    
    // Simulate loading progress
    const progressInterval = setInterval(() => {
        progress += increment + Math.random() * 2;
        
        if (progress >= 100) {
            progress = 100;
            clearInterval(progressInterval);
            
            // Complete loading after a short delay
            setTimeout(() => {
                hidePreloader();
            }, 500);
        }
        
        // Update progress bar and text
        progressFill.style.width = progress + '%';
        progressPercent.textContent = Math.floor(progress);
        
    }, 100 + Math.random() * 100); // Random interval between 100-200ms
    
    // Also hide preloader when page is fully loaded (backup)
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (!preloader.classList.contains('hidden')) {
                progress = 100;
                progressFill.style.width = '100%';
                progressPercent.textContent = '100';
                
                setTimeout(() => {
                    hidePreloader();
                }, 300);
            }
        }, 1000); // Minimum 1 second display time
    });
    
    function hidePreloader() {
        preloader.classList.add('hidden');
        document.body.style.overflow = 'auto';
        
        // Remove preloader from DOM after animation
        setTimeout(() => {
            if (preloader.parentNode) {
                preloader.parentNode.removeChild(preloader);
            }
        }, 500);
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    initializePartnersCarousel();
});

function initializeApp() {
    console.log('Initializing Emil Production app...');
    
    // Initialize preloader first
    initializePreloader();
    
    // Hide page content initially
    document.body.style.overflow = 'hidden';
    
    // Initialize other components
    initializeMobileMenu();
    initializeButtons();
    initializeVideoHandling();
    initializeFormHandling();
    initializeFAQ();
    
    console.log('App initialized successfully');
}

// Mobile Menu Functionality
function initializeMobileMenu() {
    const burger = document.getElementById('burger');
    const mobileNav = document.getElementById('mobile-nav');
    const body = document.body;
    
    if (!burger || !mobileNav) {
        console.error('Mobile menu elements not found!');
        return;
    }
    
    // Toggle mobile menu
    burger.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        burger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        
        // Always show header when mobile menu is opened
        if (mobileNav.classList.contains('active')) {
            body.style.overflow = 'hidden';
            showHeader();
        } else {
            body.style.overflow = 'auto';
        }
    });
    
    // Close mobile menu when clicking on links
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            closeMobileMenu();
        });
    });
    
    // Close mobile menu when clicking outside
    mobileNav.addEventListener('click', function(e) {
        if (e.target === mobileNav) {
            closeMobileMenu();
        }
    });
    
    function closeMobileMenu() {
        burger.classList.remove('active');
        mobileNav.classList.remove('active');
        body.style.overflow = 'auto';
    }
    
    // Close menu on window resize (desktop)
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });
}

// Header Scroll Behavior
function initializeHeaderScrollBehavior(container) {
    container.addEventListener('scroll', throttle(handleHeaderScroll, 16), { passive: true });
}

function handleHeaderScroll() {
    const container = document.querySelector('.snap-container');
    const header = document.querySelector('.header');
    
    if (!container || !header) return;
    
    const scrollTop = container.scrollTop;
    const scrollDelta = scrollTop - lastScrollTop;
    
    // Update last scroll time
    lastScrollTime = Date.now();
    
    // Determine scroll direction
    if (scrollDelta > 0) {
        scrollDirection = 'down';
    } else if (scrollDelta < 0) {
        scrollDirection = 'up';
    }
    
    // Show/hide header based on scroll direction and position
    if (scrollTop > 100) { // Only after scrolling past hero section a bit
        if (scrollDirection === 'down' && scrollDelta > 5) {
            // Scrolling down - hide header
            hideHeader();
        } else if (scrollDirection === 'up' && scrollDelta < -5) {
            // Scrolling up - show header
            showHeader();
        }
        
        // Add scrolled class for background change
        header.classList.add('scrolled');
    } else {
        // At top - always show header
        showHeader();
        header.classList.remove('scrolled');
    }
    
    lastScrollTop = scrollTop;
}

function hideHeader() {
    const header = document.querySelector('.header');
    if (header) {
        header.classList.add('hidden');
        header.classList.remove('visible');
        
        // Clear any pending show timeout
        if (headerHideTimeout) {
            clearTimeout(headerHideTimeout);
        }
    }
}

function showHeader() {
    const header = document.querySelector('.header');
    if (header) {
        header.classList.remove('hidden');
        header.classList.add('visible');
        
        // Auto-hide after inactivity (only if not at top)
        if (lastScrollTop > 100) {
            if (headerHideTimeout) {
                clearTimeout(headerHideTimeout);
            }
            headerHideTimeout = setTimeout(() => {
                if (scrollDirection === 'down' || Date.now() - lastScrollTime > 3000) {
                    hideHeader();
                }
            }, 3000); // Hide after 3 seconds of inactivity
        }
    }
}

function handleMobileScroll() {
    handleHeaderScroll();
}

// Button Handlers
function initializeButtons() {
    // Hero buttons
    const artistButton = document.querySelector('.hero .btn-primary');
    const investorButton = document.querySelector('.hero .btn-secondary');
    
    if (artistButton) {
        artistButton.addEventListener('click', function() {
            console.log('Artist button clicked');
            // Scroll to contact form
            const targetIndex = Array.from(sections).findIndex(section => 
                section.id === 'contacts'
            );
            if (targetIndex !== -1) {
                scrollToSection(targetIndex);
            }
        });
    }
    
    if (investorButton) {
        investorButton.addEventListener('click', function() {
            console.log('Investor button clicked');
            // Scroll to investors section
            const targetIndex = Array.from(sections).findIndex(section => 
                section.id === 'investors'
            );
            if (targetIndex !== -1) {
                scrollToSection(targetIndex);
            }
        });
    }
    
    // Investor section buttons
    const downloadButton = document.querySelector('.investors .btn-primary');
    const investorContactButton = document.querySelector('.investors .btn-secondary');
    
    if (downloadButton) {
        downloadButton.addEventListener('click', function() {
            console.log('Download presentation clicked');
            // Simulate download
            showNotification('Презентация будет отправлена на ваш email после заполнения формы');
            
            // Scroll to contact form
            const contactIndex = Array.from(sections).findIndex(section => 
                section.id === 'contacts'
            );
            if (contactIndex !== -1) {
                setTimeout(() => {
                    scrollToSection(contactIndex);
                }, 1000);
            }
        });
    }
    
    if (investorContactButton) {
        investorContactButton.addEventListener('click', function() {
            console.log('Investor contact clicked');
            // Scroll to contact form
            const contactIndex = Array.from(sections).findIndex(section => 
                section.id === 'contacts'
            );
            if (contactIndex !== -1) {
                scrollToSection(contactIndex);
            }
        });
    }
    
    // Partners button
    const partnerButton = document.querySelector('.partners .btn-primary');
    if (partnerButton) {
        partnerButton.addEventListener('click', function() {
            console.log('Partner button clicked');
            openPartnerForm();
        });
    }
}

// Partner Form Handler
function openPartnerForm() {
    // Scroll to contact form and pre-select partner role
    const contactIndex = Array.from(sections).findIndex(section => 
        section.id === 'contacts'
    );
    if (contactIndex !== -1) {
        scrollToSection(contactIndex);
        
        // Pre-select partner role
        setTimeout(() => {
            const roleSelect = document.querySelector('select[name="role"]');
            if (roleSelect) {
                roleSelect.value = 'partner';
                roleSelect.style.color = '#F5F5F5';
            }
        }, 1000);
    }
}

// Video Handling
function initializeVideoHandling() {
    const video = document.querySelector('.video-background video');
    
    if (!video) return;
    
    // Handle video loading states
    video.addEventListener('loadstart', function() {
        console.log('Video loading started');
    });
    
    video.addEventListener('canplay', function() {
        console.log('Video can start playing');
        video.style.opacity = '1';
    });
    
    video.addEventListener('error', function() {
        console.log('Video loading error');
        // Fallback: show gradient background
        const videoBackground = document.querySelector('.video-background');
        if (videoBackground) {
            videoBackground.style.background = 'linear-gradient(45deg, #111, #222)';
        }
    });
    
    // Ensure video plays on mobile (if user interacts)
    video.addEventListener('click', function() {
        if (video.paused) {
            video.play().catch(e => console.log('Video play failed:', e));
        }
    });
    
    // Intersection Observer for video lazy loading
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const video = entry.target;
                    // Load video sources if not already loaded
                    if (!video.src && video.children.length > 0) {
                        Array.from(video.children).forEach(source => {
                            if (source.dataset.src) {
                                source.src = source.dataset.src;
                            }
                        });
                        video.load();
                    }
                    videoObserver.unobserve(video);
                }
            });
        }, { threshold: 0.1 });
        
        videoObserver.observe(video);
    }
}

// Form Handling
function initializeFormHandling() {
    const form = document.querySelector('.contact-form-wrapper');
    
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = {};
        
        // Convert FormData to object
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        // Basic validation
        const name = form.querySelector('input[placeholder="Ваше имя"]').value;
        const contact = form.querySelector('input[placeholder*="Telegram"]').value;
        const role = form.querySelector('select[name="role"]').value;
        const agreement = form.querySelector('input[type="checkbox"]').checked;
        
        if (!name.trim() || !contact.trim() || !role) {
            showNotification('Пожалуйста, заполните обязательные поля', 'error');
            return;
        }
        
        if (!agreement) {
            showNotification('Необходимо согласие с политикой конфиденциальности', 'error');
            return;
        }
        
        // Simulate form submission
        console.log('Form submitted:', data);
        
        // Show success message
        const submitButton = form.querySelector('.btn-submit');
        const originalText = submitButton.textContent;
        
        submitButton.textContent = 'Отправляется...';
        submitButton.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            submitButton.textContent = 'Отправлено!';
            submitButton.style.background = '#4CAF50';
            
            // Reset form
            form.reset();
            
            // Reset select placeholder
            const selectElement = form.querySelector('select[name="role"]');
            if (selectElement) {
                selectElement.selectedIndex = 0;
                selectElement.style.color = '#C0C0C0';
            }
            
            // Reset button after delay
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                submitButton.style.background = '';
            }, 3000);
            
            // Show success notification
            showNotification('Спасибо! Мы свяжемся с вами в течение 5 дней.', 'success');
            
        }, 1500);
    });
    
    // Form field enhancements
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        // Add focus/blur effects
        input.addEventListener('focus', function() {
            this.style.borderColor = '#F5F5F5';
            this.style.boxShadow = '0 0 10px rgba(245, 245, 245, 0.2)';
        });
        
        input.addEventListener('blur', function() {
            this.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            this.style.boxShadow = 'none';
        });
    });
    
    // Select specific handling
    const selectElement = form.querySelector('select[name="role"]');
    if (selectElement) {
        selectElement.addEventListener('change', function() {
            // Update text color when valid option is selected
            if (this.value) {
                this.style.color = '#F5F5F5';
            } else {
                this.style.color = '#C0C0C0';
            }
        });
    }
}

// FAQ Functionality
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            if (isActive) {
                item.classList.remove('active');
            } else {
                item.classList.add('active');
            }
        });
    });
}

// Notification System
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notif => notif.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10001;
        background: ${type === 'error' ? '#ff4444' : type === 'success' ? '#4CAF50' : '#333'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        font-size: 14px;
    `;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }
    }, 5000);
}

// Scroll Animations and Intersection Observer
function initializeScrollAnimations() {
    if (isReducedMotion) return;
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animated');
            }
        });
    }, observerOptions);
    
    // Observe sections
    const animatedSections = document.querySelectorAll('.about, .target-audience, .what-we-offer, .how-to-join, .investors, .team, .contact-form, .faq');
    animatedSections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(50px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
    
    // Observe cards and items
    const animatedItems = document.querySelectorAll('.audience-card, .offer-item, .step-item, .advantage-item, .team-member, .faq-item');
    animatedItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(item);
    });
}

// Parallax Effects (Desktop only)
function initializeParallaxEffects() {
    if (isMobile || isReducedMotion) return;
    
    let mouseX = 0;
    let mouseY = 0;
    let parallaxElements = [];
    
    // Initialize parallax elements
    parallaxElements = document.querySelectorAll('.section-bg');
    console.log('Parallax elements found:', parallaxElements.length);
    
    // Mouse parallax
    document.addEventListener('mousemove', debounce(function(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 20;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        
        updateMouseParallax();
    }, 16)); // ~60fps
    
    function updateMouseParallax() {
        parallaxElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            
            // Only apply parallax if element is visible
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const intensity = 0.5;
                element.style.setProperty('--mouse-x', `${mouseX * intensity}px`);
                element.style.setProperty('--mouse-y', `${mouseY * intensity}px`);
            }
        });
    }
    
    // Scroll parallax for all sections
    const container = document.querySelector('.snap-container');
    if (container) {
        container.addEventListener('scroll', debounce(() => {
            updateScrollParallax();
        }, 16), { passive: true });
    }
    
    function updateScrollParallax() {
        const scrolled = container.scrollTop;
        const windowHeight = window.innerHeight;
        
        
        // Special handling for hero section
        const hero = document.querySelector('.hero');
        if (hero && scrolled < windowHeight) {
            const video = hero.querySelector('.video-background video');
            const content = hero.querySelector('.hero-content');
            
            if (video) {
                video.style.transform = `translateY(${scrolled * 0.5}px) scale(1.1)`;
            }
            
            if (content) {
                const opacity = Math.max(0, 1 - (scrolled / windowHeight) * 1.2);
                content.style.transform = `translateY(${scrolled * 0.3}px)`;
                content.style.opacity = opacity;
            }
        }
    }
    
    // Initial parallax update
    setTimeout(() => {
        updateScrollParallax();
        updateMouseParallax();
    }, 100);
}

// Keyboard Navigation
function initializeKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Skip if user is typing in form
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }
        
        switch(e.key) {
            case 'ArrowDown':
            case 'PageDown':
                e.preventDefault();
                if (currentSection < sections.length - 1) {
                    scrollToSection(currentSection + 1);
                }
                break;
                
            case 'ArrowUp':
            case 'PageUp':
                e.preventDefault();
                if (currentSection > 0) {
                    scrollToSection(currentSection - 1);
                }
                break;
                
            case 'Home':
                e.preventDefault();
                scrollToSection(0);
                break;
                
            case 'End':
                e.preventDefault();
                scrollToSection(sections.length - 1);
                break;
                
            case 'Escape':
                // Close mobile menu if open
                const mobileNav = document.getElementById('mobile-nav');
                const burger = document.getElementById('burger');
                if (mobileNav && mobileNav.classList.contains('active')) {
                    burger.click();
                }
                
                // Close any open FAQ items
                const activeFAQItems = document.querySelectorAll('.faq-item.active');
                activeFAQItems.forEach(item => {
                    item.classList.remove('active');
                });
                break;
        }
    });
}

// Performance Optimizations
function initializePerformanceOptimizations() {
    // Intersection Observer for lazy loading
    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Load background images
                    if (element.dataset.bg) {
                        element.style.backgroundImage = `url(${element.dataset.bg})`;
                        element.removeAttribute('data-bg');
                    }
                    
                    // Load images
                    if (element.tagName === 'IMG' && element.dataset.src) {
                        element.src = element.dataset.src;
                        element.removeAttribute('data-src');
                    }
                    
                    lazyObserver.unobserve(element);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px'
        });
        
        // Observe elements with data-bg or data-src
        const lazyElements = document.querySelectorAll('[data-bg], [data-src]');
        lazyElements.forEach(el => lazyObserver.observe(el));
    }
    
    // Preload critical resources
    const criticalImages = [
        'hero-bg.jpg',
        'about-bg.webp',
        'target-bg.jpeg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
    
    // Preload next section images when scrolling
    const container = document.querySelector('.snap-container');
    if (container) {
        container.addEventListener('scroll', debounce(() => {
            preloadNearbyImages();
        }, 500), { passive: true });
    }
}

function preloadNearbyImages() {
    const nextSectionIndex = Math.min(currentSection + 1, sections.length - 1);
    const prevSectionIndex = Math.max(currentSection - 1, 0);
    
    [nextSectionIndex, prevSectionIndex].forEach(index => {
        const section = sections[index];
        if (section) {
            const images = section.querySelectorAll('img[data-src]');
            images.forEach(img => {
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
            });
        }
    });
}

// Touch Gestures for Mobile
function initializeTouchGestures() {
    if (!isMobile) return;
    
    let startY = 0;
    let startTime = 0;
    const minSwipeDistance = 50;
    const maxSwipeTime = 300;
    
    const container = document.querySelector('.snap-container');
    if (!container) return;
    
    container.addEventListener('touchstart', function(e) {
        startY = e.touches[0].clientY;
        startTime = Date.now();
    }, { passive: true });
    
    container.addEventListener('touchend', function(e) {
        if (!startY) return;
        
        const endY = e.changedTouches[0].clientY;
        const distance = startY - endY;
        const time = Date.now() - startTime;
        
        // Check if it's a valid swipe
        if (Math.abs(distance) >= minSwipeDistance && time <= maxSwipeTime) {
            if (distance > 0 && currentSection < sections.length - 1) {
                // Swipe up - next section
                scrollToSection(currentSection + 1);
            } else if (distance < 0 && currentSection > 0) {
                // Swipe down - previous section
                scrollToSection(currentSection - 1);
            }
        }
        
        startY = 0;
    }, { passive: true });
}

// Analytics Integration
function initializeAnalytics() {
    // Google Analytics
    if (typeof gtag !== 'undefined') {
        // Track section views
        function trackSectionView(sectionId) {
            gtag('event', 'page_view', {
                page_title: `Section: ${sectionId}`,
                page_location: `${window.location.origin}${window.location.pathname}#${sectionId}`
            });
        }
        
        // Track form submissions
        function trackFormSubmission(formType) {
            gtag('event', 'form_submit', {
                form_type: formType
            });
        }
        
        // Track button clicks
        function trackButtonClick(buttonName, section) {
            gtag('event', 'click', {
                event_category: 'Button',
                event_label: `${buttonName} - ${section}`
            });
        }
        
        // Export functions for use in other parts of the code
        window.analytics = {
            trackSectionView,
            trackFormSubmission,
            trackButtonClick
        };
    }
    
    // Yandex Metrica
    if (typeof ym !== 'undefined') {
        // Similar tracking for Yandex Metrica
        console.log('Yandex Metrica initialized');
    }
}

// Error Handling and Debugging
function initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);
        
        // Optional: Send error to analytics
        if (window.analytics && window.analytics.trackError) {
            window.analytics.trackError(e.error.message, e.filename, e.lineno);
        }
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(e) {
        console.error('Unhandled promise rejection:', e.reason);
        
        // Prevent default browser behavior
        e.preventDefault();
    });
    
    // Debug helpers (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        window.debug = {
            getCurrentSection: () => currentSection,
            getSections: () => sections,
            scrollToSection: scrollToSection,
            showHeader: showHeader,
            hideHeader: hideHeader,
            showNotification: showNotification
        };
        
        console.log('Debug helpers available at window.debug');
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!inThrottle) {
            func.apply(context, args);
            lastRan = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Cookie and localStorage helpers
function setCookie(name, value, days) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function saveToLocalStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.warn('localStorage not available:', e);
    }
}

function getFromLocalStorage(key) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    } catch (e) {
        console.warn('localStorage not available:', e);
        return null;
    }
}

// Initialize additional features after DOM load
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure everything is rendered
    setTimeout(() => {
        initializeScrollAnimations();
        initializeParallaxEffects();
        initializeKeyboardNavigation();
        initializePerformanceOptimizations();
        initializeTouchGestures();
        initializeAnalytics();
        initializeErrorHandling();
    }, 100);
});

// Window load optimizations
window.addEventListener('load', function() {
    console.log('Page fully loaded');
    
    // Force update of current section
    setTimeout(() => {
        updateActiveSection();
    }, 200);
    
    // Remove initial loading styles if any
    document.body.classList.add('loaded');
    
    // Initialize any remaining lazy-loaded elements
    const lazyElements = document.querySelectorAll('[data-src], [data-bg]');
    lazyElements.forEach(element => {
        if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
        }
        if (element.dataset.bg) {
            element.style.backgroundImage = `url(${element.dataset.bg})`;
            element.removeAttribute('data-bg');
        }
    });
});

// Visibility change handling
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden - pause any animations or videos
        const video = document.querySelector('.video-background video');
        if (video && !video.paused) {
            video.pause();
        }
        
        // Pause any running animations
        const runningAnimations = document.querySelectorAll('.running-animation');
        runningAnimations.forEach(el => {
            el.style.animationPlayState = 'paused';
        });
    } else {
        // Page is visible - resume
        const video = document.querySelector('.video-background video');
        if (video && video.paused) {
            video.play().catch(e => console.log('Video resume failed:', e));
        }
        
        // Resume animations
        const pausedAnimations = document.querySelectorAll('.running-animation');
        pausedAnimations.forEach(el => {
            el.style.animationPlayState = 'running';
        });
    }
});

// Resize handler
window.addEventListener('resize', debounce(function() {
    // Recalculate section positions
    if (sections.length > 0) {
        updateActiveSection();
    }
    
    // Update mobile menu state
    if (window.innerWidth > 768) {
        const burger = document.getElementById('burger');
        const mobileNav = document.getElementById('mobile-nav');
        if (burger && mobileNav && mobileNav.classList.contains('active')) {
            burger.click();
        }
    }
    
    // Recalculate parallax if on desktop
    if (!isMobile && window.innerWidth > 1024) {
        const parallaxElements = document.querySelectorAll('.section-bg');
        parallaxElements.forEach(element => {
            element.style.setProperty('--mouse-x', '0px');
            element.style.setProperty('--mouse-y', '0px');
            element.style.setProperty('--parallax-offset', '0px');
        });
    }
}, 250));

// Online/Offline status
window.addEventListener('online', function() {
    console.log('Connection restored');
    showNotification('Соединение восстановлено', 'success');
});

window.addEventListener('offline', function() {
    console.log('Connection lost');
    showNotification('Нет соединения с интернетом', 'error');
});

// === Скрытие/показ хедера при скролле вниз/вверх ===
(function() {
  let lastScrollTop = 0;
  let ticking = false;
  const header = document.querySelector('.header');
  if (!header) return;

  function onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // Скролл вниз
      header.classList.add('hidden');
      header.classList.remove('visible');
    } else {
      // Скролл вверх
      header.classList.remove('hidden');
      header.classList.add('visible');
    }
    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      window.requestAnimationFrame(function() {
        onScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Показываем хедер при загрузке
  header.classList.add('visible');
})();

// Export for debugging and external access
if (typeof window !== 'undefined') {
    window.emilProduction = {
        scrollToSection,
        showNotification,
        openPartnerForm,
        getCurrentSection: () => currentSection,
        getSections: () => sections,
        getScrollDots: () => scrollDots,
        showHeader,
        hideHeader,
        updateActiveSection,
        version: '1.0.0'
    };
    
    console.log('Emil Production app ready. Access via window.emilProduction');
}

// Partners Carousel Functionality - FIXED AUTOSCROLL
// КАРУСЕЛЬ С ПОСТОЯННО АКТИВНЫМ АВТОСКРОЛЛОМ
function initializePartnersCarousel() {
    console.log('🎠 Initializing partners carousel...');
    
    const carousel = document.getElementById('partnersCarousel');
    const prevButton = document.getElementById('carouselPrev');
    const nextButton = document.getElementById('carouselNext');
    const dotsContainer = document.getElementById('carouselDots');
    
    if (!carousel || !prevButton || !nextButton || !dotsContainer) {
        console.warn('❌ Carousel elements not found');
        return null;
    }
    
    const partners = carousel.querySelectorAll('.partner-logo');
    const totalPartners = partners.length;
    
    console.log(`📊 Total partners: ${totalPartners}`);
    
    // Responsive slides per view
    function getSlidesPerView() {
        if (window.innerWidth < 768) return 2;
        if (window.innerWidth < 1024) return 3;
        return 4;
    }
    
    let slidesPerView = getSlidesPerView();
    let currentSlide = 0;
    let maxSlide = Math.max(0, totalPartners - slidesPerView);
    let autoScrollInterval = null;
    let isAutoScrollActive = true; // ВСЕГДА ВКЛЮЧЕН
    let isUserInteracting = false;
    let autoScrollPosition = 0;
    let cycleCount = 0;
    
    console.log(`⚙️ Initial config:`, {
        slidesPerView,
        maxSlide,
        totalPartners,
        alwaysActive: true
    });
    
    // Create dots
    function createDots() {
        dotsContainer.innerHTML = '';
        const totalDots = maxSlide + 1;
        
        for (let i = 0; i <= maxSlide; i++) {
            const dot = document.createElement('button');
            dot.className = 'carousel-dot';
            dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
            dot.addEventListener('click', () => {
                console.log(`🔘 Dot ${i} clicked`);
                goToSlide(i);
                pauseAutoScrollForInteraction(8000);
            });
            dotsContainer.appendChild(dot);
        }
        console.log(`🔘 Created ${totalDots} dots`);
    }
    
    // Update carousel position
    function updateCarousel(useAutoScrollPosition = false) {
        const slideWidth = window.innerWidth < 768 ? 165 : window.innerWidth < 1024 ? 195 : 220;
        const position = useAutoScrollPosition ? autoScrollPosition : currentSlide;
        const offset = -position * slideWidth;
        
        carousel.style.transform = `translateX(${offset}px)`;
        
        console.log(`🎯 Updated carousel:`, {
            mode: useAutoScrollPosition ? 'AUTO' : 'MANUAL',
            position,
            offset: `${offset}px`
        });
        
        // Update dots based on manual position only
        if (!useAutoScrollPosition) {
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        // Update button states
        prevButton.disabled = false;
        nextButton.disabled = false;
        
        if (currentSlide === 0) {
            prevButton.style.opacity = '0.6';
        } else {
            prevButton.style.opacity = '1';
        }
        
        if (currentSlide >= maxSlide) {
            nextButton.style.opacity = '0.6';
        } else {
            nextButton.style.opacity = '1';
        }
    }
    
    // Go to specific slide
    function goToSlide(slideIndex) {
        console.log(`🎯 Going to slide ${slideIndex}`);
        currentSlide = Math.max(0, Math.min(slideIndex, maxSlide));
        autoScrollPosition = currentSlide;
        updateCarousel(false);
        resetAutoScroll();
    }
    
    // Next slide for manual control
    function nextSlide() {
        console.log(`👆 Manual next slide`);
        if (currentSlide < maxSlide) {
            currentSlide++;
        } else {
            currentSlide = 0;
        }
        autoScrollPosition = currentSlide;
        updateCarousel(false);
    }
    
    // Previous slide for manual control
    function prevSlide() {
        console.log(`👆 Manual prev slide`);
        if (currentSlide > 0) {
            currentSlide--;
        } else {
            currentSlide = maxSlide;
        }
        autoScrollPosition = currentSlide;
        updateCarousel(false);
    }
    
    // ПОСТОЯННО АКТИВНЫЙ АВТОСКРОЛЛ
    function performAutoScroll() {
        console.log(`🤖 Auto-scroll check:`, {
            isUserInteracting,
            intervalExists: !!autoScrollInterval,
            currentPosition: autoScrollPosition,
            cycleCount
        });
        
        if (isUserInteracting) {
            console.log('❌ User is interacting');
            return false;
        }
        
        console.log(`🚀 Auto-scroll step: ${autoScrollPosition}/${totalPartners - 1} (cycle ${cycleCount})`);
        
        // Увеличиваем позицию
        autoScrollPosition++;
        
        // Проверяем достижение конца
        if (autoScrollPosition >= totalPartners) {
            autoScrollPosition = 0;
            cycleCount++;
            console.log(`🔄 Cycle ${cycleCount} completed, returning to start`);
        }
        
        // Обновляем позицию
        updateCarousel(true);
        
        // Синхронизируем dots
        const nearestManualPosition = Math.min(autoScrollPosition, maxSlide);
        if (currentSlide !== nearestManualPosition) {
            currentSlide = nearestManualPosition;
            const dots = dotsContainer.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentSlide);
            });
        }
        
        return true;
    }
    
    // Start auto-scroll
    function startAutoScroll() {
        console.log(`🟢 Starting auto-scroll (always active mode)...`);
        
        if (isUserInteracting) {
            console.log('❌ Cannot start: user interacting');
            return;
        }
        
        stopAutoScroll();
        
        console.log('🟢 Starting auto-scroll interval...');
        autoScrollInterval = setInterval(() => {
            try {
                performAutoScroll();
            } catch (error) {
                console.error('💥 Auto-scroll error:', error);
                stopAutoScroll();
                // Автоматический перезапуск через 5 секунд
                setTimeout(startAutoScroll, 5000);
            }
        }, 3000);
        
        console.log(`✅ Auto-scroll started with interval ID: ${autoScrollInterval}`);
    }
    
    function stopAutoScroll() {
        if (autoScrollInterval) {
            console.log(`🛑 Stopping auto-scroll (interval ID: ${autoScrollInterval})`);
            clearInterval(autoScrollInterval);
            autoScrollInterval = null;
        }
    }
    
    function resetAutoScroll() {
        console.log('🔄 Resetting auto-scroll...');
        stopAutoScroll();
        
        if (!isUserInteracting) {
            console.log('⏰ Scheduling auto-scroll restart in 2 seconds...');
            setTimeout(() => {
                if (!isUserInteracting) {
                    startAutoScroll();
                }
            }, 2000);
        }
    }
    
    // Пауза при взаимодействии
    function pauseAutoScrollForInteraction(duration = 5000) {
        console.log(`⏸️ Pausing auto-scroll for ${duration}ms`);
        isUserInteracting = true;
        stopAutoScroll();
        
        if (window.autoScrollResumeTimer) {
            clearTimeout(window.autoScrollResumeTimer);
        }
        
        window.autoScrollResumeTimer = setTimeout(() => {
            console.log('⏯️ Resuming auto-scroll after interaction');
            isUserInteracting = false;
            startAutoScroll();
        }, duration);
    }
    
    // Event listeners
    prevButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('👈 Prev button clicked');
        prevSlide();
        pauseAutoScrollForInteraction(8000);
    });
    
    nextButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('👉 Next button clicked');
        nextSlide();
        pauseAutoScrollForInteraction(8000);
    });
    
    // Touch events
    prevButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        prevSlide();
        pauseAutoScrollForInteraction(8000);
    });
    
    nextButton.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        nextSlide();
        pauseAutoScrollForInteraction(8000);
    });
    
    // Hover events - КРАТКОВРЕМЕННАЯ пауза
    carousel.addEventListener('mouseenter', () => {
        console.log('🐭 Mouse entered carousel - brief pause');
        pauseAutoScrollForInteraction(3000); // Только 3 секунды паузы
    });
    
    // Touch/Swipe support
    let touchStartX = 0;
    let touchEndX = 0;
    let isDragging = false;
    
    carousel.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        isDragging = true;
        pauseAutoScrollForInteraction(5000);
    }, { passive: true });
    
    carousel.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        isDragging = false;
    }, { passive: true });
    
    function handleSwipe() {
        const deltaX = touchEndX - touchStartX;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > minSwipeDistance) {
            if (deltaX > 0) {
                prevSlide();
            } else {
                nextSlide();
            }
        }
    }
    
    // Window resize handler
    function handleResize() {
        const newSlidesPerView = getSlidesPerView();
        if (newSlidesPerView !== slidesPerView) {
            slidesPerView = newSlidesPerView;
            maxSlide = Math.max(0, totalPartners - slidesPerView);
            currentSlide = Math.min(currentSlide, maxSlide);
            autoScrollPosition = currentSlide;
            createDots();
            updateCarousel(false);
        }
    }
    
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // УБИРАЕМ Intersection Observer - карусель всегда активна
    console.log('🔥 Always-active mode: no visibility detection');
    
    // Initialize
    createDots();
    updateCarousel(false);
    
    console.log('✅ Carousel initialized (always-active mode)');
    
    // Запуск автоскролла
    setTimeout(() => {
        console.log('🚀 Starting initial auto-scroll (always-active)');
        startAutoScroll();
    }, 3000);
    
    // DEBUG функции
    window.debugCarousel = () => {
        const state = {
            currentSlide,
            autoScrollPosition,
            maxSlide,
            totalPartners,
            slidesPerView,
            isUserInteracting,
            intervalActive: !!autoScrollInterval,
            intervalId: autoScrollInterval,
            cycleCount,
            mode: 'ALWAYS_ACTIVE'
        };
        console.table(state);
        return state;
    };
    
    window.forceRestartAutoScroll = () => {
        console.log('🔧 Force restarting auto-scroll...');
        isUserInteracting = false;
        autoScrollPosition = currentSlide;
        stopAutoScroll();
        setTimeout(startAutoScroll, 500);
    };
    
    // Return API
    return {
        nextSlide,
        prevSlide,
        goToSlide,
        getCurrentSlide: () => currentSlide,
        getAutoScrollPosition: () => autoScrollPosition,
        getTotalSlides: () => maxSlide + 1,
        startAutoScroll,
        stopAutoScroll,
        pauseForInteraction: pauseAutoScrollForInteraction,
        debug: () => window.debugCarousel(),
        forceRestart: () => window.forceRestartAutoScroll()
    };
}

// Универсальная функция для перехода к форме заявки с предзаполнением роли
function scrollToContactFormWithRole(role, message) {
    const contactSection = document.getElementById('contacts');
    if (contactSection) {
        contactSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Предварительно заполняем роль
        setTimeout(() => {
            const roleSelect = document.querySelector('select[name="role"]');
            if (roleSelect) {
                roleSelect.value = role;
                roleSelect.style.color = '#F5F5F5';
                
                // Добавляем визуальный эффект
                roleSelect.style.borderColor = '#F5F5F5';
                roleSelect.style.boxShadow = '0 0 10px rgba(245, 245, 245, 0.3)';
                
                setTimeout(() => {
                    roleSelect.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                    roleSelect.style.boxShadow = 'none';
                }, 2000);
            }
            
            // Фокус на первое поле
            const nameInput = document.querySelector('input[placeholder="Ваше имя"]');
            if (nameInput) {
                nameInput.focus();
            }
        }, 1000);
        
        // Показываем уведомление
        if (typeof showNotification === 'function') {
            showNotification(message, 'info');
        }
    }
}

// Специфичные функции для каждой роли
function scrollToContactFormArtist() {
    scrollToContactFormWithRole('artist', 'Заполните форму для подачи заявки как артист');
}

function scrollToContactFormInvestor() {
    scrollToContactFormWithRole('investor', 'Заполните форму для инвестиционного сотрудничества');
}

function scrollToContactFormPartner() {
    scrollToContactFormWithRole('partner', 'Заполните форму для партнерского сотрудничества');
}

// Инициализация всех кнопок
function initializeAllNavigationButtons() {
    console.log('Initializing all navigation buttons...');
    
    // АРТИСТЫ - кнопки "Стать артистом"
    const artistButtons = [
        document.querySelector('.hero .btn-primary'), // Главная кнопка в hero
        ...document.querySelectorAll('[data-role="artist"]') // Дополнительные кнопки с атрибутом
    ];
    
    artistButtons.forEach(button => {
        if (button) {
            const buttonText = button.textContent.trim().toLowerCase();
            if (buttonText.includes('стать артистом') || buttonText.includes('артист') || button.dataset.role === 'artist') {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Artist button clicked');
                    scrollToContactFormArtist();
                });
                
                button.setAttribute('aria-label', 'Перейти к форме заявки артиста');
                button.setAttribute('title', 'Заполнить заявку на сотрудничество как артист');
            }
        }
    });
    
    // ИНВЕСТОРЫ - кнопки в hero и секции инвесторов
    const investorButtons = [
        document.querySelector('.hero .btn-secondary'), // Кнопка "Инвестировать" в hero
        document.querySelector('.investors .btn-secondary'), // Кнопка "Оставить заявку" в секции инвесторов
        ...document.querySelectorAll('[data-role="investor"]') // Дополнительные кнопки
    ];
    
    investorButtons.forEach(button => {
        if (button) {
            const buttonText = button.textContent.trim().toLowerCase();
            if (buttonText.includes('инвестировать') || 
                buttonText.includes('инвестор') || 
                buttonText.includes('оставить заявку') ||
                button.dataset.role === 'investor') {
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Investor button clicked');
                    scrollToContactFormInvestor();
                });
                
                button.setAttribute('aria-label', 'Перейти к форме заявки инвестора');
                button.setAttribute('title', 'Заполнить заявку для инвестиционного сотрудничества');
            }
        }
    });
    
    // ПАРТНЕРЫ - кнопки в секции партнеров
    const partnerButtons = [
        document.querySelector('.partners .btn-primary'), // Кнопка "Стать партнёром"
        ...document.querySelectorAll('[data-role="partner"]') // Дополнительные кнопки
    ];
    
    partnerButtons.forEach(button => {
        if (button) {
            const buttonText = button.textContent.trim().toLowerCase();
            if (buttonText.includes('стать партнёром') || 
                buttonText.includes('партнёр') ||
                button.dataset.role === 'partner') {
                
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('Partner button clicked');
                    scrollToContactFormPartner();
                });
                
                button.setAttribute('aria-label', 'Перейти к форме заявки партнера');
                button.setAttribute('title', 'Заполнить заявку для партнерского сотрудничества');
            }
        }
    });
    
    // ДОПОЛНИТЕЛЬНО: Обработка кнопки "Скачать презентацию" для инвесторов
    const downloadButton = document.querySelector('.investors .btn-primary');
    if (downloadButton && downloadButton.textContent.toLowerCase().includes('презентацию')) {
        downloadButton.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Download presentation clicked');
            
            // Показываем уведомление о том, что презентация будет отправлена после заполнения формы
            if (typeof showNotification === 'function') {
                showNotification('Презентация будет отправлена на ваш email после заполнения формы', 'info');
            }
            
            // Переходим к форме с ролью инвестора
            setTimeout(() => {
                scrollToContactFormInvestor();
            }, 1500);
        });
    }
    
    console.log('All navigation buttons initialized');
}

// Функция для добавления data-атрибутов к кнопкам (если нужно)
function addRoleAttributesToButtons() {
    // Автоматически добавляем data-role к кнопкам на основе их текста
    const allButtons = document.querySelectorAll('button, .btn, a[class*="btn"]');
    
    allButtons.forEach(button => {
        const text = button.textContent.trim().toLowerCase();
        
        if (text.includes('стать артистом') || text.includes('артист')) {
            button.setAttribute('data-role', 'artist');
        } else if (text.includes('инвестировать') || text.includes('инвестор') || text.includes('оставить заявку')) {
            button.setAttribute('data-role', 'investor');
        } else if (text.includes('стать партнёром') || text.includes('партнёр')) {
            button.setAttribute('data-role', 'partner');
        }
    });
}

// Обновляем функцию openPartnerForm для совместимости
function openPartnerForm() {
    console.log('openPartnerForm called - redirecting to new function');
    scrollToContactFormPartner();
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing all role-based navigation...');
    
    setTimeout(() => {
        addRoleAttributesToButtons();
        initializeAllNavigationButtons();
        console.log('Role-based navigation initialized');
    }, 500);
});

// Дополнительная инициализация если DOM уже загружен
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        addRoleAttributesToButtons();
        initializeAllNavigationButtons();
    }, 100);
}

// Экспорт функций для использования в HTML или других скриптах
window.scrollToContactFormArtist = scrollToContactFormArtist;
window.scrollToContactFormInvestor = scrollToContactFormInvestor;
window.scrollToContactFormPartner = scrollToContactFormPartner;
window.scrollToContactFormWithRole = scrollToContactFormWithRole;

// Обратная совместимость
window.scrollToContactForm = scrollToContactFormArtist; // По умолчанию для артистов

// Logo Navigation Functionality
function initializeLogoNavigation() {
    const logoLink = document.getElementById('logoLink');
    const heroSection = document.getElementById('hero');
    
    if (!logoLink || !heroSection) {
        console.warn('Logo link or hero section not found');
        return;
    }
    
    // Функция для прокрутки к главной странице
    function scrollToHome(e) {
        e.preventDefault();
        console.log('Logo clicked - scrolling to home');
        
        // Плавная прокрутка к hero секции
        heroSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        // Альтернативный способ если первый не работает
        setTimeout(() => {
            if (window.scrollY > 100) {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }, 100);
        
        // Закрываем мобильное меню если оно открыто
        const mobileNav = document.getElementById('mobile-nav');
        const burger = document.getElementById('burger');
        if (mobileNav && burger && mobileNav.classList.contains('active')) {
            burger.classList.remove('active');
            mobileNav.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
        
        // Показываем уведомление (опционально)
        if (typeof showNotification === 'function') {
            showNotification('Добро пожаловать в Emil Production!', 'info');
        }
    }
    
    // Обработчики событий
    logoLink.addEventListener('click', scrollToHome);
    
    // Обработка Enter и Space для accessibility
    logoLink.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            scrollToHome(e);
        }
    });
    
    // Touch события для мобильных устройств
    logoLink.addEventListener('touchend', function(e) {
        e.preventDefault();
        scrollToHome(e);
    });
    
    console.log('Logo navigation initialized');
}

// Дополнительная функция для навигации по секциям через логотип
function enhanceLogoNavigation() {
    const logoLink = document.getElementById('logoLink');
    
    if (!logoLink) return;
    
    // Визуальная обратная связь при клике
    logoLink.addEventListener('mousedown', function() {
        this.style.transform = 'translateY(0) scale(0.98)';
    });
    
    logoLink.addEventListener('mouseup', function() {
        this.style.transform = '';
    });
    
    logoLink.addEventListener('mouseleave', function() {
        this.style.transform = '';
    });
    
    // Анимация при загрузке страницы
    setTimeout(() => {
        logoLink.style.opacity = '1';
        logoLink.style.transform = 'translateY(0)';
    }, 500);
}

// Функция для обновления активного состояния логотипа
function updateLogoState() {
    const logoLink = document.getElementById('logoLink');
    const heroSection = document.getElementById('hero');
    
    if (!logoLink || !heroSection) return;
    
    // Проверяем, находимся ли мы в hero секции
    const heroRect = heroSection.getBoundingClientRect();
    const isAtTop = window.scrollY < window.innerHeight * 0.5;
    
    if (isAtTop) {
        logoLink.classList.add('at-home');
    } else {
        logoLink.classList.remove('at-home');
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing logo navigation...');
    
    setTimeout(() => {
        initializeLogoNavigation();
        enhanceLogoNavigation();
        updateLogoState();
        console.log('Logo navigation ready');
    }, 300);
});

// Обновление состояния при скролле
window.addEventListener('scroll', debounce(updateLogoState, 100), { passive: true });

// Дополнительная инициализация
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(() => {
        if (!document.getElementById('logoLink')?.onclick) {
            initializeLogoNavigation();
            enhanceLogoNavigation();
        }
    }, 100);
}

// Экспорт функции для внешнего использования
window.scrollToHome = function() {
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        heroSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};