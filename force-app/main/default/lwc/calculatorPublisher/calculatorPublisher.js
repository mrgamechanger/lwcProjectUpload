import { LightningElement } from 'lwc';
import pubsub from 'c/pubsub';

export default class CalculatorPublisher extends LightningElement {
    number1 = 0;
    number2 = 0;

    handleNumber1Change(event) {
        this.number1 = parseFloat(event.target.value) || 0;
    }

    handleNumber2Change(event) {
        this.number2 = parseFloat(event.target.value) || 0;
    }

    handleAdd() {
        const result = this.number1 + this.number2;
        pubsub.fire('calculationEvent', { operation: 'Addition', result });
    }

    handleSubtract() {
        const result = this.number1 - this.number2;
        pubsub.fire('calculationEvent', { operation: 'Subtraction', result });
    }

    handleMultiply() {
        const result = this.number1 * this.number2;
        pubsub.fire('calculationEvent', { operation: 'Multiplication', result });
    }

    handleDivide() {
        let result = 'Cannot divide by zero';
        if (this.number2 !== 0) {
            result = this.number1 / this.number2;
        }
        pubsub.fire('calculationEvent', { operation: 'Division', result });
    }
}