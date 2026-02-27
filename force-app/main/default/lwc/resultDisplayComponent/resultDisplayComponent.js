import { LightningElement } from 'lwc';
import pubsub from 'c/pubsub/pubsub';  // Importing the custom pubsub module

export default class ResultDisplayComponent extends LightningElement {
    result = '';

    connectedCallback() {
        // Registering to listen to the calculation result
        pubsub.subscribe('calculationResult', this.handleCalculationResult.bind(this));
    }

    handleCalculationResult(payload) {
        // Update the result with the payload from the publisher
        this.result = payload.result;
    }

    disconnectedCallback() {
        // Unsubscribe when the component is removed
        pubsub.unsubscribe('calculationResult', this.handleCalculationResult.bind(this));
    }
}
