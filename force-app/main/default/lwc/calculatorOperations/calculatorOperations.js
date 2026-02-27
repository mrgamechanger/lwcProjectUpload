import { LightningElement } from 'lwc';

export default class CalculatorOperations extends LightningElement {
    number1 = 0;
    number2 = 0;

    // Handle input changes
    handleNumber1Change(event) {
        this.number1 = parseFloat(event.target.value);
    }

    handleNumber2Change(event) {
        this.number2 = parseFloat(event.target.value);
    }

    // Dispatch result to parent
    dispatchResult(operation, result) {
        const event = new CustomEvent('calculate', {
            detail: { operation, result }
        });
        this.dispatchEvent(event);
    }

    handleAddition() {
        const result = this.number1 + this.number2;
        this.dispatchResult('Addition', result);
    }

    handleSubtraction() {
        const result = this.number1 - this.number2;
        this.dispatchResult('Subtraction', result);
    }

    handleMultiplication() {
        const result = this.number1 * this.number2;
        this.dispatchResult('Multiplication', result);
    }

    handleDivision() {
        const result = this.number2 !== 0 ? this.number1 / this.number2 : 'Cannot divide by zero';
        this.dispatchResult('Division', result);
    }
}