async function sendMessage() {
  const userInput = document.getElementById('user-input');
  const message = userInput.value.trim();
  if (!message) return;

  appendMessage('user', message);
  userInput.value = '';

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
  try {
    const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-alpha", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer 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"
      },
      body: JSON.stringify({
        inputs: userMessage
      })
    });

    // Log the raw response to debug
    const rawData = await response.text();
    console.log("API raw response:", rawData);

    // Parse the JSON
    const data = JSON.parse(rawData);

    // Check possible formats
    if (data.generated_text) {
      return data.generated_text;
    } else if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
      return data[0].generated_text;
    } else if (data.error) {
      return "Sorry, the model returned an error: " + data.error;
    } else {
      return "Sorry, I can't answer that!";
    }
  } catch (error) {
    console.error("Error in getAIResponse:", error);
    return "Oops! There was a problem contacting the AI service.";
  }
}
