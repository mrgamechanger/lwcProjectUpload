import { LightningElement } from 'lwc';
import pubsub from 'c/pubsub';

export default class CalculatorSubscriber extends LightningElement {
    operation = 'None';
    result = 'N/A';

    connectedCallback() {
        // Register a listener for the 'calculationEvent'
        pubsub.register('calculationEvent', this.handleCalculationEvent.bind(this));
    }

    handleCalculationEvent(payload) {
        this.operation = payload.operation;
        this.result = payload.result;
    }

    disconnectedCallback() {
        // Unregister the listener when the component is removed
        pubsub.unregister('calculationEvent', this.handleCalculationEvent.bind(this));
    }
}