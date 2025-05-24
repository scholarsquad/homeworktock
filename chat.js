async function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage('user', message);
    userInput.value = '';

    // Show typing indicator
    const loadingId = showTypingIndicator();
    
    // Add realistic delay for better UX
    setTimeout(() => {
        removeMessage(loadingId);
        const aiResponse = getAIResponse(message);
        appendMessage('bot', aiResponse);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
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

function showTypingIndicator() {
    const chatBox = document.getElementById('chat-box');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot typing';
    typingDiv.innerHTML = 'AI is typing<span class="dots">...</span>';
    typingDiv.id = `typing-${Date.now()}`;
    chatBox.appendChild(typingDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
    return typingDiv.id;
}

function removeMessage(messageId) {
    const messageDiv = document.getElementById(messageId);
    if (messageDiv) {
        messageDiv.remove();
    }
}

// Store conversation context
let conversationHistory = [];
let userProfile = {
    name: null,
    interests: [],
    mood: 'neutral'
};

function getAIResponse(userMessage) {
    // Add to conversation history
    conversationHistory.push(userMessage);
    
    // Keep only last 5 messages for context
    if (conversationHistory.length > 5) {
        conversationHistory = conversationHistory.slice(-5);
    }
    
    const lowerMessage = userMessage.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.match(/\b(hello|hi|hey|greetings|good morning|good afternoon|good evening)\b/)) {
        const greetings = [
            "Hello there! How are you doing today?",
            "Hi! Great to see you here. What's on your mind?",
            "Hey! I'm excited to chat with you. How can I help?",
            "Greetings! What would you like to talk about?",
            "Hello! I hope you're having a wonderful day. What brings you here?"
        ];
        return getRandomResponse(greetings);
    }
    
    // Name-related
    if (lowerMessage.includes('my name is') || lowerMessage.includes("i'm ") || lowerMessage.includes("i am ")) {
        const nameMatch = lowerMessage.match(/(?:my name is|i'm|i am) (\w+)/);
        if (nameMatch) {
            userProfile.name = nameMatch[1];
            return `Nice to meet you, ${userProfile.name}! That's a lovely name. What would you like to chat about?`;
        }
    }
    
    // Ask about user's name
    if (lowerMessage.includes('what') && lowerMessage.includes('name')) {
        if (userProfile.name) {
            return `You told me your name is ${userProfile.name}! What's your name for the AI? You can call me Claude, or whatever you prefer.`;
        } else {
            return "I'm your AI assistant! You can call me Claude. What's your name? I'd love to know what to call you.";
        }
    }
    
    // How are you responses
    if (lowerMessage.match(/how are you|how're you|how do you feel/)) {
        const responses = [
            "I'm doing great, thank you for asking! I love having conversations. How are you feeling today?",
            "I'm wonderful! Every conversation is exciting to me. What about you - how has your day been?",
            "I'm fantastic! I'm always eager to learn about new topics. How are you doing?",
            "I'm doing well! I enjoy our chat. Tell me, what's been the highlight of your day?"
        ];
        return getRandomResponse(responses);
    }
    
    // Feeling/emotion responses
    if (lowerMessage.match(/\b(sad|happy|excited|angry|frustrated|tired|great|awesome|terrible|awful|amazing)\b/)) {
        const emotion = lowerMessage.match(/\b(sad|happy|excited|angry|frustrated|tired|great|awesome|terrible|awful|amazing)\b/)[0];
        userProfile.mood = emotion;
        
        if (['sad', 'angry', 'frustrated', 'tired', 'terrible', 'awful'].includes(emotion)) {
            return `I'm sorry to hear you're feeling ${emotion}. Would you like to talk about what's bothering you? Sometimes sharing can help.`;
        } else {
            return `That's wonderful that you're feeling ${emotion}! I love hearing when people are doing well. What's making you feel this way?`;
        }
    }
    
    // Questions about AI
    if (lowerMessage.match(/what are you|who are you|are you (a )?robot|are you (an )?ai/)) {
        const responses = [
            "I'm an AI assistant created to have friendly conversations! I love learning about people and helping with various topics.",
            "I'm your AI chat companion! I'm here to talk, answer questions, or just have a nice conversation with you.",
            "I'm an artificial intelligence, but I like to think of myself as your conversational friend! What would you like to know?",
            "I'm an AI assistant who enjoys chatting with people like you! I can discuss almost any topic you're interested in."
        ];
        return getRandomResponse(responses);
    }
    
    // Help requests
    if (lowerMessage.match(/help|assist|support|need/)) {
        return "I'm here to help! I can chat about almost anything - answer questions, discuss topics you're interested in, or just have a friendly conversation. What would you like to talk about?";
    }
    
    // Weather (since we can't get real data)
    if (lowerMessage.includes('weather')) {
        return "I don't have access to current weather data, but I'd love to hear about the weather where you are! Is it nice outside today?";
    }
    
    // Hobbies/interests
    if (lowerMessage.match(/hobby|hobbies|interest|like to|love to|enjoy/)) {
        const interests = ['reading', 'music', 'movies', 'sports', 'cooking', 'travel', 'art', 'gaming', 'photography'];
        const randomInterest = interests[Math.floor(Math.random() * interests.length)];
        return `That sounds interesting! I love hearing about people's passions. Are you into ${randomInterest} at all? What do you enjoy doing in your free time?`;
    }
    
    // Technology questions
    if (lowerMessage.match(/technology|computer|programming|code|tech/)) {
        return "Technology is fascinating! There's always something new and exciting happening in the tech world. Are you interested in programming, gadgets, or maybe AI like me?";
    }
    
    // Books/reading
    if (lowerMessage.match(/book|read|novel|story|author/)) {
        return "I love discussing books! Reading opens up so many worlds and perspectives. What kind of books do you enjoy? Fiction, non-fiction, or maybe something specific like sci-fi or mystery?";
    }
    
    // Movies/entertainment
    if (lowerMessage.match(/movie|film|watch|netflix|tv show|series/)) {
        return "Movies and shows are great conversation topics! I find it interesting how stories can affect us so deeply. What have you watched recently that you'd recommend?";
    }
    
    // Questions
    if (lowerMessage.includes('?')) {
        const responses = [
            "That's a great question! I'd love to explore that topic with you. What are your thoughts on it?",
            "Interesting question! I think there are many ways to look at that. What's your perspective?",
            "You've got me thinking! That's the kind of question that could lead to a really good discussion. What do you think?",
            "I appreciate thoughtful questions like that! What made you curious about this topic?"
        ];
        return getRandomResponse(responses);
    }
    
    // Long messages (show engagement)
    if (userMessage.length > 100) {
        return "Thank you for sharing so much with me! I really appreciate when people take the time to explain their thoughts. That gives me a lot to think about. What aspect of this matters most to you?";
    }
    
    // Context-aware responses based on conversation history
    if (conversationHistory.length > 2) {
        const contextResponses = [
            "That's an interesting continuation of our conversation! I'm enjoying getting to know your perspective on things.",
            "I like how our chat is developing! You bring up really thoughtful points.",
            "It's great how one topic leads to another in our conversation. What else comes to mind about this?",
            "You're keeping me engaged with these interesting topics! Tell me more about what you're thinking."
        ];
        return getRandomResponse(contextResponses);
    }
    
    // Generic engaging responses
    const genericResponses = [
        "That's really interesting! Can you tell me more about that?",
        "I find that fascinating! What's your experience with that been like?",
        "Thanks for sharing that with me! What made you think of that topic?",
        "I love learning new things through our conversations! What else would you like to discuss?",
        "That's a great point! I hadn't thought about it that way before.",
        "You've got me curious now! What's the most interesting part about that to you?",
        "I appreciate you taking the time to chat with me! What's been on your mind lately?",
        "That sounds like something worth exploring! What draws you to that topic?",
        "I'm always amazed by the different perspectives people have! What's your take on that?",
        "Thanks for the thoughtful conversation! What would you like to talk about next?"
    ];
    
    return getRandomResponse(genericResponses);
}

function getRandomResponse(responses) {
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
    
    // Add welcome message after a short delay
    setTimeout(() => {
        appendMessage('bot', 'Hello! I\'m your AI chat assistant. I\'m here to have a friendly conversation with you about whatever interests you. What\'s on your mind today? 😊');
    }, 1000);
});
