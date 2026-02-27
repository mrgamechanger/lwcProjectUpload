import { LightningElement, wire, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { refreshApex } from '@salesforce/apex';

const COLS = [
    { label: 'ID', fieldName: 'Id' },
    { label: 'Name', fieldName: 'Name', type: 'text', editable: true },
    { label: 'Phone', fieldName: 'Phone', type: 'phone', editable: true },
    { label: 'Industry', fieldName: 'Industry', type: 'text', editable: true }
];

export default class AccountManagement extends LightningElement {
    cols = COLS;
    @track selectedRecord;
    @track accountList = [];
    @track error;
    @track wiredAccountList = [];
    draftValues = []; // To track the inline edits

    // Fetch the list of accounts and track result for refresh
    @wire(getAccounts)
    accList(result) {
        this.wiredAccountList = result;
        if (result.data) {
            this.accountList = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.accountList = [];
        }
    }

    // Getter to disable the delete button if no record is selected
    get isDeleteDisabled() {
        return !this.selectedRecord;
    }

    // Handle row selection in the datatable
    handleSelection(event) {
        if (event.detail.selectedRows.length > 0) {
            this.selectedRecord = event.detail.selectedRows[0].Id;
        }
    }

    // Delete the selected account
    deleteRecord() {
        if (!this.selectedRecord) return;

        deleteRecord(this.selectedRecord)
            .then(() => {
                this.selectedRecord = null; // clear selection
                refreshApex(this.wiredAccountList); // refresh the account list
                this.showToast('Deleted Account', 'The account was deleted successfully', 'success');
            })
            .catch(() => {
                this.showToast('Error Deleting Account', 'An error occurred while deleting the account', 'error');
            });
    }

    // Handle inline edit save action from datatable
    handleSave(event) {
        
        const updatedFields = event.detail.draftValues.map(draft => {
            return { fields: draft };
        });

        
        const updatePromises = updatedFields.map(recordInput => updateRecord(recordInput));

        Promise.all(updatePromises)
            .then(() => {
                this.draftValues = []; // clear draft values after update
                refreshApex(this.wiredAccountList); // refresh the account list
                this.showToast('Success', 'Accounts updated successfully', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'An error occurred while updating accounts', 'error');
            });
    }

    // Helper method to show toast notifications
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(toastEvent);
    }
}