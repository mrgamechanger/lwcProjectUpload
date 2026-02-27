import { LightningElement, track } from 'lwc';
import sendEligibilityEmail from '@salesforce/apex/EligibilityController.sendEligibilityEmail';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class UserEligibilityForm extends LightningElement {
    @track name = '';
    @track phone = '';
    @track email = '';
    @track cibilScore = '';

    handleInputChange(event) {
        const field = event.target.label.toLowerCase().replace(' ', '');
        this[field] = event.target.value;
        console.log(`Field ${field} updated to: ${this[field]}`);
    }

    handleSubmit() {
        sendEligibilityEmail({
            name: this.name,
            phone: this.phone,
            email: this.email,
            cibilScore: this.cibilScore
        })
        .then((res) => {
            this.showToast('Success', 'Encrypted email sent successfully', 'success');
console.log('Email sent successfully:', res);
            this.resetForm();
        })
        .catch(error => {
            this.showToast('Error', 'Failed to send encrypted email: ' + error.message, 'error');
        });
    }


    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}