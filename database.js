// database.js
// Persistência local usando localStorage.
// Os posts e vídeos são salvos diretamente no navegador e permanecem após atualizar a página.

const POSTS_KEY = 'meu_blog_posts';
const VIDEOS_KEY = 'meu_blog_videos';

function loadStorage(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch (error) {
        console.error('Erro ao ler storage:', error);
        return [];
    }
}

function saveStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function generateId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const Database = {
    getPosts: async function() {
        const posts = loadStorage(POSTS_KEY);
        return posts.slice().sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    },

    getVideos: async function() {
        return loadStorage(VIDEOS_KEY);
    },

    addPost: async function(post) {
        const posts = loadStorage(POSTS_KEY);
        const newPost = {
            id: generateId(),
            title: post.title,
            content: post.content,
            image: post.image || null,
            createdAt: post.createdAt || new Date().toISOString(),
            updatedAt: post.updatedAt || null
        };
        posts.push(newPost);
        saveStorage(POSTS_KEY, posts);
        return newPost;
    },

    updatePost: async function(post) {
        const posts = loadStorage(POSTS_KEY);
        const index = posts.findIndex(item => item.id === post.id);
        if (index === -1) {
            throw new Error('Post não encontrado.');
        }
        posts[index] = {
            ...posts[index],
            title: post.title,
            content: post.content,
            image: post.image || null,
            updatedAt: post.updatedAt || new Date().toISOString()
        };
        saveStorage(POSTS_KEY, posts);
    },

    deletePost: async function(postId) {
        const posts = loadStorage(POSTS_KEY).filter(item => item.id !== postId);
        saveStorage(POSTS_KEY, posts);
    },

    addVideo: async function(video) {
        const videos = loadStorage(VIDEOS_KEY);
        const newVideo = {
            id: generateId(),
            title: video.title,
            url: video.url,
            createdAt: new Date().toISOString()
        };
        videos.push(newVideo);
        saveStorage(VIDEOS_KEY, videos);
        return newVideo;
    }
};
