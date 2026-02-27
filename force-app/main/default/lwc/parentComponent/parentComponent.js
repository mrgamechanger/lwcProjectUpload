import { LightningElement } from 'lwc';
import userId from '@salesforce/user/Id';
export default class ParentComponent extends LightningElement {
    total = 0;
    percentage = 0;
    discount = 0;
    markup = 0;
    result = null;
    curentuserid=userId;
    connectedCallback()
    {
        console.log("currentUser",this.curentuserid);
    }
    // Getter to access the child component
    get childComponent() {
        return this.template.querySelector('c-child-calculator');
    }

    handleTotalChange(event) {
        this.total = Number(event.target.value); // Convert input value to a number
    }

    handlePercentageChange(event) {
        this.percentage = Number(event.target.value); // Convert input value to a number
    }

    handleDiscountChange(event) {
        this.discount = Number(event.target.value); // Convert input value to a number
    }

    handleMarkupChange(event) {
        this.markup = Number(event.target.value); // Convert input value to a number
    }

    calculatePercentage() {
        if (this.childComponent) {
            this.result = this.childComponent.calculatePercentage(this.total, this.percentage);
        }
    }

    calculateDiscount() {
        if (this.childComponent) {
            this.result = this.childComponent.calculateDiscount(this.total, this.discount);
        }
    }

    calculateMarkup() {
        if (this.childComponent) {
            this.result = this.childComponent.calculateMarkup(this.total, this.markup);
        }
    }
}