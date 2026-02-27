import { LightningElement, track } from 'lwc';
import getExpensesByDate from "@salesforce/apex/ExpenseClass.getExpensesByDate";
import createExpense from "@salesforce/apex/ExpenseClass.createExpense";

export default class SearchExpensesByDate extends LightningElement {
    @track originalExpenseRecords;
    @track getExpenseRecords;
    @track startDate;
    @track endDate;
    @track errorMessage;
    @track totalExpenseAmount = 0;

    handleStartDate(event) {
        this.startDate = event.target.value;
        console.log('Start Date:', this.startDate);
    }

    handleEndDate(event) {
        this.endDate = event.target.value;
        console.log('End Date:', this.endDate);
    }

    isDataAvailable = false;
    isLoading = false;

    handleSearchByDate() {
        console.log('Dates on Button: Start Date =>', this.startDate, 'End Date =>', this.endDate);
        this.isLoading = true;
        this.errorMessage = '';

        getExpensesByDate({ minDate: this.startDate, maxDate: this.endDate })
            .then((results) => {
                this.isDataAvailable = true;
                this.getExpenseRecords = results;
                this.originalExpenseRecords = [...results];
                console.log('Results in getExpenseRecords:', this.getExpenseRecords);
                this.calculateTotalExpense();
                this.isLoading = false;
            })
            .catch((error) => {
                console.error('Error:', error);
                this.errorMessage = 'Failed to fetch expenses. Please try again later.';
                this.isLoading = false;
            });
    }

    calculateTotalExpense() {
        this.totalExpenseAmount = this.getExpenseRecords.reduce((total, expense) => {
            return total + expense.Expense_Amount__c;
        }, 0);
    }

    handleClose() {
        this.isDataAvailable = false;
    }

    handleReset() {
        this.startDate = "";
        this.endDate = "";
        this.getExpenseRecords = [];
        this.isDataAvailable = false;
        this.errorMessage = '';
        this.totalExpenseAmount = 0;
        this.template.querySelector('form').reset();
    }

    // Method to create expense and handle duplicates
    handleCreateExpense(newExpense) {
        createExpense({ 
            NewExpenseName: newExpense.Name, 
            NewExpenseDate: newExpense.Expense_Date__c, 
            NewAmount: newExpense.Expense_Amount__c, 
            NewStatus: newExpense.Expense_Status__c 
        })
        .then(result => {
            // Handle successful creation
            console.log('Expense created:', result);
            this.handleSearchByDate(); // Refresh the list
        })
        .catch(error => {
            if (error.body.message === 'Duplicate expense record exists.') {
                this.errorMessage = 'Duplicate expense record exists.';
            } else {
                console.error('Error:', error);
                this.errorMessage = 'Failed to create expense. Please try again later.';
            }
        });
    }
}