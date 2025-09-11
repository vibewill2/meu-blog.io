// ===== MAIN BLOG FUNCTIONALITY =====

class BlogManager {
    constructor() {
        this.posts = [];
        this.currentFilter = 'all';
        this.postsPerPage = 6;
        this.currentPage = 1;
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPosts();
        this.setupAnimations();
        this.handleLoader();
        this.setupTheme();
    }

    // ===== EVENT BINDINGS =====
    bindEvents() {
        // Navigation
        document.addEventListener('DOMContentLoaded', () => {
            this.setupNavigation();
            this.setupMobileMenu();
            this.setupBackToTop();
            this.setupModals();
            this.setupForms();
            this.setupScrollEffects();
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Filter buttons
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleFilter(e.target.dataset.filter);
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', this.loadMorePosts.bind(this));
        }

        // Hero buttons
        const exploreBtn = document.getElementById('explore-btn');
        const newsletterBtn = document.getElementById('newsletter-btn');
        
        if (exploreBtn) {
            exploreBtn.addEventListener('click', () => {
                this.scrollToSection('posts');
            });
        }

        if (newsletterBtn) {
            newsletterBtn.addEventListener('click', () => {
                this.openModal('newsletter-modal');
            });
        }
    }

    // ===== LOADER =====
    handleLoader() {
        window.addEventListener('load', () => {
            setTimeout(() => {
                const loader = document.getElementById('loader');
                if (loader) {
                    loader.classList.add('hidden');
                }
            }, 1000);
        });
    }

    // ===== THEME MANAGEMENT =====
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    }

    updateThemeIcon(theme) {
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            const icon = themeToggle.querySelector('i');
            icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }

    // ===== NAVIGATION =====
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Smooth scroll for navigation links
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId.startsWith('#')) {
                    this.scrollToSection(targetId.substring(1));
                    this.setActiveNavLink(link);
                }
            });
        });

        // Set active nav link on scroll
        window.addEventListener('scroll', this.handleNavScroll.bind(this));
    }

    setupMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                this.animateHamburger(navToggle);
            });

            // Close menu when clicking on a link
            navMenu.addEventListener('click', (e) => {
                if (e.target.classList.contains('nav-link')) {
                    navMenu.classList.remove('active');
                    this.animateHamburger(navToggle, false);
                }
            });
        }
    }

    animateHamburger(toggle, isActive = null) {
        const spans = toggle.querySelectorAll('span');
        const shouldBeActive = isActive !== null ? isActive : toggle.classList.contains('active');
        
        if (shouldBeActive) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans.forEach(span => {
                span.style.transform = '';
                span.style.opacity = '';
            });
        }
        
        toggle.classList.toggle('active');
    }

    handleNavScroll() {
        const sections = document.querySelectorAll('section[id]');
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                this.setActiveNavLink(navLink);
            }
        });
    }

    setActiveNavLink(activeLink) {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const offsetTop = section.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    }

    // ===== BACK TO TOP =====
    setupBackToTop() {
        const backToTopBtn = document.getElementById('back-to-top');
        
        if (backToTopBtn) {
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    backToTopBtn.classList.add('visible');
                } else {
                    backToTopBtn.classList.remove('visible');
                }
            });

            backToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }
    }

    // ===== POSTS MANAGEMENT =====
    async loadPosts() {
        this.showPostsLoading();
        
        try {
            const response = await fetch('data/posts.json');
            if (response.ok) {
                this.posts = await response.json();
            } else {
                // If posts.json doesn't exist, create sample posts
                this.posts = this.createSamplePosts();
            }
            this.renderPosts();
        } catch (error) {
            console.log('Loading sample posts...');
            this.posts = this.createSamplePosts();
            this.renderPosts();
        }
    }

    createSamplePosts() {
        return [
            {
                id: 1,
                title: "Bem-vindo ao VibeWill Blog!",
                excerpt: "Este é o primeiro post do nosso blog. Aqui você encontrará conteúdos incríveis sobre tecnologia, lifestyle e muito mais.",
                content: "Conteúdo completo do post...",
                category: "tecnologia",
                date: "2024-01-15",
                author: "VibeWill",
                image: "fas fa-rocket"
            },
            {
                id: 2,
                title: "Tendências de Design em 2024",
                excerpt: "Descubra as principais tendências de design que estão dominando o mercado este ano.",
                content: "Conteúdo completo do post...",
                category: "design",
                date: "2024-01-10",
                author: "VibeWill",
                image: "fas fa-palette"
            },
            {
                id: 3,
                title: "Produtividade e Lifestyle",
                excerpt: "Dicas essenciais para equilibrar vida pessoal e profissional de forma saudável.",
                content: "Conteúdo completo do post...",
                category: "lifestyle",
                date: "2024-01-05",
                author: "VibeWill",
                image: "fas fa-coffee"
            },
            {
                id: 4,
                title: "JavaScript Moderno: Guia Completo",
                excerpt: "Aprenda as funcionalidades mais recentes do JavaScript e como aplicá-las em seus projetos.",
                content: "Conteúdo completo do post...",
                category: "tecnologia",
                date: "2024-01-01",
                author: "VibeWill",
                image: "fas fa-code"
            },
            {
                id: 5,
                title: "Minimalismo no Design Digital",
                excerpt: "Como aplicar os conceitos do minimalismo para criar interfaces mais limpas e eficientes.",
                content: "Conteúdo completo do post...",
                category: "design",
                date: "2023-12-28",
                author: "VibeWill",
                image: "fas fa-minimize"
            },
            {
                id: 6,
                title: "Rotina Matinal Produtiva",
                excerpt: "Transforme suas manhãs e aumente sua produtividade com essas dicas simples.",
                content: "Conteúdo completo do post...",
                category: "lifestyle",
                date: "2023-12-25",
                author: "VibeWill",
                image: "fas fa-sun"
            }
        ];
    }

    handleFilter(filter) {
        this.currentFilter = filter;
        this.currentPage = 1;
        
        // Update active filter button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        
        this.renderPosts();
    }

    getFilteredPosts() {
        if (this.currentFilter === 'all') {
            return this.posts;
        }
        return this.posts.filter(post => post.category === this.currentFilter);
    }

    renderPosts() {
        const postsGrid = document.getElementById('posts-grid');
        if (!postsGrid) return;

        const filteredPosts = this.getFilteredPosts();
        const startIndex = 0;
        const endIndex = this.currentPage * this.postsPerPage;
        const postsToShow = filteredPosts.slice(startIndex, endIndex);

        postsGrid.innerHTML = '';

        if (postsToShow.length === 0) {
            postsGrid.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-search"></i>
                    <h3>Nenhum post encontrado</h3>
                    <p>Tente selecionar uma categoria diferente.</p>
                </div>
            `;
            return;
        }

        postsToShow.forEach((post, index) => {
            const postElement = this.createPostElement(post, index);
            postsGrid.appendChild(postElement);
        });

        // Show/hide load more button
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            if (endIndex >= filteredPosts.length) {
                loadMoreBtn.style.display = 'none';
            } else {
                loadMoreBtn.style.display = 'inline-flex';
            }
        }

        // Apply entrance animations
        this.animatePostsEntrance();
    }

    createPostElement(post, index) {
        const postEl = document.createElement('article');
        postEl.className = 'post-card animate-in';
        postEl.style.animationDelay = `${index * 0.1}s`;
        
        postEl.innerHTML = `
            <div class="post-image">
                <i class="${post.image}"></i>
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-category">${this.capitalizeFirst(post.category)}</span>
                    <span class="post-date">
                        <i class="fas fa-calendar"></i>
                        ${this.formatDate(post.date)}
                    </span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-footer">
                    <a href="#" class="read-more" data-post-id="${post.id}">
                        Ler mais
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <div class="post-author">
                        <i class="fas fa-user"></i>
                        ${post.author}
                    </div>
                </div>
            </div>
        `;

        // Add click event for read more
        const readMoreBtn = postEl.querySelector('.read-more');
        readMoreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.showPostModal(post);
        });

        return postEl;
    }

    showPostModal(post) {
        // Create modal dynamically
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.id = 'post-modal';
        
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <button class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
                <div class="modal-body">
                    <div class="post-image" style="height: 200px; margin-bottom: 2rem;">
                        <i class="${post.image}"></i>
                    </div>
                    <div class="post-meta" style="margin-bottom: 1rem;">
                        <span class="post-category">${this.capitalizeFirst(post.category)}</span>
                        <span class="post-date">
                            <i class="fas fa-calendar"></i>
                            ${this.formatDate(post.date)}
                        </span>
                    </div>
                    <h2 style="margin-bottom: 1rem;">${post.title}</h2>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">${post.excerpt}</p>
                    <div class="post-content">
                        <p>${post.content}</p>
                    </div>
                    <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 1rem;">
                        <i class="fas fa-user"></i>
                        <span>Por ${post.author}</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal events
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    loadMorePosts() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.currentPage++;
        
        setTimeout(() => {
            this.renderPosts();
            this.isLoading = false;
        }, 500);
    }

    showPostsLoading() {
        const postsGrid = document.getElementById('posts-grid');
        if (postsGrid) {
            postsGrid.innerHTML = `
                <div class="posts-loading">
                    <div class="loading-spinner"></div>
                    <p>Carregando posts...</p>
                </div>
            `;
        }
    }

    animatePostsEntrance() {
        const posts = document.querySelectorAll('.post-card.animate-in');
        posts.forEach((post, index) => {
            setTimeout(() => {
                post.classList.add('visible');
            }, index * 100);
        });
    }

    // ===== ANIMATIONS =====
    setupAnimations() {
        // Animate on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe elements for animation
        document.querySelectorAll('.animate-in').forEach(el => {
            observer.observe(el);
        });

        // Animate statistics numbers
        this.animateStats();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-number');
        
        const animateNumber = (element) => {
            const target = parseInt(element.dataset.target);
            const increment = target / 100;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                element.textContent = Math.ceil(current);
            }, 20);
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    animateNumber(entry.target);
                }
            });
        });

        statNumbers.forEach(stat => observer.observe(stat));
    }

    setupScrollEffects() {
        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.floating-cards');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.2}px)`;
            }
        });
    }

    // ===== MODALS =====
    setupModals() {
        // Newsletter modal
        const newsletterModal = document.getElementById('newsletter-modal');
        const newsletterClose = document.getElementById('newsletter-close');
        
        if (newsletterClose) {
            newsletterClose.addEventListener('click', () => {
                this.closeModal('newsletter-modal');
            });
        }

        if (newsletterModal) {
            newsletterModal.addEventListener('click', (e) => {
                if (e.target === newsletterModal) {
                    this.closeModal('newsletter-modal');
                }
            });
        }
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    // ===== FORMS =====
    setupForms() {
        // Contact form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', this.handleContactForm.bind(this));
        }

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', this.handleNewsletterForm.bind(this));
        }
    }

    handleContactForm(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);
        
        // Show success message
        this.showNotification('Mensagem enviada com sucesso!', 'success');
        e.target.reset();
    }

    handleNewsletterForm(e) {
        e.preventDefault();
        const email = e.target.querySelector('input[type="email"]').value;
        
        // Show success message
        this.showNotification('Inscrição realizada com sucesso!', 'success');
        this.closeModal('newsletter-modal');
        e.target.reset();
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 2rem;
            background: ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            gap: 1rem;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            padding: 0.25rem;
        `;

        const closeNotification = () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        };

        closeBtn.addEventListener('click', closeNotification);

        // Auto remove after 5 seconds
        setTimeout(closeNotification, 5000);
    }

    // ===== UTILITY FUNCTIONS =====
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    formatDate(dateStr) {
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

// ===== INITIALIZE =====
document.addEventListener('DOMContentLoaded', () => {
    new BlogManager();
});

// ===== UTILITY FUNCTIONS =====
// Smooth scroll polyfill
if (!('scrollBehavior' in document.documentElement.style)) {
    const smoothscroll = () => {
        const links = document.querySelectorAll('a[href*="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    };
    smoothscroll();
}

// Performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Add debounced scroll event
window.addEventListener('scroll', debounce(() => {
    // Scroll-based animations can be added here
}, 10));

// Service Worker registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
