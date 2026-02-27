import { LightningElement, track } from 'lwc';
import OmniscriptActionUtilsForCore from 'c/omniscriptActionUtilsForCore';

export default class MyCustomLWC extends LightningElement {
    @track inputData = {}; // Input data for the Integration Procedure
    @track responseData = null; // Stores the IP response
    @track error = null; // Stores any error
    @track isLoading = false; // Spinner visibility control

    // Handle input changes for dynamic input
    handleInputChange(event) {
        const { name, value } = event.target;
        this.inputData[name] = value; // Dynamically populate input data
    }

    // Call the Integration Procedure
    invokeIntegrationProcedure() {
        this.isLoading = true; // Show loading spinner
        this.error = null; // Clear previous errors

        // Initialize the utility
        const omniactions = new OmniscriptActionUtilsForCore(this.omniScriptHeaderDef.uuid);

        // Call the Integration Procedure
        omniactions
            .runIntegrationProcedure({
                ipName: "TrainDetailsIP", // Replace with your IP name
                options: {}, // Optional settings
                input: this.inputData, // Pass the dynamic input
            })
            .then((result) => {
                this.isLoading = false; // Hide loading spinner
                this.responseData = result.result; // Store the result
                console.log("Integration Procedure Response:", result);
            })
            .catch((error) => {
                this.isLoading = false; // Hide loading spinner
                this.error = "Error calling Integration Procedure. Please try again.";
                console.error("Integration Procedure Error:", error);
            });
    }
}
