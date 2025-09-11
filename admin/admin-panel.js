// ===== ADMIN PANEL FUNCTIONALITY =====

class AdminPanel {
    constructor() {
        this.posts = [];
        this.currentEditingPost = null;
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupTheme();
        this.bindEvents();
        this.loadPosts();
        this.setupSidebar();
    }

    // ===== AUTHENTICATION =====
    checkAuthentication() {
        const adminSession = localStorage.getItem('admin_session');
        const sessionExpiry = localStorage.getItem('admin_session_expiry');
        
        if (!adminSession || !sessionExpiry || new Date().getTime() > parseInt(sessionExpiry)) {
            // Session expired or doesn't exist
            this.logout();
            return;
        }
    }

    logout() {
        localStorage.removeItem('admin_session');
        localStorage.removeItem('admin_session_expiry');
        localStorage.removeItem('admin_username');
        window.location.href = 'login.html';
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

    // ===== SIDEBAR =====
    setupSidebar() {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                this.saveSidebarState();
            });
        }

        // Load saved sidebar state
        const isCollapsed = localStorage.getItem('sidebar_collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
        }
    }

    saveSidebarState() {
        const sidebar = document.getElementById('sidebar');
        localStorage.setItem('sidebar_collapsed', sidebar.classList.contains('collapsed'));
    }

    // ===== EVENT BINDINGS =====
    bindEvents() {
        // Navigation
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', this.handleNavigation.bind(this));
        });

        // Theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }

        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.logout.bind(this));
        }

        // Post form
        const postForm = document.getElementById('post-form');
        if (postForm) {
            postForm.addEventListener('submit', this.handlePostSubmit.bind(this));
        }

        // Form buttons
        const cancelBtn = document.getElementById('cancel-post');
        const saveDraftBtn = document.getElementById('save-draft');
        const addPostBtn = document.getElementById('add-post-btn');

        if (cancelBtn) {
            cancelBtn.addEventListener('click', this.cancelPost.bind(this));
        }

        if (saveDraftBtn) {
            saveDraftBtn.addEventListener('click', this.saveDraft.bind(this));
        }

        if (addPostBtn) {
            addPostBtn.addEventListener('click', () => this.switchSection('new-post'));
        }

        // Search
        const postsSearch = document.getElementById('posts-search');
        if (postsSearch) {
            postsSearch.addEventListener('input', this.handleSearch.bind(this));
        }

        // Editor toolbar
        document.querySelectorAll('.toolbar-btn').forEach(btn => {
            btn.addEventListener('click', this.handleEditorToolbar.bind(this));
        });
    }

    // ===== NAVIGATION =====
    handleNavigation(e) {
        e.preventDefault();
        const sectionId = e.currentTarget.dataset.section;
        this.switchSection(sectionId);
    }

    switchSection(sectionId) {
        // Update active nav link
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Show section
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionId).classList.add('active');

        // Update page title
        const titles = {
            'dashboard': 'Dashboard',
            'posts': 'Gerenciar Posts',
            'new-post': 'Novo Post',
            'settings': 'Configurações'
        };
        document.getElementById('page-title').textContent = titles[sectionId];

        // Load section data
        if (sectionId === 'posts') {
            this.renderAllPosts();
        } else if (sectionId === 'dashboard') {
            this.renderRecentPosts();
        }
    }

    // ===== POSTS MANAGEMENT =====
    async loadPosts() {
        try {
            // Try to load from API first
            const response = await fetch('/api/posts');
            if (response.ok) {
                this.posts = await response.json();
            } else {
                // Fallback to JSON file
                const fallbackResponse = await fetch('../data/posts.json');
                if (fallbackResponse.ok) {
                    this.posts = await fallbackResponse.json();
                } else {
                    this.posts = this.getDefaultPosts();
                }
            }
            this.updateStats();
            this.renderRecentPosts();
        } catch (error) {
            console.log('Loading from localStorage or defaults');
            // Try localStorage as last resort
            const stored = localStorage.getItem('blog_posts');
            if (stored) {
                try {
                    this.posts = JSON.parse(stored);
                } catch {
                    this.posts = this.getDefaultPosts();
                }
            } else {
                this.posts = this.getDefaultPosts();
            }
            this.updateStats();
            this.renderRecentPosts();
        }
    }

    getDefaultPosts() {
        // This would normally come from the JSON file
        return [
            {
                id: 1,
                title: "Bem-vindo ao VibeWill Blog!",
                excerpt: "Este é o primeiro post do nosso blog...",
                content: "Conteúdo completo do post...",
                category: "tecnologia",
                date: "2024-01-15",
                author: "VibeWill",
                image: "fas fa-rocket",
                status: "published",
                featured: true,
                tags: ["bem-vindo", "blog", "comunidade"]
            }
        ];
    }

    updateStats() {
        document.getElementById('total-posts').textContent = this.posts.length;
    }

    renderRecentPosts() {
        const container = document.getElementById('recent-posts');
        const recentPosts = this.posts.slice(0, 5); // Show last 5 posts
        
        if (recentPosts.length === 0) {
            container.innerHTML = this.getEmptyState('posts');
            return;
        }

        container.innerHTML = recentPosts.map(post => this.createPostListItem(post)).join('');
    }

    renderAllPosts() {
        const container = document.getElementById('all-posts');
        
        if (this.posts.length === 0) {
            container.innerHTML = this.getEmptyState('posts');
            return;
        }

        container.innerHTML = this.posts.map(post => this.createPostListItem(post, true)).join('');
    }

    createPostListItem(post, showActions = false) {
        const date = new Date(post.date).toLocaleDateString('pt-BR');
        
        return `
            <div class="post-item" data-post-id="${post.id}">
                <div class="post-info">
                    <div class="post-title">${post.title}</div>
                    <div class="post-meta">
                        <span class="post-category">${this.capitalizeFirst(post.category)}</span>
                        <span><i class="fas fa-calendar"></i> ${date}</span>
                        <span><i class="fas fa-user"></i> ${post.author}</span>
                        ${post.featured ? '<span><i class="fas fa-star" style="color: #f59e0b;"></i> Destaque</span>' : ''}
                    </div>
                </div>
                ${showActions ? `
                    <div class="post-actions">
                        <button class="action-btn btn-edit" onclick="adminPanel.editPost(${post.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn btn-delete" onclick="adminPanel.deletePost(${post.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
    }

    getEmptyState(type) {
        const messages = {
            posts: {
                icon: 'fas fa-newspaper',
                title: 'Nenhum post encontrado',
                message: 'Comece criando seu primeiro post!'
            }
        };

        const state = messages[type];
        return `
            <div class="empty-state">
                <i class="${state.icon}"></i>
                <h3>${state.title}</h3>
                <p>${state.message}</p>
            </div>
        `;
    }

    // ===== POST EDITOR =====
    editPost(postId) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        this.currentEditingPost = post;
        this.populateForm(post);
        this.switchSection('new-post');
    }

    populateForm(post) {
        document.getElementById('post-title').value = post.title;
        document.getElementById('post-excerpt').value = post.excerpt;
        document.getElementById('post-content').value = post.content;
        document.getElementById('post-category').value = post.category;
        document.getElementById('post-tags').value = post.tags.join(', ');
        document.getElementById('post-image').value = post.image;
        document.getElementById('post-featured').checked = post.featured;
        document.getElementById('post-status').value = post.status;

        // Update form title
        document.querySelector('.post-editor h3').textContent = 'Editar Post';
    }

    clearForm() {
        document.getElementById('post-form').reset();
        this.currentEditingPost = null;
        document.querySelector('.post-editor h3').textContent = 'Novo Post';
    }

    handlePostSubmit(e) {
        e.preventDefault();
        this.savePost('published');
    }

    saveDraft() {
        this.savePost('draft');
    }

    async savePost(status) {
        const formData = new FormData(document.getElementById('post-form'));
        
        const postData = {
            title: formData.get('title'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            image: formData.get('image'),
            featured: formData.has('featured'),
            status: status,
            author: 'VibeWill'
        };

        try {
            let response;
            if (this.currentEditingPost) {
                // Update existing post
                response = await fetch(`/api/posts/${this.currentEditingPost.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postData)
                });
            } else {
                // Create new post
                response = await fetch('/api/posts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(postData)
                });
            }

            if (response.ok) {
                const result = await response.json();
                
                // Reload posts from server
                await this.loadPosts();
                
                this.showNotification(
                    this.currentEditingPost ? 'Post atualizado com sucesso!' : 'Post criado com sucesso!',
                    'success'
                );
                
                this.clearForm();
                this.switchSection('posts');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error saving post:', error);
            this.showNotification('Erro ao salvar post. Tente novamente.', 'error');
        }
    }

    async deletePost(postId) {
        if (!confirm('Tem certeza que deseja excluir este post?')) {
            return;
        }

        try {
            const response = await fetch(`/api/posts/${postId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                // Reload posts from server
                await this.loadPosts();
                this.renderAllPosts();
                this.showNotification('Post excluído com sucesso!', 'success');
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            this.showNotification('Erro ao excluir post. Tente novamente.', 'error');
        }
    }

    cancelPost() {
        if (confirm('Descartar as alterações?')) {
            this.clearForm();
            this.switchSection('dashboard');
        }
    }

    getNextId() {
        return Math.max(...this.posts.map(p => p.id), 0) + 1;
    }

    async savePosts() {
        // Save posts to backend via API
        try {
            localStorage.setItem('blog_posts', JSON.stringify(this.posts));
            this.updateStats();
            return true;
        } catch (error) {
            console.error('Error saving posts:', error);
            return false;
        }
    }

    // ===== SEARCH =====
    handleSearch(e) {
        const searchTerm = e.target.value.toLowerCase();
        const posts = document.querySelectorAll('#all-posts .post-item');
        
        posts.forEach(post => {
            const title = post.querySelector('.post-title').textContent.toLowerCase();
            const shouldShow = title.includes(searchTerm);
            post.style.display = shouldShow ? 'flex' : 'none';
        });
    }

    // ===== EDITOR TOOLBAR =====
    handleEditorToolbar(e) {
        const format = e.currentTarget.dataset.format;
        const textarea = document.getElementById('post-content');
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = textarea.value.substring(start, end);
        
        let replacement = '';
        
        switch (format) {
            case 'bold':
                replacement = `<strong>${selectedText}</strong>`;
                break;
            case 'italic':
                replacement = `<em>${selectedText}</em>`;
                break;
            case 'heading':
                replacement = `<h2>${selectedText}</h2>`;
                break;
            case 'list':
                replacement = `<ul><li>${selectedText}</li></ul>`;
                break;
            case 'link':
                const url = prompt('Digite a URL:');
                if (url) {
                    replacement = `<a href="${url}">${selectedText}</a>`;
                }
                break;
            case 'code':
                replacement = `<code>${selectedText}</code>`;
                break;
        }
        
        if (replacement) {
            textarea.value = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
            textarea.focus();
            textarea.setSelectionRange(start + replacement.length, start + replacement.length);
        }
    }

    // ===== UTILITIES =====
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
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
}

// ===== INITIALIZE ADMIN PANEL =====
let adminPanel;

document.addEventListener('DOMContentLoaded', () => {
    adminPanel = new AdminPanel();
});

// ===== GLOBAL FUNCTIONS =====
// These functions need to be global to be called from HTML
window.adminPanel = {
    editPost: (id) => adminPanel.editPost(id),
    deletePost: (id) => adminPanel.deletePost(id)
};

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
    console.error('Admin Panel Error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save post
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeSection = document.querySelector('.section.active');
        if (activeSection && activeSection.id === 'new-post') {
            adminPanel.saveDraft();
        }
    }
    
    // Escape to cancel
    if (e.key === 'Escape') {
        const activeSection = document.querySelector('.section.active');
        if (activeSection && activeSection.id === 'new-post') {
            adminPanel.cancelPost();
        }
    }
});

// ===== AUTO-SAVE FUNCTIONALITY =====
let autoSaveTimeout;

document.addEventListener('input', (e) => {
    if (e.target.closest('#post-form')) {
        clearTimeout(autoSaveTimeout);
        autoSaveTimeout = setTimeout(() => {
            // Auto-save draft every 30 seconds of inactivity
            const activeSection = document.querySelector('.section.active');
            if (activeSection && activeSection.id === 'new-post') {
                const title = document.getElementById('post-title').value.trim();
                if (title) {
                    adminPanel.savePost('draft');
                    adminPanel.showNotification('Rascunho salvo automaticamente', 'info');
                }
            }
        }, 30000);
    }
});

// ===== SESSION MANAGEMENT =====
// Check session every 5 minutes
setInterval(() => {
    const sessionExpiry = localStorage.getItem('admin_session_expiry');
    if (!sessionExpiry || new Date().getTime() > parseInt(sessionExpiry)) {
        adminPanel.logout();
    }
}, 5 * 60 * 1000);

// Extend session on user activity
let lastActivity = Date.now();
document.addEventListener('click', () => {
    lastActivity = Date.now();
});

document.addEventListener('keypress', () => {
    lastActivity = Date.now();
});

// Check for inactivity every minute
setInterval(() => {
    const inactiveTime = Date.now() - lastActivity;
    const maxInactiveTime = 30 * 60 * 1000; // 30 minutes
    
    if (inactiveTime > maxInactiveTime) {
        adminPanel.logout();
    }
}, 60 * 1000);
