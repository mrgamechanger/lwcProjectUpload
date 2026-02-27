import { LightningElement } from 'lwc';

export default class CalculatorLWC extends LightningElement {
    input1 = " ";
    input2 = " ";
    result = null;

    handleInput1Change(event) {
        this.input1 = parseFloat(event.target.value) || 0;
    }

    handleInput2Change(event) {
        this.input2 = parseFloat(event.target.value) || 0;
    }

    handleAdd() {
        this.result = this.input1 + this.input2;
    }

    handleSubtract() {
        this.result = this.input1 - this.input2;
    }

    handleMultiply() {
        this.result = this.input1 * this.input2;
    }

    handleDivide() {
        if (this.input2 !== 0) {
            this.result = this.input1 / this.input2;
        } else {
            this.result = 'Cannot divide by 0';
        }
    }

    handleReset() {
        this.input1 = 0;
        this.input2 = 0;
        this.result = null;

        // Reset the input fields
        this.template.querySelectorAll('lightning-input').forEach(input => {
            input.value = 0;
        });
    }
}