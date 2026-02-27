import { LightningElement, api } from 'lwc';

export default class Square extends LightningElement {
    @api value;

    handleClick() {
        // Custom event to handle square click
        this.dispatchEvent(new CustomEvent('squareclick'));
    }
}