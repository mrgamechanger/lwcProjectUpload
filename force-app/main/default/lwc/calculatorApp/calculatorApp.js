import { LightningElement } from 'lwc';

export default class CalculatorApp extends LightningElement {
    operation = '';
    result = '';
b connectedCallback() {        // Listen for the custom event from the child component
       
    }
    // Handle the event from child
    handleCalculation(event) {
        const { operation, result } = event.detail;
        this.operation = operation;
        this.result = result;
    }
}