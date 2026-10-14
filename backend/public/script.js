const API = window.location.origin + '/api/v1/users';

const signupBtn = document.getElementById('signup-btn');
const signupPassword = document.getElementById('signup-password');
const loginBtn = document.getElementById('login-btn');
const usernameInput = document.getElementById('username');
const loginPassword = document.getElementById('login-password');
const notification = document.getElementById('notification');

function showNotification(msg, isError = false, timeout = 10000) {
  notification.textContent = msg;
  notification.classList.toggle('error', !!isError);
  if (timeout) {
    setTimeout(() => {
      if (notification.textContent === msg) notification.textContent = '';
      notification.classList.remove('error');
    }, timeout);
  }
}

signupBtn.addEventListener('click', async () => {
  const password = signupPassword.value.trim();
  if (!password) { showNotification('Enter a password', true); return; }
  signupBtn.disabled = true;
  showNotification('Creating user...', false, 0);
  try {
    const res = await fetch(`${API}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      showNotification('User created, your username is: ' + data.username);
      signupPassword.value = '';
    } else {
      showNotification(data.error || 'Sign-up failed', true);
    }
  } catch (err) {
    showNotification(err.message || 'Network error', true);
  } finally {
    signupBtn.disabled = false;
  }
});

loginBtn.addEventListener('click', async () => {
  const username = usernameInput.value.trim();
  const password = loginPassword.value;
  if (!username || !password) { showNotification('Enter username and password', true); return; }
  loginBtn.disabled = true;
  showNotification('Logging in...', false, 0);
  try {
    const res = await fetch(`${API}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include'
    });
    const data = await res.json();
    if (res.ok) {
      showNotification('Login successful: ' + data.username);
      window.location.href = "/chatt.html";
    } else {
      showNotification(data.error || 'Invalid credentials', true);
    }
  } catch (err) {
    showNotification(err.message || 'Network error', true);
  } finally {
    loginBtn.disabled = false;
  }
});

// chat functionality
const socket = io();

const activity = document.querySelector('.activity')
const msgInput = document.querySelector('input')

function sendMessage(e) {
    e.preventDefault()
    if (msgInput.value) {
        socket.emit('message', msgInput.value)
        msgInput.value = ""
    }
    msgInput.focus()
}

document.querySelector('form')
    .addEventListener('submit', sendMessage)

// Listen for messages 
socket.on("message", (data) => {
    activity.textContent = ""
    const li = document.createElement('li')
    li.textContent = data
    document.querySelector('ul').appendChild(li)
})

msgInput.addEventListener('keypress', () => {
    socket.emit('activity', socket.id.substring(0, 5))
})

let activityTimer
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`

    // Clear after 3 seconds 
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
        activity.textContent = ""
    }, 3000)
})

