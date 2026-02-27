// parentCalculator.js
import { LightningElement } from 'lwc';

export default class ParentCalculator extends LightningElement {
    totalAmount = " ";       // Example total amount
    percentageValue = " ";    // Example percentage
    discountValue = " ";      // Example discount

    percentageResult;
    discountResult;

    handleCalculatePercentage() {
        const childCalculator = this.template.querySelector('c-child-calculator');
        if (childCalculator) {
            this.percentageResult = childCalculator.calculatePercentage(this.totalAmount, this.percentageValue);
        }
    }

    handleCalculateDiscount() {
        const childCalculator = this.template.querySelector('c-child-calculator');
        if (childCalculator) {
            this.discountResult = childCalculator.calculateDiscount(this.totalAmount, this.discountValue);
        }
    }

    handleTotalChange(event) {
        this.totalAmount = event.target.value;
    }

    handlePercentageChange(event) {
        this.percentageValue = event.target.value;
    }

    handleDiscountChange(event) {
        this.discountValue = event.target.value;
    }
}