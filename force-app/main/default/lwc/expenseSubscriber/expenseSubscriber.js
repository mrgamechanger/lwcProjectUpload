import { LightningElement, wire } from 'lwc';
import { subscribe, unsubscribe, createMessageContext } from 'lightning/messageService';
import EXPENSE_CHANNEL from '@salesforce/messageChannel/ExpenseChannel__c';

export default class ExpenseSubscriber extends LightningElement {
    messageContext = createMessageContext();
    subscription = null;
    receivedMessages = [];

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                EXPENSE_CHANNEL,
                (message) => this.handleMessage(message)
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }

    handleMessage(message) {
        this.receivedMessages = [...this.receivedMessages, message];
        console.log('Received message:', message);
        
        // You can perform any action based on the message
        if (message.action === 'ADD') {
            // Handle new expense addition
            this.showToast('Success', `New expense added: ${message.category} - $${message.amount}`);
        }
    }

    showToast(title, message) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: 'success'
        });
        this.dispatchEvent(evt);
    }
} 