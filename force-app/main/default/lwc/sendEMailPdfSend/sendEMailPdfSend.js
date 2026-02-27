import { LightningElement, track } from 'lwc';
import getpdf from '@salesforce/apex/GeneratePdf.getpdf';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class SendEMailPdfSend extends LightningElement {
    @track contactName = '';
    @track contactPhone = '';
    @track contactEmail = '';

    // Handle each input explicitly instead of dynamic property assignment
    handleInputChange(event) {
        const fieldName = event.target.name;
        const fieldValue = event.target.value;

        switch (fieldName) {
            case 'conname':
                this.contactName = fieldValue;
                break;
            case 'Phone':
                this.contactPhone = fieldValue;
                break;
            case 'Email':
                this.contactEmail = fieldValue;
                break;
            default:
                break;
        }
    }

    handleGenerateClick() {
        // Simple front-end validation
        if (!this.contactName || !this.contactEmail) {
            this.showToast('Validation Error', 'Name and Email are required.', 'error');
            return;
        }

        const body = this.createWrapperPayload();
        console.log('Wrapper Payload:', JSON.stringify(body));
        getpdf({ wrapper: body })
            .then(createdContact => {
                const message =
                    createdContact && createdContact.Id
                        ? `Contact ${createdContact.Id} inserted and PDF sent to email.`
                        : 'PDF email sent successfully.';

                this.showToast('Success', message, 'success');
                this.clearForm();
            })
            .catch(error => {
                const errorMessage =
                    error && error.body && error.body.message
                        ? error.body.message
                        : 'Unexpected error occurred while sending email.';
                this.showToast('Error', errorMessage, 'error');
            });
    }

    // Build wrapper object for Apex
    createWrapperPayload() {
        return {
            contactname: this.contactName,
            Phone: this.contactPhone,
            Email: this.contactEmail
        };
    }

    // Reset inputs
    clearForm() {
        this.contactName = '';
        this.contactPhone = '';
        this.contactEmail = '';
    }

    // Common toast helper
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant,
                mode: 'dismissable'
            })
        );
    }
}
