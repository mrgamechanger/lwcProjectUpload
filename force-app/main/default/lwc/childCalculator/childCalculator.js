import { LightningElement, api } from 'lwc';

export default class ChildCalculator extends LightningElement {
    @api
    calculatePercentage(total, percentage) {
        return (total * percentage) / 100;
    }

    @api
    calculateDiscount(total, discount) {
        return total - (total * discount) / 100;
    }

    @api
    calculateMarkup(total, markup) {
        return total + (total * markup) / 100;
    }
}