import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createRecord } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';
import ACCOUNT_OBJECT from '@salesforce/schema/Account';
import NAME_FIELD from '@salesforce/schema/Account.Name';
import ANNUAL_REVENUE_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import PHONE_FIELD from '@salesforce/schema/Account.Phone';
import RATING_FIELD from '@salesforce/schema/Account.Rating';

export default class CreateAccount extends NavigationMixin(LightningElement) {
    @track accountName = '';
    @track annualRevenue = 0;
    @track phone = '';
    @track rating = '';
    
    ratingOptions = [
        { label: 'Hot', value: 'Hot' },
        { label: 'Warm', value: 'Warm' },
        { label: 'Cold', value: 'Cold' }
    ];

    // Handle input changes
    handleInputChange(event) {
        const field = event.target.dataset.id;
        if (field === 'Name') {
            this.accountName = event.target.value;
        } else if (field === 'AnnualRevenue') {
            this.annualRevenue = event.target.value;
        } else if (field === 'Phone') {
            this.phone = event.target.value;
        } else if (field === 'Rating') {
            this.rating = event.target.value;
        }
    }

    // Handle form submission
    handleCreateAccount() {
        const fields = {};
        fields[NAME_FIELD.fieldApiName] = this.accountName;
        fields[ANNUAL_REVENUE_FIELD.fieldApiName] = this.annualRevenue;
        fields[PHONE_FIELD.fieldApiName] = this.phone;
        fields[RATING_FIELD.fieldApiName] = this.rating;

        const recordInput = { apiName: ACCOUNT_OBJECT.objectApiName, fields };

        createRecord(recordInput)
            .then(account => {
                this.showToast('Success', `Account ${this.accountName} has been created`, 'success');
                this.navigateToRecord(account.id);
            })
            .catch(error => {
                this.showToast('Error creating record', error.body.message, 'error');
            });
    }

    // Display a toast message
    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }

    // Navigate to the newly created Account record's detail page
    navigateToRecord(recordId) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Account',
                actionName: 'view'
            }
        });
    }
}