document.addEventListener('DOMContentLoaded', function() {
    const authBtn = document.getElementById('auth-btn');
    const postBtn = document.getElementById('post-btn');
    const addVideoBtn = document.getElementById('add-video-btn');
    const postsContainer = document.getElementById('posts');

    let editingPostId = null;

    const STORAGE_KEY = 'blogPosts';
    const VIDEOS_KEY = 'blogVideos';

    function saveVideos(videos) {
        localStorage.setItem(VIDEOS_KEY, JSON.stringify(videos));
    }

    function loadVideos() {
        const raw = localStorage.getItem(VIDEOS_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    function renderVideos() {
        const videosList = document.getElementById('videos-list');
        videosList.innerHTML = '';
        const videos = loadVideos();
        videos.forEach(video => {
            const link = document.createElement('a');
            link.href = video.url;
            link.target = '_blank';
            link.textContent = video.title;
            link.style.display = 'block';
            link.style.marginBottom = '10px';
            videosList.appendChild(link);
        });
    }

    function savePosts(posts) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    }

    function loadPosts() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        try {
            return JSON.parse(raw);
        } catch {
            return [];
        }
    }

    function renderPost(postData) {
        const post = document.createElement('div');
        post.className = 'post';
        let imageHtml = '';
        if (postData.image) {
            imageHtml = `<img src="${postData.image}" alt="Imagem do post" style="max-width: 100%; height: auto; margin-bottom: 10px; border-radius: 5px;">`;
        }
        post.innerHTML = `<h2>${postData.title}</h2>${imageHtml}<p>${postData.content}</p>`;

        const loggedIn = localStorage.getItem('loggedIn') === 'true';
        if (loggedIn) {
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Editar';
            editBtn.className = 'edit-btn';
            editBtn.addEventListener('click', () => {
                editingPostId = postData.id;
                document.getElementById('post-title').value = postData.title;
                document.getElementById('post-content').value = postData.content;
                document.getElementById('post-image').value = postData.image || '';
                modal.style.display = 'flex';
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Excluir';
            deleteBtn.className = 'delete-btn';
            deleteBtn.addEventListener('click', () => {
                const posts = loadPosts().filter(p => p.id !== postData.id);
                savePosts(posts);
                post.remove();
            });

            post.appendChild(editBtn);
            post.appendChild(deleteBtn);
        }

        postsContainer.insertBefore(post, postsContainer.firstChild);
    }

    function renderAllPosts() {
        const posts = loadPosts();
        postsContainer.innerHTML = '';
        // mostrar os mais recentes primeiro
        posts.slice().reverse().forEach(renderPost);
    }

    // Verificar se está logado
    function checkLogin() {
        const loggedIn = localStorage.getItem('loggedIn') === 'true';
        if (loggedIn) {
            authBtn.textContent = 'Logout';
            postBtn.style.display = 'inline-block';
            addVideoBtn.style.display = 'inline-block';
        } else {
            authBtn.textContent = 'Login';
            postBtn.style.display = 'none';
            addVideoBtn.style.display = 'none';
        }
        renderAllPosts();

        // Remover posts de exemplo antigos
        const posts = loadPosts();
        const filteredPosts = posts.filter(p => !['1', '2', '3'].includes(p.id));
        if (filteredPosts.length !== posts.length) {
            savePosts(filteredPosts);
            renderAllPosts();
        }

        // Renderizar vídeos
        const videos = loadVideos();
        if (videos.length === 0) {
            const defaultVideos = [
                { title: 'Vídeo sobre JavaScript', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
                { title: 'Tutorial de HTML e CSS', url: 'https://www.youtube.com/watch?v=UB1O30fR-EE' },
                { title: 'Introdução ao Desenvolvimento Web', url: 'https://www.youtube.com/watch?v=3JluqTojuME' }
            ];
            saveVideos(defaultVideos);
        }
        renderVideos();
    }

    checkLogin();

    // Modal de login
    const loginModal = document.createElement('div');
    loginModal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: none; justify-content: center;
        align-items: center; z-index: 1000;
    `;
    loginModal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; width: 300px;">
            <h3>Login</h3>
            <input type="text" id="username" placeholder="Usuário" style="width: 100%; margin-bottom: 10px; padding: 10px;">
            <input type="password" id="password" placeholder="Senha" style="width: 100%; margin-bottom: 10px; padding: 10px;">
            <button id="login-submit">Entrar</button>
            <button id="login-cancel">Cancelar</button>
        </div>
    `;
    document.body.appendChild(loginModal);

    authBtn.addEventListener('click', () => {
        if (authBtn.textContent === 'Login') {
            loginModal.style.display = 'flex';
        } else {
            localStorage.removeItem('loggedIn');
            checkLogin();
        }
    });

    document.getElementById('login-cancel').addEventListener('click', () => {
        loginModal.style.display = 'none';
    });

    document.getElementById('login-submit').addEventListener('click', () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        if (username === 'vibewill' && password === 'Guns@123') {
            localStorage.setItem('loggedIn', 'true');
            loginModal.style.display = 'none';
            checkLogin();
        } else {
            alert('Usuário ou senha incorretos');
        }
    });

    // Criar modal de postagem
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: none; justify-content: center;
        align-items: center; z-index: 1000;
    `;
    modal.innerHTML = `
        <div style="background: white; padding: 20px; border-radius: 10px; width: 400px;">
            <h3>Nova Postagem</h3>
            <input type="text" id="post-title" placeholder="Título" style="width: 100%; margin-bottom: 10px; padding: 10px;">
            <textarea id="post-content" placeholder="Conteúdo" style="width: 100%; height: 100px; margin-bottom: 10px; padding: 10px;"></textarea>
            <input type="url" id="post-image" placeholder="URL da imagem (opcional)" style="width: 100%; margin-bottom: 10px; padding: 10px;">
            <button id="submit-post">Postar</button>
            <button id="cancel-post">Cancelar</button>
        </div>
    `;
    document.body.appendChild(modal);

    postBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    document.getElementById('cancel-post').addEventListener('click', () => {
        modal.style.display = 'none';
        editingPostId = null;
        // Limpar campos ao cancelar
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-image').value = '';
    });

    document.getElementById('submit-post').addEventListener('click', () => {
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const image = document.getElementById('post-image').value;
        if (title && content) {
            const posts = loadPosts();
            if (editingPostId) {
                // Editar post existente
                const postIndex = posts.findIndex(p => p.id === editingPostId);
                if (postIndex !== -1) {
                    posts[postIndex] = { ...posts[postIndex], title, content, image: image || null };
                    savePosts(posts);
                    renderAllPosts();
                }
                editingPostId = null;
            } else {
                // Criar novo post
                const newPost = {
                    id: Date.now().toString(),
                    title,
                    content,
                    image: image || null,
                    createdAt: new Date().toISOString(),
                };
                posts.push(newPost);
                savePosts(posts);
                renderPost(newPost);
            }

            // Limpar campos
            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            modal.style.display = 'none';
        }
    });

    // Adicionar vídeo
    addVideoBtn.addEventListener('click', () => {
        const loggedIn = localStorage.getItem('loggedIn') === 'true';
        if (!loggedIn) {
            alert('Faça login para adicionar vídeos.');
            return;
        }

        const title = prompt('Título do vídeo:');
        const url = prompt('URL do vídeo:');
        if (title && url) {
            const videos = loadVideos();
            videos.push({ title, url });
            saveVideos(videos);
            renderVideos();
        }
    });

    renderAllPosts();
});