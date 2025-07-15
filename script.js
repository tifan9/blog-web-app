function registeringForm() {
  document.getElementById('startOptions').classList.add('hidden');
  document.getElementById('reg-form').classList.remove('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('message').innerText = "";
}

function signingInForm() {
  document.getElementById('startOptions').classList.add('hidden');
  document.getElementById('loginForm').classList.remove('hidden');
  document.getElementById('reg-form').classList.add('hidden');
  document.getElementById('message').innerText = "";
}

function back() {
  document.getElementById('reg-form').classList.add('hidden');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('startOptions').classList.remove('hidden');
  document.getElementById('message').innerText = "";
}

function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  if (!username || !password || !role) {
    document.getElementById('message').innerText = "Please fill in all fields.";
    return;
  }

  if (localStorage.getItem(username)) {
    document.getElementById('message').innerText = "Username already exists.";
    return;
  }

  const user = { username, password, role };
  localStorage.setItem(username, JSON.stringify(user));
  document.getElementById('message').innerText = "Registration successful!";
}

function login() {
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  const data = localStorage.getItem(username);
  if (!data) {
    document.getElementById('message').innerText = "User not found.";
    return;
  }

  const user = JSON.parse(data);
  if (user.password === password) {
    document.getElementById('message').innerText = `Welcome, ${user.role}!`;
  } else {
    document.getElementById('message').innerText = "Incorrect password.";
  }
}
