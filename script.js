// Dados dos posts do blog
const blogPosts = [
    {
        id: 1,
        title: "Como Criar Interfaces Modernas com CSS Grid",
        excerpt: "Descubra as técnicas mais avançadas para criar layouts responsivos e elegantes usando CSS Grid. Um guia completo para desenvolvedores.",
        category: "tecnologia",
        date: "2024-03-15",
        readTime: "8 min",
        likes: 42,
        comments: 12,
        icon: "fas fa-code",
        featured: true
    },
    {
        id: 2,
        title: "10 Hábitos Que Mudaram Minha Vida",
        excerpt: "Pequenas mudanças que podem ter um grande impacto no seu dia a dia. Aprenda como implementar hábitos positivos de forma sustentável.",
        category: "lifestyle",
        date: "2024-03-12",
        readTime: "5 min",
        likes: 89,
        comments: 23,
        icon: "fas fa-heart",
        featured: true
    },
    {
        id: 3,
        title: "JavaScript ES6+: Guia Completo",
        excerpt: "Tudo que você precisa saber sobre as funcionalidades modernas do JavaScript para se tornar um desenvolvedor mais eficiente.",
        category: "tutorial",
        date: "2024-03-10",
        readTime: "12 min",
        likes: 156,
        comments: 34,
        icon: "fab fa-js-square",
        featured: false
    },
    {
        id: 4,
        title: "Produtividade no Home Office",
        excerpt: "Dicas práticas para manter o foco e a produtividade trabalhando de casa. Estratégias testadas por profissionais remotos.",
        category: "lifestyle",
        date: "2024-03-08",
        readTime: "6 min",
        likes: 67,
        comments: 18,
        icon: "fas fa-home",
        featured: false
    },
    {
        id: 5,
        title: "React Hooks: Do Básico ao Avançado",
        excerpt: "Um mergulho profundo nos React Hooks, desde os conceitos básicos até padrões avançados para aplicações complexas.",
        category: "tutorial",
        date: "2024-03-05",
        readTime: "15 min",
        likes: 203,
        comments: 56,
        icon: "fab fa-react",
        featured: false
    },
    {
        id: 6,
        title: "Design Thinking na Prática",
        excerpt: "Como aplicar metodologias de design thinking para resolver problemas complexos de forma criativa e inovadora.",
        category: "tecnologia",
        date: "2024-03-03",
        readTime: "10 min",
        likes: 78,
        comments: 21,
        icon: "fas fa-lightbulb",
        featured: false
    },
    {
        id: 7,
        title: "Minimalismo Digital: Menos é Mais",
        excerpt: "Como reduzir o ruído digital em sua vida e focar no que realmente importa. Estratégias para uma vida digital mais consciente.",
        category: "lifestyle",
        date: "2024-03-01",
        readTime: "7 min",
        likes: 134,
        comments: 29,
        icon: "fas fa-mobile-alt",
        featured: false
    },
    {
        id: 8,
        title: "API REST com Node.js e Express",
        excerpt: "Tutorial passo a passo para criar uma API REST robusta e escalável usando Node.js, Express e melhores práticas de desenvolvimento.",
        category: "tutorial",
        date: "2024-02-28",
        readTime: "20 min",
        likes: 187,
        comments: 43,
        icon: "fab fa-node-js",
        featured: false
    }
];

// Estado da aplicação
let currentFilter = 'all';
let displayedPosts = 6;
const postsPerLoad = 3;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupNavigation();
    setupHeroButtons();
    setupFilterButtons();
    setupLoadMore();
    setupNewsletter();
    renderFeaturedPosts();
    renderPosts();
}

// Navegação mobile
function setupNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Fechar menu ao clicar em um link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            
            // Atualizar link ativo
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Scroll suave para seções
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Botões da seção hero
function setupHeroButtons() {
    const exploreBtn = document.getElementById('explore-btn');
    const aboutBtn = document.getElementById('about-btn');

    exploreBtn.addEventListener('click', function() {
        const postsSection = document.getElementById('posts');
        const offsetTop = postsSection.offsetTop - 80;
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    });

    aboutBtn.addEventListener('click', function() {
        showModal('sobre', {
            title: 'Sobre Mim',
            content: `
                <p>Olá! Sou um desenvolvedor apaixonado por tecnologia e compartilhamento de conhecimento.</p>
                <p>Neste blog, escrevo sobre desenvolvimento web, produtividade, lifestyle e reflexões sobre a vida moderna.</p>
                <p>Meu objetivo é criar conteúdo que inspire e ajude outros desenvolvedores em sua jornada.</p>
            `
        });
    });
}

// Filtros de categoria
function setupFilterButtons() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remover classe active de todos os botões
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Adicionar classe active ao botão clicado
            this.classList.add('active');

            // Atualizar filtro atual
            currentFilter = this.dataset.category;
            displayedPosts = postsPerLoad;
            
            // Re-renderizar posts
            renderPosts();
            updateLoadMoreButton();
        });
    });
}

// Carregar mais posts
function setupLoadMore() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    
    loadMoreBtn.addEventListener('click', function() {
        displayedPosts += postsPerLoad;
        renderPosts();
        updateLoadMoreButton();
        
        // Adicionar animação de loading
        const btn = this;
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<span>Carregando...</span><i class="fas fa-spinner fa-spin"></i>';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
        }, 800);
    });
}

// Newsletter
function setupNewsletter() {
    const form = document.getElementById('newsletter-form');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        
        showModal('newsletter', {
            title: 'Inscrição Realizada!',
            content: `
                <p>Obrigado por se inscrever na nossa newsletter!</p>
                <p>Em breve você receberá os melhores conteúdos em <strong>${email}</strong></p>
                <div style="text-align: center; margin-top: 1rem;">
                    <i class="fas fa-check-circle" style="color: #48bb78; font-size: 3rem;"></i>
                </div>
            `
        });
        
        this.reset();
    });
}

// Renderizar posts em destaque
function renderFeaturedPosts() {
    const container = document.getElementById('featured-posts');
    const featuredPosts = blogPosts.filter(post => post.featured);
    
    container.innerHTML = featuredPosts.map(post => createPostCard(post, true)).join('');
    
    // Adicionar event listeners
    addPostEventListeners();
}

// Renderizar posts
function renderPosts() {
    const container = document.getElementById('posts-container');
    let filteredPosts = blogPosts.filter(post => !post.featured);
    
    // Aplicar filtro
    if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === currentFilter);
    }
    
    // Limitar número de posts exibidos
    const postsToShow = filteredPosts.slice(0, displayedPosts);
    
    container.innerHTML = postsToShow.map(post => createPostCard(post)).join('');
    
    // Adicionar event listeners
    addPostEventListeners();
    updateLoadMoreButton();
}

// Criar HTML do card do post
function createPostCard(post, isFeatured = false) {
    const formattedDate = formatDate(post.date);
    const featuredClass = isFeatured ? 'featured' : '';
    
    return `
        <article class="post-card ${featuredClass}" data-post-id="${post.id}">
            <div class="post-image">
                <i class="${post.icon}"></i>
            </div>
            <div class="post-content">
                <div class="post-meta">
                    <span class="post-category">${post.category}</span>
                    <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                    <span><i class="far fa-clock"></i> ${post.readTime}</span>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-footer">
                    <a href="#" class="read-more">
                        <span>Ler mais</span>
                        <i class="fas fa-arrow-right"></i>
                    </a>
                    <div class="post-stats">
                        <span><i class="far fa-heart"></i> ${post.likes}</span>
                        <span><i class="far fa-comment"></i> ${post.comments}</span>
                    </div>
                </div>
            </div>
        </article>
    `;
}

// Adicionar event listeners aos posts
function addPostEventListeners() {
    const postCards = document.querySelectorAll('.post-card');
    
    postCards.forEach(card => {
        card.addEventListener('click', function() {
            const postId = parseInt(this.dataset.postId);
            const post = blogPosts.find(p => p.id === postId);
            
            if (post) {
                showPostModal(post);
            }
        });
    });
}

// Mostrar modal do post
function showPostModal(post) {
    const formattedDate = formatDate(post.date);
    
    showModal('post', {
        title: post.title,
        content: `
            <div class="modal-post-meta">
                <span class="post-category">${post.category}</span>
                <span><i class="far fa-calendar"></i> ${formattedDate}</span>
                <span><i class="far fa-clock"></i> ${post.readTime}</span>
            </div>
            <div class="modal-post-image">
                <i class="${post.icon}"></i>
            </div>
            <div class="modal-post-content">
                <p>${post.excerpt}</p>
                <p>Este é o conteúdo completo do post "${post.title}". Aqui você encontraria o artigo completo com todos os detalhes, exemplos de código, imagens e informações relevantes sobre o tópico.</p>
                <p>Para uma implementação real, você conectaria este blog a um CMS ou banco de dados com o conteúdo completo dos artigos.</p>
                <div class="modal-post-stats">
                    <span><i class="far fa-heart"></i> ${post.likes} curtidas</span>
                    <span><i class="far fa-comment"></i> ${post.comments} comentários</span>
                </div>
            </div>
        `
    });
}

// Sistema de modal genérico
function showModal(type, data) {
    // Remover modal existente
    const existingModal = document.querySelector('.modal-overlay');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${data.title}</h2>
                    <button class="modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${data.content}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Adicionar estilos do modal se não existirem
    if (!document.querySelector('#modal-styles')) {
        addModalStyles();
    }
    
    // Event listeners do modal
    const modal = document.querySelector('.modal-overlay');
    const closeBtn = modal.querySelector('.modal-close');
    
    closeBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    // Fechar com ESC
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
    
    // Animar entrada
    setTimeout(() => modal.classList.add('active'), 10);
}

// Adicionar estilos do modal dinamicamente
function addModalStyles() {
    const styles = `
        <style id="modal-styles">
            .modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                visibility: hidden;
                transition: all 0.3s ease;
            }
            
            .modal-overlay.active {
                opacity: 1;
                visibility: visible;
            }
            
            .modal-content {
                background: white;
                border-radius: var(--border-radius);
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                transform: translateY(-50px);
                transition: transform 0.3s ease;
            }
            
            .modal-overlay.active .modal-content {
                transform: translateY(0);
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1.5rem;
                border-bottom: 1px solid var(--border-color);
            }
            
            .modal-header h2 {
                margin: 0;
                color: var(--text-primary);
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 1.5rem;
                cursor: pointer;
                color: var(--text-muted);
                transition: var(--transition);
                padding: 0.5rem;
                border-radius: 50%;
            }
            
            .modal-close:hover {
                background: var(--bg-secondary);
                color: var(--text-primary);
            }
            
            .modal-body {
                padding: 1.5rem;
            }
            
            .modal-post-meta {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }
            
            .modal-post-image {
                text-align: center;
                padding: 2rem;
                background: var(--gradient-accent);
                color: white;
                font-size: 4rem;
                border-radius: var(--border-radius);
                margin-bottom: 1.5rem;
            }
            
            .modal-post-content p {
                margin-bottom: 1rem;
                line-height: 1.7;
                color: var(--text-secondary);
            }
            
            .modal-post-stats {
                display: flex;
                gap: 1rem;
                margin-top: 1.5rem;
                padding-top: 1.5rem;
                border-top: 1px solid var(--border-color);
                color: var(--text-muted);
            }
        </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
}

// Atualizar botão "Carregar Mais"
function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('load-more-btn');
    let filteredPosts = blogPosts.filter(post => !post.featured);
    
    if (currentFilter !== 'all') {
        filteredPosts = filteredPosts.filter(post => post.category === currentFilter);
    }
    
    if (displayedPosts >= filteredPosts.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'inline-flex';
    }
}

// Formatar data
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Animações de scroll
function setupScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observar elementos para animação
    document.querySelectorAll('.post-card, .section-title').forEach(el => {
        observer.observe(el);
    });
}

// Efeitos de hover personalizados nos botões
function setupButtonHoverEffects() {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Parallax suave no hero
function setupParallax() {
    const hero = document.querySelector('.hero');
    const floatingCards = document.querySelectorAll('.floating-card');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        if (hero) {
            hero.style.transform = `translateY(${rate}px)`;
        }
        
        floatingCards.forEach((card, index) => {
            const speed = (index + 1) * 0.1;
            card.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
}

// Busca dinâmica (funcionalidade extra)
function setupSearch() {
    // Criar barra de busca
    const searchHTML = `
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Buscar posts..." />
            <i class="fas fa-search"></i>
        </div>
    `;
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.toLowerCase();
            filterPostsBySearch(query);
        });
    }
}

function filterPostsBySearch(query) {
    if (!query) {
        renderPosts();
        return;
    }
    
    const filteredPosts = blogPosts.filter(post => 
        !post.featured && 
        (post.title.toLowerCase().includes(query) || 
         post.excerpt.toLowerCase().includes(query) ||
         post.category.toLowerCase().includes(query))
    );
    
    const container = document.getElementById('posts-container');
    container.innerHTML = filteredPosts.map(post => createPostCard(post)).join('');
    addPostEventListeners();
}

// Contador de visualizações (simulado)
function trackPostView(postId) {
    // Em uma implementação real, isso enviaria dados para um servidor
    console.log(`Post ${postId} visualizado`);
}

// Curtir post (simulado)
function likePost(postId) {
    const post = blogPosts.find(p => p.id === postId);
    if (post) {
        post.likes++;
        renderPosts();
        renderFeaturedPosts();
    }
}

// Animação de digitação no hero
function typewriterEffect() {
    const heroTitle = document.querySelector('.hero-title');
    const text = heroTitle.textContent;
    heroTitle.textContent = '';
    
    let i = 0;
    const timer = setInterval(() => {
        if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, 100);
}

// Smooth scroll personalizado para navegação
function smoothScroll(target, duration = 800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const targetPosition = targetElement.offsetTop - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;
    
    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = ease(timeElapsed, startPosition, distance, duration);
        window.scrollTo(0, run);
        if (timeElapsed < duration) requestAnimationFrame(animation);
    }
    
    function ease(t, b, c, d) {
        t /= d / 2;
        if (t < 1) return c / 2 * t * t + b;
        t--;
        return -c / 2 * (t * (t - 2) - 1) + b;
    }
    
    requestAnimationFrame(animation);
}

// Inicializar efeitos adicionais após carregamento
window.addEventListener('load', function() {
    setupScrollAnimations();
    setupButtonHoverEffects();
    setupParallax();
    
    // Adicionar classes de animação com delay
    setTimeout(() => {
        document.querySelectorAll('.post-card').forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }, 100);
});

// Debounce function para performance
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

// Performance optimization para scroll events
const debouncedScrollHandler = debounce(() => {
    // Scroll logic aqui se necessário
}, 10);

window.addEventListener('scroll', debouncedScrollHandler);
