import { LightningElement } from 'lwc';
import pubsub from 'c/pubsub';  // Importing the custom pubsub module

export default class CalculatorComponent extends LightningElement {
    num1 = 0;
    num2 = 0;

    handleNum1Change(event) {
        this.num1 = parseFloat(event.target.value);
    }

    handleNum2Change(event) {
        this.num2 = parseFloat(event.target.value);
    }

    publishResult(result) {
        const payload = { result };
        pubsub.fire('calculationResult', payload);  // Publishing the result
    }

    handleAdd() {
        const result = this.num1 + this.num2;
        this.publishResult(result);
    }

    handleSubtract() {
        const result = this.num1 - this.num2;
        this.publishResult(result);
    }

    handleMultiply() {
        const result = this.num1 * this.num2;
        this.publishResult(result);
    }

    handleDivide() {
        if (this.num2 === 0) {
            this.publishResult('Error: Division by zero');
        } else {
            const result = this.num1 / this.num2;
            this.publishResult(result);
        }
    }
}
