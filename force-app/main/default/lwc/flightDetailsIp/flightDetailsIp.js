import { LightningElement, track } from 'lwc';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';

export default class FlightDetailsIp extends OmniscriptBaseMixin(LightningElement) {
    to = '';
    from = '';
    Adult = '';
    Amt = 'INR';
    date = '';
    flightDetails = '';
    itinerariesArray = [];
    @track showSpinner = false;
    @track ItinerariesDisplay = [];
    @track display = false;
    @track showModal = false;
    @track editData = {};
    @track isEdit = false; // Track if the modal is for editing or adding

    connectedCallback() {
        this.actionUtilClass = new OmniscriptActionCommonUtil();
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this[name] = value;
    }

    get isSearchButtonDisabled() {
        return !this.to || !this.from || !this.date || !this.Adult;
    }

    handleflightInfo() {
        if (!this.to || !this.from || !this.date || !this.Adult) {
            console.error('All fields are required!');
            return;
        }

        if (this.isSearchButtonDisabled) {
            console.error('All fields are required!');
            return;
        }
        
        this.showSpinner = true;        
        const params = {
            input: JSON.stringify({
                to: this.to,
                from: this.from,
                person: this.Adult,
                date: this.date,
            }),
            sClassName: 'omnistudio.IntegrationProcedureService',
            sMethodName: 'test_filght',
            options: '{}',
        };

        this.actionUtilClass.executeAction(params, null, this, null, null)
            .then((response) => {
                this.showSpinner = false;
                this.ItinerariesDisplay = [];
                this.display = true;

                const res = response.result.IPResult;
                if (res && res.data && Array.isArray(res.data.itineraries)) {
                    this.itinerariesArray = res.data.itineraries.map(itinerary => ({
                        id: itinerary.id,
                        duration: itinerary.legs[0].durationInMinutes,
                        carrier: itinerary.legs[0].segments[0].marketingCarrier.name,
                        origin: itinerary.legs[0].origin.city,
                        destination: itinerary.legs[0].destination.city,
                        price: itinerary.price.formatted,
                        url: itinerary.legs[0].carriers.marketing[0].logoUrl,
                        departureTime: this.extractTime(itinerary.legs[0].departure),
                        arrivalTime: this.extractTime(itinerary.legs[0].arrival),
                    }));
                    this.ItinerariesDisplay = [...this.itinerariesArray];
                } else {
                    console.error('Invalid response from Integration Procedure:', res);
                }
            })
            .catch((error) => {
                this.showSpinner = false;
                console.error('Error fetching flight details:', error);
            });
    }

    handleEdit(event) {
        const id = event.target.dataset.id; // Get the id of the clicked itinerary
        this.editData = { ...this.ItinerariesDisplay.find(item => item.id === id) }; // Find the itinerary and set it for editing
        this.isEdit = true; // Mark this as an edit operation
        this.showModal = true; // Open the modal
    }

    handleAddNew() {
        this.editData = {
            id: Date.now().toString(), // Generate a temporary unique ID
            duration: '',
            carrier: '',
            origin: '',
            destination: '',
            price: '',
        };
        this.isEdit = false; // Mark this as an add operation
        this.showModal = true; // Open the modal
    }

    handleModalInputChange(event) {
        const { name, value } = event.target;
        this.editData = { ...this.editData, [name]: value };
    }

    saveChanges() {
        if (this.isEdit) {
            // Update the existing itinerary
            this.ItinerariesDisplay = this.ItinerariesDisplay.map(item =>
                item.id === this.editData.id ? { ...this.editData } : item
            );
        } else {
            // Add a new itinerary
            this.ItinerariesDisplay = [...this.ItinerariesDisplay, { ...this.editData }];
        }
        this.showModal = false;
    }

    deleteItinerary() {
        this.ItinerariesDisplay = this.ItinerariesDisplay.filter(item => item.id !== this.editData.id);
        this.showModal = false;
    }

    closeModal() {
        this.showModal = false;
    }
    get modalHeader() {
        return this.isEdit ? 'Edit Itinerary' : 'Add New Itinerary';
    }
    Reset() {
        this.to = '';
        this.from = '';
        this.Adult = '';
        this.date = '';
        this.display = false;
        this.ItinerariesDisplay = [];
        const form = this.template.querySelector('form');
        if (form) {
            form.reset();
        }
    }

    extractTime(dateTimeString) {
        return dateTimeString.split('T')[1].substr(0, 5); // Get HH:mm
    }
}