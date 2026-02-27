import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getRecords from '@salesforce/apex/PdfEmailController.getRecords';
import sendPdfEmail from '@salesforce/apex/PdfEmailController.sendPdfEmail';

export default class PdfEmailTable extends NavigationMixin(LightningElement) {
    @track tableData = [];
    @track columns = [
        {
            label: 'Name',
            fieldName: 'name',
            type: 'text',
            sortable: true
        },
        {
            label: 'Description',
            fieldName: 'description',
            type: 'text',
            sortable: true
        },
        {
            label: 'Created Date',
            fieldName: 'createdDate',
            type: 'date',
            typeAttributes: {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
            },
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    {
                        label: 'Send PDF',
                        name: 'send_pdf',
                        iconName: 'utility:email',
                        title: 'Send PDF via Email'
                    }
                ]
            }
        }
    ];
    
    @track sortBy = 'name';
    @track sortDirection = 'asc';
    @track isLoading = true;
    @track error;
    @track showEmailModal = false;
    @track showSuccessToast = false;
    @track isSending = false;
    
    @track emailTo = '';
    @track emailSubject = '';
    @track emailBody = '';
    @track selectedRecord = {};
    
    // Wire the Apex method to get records
    wiredRecordsResult;
    
    @wire(getRecords)
    wiredRecords(result) {
        this.wiredRecordsResult = result;
        if (result.data) {
            this.tableData = result.data;
            this.isLoading = false;
        } else if (result.error) {
            this.error = result.error.body.message;
            this.isLoading = false;
        }
    }
    
    // Handle sorting
    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortBy = fieldName;
        this.sortDirection = sortDirection;
        
        // Sort the data
        this.tableData = [...this.tableData].sort((a, b) => {
            let aValue = a[fieldName];
            let bValue = b[fieldName];
            
            // Handle date sorting
            if (fieldName === 'createdDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            
            // Compare values
            if (aValue < bValue) {
                return sortDirection === 'asc' ? -1 : 1;
            } else if (aValue > bValue) {
                return sortDirection === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }
    
    // Handle row actions
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        if (action.name === 'send_pdf') {
            this.selectedRecord = row;
            this.emailSubject = `PDF for ${row.name}`;
            this.emailBody = `Please find the PDF for ${row.name} attached.`;
            this.showEmailModal = true;
        }
    }
    
    // Handle email form changes
    handleEmailToChange(event) {
        this.emailTo = event.target.value;
    }
    
    handleEmailSubjectChange(event) {
        this.emailSubject = event.target.value;
    }
    
    handleEmailBodyChange(event) {
        this.emailBody = event.target.value;
    }
    
    // Close the email modal
    handleCloseModal() {
        this.showEmailModal = false;
        this.emailTo = '';
        this.emailSubject = '';
        this.emailBody = '';
    }
    
    // Send the email with PDF
    async handleSendEmail() {
        // Validate email
        if (!this.emailTo || !this.emailSubject || !this.emailBody) {
            this.showToast('Error', 'Please fill in all required fields', 'error');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(this.emailTo)) {
            this.showToast('Error', 'Please enter a valid email address', 'error');
            return;
        }
        
        this.isSending = true;
        
        try {
            await sendPdfEmail({
                recordId: this.selectedRecord.id,
                emailTo: this.emailTo,
                emailSubject: this.emailSubject,
                emailBody: this.emailBody
            });
            
            this.showEmailModal = false;
            this.showSuccessToast = true;
            
            // Auto-hide toast after 5 seconds
            setTimeout(() => {
                this.showSuccessToast = false;
            }, 5000);
            
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        } finally {
            this.isSending = false;
        }
    }
    
    // Close the success toast
    handleCloseToast() {
        this.showSuccessToast = false;
    }
    
    // Show toast message
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant
            })
        );
    }
    
    // Refresh the data
    async refreshData() {
        this.isLoading = true;
        await refreshApex(this.wiredRecordsResult);
    }
} 