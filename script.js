class AIChat {
    constructor() {
        this.apiToken = null;
        this.apiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
        this.conversationHistory = [];
        this.initializeElements();
        this.setupEventListeners();
        this.checkToken();
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('messages');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.setupContainer = document.getElementById('setupContainer');
        this.apiTokenInput = document.getElementById('apiToken');
        this.saveTokenBtn = document.getElementById('saveToken');
    }

    setupEventListeners() {
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        this.saveTokenBtn.addEventListener('click', () => this.saveToken());
        this.apiTokenInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveToken();
            }
        });
    }

    checkToken() {
        // Check if token exists in session (not localStorage due to artifact restrictions)
        if (this.apiToken) {
            this.enableChat();
        } else {
            this.showSetup();
        }
    }

    saveToken() {
        const token = this.apiTokenInput.value.trim();
        if (token) {
            this.apiToken = token;
            this.enableChat();
            this.addMessage('System', 'API token saved! You can now start chatting.', 'ai-message');
        } else {
            alert('Please enter a valid API token');
        }
    }

    enableChat() {
        this.setupContainer.classList.add('hidden');
        this.messageInput.disabled = false;
        this.sendBtn.disabled = false;
        this.messageInput.focus();
    }

    showSetup() {
        this.setupContainer.classList.remove('hidden');
        this.apiTokenInput.focus();
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message) return;

        // Disable input while processing
        this.messageInput.disabled = true;
        this.sendBtn.disabled = true;

        // Add user message
        this.addMessage('You', message, 'user-message');
        this.messageInput.value = '';

        // Add loading message
        const loadingElement = this.addMessage('AI', 'Thinking...', 'ai-message loading');

        try {
            const response = await this.callAPI(message);
            // Remove loading message
            this.messagesContainer.removeChild(loadingElement);
            // Add AI response
            this.addMessage('AI', response, 'ai-message');
        } catch (error) {
            // Remove loading message
            this.messagesContainer.removeChild(loadingElement);
            // Add error message
            this.addMessage('System', `Error: ${error.message}`, 'ai-message');
        }

        // Re-enable input
        this.messageInput.disabled = false;
        this.sendBtn.disabled = false;
        this.messageInput.focus();
    }

    async callAPI(message) {
        // Add to conversation history
        this.conversationHistory.push({
            past_user_inputs: this.conversationHistory.map(c => c.user).slice(-5), // Keep last 5 exchanges
            generated_responses: this.conversationHistory.map(c => c.bot).slice(-5),
            text: message
        });

        const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {
                    past_user_inputs: this.conversationHistory.slice(-1)[0]?.past_user_inputs || [],
                    generated_responses: this.conversationHistory.slice(-1)[0]?.generated_responses || [],
                    text: message
                },
                parameters: {
                    max_length: 1000,
                    min_length: 1,
                    do_sample: true,
                    temperature: 0.8,
                    top_p: 0.9,
                    repetition_penalty: 1.2
                }
            })
        });

        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('Invalid API token. Please check your Hugging Face token.');
            } else if (response.status === 503) {
                throw new Error('Model is loading. Please try again in a moment.');
            } else {
                throw new Error(`API request failed with status ${response.status}`);
            }
        }

        const data = await response.json();
        
        let botResponse;
        if (data.generated_text) {
            botResponse = data.generated_text;
        } else if (data.conversation && data.conversation.generated_responses) {
            botResponse = data.conversation.generated_responses[data.conversation.generated_responses.length - 1];
        } else {
            botResponse = "I'm sorry, I couldn't generate a response. Please try again.";
        }

        // Update conversation history
        this.conversationHistory[this.conversationHistory.length - 1] = {
            user: message,
            bot: botResponse
        };

        return botResponse;
    }

    addMessage(sender, text, className) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${className}`;
        
        const content = document.createElement('div');
        content.textContent = text;
        messageElement.appendChild(content);
        
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        return messageElement;
    }
}

// Initialize the chat when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new AIChat();
});
