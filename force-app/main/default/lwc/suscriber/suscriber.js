import { LightningElement ,wire,track} from 'lwc';
import { subscribe, MessageContext } from 'lightning/messageService';
import apexMethodName from '@salesforce/apex/Namespace.ClassName.apexMethodReference';
import SAMPLEMC from '@salesforce/messageChannel/CalculatorChannel__c';

export default class Suscriber extends LightningElement {
    @wire(MessageContext) messageContext;
   @track result;

    connectedCallback() {
        this.subscribeToMessageChannel();
    }
    
    subscribeToMessageChannel() {
        subscribe(this.messageContext, SAMPLEMC, (message) => this.handleMessage(message));
    }
    handleMessage(message) {
        this.result = message.result;
    }
}