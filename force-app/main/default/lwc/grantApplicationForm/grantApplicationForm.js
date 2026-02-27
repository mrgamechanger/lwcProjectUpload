import { LightningElement, track } from 'lwc';
import submitGrantApplication from '@salesforce/apex/GrantApplicationService.submitGrantApplication';

export default class GrantApplicationForm extends LightningElement {
    @track formData = {
        firstName: '',
        lastName: '',
        phone: '',
        postalCode: '',
        monthlyIncome: '',
        supportOption: ''
    };

    @track phoneError = false;
    @track phoneErrorMsg = '';
    @track postalError = false;
    @track postalErrorMsg = '';
    @track incomeError = false;
    @track incomeErrorMsg = '';

    @track hasError = false;
    @track errorMessage = '';
    @track hasSuccess = false;
    @track successMessage = '';
    @track isLoading = false;
    @track isSubmitted = false;

    supportOptions = [
        { label: 'Basic (3 months)', value: 'BASIC' },
        { label: 'Standard (6 months)', value: 'STANDARD' },
        { label: 'Premium (12 months)', value: 'PREMIUM' }
    ];

    // Regex for Singapore phone validation (65 + 8 digits)
    phoneRegex = new RegExp('^65[0-9]{8}$');
    // Regex for 6-digit postal code
    postalRegex = new RegExp('^[0-9]{6}$');

    handleInputChange(event) {
        const field = event.currentTarget.name || event.currentTarget.dataset.field;
        const value = event.detail ? event.detail.value : event.target.value;

        this.formData = {
            ...this.formData,
            [field]: value
        };

        // Clear errors when user starts typing
        this.clearValidationError(field);
    }

    clearValidationError(field) {
        switch (field) {
            case 'phone':
                this.phoneError = false;
                break;
            case 'postalCode':
                this.postalError = false;
                break;
            case 'monthlyIncome':
                this.incomeError = false;
                break;
        }
    }

    validateForm() {
        this.phoneError = false;
        this.postalError = false;
        this.incomeError = false;
        let isValid = true;

        // Validate Phone
        if (!this.phoneRegex.test(this.formData.phone)) {
            this.phoneError = true;
            this.phoneErrorMsg = 'Phone must be in format: 65xxxxxxxx (Singapore number)';
            isValid = false;
        }

        // Validate Postal Code
        if (!this.postalRegex.test(this.formData.postalCode)) {
            this.postalError = true;
            this.postalErrorMsg = 'Postal code must be exactly 6 digits';
            isValid = false;
        }

        // Validate Monthly Income
        const income = parseFloat(this.formData.monthlyIncome);
        if (isNaN(income) || income <= 0) {
            this.incomeError = true;
            this.incomeErrorMsg = 'Monthly income must be a positive number';
            isValid = false;
        }

        return isValid;
    }

    async handleSubmit(event) {
        event.preventDefault();

        // Clear previous messages
        this.hasError = false;
        this.hasSuccess = false;

        // Validate form
        if (!this.validateForm()) {
            this.hasError = true;
            this.errorMessage = 'Please correct the validation errors above.';
            return;
        }

        this.isLoading = true;

        try {
            // Call Apex controller to submit application
            const result = await submitGrantApplication({
                firstName: this.formData.firstName,
                lastName: this.formData.lastName,
                phone: this.formData.phone,
                postalCode: this.formData.postalCode,
                monthlyIncome: parseFloat(this.formData.monthlyIncome),
                supportOption: this.formData.supportOption
            });

            this.isLoading = false;

            if (result.success) {
                this.isSubmitted = true;
                this.hasSuccess = true;
                this.successMessage = result.message || 'Application submitted successfully!';
            } else {
                this.hasError = true;
                this.errorMessage = result.message || 'Failed to submit application. Please try again.';
            }
        } catch (error) {
            this.isLoading = false;
            this.hasError = true;
            this.errorMessage = error.body?.message || 'An error occurred while submitting the application.';
            console.error('Error submitting application:', error);
        }
    }

    handleReset(event) {
        event.preventDefault();
        this.formData = {
            firstName: '',
            lastName: '',
            phone: '',
            postalCode: '',
            monthlyIncome: '',
            supportOption: ''
        };
        this.hasError = false;
        this.hasSuccess = false;
        this.phoneError = false;
        this.postalError = false;
        this.incomeError = false;
    }

    handleNewApplication() {
        this.isSubmitted = false;
        this.handleReset(new Event('reset'));
    }
}
