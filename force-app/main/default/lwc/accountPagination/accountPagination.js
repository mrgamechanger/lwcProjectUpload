import { LightningElement, track } from "lwc";
import getAccounts from "@salesforce/apex/AccountContoller.getAccounts";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

export default class AccountPagination extends LightningElement {
    @track records = [];
    @track filteredRecords = [];
    @track recordsToDisplay = [];
    @track columns = [
        { label: "Name", fieldName: "Name", type: "text" },
        { label: "Phone", fieldName: "Phone", type: "phone" },
        { label: "Industry", fieldName: "Industry", type: "text" },
        { label: "Rating", fieldName: "Rating", type: "text" }
    ];

    totalRecords = 0;
    pageNo = 1;
    recordsPerPage = 10; // Default number of records per page
    isLoading = false;
    searchKey = ""; // To store the search input

    // Computed properties for record range
    get startRecord() {
        return (this.pageNo - 1) * this.recordsPerPage + 1;
    }

    get endRecord() {
        return Math.min(this.pageNo * this.recordsPerPage, this.totalRecords);
    }

    get isPreviousDisabled() {
        return this.pageNo === 1;
    }

    get isNextDisabled() {
        return this.pageNo * this.recordsPerPage >= this.totalRecords;
    }

    connectedCallback() {
        this.fetchAccounts();
    }

    fetchAccounts() {
        this.isLoading = true;
        getAccounts()
            .then((data) => {
                this.records = data;
                this.filteredRecords = data; // Initialize filtered records
                this.totalRecords = this.filteredRecords.length;
                this.updateDisplayedRecords();
            })
            .catch((error) => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: "Error",
                        message: "Failed to fetch Accounts: " + error.body.message,
                        variant: "error"
                    })
                );
            })
            .finally(() => {
                this.isLoading = false;
            });
    }

    updateDisplayedRecords() {
        const startIndex = (this.pageNo - 1) * this.recordsPerPage;
        const endIndex = startIndex + this.recordsPerPage;
        this.recordsToDisplay = this.filteredRecords.slice(startIndex, endIndex);
    }

    handleNext() {
        if (!this.isNextDisabled) {
            this.pageNo += 1;
            this.updateDisplayedRecords();
        }
    }

    handlePrevious() {
        if (!this.isPreviousDisabled) {
            this.pageNo -= 1;
            this.updateDisplayedRecords();
        }
    }

    handleSearch(event) {
        this.searchKey = event.target.value.toLowerCase(); // Get the search key
        if (this.searchKey) {
            this.filteredRecords = this.records.filter((record) =>
                record.Name.toLowerCase().includes(this.searchKey)
            );
        } else {
            this.filteredRecords = this.records; // Reset to all records if no search input
        }
        this.pageNo = 1; // Reset to the first page
        this.totalRecords = this.filteredRecords.length;
        this.updateDisplayedRecords();
    }
}