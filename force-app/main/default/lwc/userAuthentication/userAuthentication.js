import { LightningElement, track } from 'lwc';

export default class UserAuthentication extends LightningElement {
    @track inputType = 'password';
    @track eyeIcon = 'utility:hide';
    @track username = '';
    @track password = '';
    @track isSubmitDisabled = true;

    togglePasswordVisibility(event) {
        event.preventDefault();
        this.inputType = this.inputType === 'password' ? 'text' : 'password';
        this.eyeIcon = this.inputType === 'password' ? 'utility:hide' : 'utility:preview';
    }

    handleUsernameChange(event) {
        this.username = event.target.value;
        this.updateSubmitButton();
    }

    handlePasswordChange(event) {
        this.password = event.target.value;
        this.updateSubmitButton();
    }

    updateSubmitButton() {
        this.isSubmitDisabled = !this.username.trim() || !this.password.trim();
    }

    handleSubmit() {
        if (this.username.trim() && this.password.trim()) {
            // Here you would typically handle the authentication
            // For example, you might want to hash the password and send it securely to a server
            console.log('Authentication submitted:', { username: this.username, password: this.password });
            // Reset the form after submission
            this.username = '';
            this.password = '';
            this.isSubmitDisabled = true;
            this.template.querySelectorAll('input').forEach(input => input.value = '');
        }
    }
}