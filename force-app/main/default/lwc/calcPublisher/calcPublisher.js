import { LightningElement, wire } from 'lwc';
import { publish, MessageContext } from 'lightning/messageService';
import CALC_MC from '@salesforce/messageChannel/CalculationMessageChannel__c';

export default class CalcPublisher extends LightningElement {
    total = 0;
    percentage = 0;
    discount = 0;
    markup = 0;

    // new temperature fields
    temperature = 0;
    conversion = 'toCelsius';

    // options for radio group
    get conversionOptions() {
        return [
            { label: 'Celsius to Fahrenheit', value: 'toFahrenheit' },
            { label: 'Fahrenheit to Celsius', value: 'toCelsius' }
        ];
    }

    // Obtain a message context for publishing messages
    @wire(MessageContext)
    messageContext;

    handleTotalChange(event) {
        this.total = Number(event.target.value);
    }

    handlePercentageChange(event) {
        this.percentage = Number(event.target.value);
    }

    handleDiscountChange(event) {
        this.discount = Number(event.target.value);
    }

    handleMarkupChange(event) {
        this.markup = Number(event.target.value);
    }

    handleTemperatureChange(event) {
        this.temperature = Number(event.target.value);
    }

    handleConversionChange(event) {
        this.conversion = event.detail.value;
    }

    handleCalculatePercentage() {
        const message = {
            calculationType: 'percentage',
            total: this.total,
            percentage: this.percentage
        };
        publish(this.messageContext, CALC_MC, message);
    }

    handleCalculateDiscount() {
        const message = {
            calculationType: 'discount',
            total: this.total,
            discount: this.discount
        };
        publish(this.messageContext, CALC_MC, message);
    }

    handleCalculateMarkup() {
        const message = {
            calculationType: 'markup',
            total: this.total,
            markup: this.markup
        };
        publish(this.messageContext, CALC_MC, message);
    }

    handleCalculateTemperature() {
        const message = {
            calculationType: 'temperature',
            temperature: this.temperature,
            conversion: this.conversion
        };
        publish(this.messageContext, CALC_MC, message);
    }
}