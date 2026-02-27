import { LightningElement, wire } from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import CALC_MC from '@salesforce/messageChannel/CalculationMessageChannel__c';

export default class CalcSubscriber extends LightningElement {
    result;
    subscription = null;

    // Obtain a message context for subscribing to messages
    @wire(MessageContext)
    messageContext;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }

    subscribeToMessageChannel() {
        if (!this.subscription) {
            this.subscription = subscribe(this.messageContext, CALC_MC, (message) => {
                this.handleMessage(message);
            });
        }
    }

    handleMessage(message) {
        const { calculationType, total, percentage, discount, markup, temperature, conversion } = message;
        if (calculationType === 'percentage') {
            this.result = (total * percentage) / 100;
        } else if (calculationType === 'discount') {
            this.result = total - (total * discount) / 100;
        } else if (calculationType === 'markup') {
            this.result = total + (total * markup) / 100;
        } else if (calculationType === 'temperature') {
            if (conversion === 'toCelsius') {
                // Fahrenheit to Celsius
                this.result = (temperature - 32) * 5 / 9;
            } else if (conversion === 'toFahrenheit') {
                // Celsius to Fahrenheit
                this.result = temperature * 9 / 5 + 32;
            }
        }
    }
}