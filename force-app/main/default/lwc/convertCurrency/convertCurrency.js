import { LightningElement, track } from 'lwc';
import getExchangeRate from '@salesforce/apex/ExangeRatesConveter.getExchangeRate';

export default class ConvertCurrency extends LightningElement {
    @track showOutput = false;
    @track Rate = '';
    @track symbol = '';
    
    enteredAmount = '';
    fromCurrency = '';
    toCurrency = '';
    @track currencyOptions = [
        { label: 'USD', value: 'USD' },
        { label: 'INR', value: 'INR' },
        { label: 'EUR', value: 'EUR' },
        { label: 'GBP', value: 'GBP' },
        { label: 'AUD', value: 'AUD' },
        // Add more currency options here
    ];

    handler(event) {
        const { name, value } = event.target;
        if (name === 'amount') {
            this.enteredAmount = value;
        } else if (name === 'fromcurr') {
            this.fromCurrency = value;
        } else if (name === 'tocurr') {
            this.toCurrency = value;
        }
    }

    clickHandler() {
        getExchangeRate({
            amount: this.enteredAmount,
            fromCurrency: this.fromCurrency,
            toCurrency: this.toCurrency,
        })
        .then((result) => {
            console.log('result', JSON.stringify(result));
            this.showOutput = true;
            const response = JSON.parse(result);
            this.Rate = response.rates[this.toCurrency];
            this.symbol = this.toCurrency;
        })
        .catch((error) => {
            console.error('Error fetching exchange rate:', error);
            this.showOutput = false;
        });
    }

    clickReset() {
        this.showOutput = false;
        this.enteredAmount = '';
        this.fromCurrency = '';
        this.toCurrency = '';
        this.template.querySelector('form').reset();
    }
}