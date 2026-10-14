(async function () {
  const form = document.querySelector('form');
  const input = form.querySelector('input');
  const contactsList = document.querySelector('ul');
  const activity = document.querySelector('.activity');

  // hide send form until a contact is selected
  form.style.display = 'none';
  let selectedContactId = null;
  let selectedContactName = null;

  // 1) Verify auth & load contacts
  const res = await fetch('/api/v1/users/me/contacts', { credentials: 'include' });
  if (!res.ok) {
    window.location.href = '/'; // redirect to login if not authenticated
    return;
  }
  const contacts = await res.json();

  // render contacts in the existing <ul>
  contactsList.innerHTML = '';
  contacts.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c.username;
    li.dataset.id = c._id;
    li.style.cursor = 'pointer';
    li.addEventListener('click', () => {
      // select contact
      selectedContactId = c._id;
      selectedContactName = c.username;

      // mark selection visually
      contactsList.querySelectorAll('li').forEach(n => n.classList.remove('selected'));
      li.classList.add('selected');

      // show message box
      form.style.display = '';
      input.placeholder = `Message ${selectedContactName}`;
      input.focus();

      // clear chat view (create container if missing)
      let chatContainer = document.getElementById('chat-messages');
      if (!chatContainer) {
        chatContainer = document.createElement('ul');
        chatContainer.id = 'chat-messages';
        document.body.insertBefore(chatContainer, activity);
      }
      chatContainer.innerHTML = '';
    });
    contactsList.appendChild(li);
  });

  // 2) Connect socket (same-origin cookie will be sent automatically)
  const socket = io();

  socket.on('connect_error', (err) => {
    console.error('Socket connect error', err.message);
    if (err.message === 'unauthorized') window.location.href = '/';
  });

  // 3) Receive private messages (server echoes to sender and delivers to recipient)
  socket.on('private_message', (msg) => {
    // only append messages for current selected contact
    if (!selectedContactId) return;
    if (msg.fromUserId === selectedContactId || msg.toUserId === selectedContactId) {
      appendChatMessage(msg);
    }
  });

  socket.on('private_message_error', (err) => {
    console.error('private_message_error', err);
    alert(err.error || 'Message error');
  });

  // 4) Send message on form submit
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!selectedContactId) { alert('Select a contact first'); return; }
    const text = input.value.trim();
    if (!text) return;
    socket.emit('private_message', { toUserId: selectedContactId, content: text });
    input.value = '';
  });

  // helper to append message to chat container
  function appendChatMessage(msg) {
    let chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) {
      chatContainer = document.createElement('ul');
      chatContainer.id = 'chat-messages';
      document.body.insertBefore(chatContainer, activity);
    }
    const li = document.createElement('li');
    const isIncoming = msg.fromUserId === selectedContactId;
    li.className = isIncoming ? 'incoming' : 'outgoing';
    li.textContent = `${isIncoming ? selectedContactName : 'You'}: ${msg.content}`;
    chatContainer.appendChild(li);
    li.scrollIntoView({ block: 'end' });
  }
})();