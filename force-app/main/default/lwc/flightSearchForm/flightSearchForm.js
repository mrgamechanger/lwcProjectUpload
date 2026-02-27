import { LightningElement, track } from 'lwc';
import searchFlights from '@salesforce/apex/FlightSearchController.searchFlights';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
const TRAVEL_CLASS_OPTIONS = [
    { label: 'Economy', value: 'ECONOMY' },
    { label: 'Premium Economy', value: 'PREMIUM_ECONOMY' },
    { label: 'Business', value: 'BUSINESS' },
    { label: 'First', value: 'FIRST' }
];

export default class FlightSearchForm extends OmniscriptBaseMixin(LightningElement) {
    @track departureId = '';
    @track arrivalId = '';
    @track outboundDate = '';
    @track returnDate = '';
    @track travelClass = 'ECONOMY';
    @track adults = 1;
    @track Flights = [];
    @track airline_logo;
    @track flighttodisplay = [];
    departureTtime;
    arrivalTime;
    duration;   

    @track isLoading = false;
    @track errorMessage = '';
    @track resultBody = '';

    get travelClassOptions() {
        return TRAVEL_CLASS_OPTIONS;
    }

    get isSubmitDisabled() {
        return !this.isValidLoc(this.departureId)
            || !this.isValidLoc(this.arrivalId)
            || !this.outboundDate
            || !this.isValidAdults(this.adults)
            || this.isReturnBeforeOutbound();
    }

    handleChange(event) {
        const { name, value } = event.target;
        switch (name) {
            case 'departureId':
                this.departureId = (value || '').toUpperCase().slice(0, 3);
                break;
            case 'arrivalId':
                this.arrivalId = (value || '').toUpperCase().slice(0, 3);
                break;
            case 'outboundDate':
                this.outboundDate = value;
                break;
            case 'returnDate':
                this.returnDate = value;
                break;
            case 'travelClass':
                this.travelClass = value;
                break;
            case 'adults':
                this.adults = value ? parseInt(value, 10) : 1;
                break;
            default:
                break;
        }
        this.errorMessage = '';
    }

    async handleSubmit() {
        this.errorMessage = '';
        this.resultBody = '';

        if (this.isSubmitDisabled) {
            this.errorMessage = 'Please correct the form before submitting.';
            return;
        }

        this.isLoading = true;
        try {
            const res = await searchFlights({
                departureId: this.departureId,
                arrivalId: this.arrivalId,
                outboundDate: this.outboundDate,
                returnDate: this.returnDate || null,
                travelClass: this.travelClass,
                adults: this.adults
            });
           // console.log('Flight search response:', JSON.stringify(JSON.parse((res))));
            if (res && res.success) {
                // Keep a pretty-printed string for display/logging
                this.resultBody = this.prettyJson(res.responseBody);
                console.log('Flight search resultBody:', this.resultBody);

                // Parse the response body into an object so we can access data
                let parsedBody = null;
                try {
                    parsedBody = typeof res.responseBody === 'string' ? JSON.parse(res.responseBody) : res.responseBody;
                } catch (e) {
                    parsedBody = res.responseBody;
                }

                // Safely extract topFlights (may be missing)
                this.Flights = (((parsedBody || {}).data || {}).itineraries || {}).topFlights || [];

                // Map flights into a clean shape for the UI (include common details)
                this.flighttodisplay = this.Flights.map((flight, index) => {
                    const firstLeg = (flight.flights && flight.flights[0]) || {};
                    const lastLeg = (flight.flights && flight.flights[flight.flights.length - 1]) || firstLeg;
                    const depAirport = (firstLeg.departure_airport) || {};
                    const arrAirport = (lastLeg.arrival_airport) || {};

                    const priceVal = (flight.price != null) ? flight.price : ((parsedBody && parsedBody.price) || '');
                    const currency = (parsedBody && parsedBody.currency) || 'INR';
                    let formattedPrice = '';
                    try {
                        if (priceVal !== '' && priceVal != null) {
                            formattedPrice = new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(priceVal);
                        }
                    } catch (e) {
                        formattedPrice = String(priceVal);
                    }

                    return {
                        id: index,
                        departureTime: flight.departure_time || depAirport.time || '',
                        arrivalTime: flight.arrival_time || arrAirport.time || '',
                        duration: (flight.duration && flight.duration.text) || '',
                        airlineLogo: flight.airline_logo || firstLeg.airline_logo || '',
                        flightNumber: flight.flight_number || firstLeg.flight_number || '',
                        departureAirportName: depAirport.airport_name || '',
                        departureAirportCode: depAirport.airport_code || '' ,
                        arrivalAirportName: arrAirport.airport_name || '',
                        arrivalAirportCode: arrAirport.airport_code || '',
                        aircraft: firstLeg.aircraft || '',
                        seat: firstLeg.seat || '',
                        legroom: firstLeg.legroom || '',
                        extensions: firstLeg.extensions || flight.extensions || [],
                        price: priceVal,
                        formattedPrice,
                        stops: (flight.stops != null) ? flight.stops : (flight.flights ? Math.max(0, flight.flights.length - 1) : 0),
                        carbonEmissions: flight.carbon_emissions || firstLeg.carbon_emissions || null,
                    };
                });

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Flight Search',
                        message: 'Search successful',
                        variant: 'success'
                    })
                );
            } else {
                const msg = (res && res.message) ? res.message : 'Callout failed.';
                this.errorMessage = msg;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Flight Search',
                        message: msg,
                        variant: 'error'
                    })
                );
            }
        } catch (e) {
            const msg = e && e.body && e.body.message ? e.body.message : (e && e.message ? e.message : 'Unexpected error');
            this.errorMessage = msg;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Flight Search',
                    message: msg,
                    variant: 'error'
                })
            );
        } finally {
            this.isLoading = false;
        }
    }

    isValidLoc(v) {
        const s = (v || '').trim().toUpperCase();
        return s.length === 3 && /^[A-Z]{3}$/.test(s);
    }

    isValidAdults(v) {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 9;
    }

    isReturnBeforeOutbound() {
        if (!this.returnDate || !this.outboundDate) return false;
        try {
            return new Date(this.returnDate) < new Date(this.outboundDate);
        } catch (e) {
            return false;
        }
    }

    prettyJson(body) {
        if (!body) return '';
        try {
            const obj = JSON.parse(body);
            return JSON.stringify(obj, null, 2);
        } catch (e) {
            // Not JSON? return raw
            return body;
        }
    }
}
