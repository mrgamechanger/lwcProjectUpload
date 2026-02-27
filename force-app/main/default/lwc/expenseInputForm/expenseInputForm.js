import { LightningElement, track } from 'lwc';
import createExpense from "@salesforce/apex/ExpenseClass.createExpense";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class ExpenseInputForm extends LightningElement {
    @track expenseDetails;
    @track expenseName;
    @track expenseAmount;
    @track expenseDate;
    expenseStatus = 'Approved'; // Always set to Approved

    handleExpName(event) {
        this.expenseName = event.target.value;
    }

    handleExpDate(event) {
        this.expenseDate = event.target.value;
    }

    handleExpAmount(event) {
        this.expenseAmount = event.target.value;
    }

    showToastSuccess() {
        const event = new ShowToastEvent({
            title: 'Expense Created Successfully',
            message: 'Expense record is created and saved successfully',
            variant: 'success'
        });
        this.dispatchEvent(event);
    }

    showToastError(errorMessage) {
        const event = new ShowToastEvent({
            title: 'Error Creating Expense',
            message: errorMessage,
            variant: 'error'
        });
        this.dispatchEvent(event);
    }

    validateForm() {
        if (!this.expenseName || !this.expenseDate || !this.expenseAmount) {
            this.showToastError('All fields are required.');
            return false;
        }
        return true;
    }

    createNewExpense() {
        if (!this.validateForm()) {
            return;
        }

        createExpense({
            NewExpenseName: this.expenseName,
            NewExpenseDate: this.expenseDate,
            NewAmount: this.expenseAmount,
            NewStatus: this.expenseStatus // Always sending "Approved"
        })
        .then((result) => {
            this.expenseDetails = result;
            this.showToastSuccess();
        })
        .catch((error) => {
            this.showToastError(error.body.message);
        });
    }

    Reset() {
        this.expenseDetails = null;
        this.expenseName = " ";
        this.expenseDate = " ";
        this.expenseAmount = " ";
        this.template.querySelector('form').reset();
    }
}