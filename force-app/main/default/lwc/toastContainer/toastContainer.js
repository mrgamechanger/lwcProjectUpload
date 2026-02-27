// toastContainer/toastContainer.js
import { LightningElement, api } from 'lwc';

export default class ToastContainer extends LightningElement {
    showToast = false;
    message = '';
    variant = 'info';
    autoCloseTime = 5000;

    @api
    showCustomToast(message, variant = 'info', autoCloseTime = 5000) {
        this.message = message;
        this.variant = variant;
        this.autoCloseTime = autoCloseTime;
        this.showToast = true;
    }

    handleCloseToast() {
        this.showToast = false;
    }
}