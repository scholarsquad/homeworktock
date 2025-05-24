async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';

    // Show loading message
    const loadingId = appendMessage('bot', 'Thinking...');
    
    try {
        const aiResponse = await getAIResponse(message);
        // Remove loading message and add actual response
        removeMessage(loadingId);
        appendMessage('bot', aiResponse);
    } catch (error) {
        removeMessage(loadingId);
        appendMessage('bot', 'Sorry, there was an error connecting to the AI.');
        console.error('Error:', error);
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-box');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    messageDiv.id = `msg-${Date.now()}-${Math.random()}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return messageDiv.id;
}

function removeMessage(messageId) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        messageDiv.remove();
    }
}

async function getAIResponse(userMessage) {
    try {
        // Try DialoGPT first
        const response = await fetch("https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                inputs: {
                    past_user_inputs: [],
                    generated_responses: [],
                    text: userMessage
                },
                parameters: {
                    max_length: 1000,
                    min_length: 10,
                    temperature: 0.7,
                    do_sample: true
                }
            })
        });

        if (!response.ok) {
            // If DialoGPT fails, try a simpler model
            return await tryAlternativeModel(userMessage);
        }

        const data = await response.json();
        console.log('API Response:', data); // For debugging
        
        if (data.generated_text) {
            return data.generated_text.trim();
        } else if (data.error) {
            console.error('API Error:', data.error);
            // Try alternative model if there's an error
            return await tryAlternativeModel(userMessage);
        }
        
        return "I'm not sure how to respond to that.";
        
    } catch (error) {
        console.error('Request failed:', error);
        // Try alternative model as fallback
        return await tryAlternativeModel(userMessage);
    }
}

async function tryAlternativeModel(userMessage) {
    try {
        // Fallback to a simpler, more reliable model
        const response = await fetch("https://api-inference.huggingface.co/models/gpt2", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                inputs: userMessage,
                parameters: {
                    max_length: 100,
                    temperature: 0.8,
                    do_sample: true,
                    pad_token_id: 50256
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fallback API Response:', data);
        
        if (Array.isArray(data) && data.length > 0 && data[0].generated_text) {
            // Clean up the response - remove the original input if it's repeated
            let generatedText = data[0].generated_text;
            if (generatedText.startsWith(userMessage)) {
                generatedText = generatedText.substring(userMessage.length).trim();
            }
            return generatedText || "Hello! I'm here to chat with you.";
        } else if (data.generated_text) {
            return data.generated_text;
        } else if (data.error) {
            return "Sorry, both AI models are currently unavailable: " + data.error;
        }
        
        return "Sorry, I'm having trouble connecting to the AI service right now.";
        
    } catch (error) {
        console.error('Fallback request failed:', error);
        return "Sorry, I'm having trouble connecting to the AI service. Please check your internet connection and try again.";
    }
}

// Allow sending message with Enter key
document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
