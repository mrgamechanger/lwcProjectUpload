// customOverlayToast/customOverlayToast.js
import { LightningElement, api } from 'lwc';

export default class CustomOverlayToast extends LightningElement {
    @api message = '';
    @api variant = 'info';
    @api autoCloseTime = 5000;

    connectedCallback() {
        if (this.autoCloseTime > 0) {
            this.autoCloseTimeout = setTimeout(() => {
                this.closeToast();
            }, this.autoCloseTime);
        }
    }

    disconnectedCallback() {
        if (this.autoCloseTimeout) {
            clearTimeout(this.autoCloseTimeout);
        }
    }

    get iconName() {
        switch (this.variant) {
            case 'success': return 'utility:success';
            case 'warning': return 'utility:warning';
            case 'error': return 'utility:error';
            default: return 'utility:info';
        }
    }

    get toastContainerClass() {
        return `custom-toast-container custom-toast-${this.variant}`;
    }

    closeToast() {
        this.dispatchEvent(new CustomEvent('close'));
    }
}