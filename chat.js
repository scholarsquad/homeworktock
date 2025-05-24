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
        // Format the input properly for the Zephyr model
        const formattedInput = `<|user|>\n${userMessage}</s>\n<|assistant|>\n`;
        
        const response = await fetch("https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-alpha", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                inputs: formattedInput,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.7,
                    top_p: 0.95,
                    do_sample: true,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // For debugging
        
        // Handle different response formats
        if (Array.isArray(data) && data.length > 0) {
            if (data[0].generated_text) {
                // Clean up the response by removing the input prompt
                let generatedText = data[0].generated_text;
                
                // Remove the formatted input from the response if it's included
                if (generatedText.includes(formattedInput)) {
                    generatedText = generatedText.replace(formattedInput, '').trim();
                }
                
                // Remove any remaining special tokens
                generatedText = generatedText
                    .replace(/<\|user\|>/g, '')
                    .replace(/<\|assistant\|>/g, '')
                    .replace(/<\/s>/g, '')
                    .trim();
                
                return generatedText || "I'm not sure how to respond to that.";
            }
        } else if (data.generated_text) {
            return data.generated_text;
        } else if (data.error) {
            console.error('API Error:', data.error);
            return "Sorry, the AI service returned an error: " + data.error;
        }
        
        return "Sorry, I didn't get a proper response from the AI.";
        
    } catch (error) {
        console.error('Request failed:', error);
        throw error;
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
