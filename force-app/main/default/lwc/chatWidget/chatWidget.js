import { LightningElement, track } from 'lwc';
import initChat from '@salesforce/apex/ChatController.initChat';
import processMessage from '@salesforce/apex/ChatController.processMessage';
import getConversation from '@salesforce/apex/ChatController.getConversation';

export default class ChatWidget extends LightningElement {
    @track isOpen = false;
    @track messages = [];
    @track inputValue = '';
    @track isLoading = false;
    @track isSending = false;
    @track showQuickReplies = false;
    @track quickReplies = [
        { label: 'Help with Accounts', value: 'Can you help me with account management?' },
        { label: 'Case Creation', value: 'How do I create a case?' },
        { label: 'Report Issue', value: 'I found a bug in the system' }
    ];

    chatWindowClass = 'chat-window hidden';
    transcriptId = null;

    connectedCallback() {
        // Initialize chat when component loads
        this.initializeChat();
    }

    async initializeChat() {
        try {
            // Initialize and preload prior conversation if available
            this.transcriptId = await initChat();
            try {
                const history = await getConversation({ transcriptId: this.transcriptId });
                if (Array.isArray(history)) {
                    // Expecting array of { id, text, type } or similar shape from Apex DTO
                    const normalized = history
                        .filter(m => m && m.text && m.type)
                        .map(m => ({
                            id: m.id || Date.now() + Math.random(),
                            text: m.text,
                            type: m.type === 'User' || m.type === 'user' ? 'user' : 'bot'
                        }));
                    if (normalized.length) {
                        this.messages = normalized;
                    }
                }
            } catch (e) {
                // Non-fatal; proceed with default greeting
                // eslint-disable-next-line no-console
                console.warn('getConversation preload failed', e);
            }

            if (!this.messages.length) {
                this.addBotMessage("Hello! I'm your Salesforce assistant. How can I help you today?");
            }
            this.showQuickReplies = true;
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error initializing chat:', error);
            this.addBotMessage("Sorry, I'm having trouble starting the chat. Please try again.");
        }
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatWindowClass = this.isOpen ? 'chat-window visible' : 'chat-window hidden';
        
        if (this.isOpen) {
            this.scrollToBottom();
        }
    }

    closeChat() {
        this.isOpen = false;
        this.chatWindowClass = 'chat-window hidden';
    }

    handleInputChange(event) {
        this.inputValue = event.target.value;
    }

    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.sendMessage();
        }
    }

    async sendMessage() {
        if (!this.inputValue || !this.inputValue.trim() || this.isSending) {
            return;
        }

        const userMessage = this.inputValue.trim();
        this.inputValue = '';
        this.isSending = true;

        // Add user message immediately for responsiveness
        this.addUserMessage(userMessage);

        try {
            this.isLoading = true;

            // Server-side processing via Apex (ensures CSP compliance and secret safety)
            const result = await processMessage({
                transcriptId: this.transcriptId,
                userMessage: userMessage
            });

            // Expect Apex to return { botMessage: string, quickReplies?: Array<{label,value}> }
            const botResponse =
                (result && (result.botMessage || result.response || result.message)) ||
                "Sorry, I couldn't process your request.";

            this.addBotMessage(botResponse);

            if (result && Array.isArray(result.quickReplies) && result.quickReplies.length) {
                this.quickReplies = result.quickReplies.map(q => ({
                    label: q.label || q.value || q,
                    value: q.value || q.label || q
                }));
                this.showQuickReplies = true;
            } else {
                // maintain default quick replies if server doesn't provide
                this.showQuickReplies = true;
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Error sending message:', error);
            this.addBotMessage('Sorry, I encountered an error. Please try again.');
        } finally {
            this.isLoading = false;
            this.isSending = false;
            this.scrollToBottom();
        }
    }

    handleQuickReply(event) {
        const message = event.target.dataset.value;
        this.inputValue = message;
        this.sendMessage();
    }

    addUserMessage(text) {
        const newMessage = {
            id: Date.now(),
            text: text,
            type: 'user'
        };
        this.messages = [...this.messages, newMessage];
        this.scrollToBottom();
    }

    addBotMessage(text) {
        const newMessage = {
            id: Date.now(),
            text: text,
            type: 'bot'
        };
        this.messages = [...this.messages, newMessage];
        this.scrollToBottom();
    }

    getMessageClass(type) {
        return type === 'user' ? 'user-message' : 'bot-message';
    }

    scrollToBottom() {
        const messagesContainer = this.template.querySelector('.chat-messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }
}
