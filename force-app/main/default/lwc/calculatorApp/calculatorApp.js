import { LightningElement } from 'lwc';

export default class CalculatorApp extends LightningElement {
    operation = '';
    result = '';

    // Handle the event from child
    handleCalculation(event) {
        const { operation, result } = event.detail;
        this.operation = operation;
        this.result = result;
    }
}