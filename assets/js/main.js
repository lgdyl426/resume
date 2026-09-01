/* ========== Main JavaScript - Resume Website ========== */

(function() {
    'use strict';

    // ========== DOM Ready ==========
    document.addEventListener('DOMContentLoaded', function() {
        initNavbar();
        initScrollProgress();
        initScrollAnimations();
        initThemeToggle();
        initMobileMenu();
        initStatCounters();
        initSkillBars();
        initYear();
        initActiveNavLink();
    });

    // ========== Navbar Scroll Effect ==========
    function initNavbar() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;

        function handleScroll() {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
    }

    // ========== Scroll Progress Bar ==========
    function initScrollProgress() {
        const progressBar = document.querySelector('.scroll-progress');
        if (!progressBar) return;

        function updateProgress() {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
            progressBar.style.width = progress + '%';
        }

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress();
    }

    // ========== Scroll Animations (Fade In) ==========
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in, .fade-in-left, .fade-in-right, .stagger');
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        animatedElements.forEach(el => observer.observe(el));
    }

    // ========== Theme Toggle ==========
    function initThemeToggle() {
        const toggleBtn = document.querySelector('.theme-toggle');
        if (!toggleBtn) return;

        // Load saved theme
        const savedTheme = localStorage.getItem('resume-theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.setAttribute('data-theme', 'dark');
        }

        updateToggleIcon();

        toggleBtn.addEventListener('click', function() {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('resume-theme', newTheme);
            updateToggleIcon();
        });

        function updateToggleIcon() {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            toggleBtn.innerHTML = isDark ? '☀️' : '🌙';
            toggleBtn.title = isDark ? '切换到亮色模式' : '切换到暗色模式';
        }
    }

    // ========== Mobile Menu ==========
    function initMobileMenu() {
        const menuBtn = document.querySelector('.mobile-menu-btn');
        const navLinks = document.querySelector('.nav-links');
        if (!menuBtn || !navLinks) return;

        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('open');
        });

        // Close menu when clicking a link
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('open');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!menuBtn.contains(e.target) && !navLinks.contains(e.target)) {
                navLinks.classList.remove('open');
            }
        });
    }

    // ========== Stat Counter Animation ==========
    function initStatCounters() {
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        if (!statNumbers.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        statNumbers.forEach(el => observer.observe(el));

        function animateCounter(el) {
            const target = parseInt(el.dataset.target, 10);
            const duration = 1500;
            const startTime = performance.now();
            const suffix = el.dataset.suffix || '';

            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeOut = 1 - Math.pow(1 - progress, 3);
                const current = Math.floor(target * easeOut);
                el.textContent = current + suffix;

                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    el.textContent = target + suffix;
                }
            }

            requestAnimationFrame(update);
        }
    }

    // ========== Skill Bar Animation ==========
    function initSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress[data-percent]');
        if (!skillBars.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const percent = entry.target.dataset.percent;
                    entry.target.style.width = percent + '%';
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.3 });

        skillBars.forEach(bar => observer.observe(bar));
    }

    // ========== Auto Update Year ==========
    function initYear() {
        const yearElements = document.querySelectorAll('[data-year]');
        const currentYear = new Date().getFullYear();
        yearElements.forEach(el => {
            el.textContent = currentYear;
        });
    }

    // ========== Active Nav Link ==========
    function initActiveNavLink() {
        const currentPage = getCurrentPage();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage) {
                link.classList.add('active');
            }
        });
    }

    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page;
    }

    // ========== Smooth Scroll for Anchor Links ==========
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        
        const targetId = link.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const navHeight = document.querySelector('.navbar')?.offsetHeight || 64;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });

})();
