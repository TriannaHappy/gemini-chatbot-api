const form = document.getElementById('chat-form');
const input = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const userMessage = input.value.trim();
  if (!userMessage) return;

  appendMessage('user', userMessage); // Display user's message
  input.value = '';

  // Add a "Thinking..." message while waiting for the bot
  const thinkingMessageElement = appendMessage('bot', 'Thinking...');

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userMessage }),
    });

    // Remove the "Thinking..." message
    chatBox.removeChild(thinkingMessageElement);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    appendMessage('bot', data.reply); // Display bot's actual reply
  } catch (error) {
    console.error('Error sending message to backend:', error);
    // Remove the "Thinking..." message and display an error
    chatBox.removeChild(thinkingMessageElement);
    appendMessage('bot', 'Oops! Something went wrong. Please try again.');
  }
});

function appendMessage(sender, text) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatBox.appendChild(msg);
  chatBox.scrollTop = chatBox.scrollHeight;
  return msg; // Return the message element so it can be removed/updated later
}
