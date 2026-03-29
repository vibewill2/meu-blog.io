document.addEventListener('DOMContentLoaded', async function() {
    const authBtn = document.getElementById('auth-btn');
    const postBtn = document.getElementById('post-btn');
    const addVideoBtn = document.getElementById('add-video-btn');
    const postsContainer = document.getElementById('posts');

    let editingPostId = null;
    let loggedIn = false;

    async function loadVideos() {
        return await Database.getVideos();
    }

    async function loadPosts() {
        return await Database.getPosts();
    }

    function renderPost(postData) {
        const post = document.createElement('div');
        post.className = 'post';
        let imageHtml = '';
        if (postData.image) {
            imageHtml = `<img src="${postData.image}" alt="Imagem do post" style="max-width: 100%; height: auto; margin-bottom: 10px; border-radius: 5px;">`;
        }
        post.innerHTML = `<h2>${postData.title}</h2>${imageHtml}<p>${postData.content}</p>`;

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
            deleteBtn.addEventListener('click', async () => {
                await Database.deletePost(postData.id);
                await renderAllPosts();
            });

            post.appendChild(editBtn);
            post.appendChild(deleteBtn);
        }

        postsContainer.insertBefore(post, postsContainer.firstChild);
    }

    async function renderVideos() {
        const videosList = document.getElementById('videos-list');
        videosList.innerHTML = '';
        const videos = await loadVideos();
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

    async function renderAllPosts() {
        const posts = await loadPosts();
        postsContainer.innerHTML = '';
        posts.forEach(renderPost);
    }

    async function checkLogin() {
        if (loggedIn) {
            authBtn.textContent = 'Logout';
            postBtn.style.display = 'inline-block';
            addVideoBtn.style.display = 'inline-block';
        } else {
            authBtn.textContent = 'Login';
            postBtn.style.display = 'none';
            addVideoBtn.style.display = 'none';
        }
        await renderAllPosts();
        await renderVideos();
    }

    checkLogin();

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
            loggedIn = false;
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
            loggedIn = true;
            loginModal.style.display = 'none';
            checkLogin();
        } else {
            alert('Usuário ou senha incorretos');
        }
    });

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
        document.getElementById('post-title').value = '';
        document.getElementById('post-content').value = '';
        document.getElementById('post-image').value = '';
    });

    document.getElementById('submit-post').addEventListener('click', async () => {
        const title = document.getElementById('post-title').value;
        const content = document.getElementById('post-content').value;
        const image = document.getElementById('post-image').value;
        if (title && content) {
            if (editingPostId) {
                const updatedPost = {
                    id: editingPostId,
                    title,
                    content,
                    image: image || null,
                    updatedAt: new Date().toISOString(),
                };
                await Database.updatePost(updatedPost);
                editingPostId = null;
            } else {
                const newPost = {
                    title,
                    content,
                    image: image || null,
                    createdAt: new Date().toISOString(),
                };
                await Database.addPost(newPost);
            }

            document.getElementById('post-title').value = '';
            document.getElementById('post-content').value = '';
            document.getElementById('post-image').value = '';
            modal.style.display = 'none';
            await renderAllPosts();
        }
    });

    addVideoBtn.addEventListener('click', async () => {
        const title = prompt('Título do vídeo:');
        const url = prompt('URL do vídeo:');
        if (title && url) {
            await Database.addVideo({ title, url });
            await renderVideos();
        }
    });
});
