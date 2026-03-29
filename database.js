// database.js
// Integração com Firestore para armazenar posts e vídeos remotamente.
// Substitua os valores de firebaseConfig pelo seu projeto Firebase antes de publicar.

const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const postsCollection = db.collection('posts');
const videosCollection = db.collection('videos');

const Database = {
    getPosts: async function() {
        try {
            const snapshot = await postsCollection.orderBy('createdAt', 'desc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao carregar posts do Firestore:', error);
            return [];
        }
    },

    getVideos: async function() {
        try {
            const snapshot = await videosCollection.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Erro ao carregar vídeos do Firestore:', error);
            return [];
        }
    },

    addPost: async function(post) {
        try {
            const docRef = await postsCollection.add(post);
            return { ...post, id: docRef.id };
        } catch (error) {
            console.error('Erro ao adicionar post ao Firestore:', error);
            throw error;
        }
    },

    updatePost: async function(post) {
        try {
            await postsCollection.doc(post.id).set(post);
        } catch (error) {
            console.error('Erro ao atualizar post no Firestore:', error);
            throw error;
        }
    },

    deletePost: async function(postId) {
        try {
            await postsCollection.doc(postId).delete();
        } catch (error) {
            console.error('Erro ao excluir post no Firestore:', error);
            throw error;
        }
    },

    addVideo: async function(video) {
        try {
            const docRef = await videosCollection.add(video);
            return { ...video, id: docRef.id };
        } catch (error) {
            console.error('Erro ao adicionar vídeo ao Firestore:', error);
            throw error;
        }
    }
};
