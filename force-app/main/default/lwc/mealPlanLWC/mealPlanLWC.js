import { LightningElement, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';

export default class MealPlanLWC extends OmniscriptBaseMixin(LightningElement) {
    @track userInput = 'High-Protein Vegetarian Meal Plan (Monday to Saturday) | 1800 kcal';
    @track mealPlanResponse;
    @track showSpinner = false;

    connectedCallback() {
        this.actionUtilClass = new OmniscriptActionCommonUtil();
    }

    handleInputChange(event) {
        this.userInput = event.target.value;
    }

    fetchMealPlan() {
        this.showSpinner = true;

        // Dynamically build the payload using the userInput from the input box.
        const payload = {
            messages: [
                {
                    role: 'user',
                    content: this.userInput  // This value comes from the input box.
                }
            ],
            model: 'gpt-4o',
            max_tokens: 100,
            temperature: 0.9
        };

        const params = {
            input: JSON.stringify(payload),
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'api_gpt', // Your IP name
            options: '{}'
        };

        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then((response) => {
                console.log('Response:', JSON.stringify(response));
                const res = response.result.IPResult;
                this.showSpinner = false;
                if (res && res.choices && res.choices[0] && res.choices[0].message) {
                    // Extract the content from choices[0].message.content
                    this.mealPlanResponse = res.choices[0].message.content;
                } else {
                    this.mealPlanResponse = 'No response from the server';
                }
            })
            .catch((error) => {
                this.showSpinner = false;
                console.error('Error fetching meal plan:', error);
                this.mealPlanResponse = 'Error retrieving meal plan';
            });
    }
}