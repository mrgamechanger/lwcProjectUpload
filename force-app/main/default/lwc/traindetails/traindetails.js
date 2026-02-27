import { LightningElement, track } from 'lwc';
import getTrainDetails from '@salesforce/apex/trainDetailsFetch.getTrainDetails';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
export default class TrainDetails extends LightningElement {
    @track display = false;
    @track showSpinner = false;
    @track trainDetails = {};
    @track trainData = [];
    inputTrainNo = '';
    currentLocation=''
    @track totalDistance = 0;
    @track trainName =' ';
    @track currentlocation = ' ';
                        

    handleInputChange(event) {
        this.inputTrainNo = event.target.value;
    }

    handleTrainInfo() {
        this.showSpinner = true;
        this.display = false;

        getTrainDetails({ trainNo: this.inputTrainNo })
            .then((result) => {
                this.showSpinner = false;
                if (result) {
                        console.log("train",result);
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

    reset() {
        this.display = false;
        this.inputTrainNo = '';
        this.trainDetails = {};
        this.trainData = [];
        this.template.querySelector('form').reset();
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(event);
    }

    formatTiming(timing) {
        // Format the timing string to ensure it only contains "HH:mm"
        return timing.slice(0, 5);
    }
    
}