/**
 * SNAP SCROLLING MODULE
 * Улучшенный снап-скроллинг для Emil Production
 * Версия: 1.0.0
 */

(function() {
    'use strict';
    
    // Конфигурация
    const config = {
        snapType: 'y mandatory',
        snapAlign: 'center', // Центрирование секций
        smoothBehavior: true,
        keyboardNavigation: true,
        touchNavigation: true,
        autoSnap: true, // Автодоводка
        snapThreshold: 0.3, // Порог для автодоводки (30% секции)
        snapDelay: 150, // Задержка перед автодоводкой (мс)
        mobileBreakpoint: 768,
        observerThreshold: 0.5,
        observerMargin: '-20% 0px -20% 0px'
    };
    
    // Состояние модуля
    let state = {
        sections: [],
        currentIndex: 0,
        isInitialized: false,
        isMobile: false,
        isScrolling: false,
        scrollTimeout: null,
        lastScrollTime: 0,
        observer: null,
        touchStart: { y: 0, time: 0 }
    };
    
    /**
     * Инициализация модуля
     */
    function init() {
        if (state.isInitialized) {
            console.warn('Snap scrolling already initialized');
            return;
        }
        
        console.log('🎯 Initializing snap scrolling...');
        
        // Получаем все секции
        state.sections = document.querySelectorAll('.snap-section');
        
        if (state.sections.length === 0) {
            console.warn('No snap sections found');
            return;
        }
        
        // Определяем мобильное устройство
        checkMobileDevice();
        
        // Применяем CSS snap
        applyCSSSnap();
        
        // Инициализируем компоненты
        initKeyboardNavigation();
        initTouchNavigation();
        initAutoSnapScrolling(); // Новая функция автодоводки
        initSectionObserver();
        initResizeHandler();
        
        state.isInitialized = true;
        
        // Экспортируем API
        exposeAPI();
        
        console.log(`✅ Snap scrolling initialized with ${state.sections.length} sections`);
    }
    
    /**
     * Проверка мобильного устройства
     */
    function checkMobileDevice() {
        state.isMobile = window.innerWidth <= config.mobileBreakpoint;
    }
    
    /**
     * Применение CSS snap стилей
     */
    function applyCSSSnap() {
        const html = document.documentElement;
        
        if (state.isMobile) {
            // Отключаем snap на мобильных
            html.style.scrollSnapType = 'none';
        } else {
            // Включаем snap на десктопе
            html.style.scrollSnapType = config.snapType;
            html.style.scrollBehavior = config.smoothBehavior ? 'smooth' : 'auto';
        }
        
        // Применяем к секциям
        state.sections.forEach(section => {
            if (!state.isMobile) {
                section.style.scrollSnapAlign = config.snapAlign;
                section.style.scrollSnapStop = 'always';
            } else {
                section.style.scrollSnapAlign = 'none';
                section.style.scrollSnapStop = 'normal';
            }
        });
    }
    
    /**
     * Переход к секции по индексу
     */
    function scrollToSection(index, smooth = true) {
        if (index < 0 || index >= state.sections.length) {
            console.warn(`Invalid section index: ${index}`);
            return false;
        }
        
        const section = state.sections[index];
        const behavior = smooth ? 'smooth' : 'auto';
        
        section.scrollIntoView({
            behavior: behavior,
            block: 'center', // Центрируем секцию
            inline: 'nearest'
        });
        
        state.currentIndex = index;
        
        // Событие для аналитики
        fireAnalyticsEvent('section_navigate', {
            section_index: index,
            section_id: section.id || `section_${index}`,
            navigation_method: 'programmatic'
        });
        
        return true;
    }
    
    /**
     * Клавиатурная навигация
     */
    function initKeyboardNavigation() {
        if (!config.keyboardNavigation) return;
        
        document.addEventListener('keydown', function(e) {
            // Пропускаем если фокус на элементах ввода
            if (isInputFocused()) return;
            
            // Пропускаем если открыто мобильное меню
            if (isMobileMenuOpen()) return;
            
            let handled = false;
            
            switch(e.key) {
                case 'ArrowDown':
                case 'PageDown':
                    e.preventDefault();
                    if (state.currentIndex < state.sections.length - 1) {
                        scrollToSection(state.currentIndex + 1);
                        fireAnalyticsEvent('keyboard_navigation', { direction: 'down' });
                    }
                    handled = true;
                    break;
                    
                case 'ArrowUp':
                case 'PageUp':
                    e.preventDefault();
                    if (state.currentIndex > 0) {
                        scrollToSection(state.currentIndex - 1);
                        fireAnalyticsEvent('keyboard_navigation', { direction: 'up' });
                    }
                    handled = true;
                    break;
                    
                case 'Home':
                    e.preventDefault();
                    scrollToSection(0);
                    fireAnalyticsEvent('keyboard_navigation', { direction: 'home' });
                    handled = true;
                    break;
                    
                case 'End':
                    e.preventDefault();
                    scrollToSection(state.sections.length - 1);
                    fireAnalyticsEvent('keyboard_navigation', { direction: 'end' });
                    handled = true;
                    break;
            }
            
            if (handled) {
                console.log(`⌨️ Keyboard navigation: ${e.key} -> section ${state.currentIndex}`);
            }
        });
    }
    
    /**
     * Автоматическая доводка при скролле
     */
    function initAutoSnapScrolling() {
        if (!config.autoSnap) return;
        
        let isUserScrolling = false;
        let scrollDirection = 0;
        let lastScrollY = window.pageYOffset;
        
        // Обработчик скролла
        function handleScroll() {
            const currentScrollY = window.pageYOffset;
            scrollDirection = currentScrollY > lastScrollY ? 1 : -1;
            lastScrollY = currentScrollY;
            
            state.isScrolling = true;
            state.lastScrollTime = Date.now();
            
            // Очищаем предыдущий таймер
            if (state.scrollTimeout) {
                clearTimeout(state.scrollTimeout);
            }
            
            // Устанавливаем новый таймер для автодоводки
            state.scrollTimeout = setTimeout(() => {
                if (state.isScrolling) {
                    performAutoSnap(scrollDirection);
                    state.isScrolling = false;
                }
            }, config.snapDelay);
        }
        
        // Обработчик остановки скролла
        function handleScrollEnd() {
            state.isScrolling = false;
            
            // Дополнительная проверка через небольшую задержку
            setTimeout(() => {
                if (!state.isScrolling) {
                    performAutoSnap(scrollDirection);
                }
            }, 50);
        }
        
        // Слушатели событий
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('scrollend', handleScrollEnd, { passive: true });
        
        // Fallback для браузеров без scrollend
        let scrollEndTimer;
        window.addEventListener('scroll', function() {
            clearTimeout(scrollEndTimer);
            scrollEndTimer = setTimeout(handleScrollEnd, 150);
        }, { passive: true });
        
        console.log('🎯 Auto-snap scrolling initialized');
    }
    
    /**
     * Выполнение автодоводки к ближайшей секции
     */
    function performAutoSnap(direction = 0) {
        if (state.isMobile || isInputFocused() || isMobileMenuOpen()) return;
        
        const windowHeight = window.innerHeight;
        const scrollY = window.pageYOffset;
        const windowCenter = scrollY + windowHeight / 2;
        
        let targetSection = null;
        let targetIndex = -1;
        let minDistance = Infinity;
        
        // Находим ближайшую секцию к центру экрана
        state.sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = scrollY + rect.top;
            const sectionCenter = sectionTop + rect.height / 2;
            const distance = Math.abs(windowCenter - sectionCenter);
            
            // Проверяем, видна ли секция хотя бы на threshold%
            const visibleHeight = Math.min(scrollY + windowHeight, sectionTop + rect.height) - 
                                Math.max(scrollY, sectionTop);
            const visibilityRatio = visibleHeight / rect.height;
            
            if (visibilityRatio > config.snapThreshold && distance < minDistance) {
                minDistance = distance;
                targetSection = section;
                targetIndex = index;
            }
        });
        
        // Если не нашли подходящую секцию, используем направление скролла
        if (targetIndex === -1) {
            if (direction > 0 && state.currentIndex < state.sections.length - 1) {
                targetIndex = state.currentIndex + 1;
            } else if (direction < 0 && state.currentIndex > 0) {
                targetIndex = state.currentIndex - 1;
            } else {
                targetIndex = state.currentIndex;
            }
            targetSection = state.sections[targetIndex];
        }
        
        // Выполняем автодоводку только если нужно
        if (targetIndex !== state.currentIndex && targetSection) {
            console.log(`🧲 Auto-snap: ${state.currentIndex} -> ${targetIndex}`);
            
            // Плавно доводим до центра секции
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
            
            state.currentIndex = targetIndex;
            
            // Аналитика
            fireAnalyticsEvent('auto_snap', {
                from_section: state.currentIndex,
                to_section: targetIndex,
                direction: direction > 0 ? 'down' : direction < 0 ? 'up' : 'none'
            });
        }
    }
    
    /**
     * Определение ближайшей секции к центру экрана
     */
    function getClosestSectionToCenter() {
        const windowHeight = window.innerHeight;
        const scrollY = window.pageYOffset;
        const windowCenter = scrollY + windowHeight / 2;
        
        let closestSection = null;
        let closestIndex = -1;
        let minDistance = Infinity;
        
        state.sections.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            const sectionTop = scrollY + rect.top;
            const sectionCenter = sectionTop + rect.height / 2;
            const distance = Math.abs(windowCenter - sectionCenter);
            
            if (distance < minDistance) {
                minDistance = distance;
                closestSection = section;
                closestIndex = index;
            }
        });
        
        return { section: closestSection, index: closestIndex, distance: minDistance };
    }
    function initTouchNavigation() {
        if (!config.touchNavigation) return;
        
        document.addEventListener('touchstart', function(e) {
            state.touchStart.y = e.touches[0].clientY;
            state.touchStart.time = Date.now();
        }, { passive: true });
        
        document.addEventListener('touchend', function(e) {
            if (!state.touchStart.y) return;
            
            const endY = e.changedTouches[0].clientY;
            const distance = state.touchStart.y - endY;
            const time = Date.now() - state.touchStart.time;
            
            // Быстрый свайп (минимум 80px за максимум 300ms)
            const isQuickSwipe = Math.abs(distance) > 80 && time < 300;
            
            if (isQuickSwipe && state.isMobile) {
                if (distance > 0 && state.currentIndex < state.sections.length - 1) {
                    // Свайп вверх - следующая секция
                    scrollToSection(state.currentIndex + 1);
                    fireAnalyticsEvent('touch_navigation', { direction: 'up' });
                } else if (distance < 0 && state.currentIndex > 0) {
                    // Свайп вниз - предыдущая секция
                    scrollToSection(state.currentIndex - 1);
                    fireAnalyticsEvent('touch_navigation', { direction: 'down' });
                }
            }
            
            state.touchStart.y = 0;
        }, { passive: true });
    }
    
    /**
     * Наблюдатель за секциями
     */
    function initSectionObserver() {
        const options = {
            threshold: [0.1, 0.3, 0.5, 0.7, 0.9], // Множественные пороги
            rootMargin: config.observerMargin
        };
        
        state.observer = new IntersectionObserver(function(entries) {
            let mostVisibleSection = null;
            let maxVisibility = 0;
            
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > maxVisibility) {
                    maxVisibility = entry.intersectionRatio;
                    mostVisibleSection = entry.target;
                }
            });
            
            if (mostVisibleSection) {
                const newIndex = Array.from(state.sections).indexOf(mostVisibleSection);
                
                if (newIndex !== state.currentIndex && newIndex !== -1) {
                    state.currentIndex = newIndex;
                    
                    // Добавляем класс активной секции
                    state.sections.forEach((section, index) => {
                        section.classList.toggle('active', index === newIndex);
                    });
                    
                    // Уведомляем о смене секции
                    fireCustomEvent('sectionChange', {
                        index: newIndex,
                        section: mostVisibleSection,
                        sectionId: mostVisibleSection.id,
                        visibility: maxVisibility
                    });
                    
                    console.log(`👀 Section active: ${newIndex} (${mostVisibleSection.id}) - ${Math.round(maxVisibility * 100)}% visible`);
                }
            }
        }, options);
        
        // Наблюдаем за всеми секциями
        state.sections.forEach(section => {
            state.observer.observe(section);
        });
    }
    
    /**
     * Обработчик изменения размера окна
     */
    function initResizeHandler() {
        let resizeTimeout;
        
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const wasMobile = state.isMobile;
                checkMobileDevice();
                
                // Если изменился тип устройства
                if (wasMobile !== state.isMobile) {
                    applyCSSSnap();
                    console.log(`📱 Device type changed: ${state.isMobile ? 'mobile' : 'desktop'}`);
                }
            }, 250);
        });
    }
    
    /**
     * Проверка фокуса на элементах ввода
     */
    function isInputFocused() {
        const activeElement = document.activeElement;
        const inputTypes = ['INPUT', 'TEXTAREA', 'SELECT'];
        return inputTypes.includes(activeElement.tagName);
    }
    
    /**
     * Проверка открытого мобильного меню
     */
    function isMobileMenuOpen() {
        const mobileNav = document.getElementById('mobile-nav');
        return mobileNav && mobileNav.classList.contains('active');
    }
    
    /**
     * Отправка события аналитики
     */
    function fireAnalyticsEvent(eventName, data = {}) {
        // Google Analytics
        if (typeof gtag === 'function') {
            gtag('event', eventName, data);
        }
        
        // Yandex Metrica
        if (typeof ym === 'function') {
            ym(window.yaCounterId, 'reachGoal', eventName, data);
        }
        
        // Custom analytics
        if (window.analytics && typeof window.analytics.track === 'function') {
            window.analytics.track(eventName, data);
        }
    }
    
    /**
     * Отправка кастомного события
     */
    function fireCustomEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { 
            detail: detail,
            bubbles: true 
        });
        document.dispatchEvent(event);
    }
    
    /**
     * Экспорт API
     */
    function exposeAPI() {
        window.SnapScrolling = {
            // Основные методы
            scrollToSection: scrollToSection,
            getCurrentSection: () => state.currentIndex,
            getSectionsCount: () => state.sections.length,
            
            // Утилиты
            scrollToNext: () => {
                if (state.currentIndex < state.sections.length - 1) {
                    return scrollToSection(state.currentIndex + 1);
                }
                return false;
            },
            
            scrollToPrev: () => {
                if (state.currentIndex > 0) {
                    return scrollToSection(state.currentIndex - 1);
                }
                return false;
            },
            
            scrollToFirst: () => scrollToSection(0),
            scrollToLast: () => scrollToSection(state.sections.length - 1),
            
            // Новые методы для автодоводки
            snapToClosest: () => {
                const closest = getClosestSectionToCenter();
                if (closest.index !== -1) {
                    scrollToSection(closest.index);
                    return true;
                }
                return false;
            },
            
            forceAutoSnap: () => performAutoSnap(0),
            
            getClosestSection: getClosestSectionToCenter,
            
            // Состояние
            isMobile: () => state.isMobile,
            isInitialized: () => state.isInitialized,
            
            // Конфигурация
            getConfig: () => ({ ...config }),
            updateConfig: (newConfig) => {
                Object.assign(config, newConfig);
                if (state.isInitialized) {
                    applyCSSSnap();
                }
            },
            
            // Отладка
            debug: () => ({
                state: { ...state },
                config: { ...config },
                sections: Array.from(state.sections).map((s, i) => ({
                    index: i,
                    id: s.id,
                    element: s
                }))
            })
        };
        
        console.log('🔧 SnapScrolling API available at window.SnapScrolling');
    }
    
    /**
     * Обновление существующих функций навигации
     */
    function updateExistingNavigation() {
        // Интеграция с существующими функциями кнопок
        const originalFunctions = {
            scrollToContactFormArtist: window.scrollToContactFormArtist,
            scrollToContactFormInvestor: window.scrollToContactFormInvestor,
            scrollToContactFormPartner: window.scrollToContactFormPartner
        };
        
        // Обновляем функции для использования snap-скроллинга
        window.scrollToContactFormArtist = function() {
            const contactSection = document.getElementById('contacts');
            if (contactSection) {
                const index = Array.from(state.sections).indexOf(contactSection);
                if (index !== -1) {
                    scrollToSection(index);
                    // Вызываем оригинальную функцию для дополнительной логики
                    if (originalFunctions.scrollToContactFormArtist) {
                        setTimeout(() => originalFunctions.scrollToContactFormArtist(), 1000);
                    }
                }
            }
        };
        
        window.scrollToContactFormInvestor = function() {
            const investorSection = document.getElementById('investors');
            if (investorSection) {
                const index = Array.from(state.sections).indexOf(investorSection);
                if (index !== -1) {
                    scrollToSection(index);
                    if (originalFunctions.scrollToContactFormInvestor) {
                        setTimeout(() => originalFunctions.scrollToContactFormInvestor(), 1000);
                    }
                }
            }
        };
        
        window.scrollToContactFormPartner = function() {
            const contactSection = document.getElementById('contacts');
            if (contactSection) {
                const index = Array.from(state.sections).indexOf(contactSection);
                if (index !== -1) {
                    scrollToSection(index);
                    if (originalFunctions.scrollToContactFormPartner) {
                        setTimeout(() => originalFunctions.scrollToContactFormPartner(), 1000);
                    }
                }
            }
        };
    }
    
    /**
     * Инициализация после загрузки DOM
     */
    function initWhenReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            // DOM уже загружен
            setTimeout(init, 100);
        }
        
        // Дополнительная проверка после полной загрузки
        window.addEventListener('load', function() {
            if (!state.isInitialized) {
                setTimeout(init, 200);
            } else {
                updateExistingNavigation();
            }
        });
    }
    
    // Запуск инициализации
    initWhenReady();
    
})();