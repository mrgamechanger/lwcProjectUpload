import { LightningElement } from 'lwc';

export default class Sipcal extends LightningElement {
    monthlyInvestment = '';
    annualInterestRate = '';
    years = '';
    result = '';

    handleInput(event) {
        const { name, value } = event.target;
        this[name] = value;  // Dynamically assign values based on input names
    }

    handleCalculation(event) {
        event.preventDefault(); // Prevent default form submission

        const action = event.target.label;
         
        if (action === 'Calculate SIP') {
            if (this.isValidInput()) {
                this.calculateSIP();
            } else {
                this.result = 'Invalid input. Please check your values.';
            }
        } else if (action === 'Reset') {
            this.resetFields();
        }

        console.log(this.result);
    }

    // SIP Calculation logic extracted into a separate function
    calculateSIP() {
        const P = parseFloat(this.monthlyInvestment);
        const annualRate = parseFloat(this.annualInterestRate) / 100;
        const r = annualRate / 12;
        const n = parseFloat(this.years) * 12;

        // Formula calculation
        const futureValue = P * (((Math.pow(1 + r, n) - 1) / r) * (1 + r));

        // Round to two decimal places and set result
        this.result = futureValue.toFixed(2);
    }

    // Input validation for better user experience
    isValidInput() {
        return this.monthlyInvestment > 0 && this.annualInterestRate > 0 && this.years > 0;
    }

    // Reset all fields and result
    resetFields() {
        this.monthlyInvestment = '';
        this.annualInterestRate = '';
        this.years = '';
        this.result = '';
        this.template.querySelector('form').reset(); // Resetting the form elements
    }
}