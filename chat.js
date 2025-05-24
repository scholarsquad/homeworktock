async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage('user', message);
  userInput.value = '';

  // Use a fake AI response for demonstration
  const aiResponse = await getAIResponse(message);
  appendMessage('bot', aiResponse);
}

function appendMessage(sender, text) {
  const chatBox = document.getElementById('chat-box');
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  messageDiv.textContent = text;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function getAIResponse(userMessage) {
  const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/starchat-alpha", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: userMessage })
  });
  const data = await response.json();
  return data.generated_text || "Sorry, I can't answer that!";
}

