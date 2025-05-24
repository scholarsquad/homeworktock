const chatLog = document.getElementById('chat-log');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

// Set your Groq API endpoint and API key
const GROQ_API_ENDPOINT = 'https://api.groq.com/v1/models/LLaMA/completions';
const GROQ_API_KEY = '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'; // Replace with your actual API key

// Send a message to the Groq API and display the response
sendBtn.addEventListener('click', async () => {
  const userMessage = userInput.value.trim();
  if (userMessage) {
    // Display user's message
    chatLog.innerHTML += `<p>User: ${userMessage}</p>`;

    // Send request to Groq API
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: userMessage,
        max_length: 200
      })
    });

    const data = await response.json();
    const aiResponse = data.choices[0].text;

    // Display AI's response
    chatLog.innerHTML += `<p>AI: ${aiResponse}</p>`;

    // Clear user input field
    userInput.value = '';
  }
});
