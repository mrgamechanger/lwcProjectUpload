import { LightningElement, track } from 'lwc';

export default class Calculator extends LightningElement {
    @track displayValue = '0';
    firstOperand = null;
    operator = null;
    waitingForSecondOperand = false;

    handleButtonClick(event) {
        const { action } = event.target.dataset;
        const value = event.target.textContent;

        switch (action) {
            case 'add':
            case 'subtract':
            case 'multiply':
            case 'divide':
            case 'power':
                this.handleOperator(action);
                break;
            case 'sqrt':
                this.calculateSquareRoot();
                break;
            case 'log':
                this.calculateLog();
                break;
            case 'decimal':
                this.inputDecimal(value);
                break;
            case 'clear':
                this.resetCalculator();
                break;
            case 'calculate':
                this.calculate();
                break;
            default:
                this.inputDigit(value);
                break;
        }
    }

    inputDigit(digit) {
        const { displayValue, waitingForSecondOperand } = this;

        if (waitingForSecondOperand) {
            this.displayValue = digit;
            this.waitingForSecondOperand = false;
        } else {
            this.displayValue = displayValue === '0' ? digit : displayValue + digit;
        }
    }

    inputDecimal(dot) {
        if (!this.displayValue.includes(dot)) {
            this.displayValue += dot;
        }
    }

    handleOperator(nextOperator) {
        const { firstOperand, displayValue, operator } = this;
        const inputValue = parseFloat(displayValue);

        if (operator && this.waitingForSecondOperand) {
            this.operator = nextOperator;
            this.displayValue = this.displayValue.slice(0, -1) + this.getOperatorSymbol(nextOperator);
            return;
        }

        if (firstOperand == null) {
            this.firstOperand = inputValue;
        } else if (operator) {
            const result = this.performCalculation[operator](firstOperand, inputValue);

            this.displayValue = `${result}${this.getOperatorSymbol(nextOperator)}`;
            this.firstOperand = result;
        } else {
            this.displayValue += this.getOperatorSymbol(nextOperator);
        }

        this.waitingForSecondOperand = true;
        this.operator = nextOperator;
    }

    getOperatorSymbol(operator) {
        switch (operator) {
            case 'add':
                return '+';
            case 'subtract':
                return '-';
            case 'multiply':
                return '×';
            case 'divide':
                return '÷';
            case 'power':
                return '^';
            default:
                return '';
        }
    }

    calculateSquareRoot() {
        const inputValue = parseFloat(this.displayValue);

        if (inputValue >= 0) {
            const result = Math.sqrt(inputValue).toFixed(4);
            this.displayValue = String(result);
            this.firstOperand = result;
            this.operator = null;
            this.waitingForSecondOperand = false;
        }
    }

    calculateLog() {
        const inputValue = parseFloat(this.displayValue);

        if (inputValue > 0) {
            const result = Math.log10(inputValue).toFixed(4);
            this.displayValue = String(result);
            this.firstOperand = result;
            this.operator = null;
            this.waitingForSecondOperand = false;
        }
    }

    calculate() {
        const { firstOperand, displayValue, operator } = this;
        const inputValue = parseFloat(displayValue.replace(/[^\d.]/g, ''));

        if (operator && firstOperand != null) {
            const result = this.performCalculation[operator](firstOperand, inputValue);

            this.displayValue = String(result);
            this.firstOperand = null;
            this.operator = null;
            this.waitingForSecondOperand = false;
        }
    }

    performCalculation = {
        'add': (firstOperand, secondOperand) => firstOperand + secondOperand,
        'subtract': (firstOperand, secondOperand) => firstOperand - secondOperand,
        'multiply': (firstOperand, secondOperand) => firstOperand * secondOperand,
        'divide': (firstOperand, secondOperand) => firstOperand / secondOperand,
        'power': (firstOperand, secondOperand) => Math.pow(firstOperand, secondOperand),
    };

    resetCalculator() {
        this.displayValue = '0';
        this.firstOperand = null;
        this.operator = null;
        this.waitingForSecondOperand = false;
    }
}