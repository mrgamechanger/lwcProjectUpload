import { LightningElement, api, wire } from 'lwc';
import testingAccount from '@salesforce/apex/testingwire.testingAccount';
import getContacts from '@salesforce/apex/testingwire.getContacts';

export default class Wiretest extends LightningElement {
    @api accountlist;
    @api contactlist;
    selectedAccountId;

    // Define columns for the account datatable
    accountColumns = [
        { label: 'Account Name', fieldName: 'Name' },
        { label: 'Account Type', fieldName: 'Type' },
        { label: 'Account Owner', fieldName: 'Owner.Name' },
        { label: 'Account ID', fieldName: 'Id' },
        {
            type: 'button',
            typeAttributes: {
                label: 'View Contacts',
                name: 'viewContacts',
                variant: 'brand'
            }
        }
    ];

    // Define columns for the contact datatable
    contactColumns = [
        { label: 'Contact Name', fieldName: 'Name' },
        { label: 'Phone', fieldName: 'Phone' },
        { label: 'Email', fieldName: 'Email' }
    ];

    // Wire method to get the account data
    @wire(testingAccount)
    wiredAccount({ error, data }) {
        if (data) {
            this.accountlist = data;
        } else if (error) {
            console.error(error);
        }
    }

    // Wire method to get contacts by Account Id
    @wire(getContacts, { aid: '$selectedAccountId' })
    wiredContacts({ error, data }) {
      if (data) {
        this.contactlist = data;
      } else if (error) {
        console.error('Error fetching contacts:', error);
      }
    }

    // Handle the row action in the account datatable
    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        if (actionName === 'viewContacts') {
            // Capture the selected Account Id
            this.selectedAccountId = row.Id;
        }
    }
}