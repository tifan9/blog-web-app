const user = JSON.parse(localStorage.getItem("loggedInUser"));
if (!user || user.role !== "author") {
  alert("Access denied");
  window.location.href = "index.html";
}

const postForm = document.getElementById("postForm");
const postsContainer = document.getElementById("postsContainer");

let editMode = false;
let editId = null;

postForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const image = document.getElementById("image").value;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];

  if (editMode) {
    posts = posts.map(p => p.id === editId ? { ...p, title, content, image } : p);
    editMode = false;
    editId = null;
  } else {
    const post = {
      id: Date.now(),
      title,
      content,
      image,
      author: user.username,
      createdAt: new Date().toLocaleString()
    };
    posts.push(post);
  }

  localStorage.setItem("posts", JSON.stringify(posts));
  postForm.reset();
  renderPosts();
});

function renderPosts() {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  postsContainer.innerHTML = "";

  posts.filter(p => p.author === user.username).forEach(post => {
    const div = document.createElement("div");
    div.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
      <img src="${post.image}" width="200" alt="image" />
      <p><i>${post.createdAt}</i></p>
      <button onclick="editPost(${post.id})">Edit</button>
      <button onclick="deletePost(${post.id})">Delete</button>
    `;
    postsContainer.appendChild(div);
  });
}

window.editPost = function (id) {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const post = posts.find(p => p.id === id);
  if (!post) return;

  document.getElementById("title").value = post.title;
  document.getElementById("content").value = post.content;
  document.getElementById("image").value = post.image;

  editMode = true;
  editId = id;
};

window.deletePost = function (id) {
  if (!confirm("Are you sure you want to delete this post?")) return;

  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(posts));
  renderPosts();
};

window.logout = function () {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
};

renderPosts();
