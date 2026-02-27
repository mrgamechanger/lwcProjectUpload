import { LightningElement, track } from 'lwc';

export default class EmployeeForm extends LightningElement {
    @track employee = {
        name: '',
        email: '',
        age: '',
        ctc: ''
    };

    @track employeeList = []; // Array to store employee records

    // Columns for the datatable
    columns = [
        { label: 'Name', fieldName: 'name', type: 'text' },
        { label: 'Email', fieldName: 'email', type: 'email' },
        { label: 'Age', fieldName: 'age', type: 'number' },
        { label: 'CTC', fieldName: 'ctc', type: 'number' }
    ];

    // Getter to determine if the Save button should be enabled
    get isSaveDisabled() {
        const { name, email, age, ctc } = this.employee;
        return !(name && email && age && ctc); // Enable only if all fields are filled
    }

    handleInputChange(event) {
        const field = event.target.name;
        this.employee[field] = event.target.value; // Update the respective field
    }

    handleSave() {
        // Add employee to the list
        this.employeeList = [...this.employeeList, { ...this.employee }];

        // Clear the input fields
        this.employee = {
            name: '',
            email: '',
            age: '',
            ctc: ''
        };

        // Display a success message
        this.showToast('Success', 'Employee added successfully!', 'success');
    }

    // Utility to show a toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}