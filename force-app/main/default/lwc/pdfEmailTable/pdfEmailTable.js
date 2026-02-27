import { LightningElement, track, wire, api } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getPdfRecords from '@salesforce/apex/PdfEmailController.getPdfRecords';
import sendPdfEmail from '@salesforce/apex/PdfEmailController.sendPdfEmail';

export default class PdfEmailTable extends NavigationMixin(LightningElement) {
    @track tableData = [];
    @track error;
    @track isLoading = true;
    @track showEmailModal = false;
    @track showSuccessToast = false;
    @track isSending = false;
    
    // Email form fields
    @track emailTo = '';
    @track emailSubject = '';
    @track emailBody = '';
    @track selectedRecord = {};
    
    // Sorting
    @track sortBy = 'createdDate';
    @track sortDirection = 'desc';
    
    // Data table columns
    columns = [
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
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            },
            sortable: true
        },
        {
            label: 'Last Modified',
            fieldName: 'lastModifiedDate',
            type: 'date',
            typeAttributes: {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            },
            sortable: true
        },
        {
            label: 'Owner',
            fieldName: 'ownerName',
            type: 'text',
            sortable: true
        },
        {
            type: 'action',
            typeAttributes: {
                rowActions: [
                    {
                        label: 'Send PDF',
                        name: 'send_pdf',
                        iconName: 'utility:email'
                    }
                ]
            }
        }
    ];
    
    // Wire the getPdfRecords method
    wiredPdfRecords;
    @wire(getPdfRecords)
    wiredRecords(result) {
        this.wiredPdfRecords = result;
        if (result.data) {
            this.tableData = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error.body.message;
            this.tableData = [];
        }
        this.isLoading = false;
    }
    
    // Handle sorting
    handleSort(event) {
        const { fieldName, sortDirection } = event.detail;
        this.sortBy = fieldName;
        this.sortDirection = sortDirection;
        
        // Sort the data
        const sortedData = [...this.tableData].sort((a, b) => {
            let aValue = a[fieldName];
            let bValue = b[fieldName];
            
            // Handle date fields
            if (fieldName === 'createdDate' || fieldName === 'lastModifiedDate') {
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
        
        this.tableData = sortedData;
    }
    
    // Handle row actions
    handleRowAction(event) {
        const action = event.detail.action;
        const row = event.detail.row;
        
        if (action.name === 'send_pdf') {
            this.selectedRecord = row;
            this.showEmailModal = true;
            
            // Pre-fill email subject
            this.emailSubject = `PDF: ${row.name}`;
            
            // Pre-fill email body
            this.emailBody = `Please find attached the PDF document "${row.name}".\n\n`;
            if (row.description) {
                this.emailBody += `Description: ${row.description}\n\n`;
            }
            this.emailBody += 'Best regards,\nYour Salesforce System';
        }
    }
    
    // Handle email form field changes
    handleEmailToChange(event) {
        this.emailTo = event.target.value;
    }
    
    handleEmailSubjectChange(event) {
        this.emailSubject = event.target.value;
    }
    
    handleEmailBodyChange(event) {
        this.emailBody = event.target.value;
    }
    
    // Handle modal actions
    handleCloseModal() {
        this.showEmailModal = false;
        this.resetEmailForm();
    }
    
    resetEmailForm() {
        this.emailTo = '';
        this.emailSubject = '';
        this.emailBody = '';
        this.selectedRecord = {};
    }
    
    // Handle sending email
    async handleSendEmail() {
        if (!this.emailTo || !this.emailSubject || !this.emailBody) {
            this.showToast('Error', 'Please fill in all email fields', 'error');
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
            this.resetEmailForm();
            
            // Auto-hide success toast after 5 seconds
            setTimeout(() => {
                this.showSuccessToast = false;
            }, 5000);
            
        } catch (error) {
            this.showToast('Error', error.body.message, 'error');
        } finally {
            this.isSending = false;
        }
    }
    
    // Handle closing toast
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
} 