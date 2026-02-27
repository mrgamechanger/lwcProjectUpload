import { LightningElement, track } from 'lwc';

export default class MmtSearchHub extends LightningElement {
    @track activeTab = 'Flights';

    // Simple state for Hotels placeholder
    @track hotel = {
        city: '',
        checkin: '',
        checkout: '',
        guests: 1
    };
    hotelSearchInfo = '';

    get isFlights() {
        return this.activeTab === 'Flights';
    }
    get isHotels() {
        return this.activeTab === 'Hotels';
    }
    get isTrains() {
        return this.activeTab === 'Trains';
    }
    get isCricket() {
        return this.activeTab === 'Cricket';
    }

    get flightTabClass() {
        return `tab ${this.isFlights ? 'active' : ''}`;
    }
    get hotelTabClass() {
        return `tab ${this.isHotels ? 'active' : ''}`;
    }
    get trainTabClass() {
        return `tab ${this.isTrains ? 'active' : ''}`;
    }
    get cricketTabClass() {
        return `tab ${this.isCricket ? 'active' : ''}`;
    }

    handleTabClick(event) {
        const tab = event.currentTarget?.dataset?.tab;
        if (tab) {
            this.activeTab = tab;
        }
    }

    handleHotelChange(event) {
        const field = event.target?.dataset?.field;
        if (!field) return;
        let value = event.detail?.value;
        if (field === 'guests') {
            const parsed = parseInt(value, 10);
            value = isNaN(parsed) || parsed < 1 ? 1 : parsed;
        }
        this.hotel = { ...this.hotel, [field]: value };
    }

    searchHotels() {
        const { city, checkin, checkout, guests } = this.hotel;
        if (!city || !checkin || !checkout) {
            this.hotelSearchInfo = 'Please fill City, Check-in and Check-out dates.';
            return;
        }
        this.hotelSearchInfo = `Searching hotels in ${city} from ${checkin} to ${checkout} for ${guests} guest(s).`;
        // Placeholder: integrate with Apex/external API later
    }
}
