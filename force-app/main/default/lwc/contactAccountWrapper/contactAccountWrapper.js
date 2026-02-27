import { LightningElement, wire, track } from 'lwc';
import getContactAccountWrappers from '@salesforce/apex/ContactAccountWrapperController.getContactAccountWrappers';

export default class ContactAccountWrapper extends LightningElement {
    @track contactAccountData = []; // Holds the wrapper data
    @track error; // Holds error messages if any
    @track selectedAccount = null; // Holds the account details of the selected contact

    // Fetch data using @wire
    @wire(getContactAccountWrappers)
    wiredWrappers({ data, error }) {
        if (data) {
            this.contactAccountData = data;
        } else if (error) {
            this.error = error;
            console.error('Error fetching wrapper data: ', error);
        }
    }

    // Handler to update checkbox selection
    handleCheckboxChange(event) {
        const contactId = event.target.dataset.id;
        const isChecked = event.target.checked;

        // Update the corresponding record in the contactAccountData array
        this.contactAccountData = this.contactAccountData.map(wrapper => {
            if (wrapper.contact.Id === contactId) {
                const updatedWrapper = { ...wrapper, isSelected: isChecked };
                if (isChecked) {
                    // If the checkbox is checked, update the selected account details
                    this.selectedAccount = updatedWrapper.account;
                }
                return updatedWrapper;
            }
            return wrapper;
        });

        // If no checkboxes are selected, clear the selected account
        if (!this.contactAccountData.some(wrapper => wrapper.isSelected)) {
            this.selectedAccount = null;
        }
    }
}