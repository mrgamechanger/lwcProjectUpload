import { LightningElement, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getTrainDetails from '@salesforce/apex/trainDetailsFetch.getTrainDetails';
import ID from '@salesforce/user/Id';

export default class TraindetailsIP extends OmniscriptBaseMixin(LightningElement) {
    datashow = false;
    @track trainNo = ''; // Train number input
    @track trainName = ''; // Train name
    @track updatedTime = ''; // Last updated time
    @track data = []; // Full train data
    @track isLoading = false; // Loading state
    @track error = ''; // Error message
    @track JsonData = {};
    // Initialize the action utility
    connectedCallback() {
        this.actionUtilClass = new OmniscriptActionCommonUtil();
        this.JsonData =JSON.stringify(JSON.parse(JSON.stringify(this.omniJsonData)));
        console.log("actionUtilClass", this.JsonData);
        console.log("ID", ID);
    }
    
    // Handle input change for train number
    handleTrainNoChange(event) {
        this.trainNo = event.target.value; // Capture train number input
    }

    // Fetch train details
    fetchTrainDetailsHandler(event) {
        event.preventDefault(); // Prevent default form submission
        if (!this.trainNo) {
            this.error = 'Please enter a train number.'; // Validate input
            this.showToast('Error', 'Please enter a train number.', 'error');
            return;
        }

        this.error = ''; // Clear previous error
        this.datashow = false; // Hide data initially
        this.fetchTrainData(this.trainNo);
    }

    // Fetch train data from the Integration Procedure
    fetchTrainData(trainNo) {
        this.isLoading = true; // Show spinner

        // Prepare parameters for Integration Procedure
        const params = {
            input: JSON.stringify({ trainvalue: trainNo }),
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'test_lwc', // Replace with your type and subtype with underscore
            options: "{}"
        };

        // Execute the Integration Procedure
        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then((response) => {
                console.log('Integration Procedure Response:', JSON.stringify(response));
                this.isLoading = false; // Hide spinner
                this.datashow = true; // Show data

                const res = response.result.IPResult;

                if (res && res.success && Array.isArray(res.data)) {
                    this.trainName = res.train_name || 'N/A';
                    this.updatedTime = res.updated_time || 'N/A';
                    this.data = res.data.map((item) => ({
                        stationName: item.station_name || 'N/A',
                        platform: item.platform || 'N/A',
                        halt: item.halt || 'N/A',
                        delay: item.delay || 'N/A',
                        timing: item.timing ? this.formatTiming(item.timing) : 'N/A',
                        distance: item.distance || 'N/A'
                    }));
                    this.showToast('Success', 'Train details fetched successfully.', 'success');
                    this.omniApplyCallResp({'trainData': this.data});
                    this.omniApplyCallResp({'trainName': this.trainName});
                    this.omniApplyCallResp({'updatedTime': this.updatedTime});
                } else {
                    this.error = 'Invalid response from server.';
                    this.showToast('Error', 'Invalid response from server.', 'error');
                    console.error('Invalid Response:', res);
                }
            })
            .catch((error) => {
                this.isLoading = false; // Hide spinner
                this.error = 'Error fetching train data. Please try again.';
                this.showToast('Error', 'Error fetching train data. Please try again.', 'error');
                console.error('Integration Procedure Error:', error);
            });
    }

    formatTiming(timing) {
        // Safely handle unexpected or malformed timing strings
        if (!timing || typeof timing !== 'string') {
            return 'N/A';
        }
        return timing.slice(0, 5); // Return "HH:mm" from "HH:mmHH:mm" format
    }

    handleReset() {
        this.trainNo = ''; // Clear train number input
        this.trainName = ''; // Clear train name
        this.updatedTime = ''; // Clear updated time
        this.data = []; // Clear train data
        this.datashow = false; // Hide data
        this.error = ''; // Clear error message
        this.showToast('Info', 'Form has been reset.', 'info');
    }

    // Utility function to show toast messages
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }


    handleTrainInfo() {
        this.showSpinner = true;
        this.display = false;

        getTrainDetails({ trainNo: this.trainNo })
            .then((result) => {
                this.showSpinner = false;
                if (result) {
                        console.log("train from apex",JSON.parse(JSON.stringify(result)));
                    this.trainDetails = JSON.parse(result);
                    if (this.trainDetails.data && this.trainDetails.data.length > 0) {
                        this.trainName = this.trainDetails.train_name;
                        this.currentlocation = this.trainDetails.message;
                        if (this.trainDetails.message !== "") {
                                this.currentlocation = this.trainDetails.message;
                            } else {
                                this.currentlocation = 'Train not started';
                            }
                        
                        this.trainData = this.trainDetails.data.map((station, index) => ({
                            id: index,
                            station_name: station.station_name,
                            distance: station.distance,
                            halt: station.halt,
                            delay: station.delay,
                            platform: station.platform,
                            timing: this.formatTiming(station.timing)
                        }));

                       
                        if (this.trainDetails.data.length > 0) {
                           this.totalDistance = parseFloat(this.trainDetails.data[this.trainDetails.data.length - 1].distance) || 0;
                        }
                        this.display = true;
                    } else {
                        this.showToast('Invalid Train Number', 'No trains exist with train number ' + this.inputTrainNo, 'error');
                    }
                } else {
                    this.showToast('Invalid Train Number', 'No trains exist with train number ' + this.inputTrainNo, 'error');
                }
            })
            .catch((error) => {
                this.showSpinner = false;
                console.error('Some error occurred while fetching train details', error);
                this.showToast('Error', 'Some error occurred while fetching train details', 'error');
            });
    }
    formatTiming(timing) {
        // Format the timing string to ensure it only contains "HH:mm"
        return timing.slice(0, 5);
    }
}