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

// Store conversation history
let conversationHistory = [];

async function getAIResponse(userMessage) {
    try {
        // Add user message to history
        conversationHistory.push({
            role: "user",
            content: userMessage
        });

        // Keep only last 10 messages to avoid token limits
        if (conversationHistory.length > 10) {
            conversationHistory = conversationHistory.slice(-10);
        }

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer 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"
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant. Keep your responses conversational and friendly."
                    },
                    ...conversationHistory
                ],
                max_tokens: 150,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            // If Groq fails, try a simple mock response
            return getMockResponse(userMessage);
        }

        const data = await response.json();
        console.log('API Response:', data);
        
        if (data.choices && data.choices[0] && data.choices[0].message) {
            const aiMessage = data.choices[0].message.content;
            
            // Add AI response to history
            conversationHistory.push({
                role: "assistant",
                content: aiMessage
            });
            
            return aiMessage;
        }
        
        return getMockResponse(userMessage);
        
    } catch (error) {
        console.error('Request failed:', error);
        return getMockResponse(userMessage);
    }
}

// Simple mock responses as fallback
function getMockResponse(userMessage) {
    const responses = [
        "That's an interesting point! Tell me more about what you think.",
        "I understand what you're saying. What would you like to explore next?",
        "Thanks for sharing that with me. How does that make you feel?",
        "That's a great question! I'd love to hear your thoughts on it.",
        "I see where you're coming from. What's your perspective on this?",
        "That sounds fascinating! Can you elaborate on that?",
        "I appreciate you bringing that up. What's most important to you about this?",
        "That's worth thinking about. What do you think the best approach would be?",
        "Thanks for the conversation! What else would you like to discuss?",
        "I'm here to chat with you about whatever interests you!"
    ];
    
    // Simple keyword-based responses
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
        return "Hello! I'm happy to chat with you. What's on your mind today?";
    }
    
    if (lowerMessage.includes('how are you')) {
        return "I'm doing well, thank you for asking! How are you doing today?";
    }
    
    if (lowerMessage.includes('weather')) {
        return "I don't have access to current weather data, but I'd love to chat about something else! What interests you?";
    }
    
    if (lowerMessage.includes('name')) {
        return "I'm your AI chat assistant! You can call me whatever you'd like. What should I call you?";
    }
    
    if (lowerMessage.includes('help')) {
        return "I'm here to have a friendly conversation with you! Feel free to ask me anything or just chat about whatever's on your mind.";
    }
    
    // Return a random response
    return responses[Math.floor(Math.random() * responses.length)];
}

// Allow sending message with Enter key
document.addEventListener('DOMContentLoaded', function() {
    const userInput = document.getElementById('user-input');
    userInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Add welcome message
    setTimeout(() => {
        appendMessage('bot', 'Hello! I\'m your AI chat assistant. How can I help you today?');
    }, 500);
});
