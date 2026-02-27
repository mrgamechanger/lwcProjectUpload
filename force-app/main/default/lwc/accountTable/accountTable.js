import { LightningElement, track } from 'lwc';
import getAccounts from '@salesforce/apex/AccountController.getAccounts';

export default class AccountTable extends LightningElement {
    @track data = [];
    @track filteredData = [];
    @track displayData = [];
    @track filterName = '';
    @track isLoading = false;

    debounceTimer;

    accountColumns = [
        { label: 'Name', fieldName: 'Name', hideDefaultActions: true },
        { label: 'Rating', fieldName: 'Rating', hideDefaultActions: true },
        { label: 'Annual Revenue', fieldName: 'AnnualRevenue', type: 'currency', hideDefaultActions: true },
        { label: 'Phone', fieldName: 'Phone', type: 'phone', hideDefaultActions: true },
        { label: 'Industry', fieldName: 'Industry', hideDefaultActions: true }
    ];

    // Fetch Account data using Apex when component is initialized
    connectedCallback() {
        this.loadAccounts();
    }

    // Load accounts from Apex and apply initial filters
    async loadAccounts() {
        this.isLoading = true;
        try {
            const result = await getAccounts();
            this.data = result.map(account => ({
                Id: account.Id,
                Name: account.Name,
                Rating: account.Rating,
                AnnualRevenue: account.AnnualRevenue,
                Phone: account.Phone,
                Industry: account.Industry
            }));
            this.applyFilters();
        } catch (error) {
            console.error('Error fetching Account data:', error);
        } finally {
            this.isLoading = false;
        }
    }

    // Handle changes in the filter input field
    handleFilterChange(event) {
        this.filterName = event.target.value;
        this.debounceFilter();
    }

    // Implement debouncing to reduce the frequency of filtering
    debounceFilter() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.applyFilters();
        }, 3000);  // Adjust debounce delay as necessary
    }

    // Apply filters based on the entered filter name
    applyFilters() {
        if (this.filterName) {
            this.filteredData = this.data.filter(item =>
                item.Name.toLowerCase().includes(this.filterName.toLowerCase())
            );
        } else {
            this.filteredData = [...this.data];
        }
        this.displayData = this.filteredData.slice(0, 20);
    }

    // Reset the filter and reload the data
    handleReset() {
        this.filterName = '';
        this.applyFilters();
    }

    // Show more results by loading the next set of filtered data
    handleShowMore() {
        const currentLength = this.displayData.length;
        const nextSet = this.filteredData.slice(currentLength, currentLength + 20);
        this.displayData = [...this.displayData, ...nextSet];
    }
}