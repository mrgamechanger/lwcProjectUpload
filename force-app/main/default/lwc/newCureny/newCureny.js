import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class NewCurrency extends LightningElement {
     showOutput = false;
     showSpinner = false; 
    @track currencyOptions = []; // Track this property to allow reactivity in the template

    enteredAmount = '';
    fromCurrency = '';
    toCurrency = '';
    rate = '';
    symbol = '';

    connectedCallback() {
        this.symbolfunc(); // Fetch the currencies when the component is initialized
    }


    get isButtonDisabled() {
        return !(this.enteredAmount && this.fromCurrency && this.toCurrency);
    }

    handleInputChange(event) {
        const { name, value } = event.target;

        if (name === 'amount') {
            this.enteredAmount = value;
        } else if (name === 'fromcurr') {
            this.fromCurrency = value;
        } else if (name === 'tocurr') {
            this.toCurrency = value;
        }
    }

    handleSubmit(event) {
        event.preventDefault();  // Prevent default form submission

        if (this.enteredAmount && this.fromCurrency && this.toCurrency) {
            this.convertCurrency();
        } else {
            this.showToast('Error', 'Please fill out all fields.', 'error');
            
        }
    }

    async symbolfunc() {
        try {
            const response = await fetch('https://api.frankfurter.app/currencies');
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            console.log('data',  JSON.stringify(data));
            // Convert the API response into an array for dropdown options
            this.currencyOptions = Object.keys(data).map(currencyCode => {
                return {
                    label: `${currencyCode} - ${data[currencyCode]}`, // e.g., 'USD - United States Dollar'
                    value: currencyCode        // e.g., 'USD'
                };
            });
        } catch (error) {
            this.showToast('Error', 'Error fetching currencies: ', 'error');
            
        }
    }

    async convertCurrency() {
        this.showSpinner = true;  
        this.showOutput = false;  

        const endpoint = `https://api.frankfurter.app/latest?amount=${this.enteredAmount}&from=${this.fromCurrency}&to=${this.toCurrency}`;

        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            this.showSpinner = false;  
            this.showOutput = true;
            this.rate = data.rates[this.toCurrency];
            this.symbol = this.toCurrency;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            this.showSpinner = false;  
            this.showOutput = false;
            
            this.showToast('Error', 'Failed to fetch exchange rate. Please try again.', 'error');
            
        }
    }

    handleReset() {
        this.showOutput = false;
        this.enteredAmount = '';
        this.fromCurrency = '';
        this.toCurrency = '';
        this.rate = '';
        this.symbol = '';
        this.template.querySelector('form').reset();
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}