import { LightningElement, track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import TAILWIND from '@salesforce/resourceUrl/TailwindCSS';

export default class ItineraryPlanner extends LightningElement {
    @track newItem = '';
    @track items = [
        { id: 1, name: 'Flight', completed: false },
        { id: 2, name: 'Currency Exchange', completed: false },
        { id: 3, name: 'Trains', completed: false },
        { id: 4, name: 'Metro', completed: false },
        { id: 5, name: 'Bus', completed: false },
        { id: 6, name: 'Expedition', completed: false },
        { id: 7, name: 'Food', completed: false }
    ];

    connectedCallback() {
        loadStyle(this, TAILWIND);
    }

    handleInput(event) {
        this.newItem = event.target.value;
    }

    addItem() {
        if (this.newItem.trim()) {
            this.items = [
                ...this.items,
                { id: Date.now(), name: this.newItem, completed: false }
            ];
            this.newItem = '';
        }
    }

    toggleItem(event) {
        const id = parseInt(event.target.dataset.id, 10);
        this.items = this.items.map(item =>
            item.id === id ? { ...item, completed: !item.completed } : item
        );
    }

    deleteItem(event) {
        const id = parseInt(event.target.dataset.id, 10);
        this.items = this.items.filter(item => item.id !== id);
    }


    getItemClass(item) {
        return item.completed ? 'line-through text-gray-400' : '';
    }
}