import { LightningElement ,wire } from 'lwc';
import { publish ,MessageContext } from 'lightning/messageService';
import SAMPLEMC from '@salesforce/messageChannel/CalculatorChannel__c';

export default class Publisher extends LightningElement {
    @wire(MessageContext)
    messageContext;

    connectedCallback(){
        console.log('Publisher connected');
    }
handleFirstNumberChange(event){
    this.firstNumber = parseFloat(event.target.value);
    console.log('First number changed: ' + this.firstNumber);
}
handleSecondNumberChange(event){
    this.secondNumber = parseFloat(event.target.value);
    console.log('Second number changed: ' + this.secondNumber);
}
calculateSum(){
    this.result = this.firstNumber + this.secondNumber;
    console.log('Calculated sum: ' + this.result);
    this.handleClick();
}


    handleClick(){
        const message = {
            result: this.result
        };
        publish(this.messageContext, SAMPLEMC, message);
    }
}