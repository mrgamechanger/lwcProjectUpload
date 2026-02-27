import { LightningElement, track, wire } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts'; // Import the Apex method
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AccountDataTable extends LightningElement {
    @track data = [];
    @track displayData = [];
    @track draftValues = [];
    @track showMoreVisible = false;
    @track filterText = ''; // Track the filter text input

    @track columns = [
        { label: 'Account Name', fieldName: 'Name', editable: true, hideDefaultActions: true },
        { label: 'Industry', fieldName: 'Industry', editable: true, hideDefaultActions: true },
        { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency', editable: true, hideDefaultActions: true },
        { label: 'Phone', fieldName: 'Phone', editable: true, hideDefaultActions: true }
    ];

    @wire(getAccounts)
    wiredAccounts({ error, data }) {
        if (data) {
            this.data = data;
            this.applyFilter(); // Apply filter initially
            this.showMoreVisible = this.data.length > 20; // Show "Show More" button if more than 20 records
        } else if (error) {
            console.error('Error fetching accounts:', error);
            this.showToast('Error', 'Error fetching account data', 'error');
        }
    }

    handleFilterChange(event) {
        this.filterText = event.target.value;
        this.applyFilter();
    }

    applyFilter() {
        if (this.filterText) {
            const filteredData = this.data.filter(account =>
                account.Name.toLowerCase().includes(this.filterText.toLowerCase())
            );
            this.displayData = filteredData.slice(0, 20); // Show only first 20 filtered records
        } else {
            this.displayData = this.data.slice(0, 20); // If no filter, show the first 20 records
        }
        this.showMoreVisible = this.displayData.length < this.data.length;
    }

    handleSave(event) {
        const updatedFields = event.detail.draftValues.map(draft => {
            return { fields: draft };
        });

        const promises = updatedFields.map(recordInput => updateRecord(recordInput));

        Promise.all(promises)
            .then(() => {
                this.showToast('Success', 'Records updated successfully!', 'success');
                this.draftValues = [];
                return refreshApex(this.wiredAccounts);
            })
            .catch(error => {
                console.error('Error updating records:', error);
                this.showToast('Error', 'Failed to update records', 'error');
            });
    }

    handleShowMore() {
        const currentLength = this.displayData.length;
        const nextSet = this.data.slice(currentLength, currentLength + 20);
        this.displayData = [...this.displayData, ...nextSet];
        this.showMoreVisible = this.data.length > this.displayData.length;
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
        });
        this.dispatchEvent(event);
    }
}