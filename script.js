// Global variables
let currentUser = null;
let editingPostId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
    
    // Check if we need to edit a post (from display-blog.html)
    const editPostId = localStorage.getItem('editPostId');
    if (editPostId && window.location.pathname.includes('blog.html')) {
        localStorage.removeItem('editPostId');
        editPost(editPostId);
    }
});

// Authentication functions
function checkAuthStatus() {
    const user = localStorage.getItem('loggedInUser');
    if (user) {
        currentUser = JSON.parse(user);
    }
}

function getCurrentUser() {
    const user = localStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        showAlert('Login successful!', 'success');
        
        // Redirect based on role
        setTimeout(() => {
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'blog.html';
            }
        }, 1000);
        
        document.getElementById('loginUsername').value = '';
        document.getElementById('loginPassword').value = '';
    } else {
        showAlert('Invalid username or password', 'error');
    }
}

function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    // Validation
    if (username.length < 3) {
        showAlert('Username must be at least 3 characters', 'error');
        return;
    }
    
    if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
    }
    
    const users = getUsers();
    
    // Check if username exists
    if (users.find(u => u.username === username)) {
        showAlert('Username already exists', 'error');
        return;
    }
    
    // Create new user
    const newUser = {
        id: Date.now().toString(),
        username: username,
        password: password,
        role: role
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    showAlert('Registration successful! Please login.', 'success');
    
    // Clear form and redirect
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerRole').value = '';
    
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

function logout() {
    currentUser = null;
    editingPostId = null;
    localStorage.removeItem('loggedInUser');
    
    showAlert('Logged out successfully!', 'success');
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Blog post functions
function handleCreatePost(event) {
    event.preventDefault();
    
    const title = document.getElementById('postTitle').value;
    const content = document.getElementById('postContent').value;
    const image = document.getElementById('postImage').value;
    
    // Validation
    if (title.length < 3) {
        showAlert('Title must be at least 3 characters', 'error');
        return;
    }
    
    if (content.length < 10) {
        showAlert('Content must be at least 10 characters', 'error');
        return;
    }
    
    const posts = getPosts();
    
    if (editingPostId) {
        // Update existing post
        const postIndex = posts.findIndex(p => p.id === editingPostId);
        if (postIndex !== -1) {
            posts[postIndex] = {
                ...posts[postIndex],
                title: title,
                content: content,
                image: image || null
            };
            showAlert('Post updated successfully!', 'success');
        }
        cancelEdit();
    } else {
        // Create new post
        const newPost = {
            id: Date.now().toString(),
            title: title,
            content: content,
            image: image || null,
            author: currentUser.username,
            createdAt: new Date().toISOString()
        };
        
        posts.push(newPost);
        showAlert('Post created successfully!', 'success');
    }
    
    localStorage.setItem('posts', JSON.stringify(posts));
    document.getElementById('postForm').reset();
    
    // Re-render user posts if function exists
    if (typeof renderUserPosts === 'function') {
        renderUserPosts();
    }
}

function editPost(postId) {
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);
    
    if (post && post.author === currentUser.username) {
        editingPostId = postId;
        document.getElementById('postTitle').value = post.title;
        document.getElementById('postContent').value = post.content;
        document.getElementById('postImage').value = post.image || '';
        document.getElementById('postSubmitBtn').textContent = 'Update Post';
        document.getElementById('cancelEditBtn').style.display = 'inline-block';
        document.getElementById('pageTitle').textContent = 'Edit Post';
        
        // Scroll to form
        document.getElementById('postForm').scrollIntoView({ behavior: 'smooth' });
    }
}

function cancelEdit() {
    editingPostId = null;
    document.getElementById('postForm').reset();
    document.getElementById('postSubmitBtn').textContent = 'Create Post';
    document.getElementById('cancelEditBtn').style.display = 'none';
    if (document.getElementById('pageTitle')) {
        document.getElementById('pageTitle').textContent = 'Create New Post';
    }
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        const posts = getPosts();
        const filteredPosts = posts.filter(p => p.id !== postId);
        localStorage.setItem('posts', JSON.stringify(filteredPosts));
        showAlert('Post deleted successfully!', 'success');
        
        // Re-render posts if functions exist
        if (typeof renderUserPosts === 'function') {
            renderUserPosts();
        }
        if (typeof renderPosts === 'function') {
            renderPosts();
        }
    }
}

function searchPosts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const posts = getPosts();
    
    const filteredPosts = posts
        .filter(post => 
            post.title.toLowerCase().includes(searchTerm) ||
            post.content.toLowerCase().includes(searchTerm) ||
            post.author.toLowerCase().includes(searchTerm)
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    if (typeof renderFilteredPosts === 'function') {
        renderFilteredPosts(filteredPosts);
    }
}

// Utility functions
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function getPosts() {
    const posts = localStorage.getItem('posts');
    return posts ? JSON.parse(posts) : [];
}

function showAlert(message, type) {
    const alertsContainer = document.getElementById('alerts');
    if (!alertsContainer) return;
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    alertsContainer.appendChild(alert);
    
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Method chaining examples in data operations
function getPostsWithMethodChaining() {
    return getPosts()
        .filter(post => post.author === currentUser?.username)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(post => ({
            ...post,
            excerpt: post.content.substring(0, 100) + '...',
            formattedDate: formatDate(post.createdAt)
        }));
}

function getUsersWithMethodChaining() {
    return getUsers()
        .filter(user => user.role === 'author')
        .sort((a, b) => a.username.localeCompare(b.username))
        .map(user => ({
            ...user,
            postCount: getPosts().filter(post => post.author === user.username).length
        }));
}
