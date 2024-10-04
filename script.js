const socket = io();

const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementById('chat-messages');
const userList = document.getElementById('user-list');
const usernameInput = document.getElementById('username-input');
const messageInput = document.getElementById('message-input');
const typingIndicator = document.getElementById('typing-indicator');

let username = '';

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (username === '') {
        username = usernameInput.value.trim();
        if (username) {
            socket.emit('join', username);
            usernameInput.value = '';
            usernameInput.disabled = true;
        }
    } else {
        const message = messageInput.value.trim();
        if (message) {
            socket.emit('chatMessage', message);
            messageInput.value = '';
        }
    }
});

messageInput.addEventListener('input', () => {
    socket.emit('typing');
});

socket.on('message', (message) => {
    displayMessage(message);
});

socket.on('userJoined', (user) => {
    displaySystemMessage(`${user} has joined the chat`);
});

socket.on('userLeft', (user) => {
    displaySystemMessage(`${user} has left the chat`);
});

socket.on('userList', (users) => {
    userList.innerHTML = `<strong>Online Users:</strong> ${users.join(', ')}`;
});

socket.on('userTyping', (user) => {
    typingIndicator.textContent = `${user} is typing...`;
    setTimeout(() => {
        typingIndicator.textContent = '';
    }, 3000);
});

function displayMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `
        <span class="username">${message.username}:</span>
        <span class="content">${message.text}</span>
        <span class="timestamp">${new Date(message.timestamp).toLocaleTimeString()}</span>
    `;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function displaySystemMessage(message) {
    const div = document.createElement('div');
    div.classList.add('system-message');
    div.textContent = message;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}