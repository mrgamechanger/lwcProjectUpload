import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'; 
import { loadStyle } from 'lightning/platformResourceLoader';
import fontawesome from '@salesforce/resourceUrl/fontawesome';
import saveListing from '@salesforce/apex/ComponentListingController.saveListing'; 
import uploadFile from '@salesforce/apex/ComponentListingController.uploadFile'; 

export default class CreateEditListing extends LightningElement {
    @api recordId;
    stylesLoaded = false;

    formData = {
        title: '',
        tagline: '',
        description: '',
        category: '',
        tags: [],
    };

    zipFile = null;
    imageFile = null;
    zipFileName = '';  
    imageFileName = ''; 

    categoryOptions = [
        { label: 'Select...', value: '' },
        { label: 'Apex', value: 'Apex' },
        { label: 'Lwc', value: 'Lwc' },
        { label: 'JavaScript', value: 'JS' },
        { label: 'Integration', value: 'Integration' },
        { label: 'admin', value: 'admin' },
        { label: 'cpq', value: 'cpq' },
        { label: 'others', value: 'others' }
    ];

    tagOptions = [
        { label: 'Apex', value: 'Apex' },
        { label: 'Lwc', value: 'Lwc' },
    ];

    connectedCallback() {
        console.log('Record ID:', this.recordId); // Check recordId
    }


    renderedCallback() {
        if (!this.stylesLoaded) {
            loadStyle(this, fontawesome + '/all.min.css')  // Adjust the path as needed
                .then(() => {
                    console.log('FontAwesome loaded successfully');
                    this.stylesLoaded = true;
                })
                .catch(error => {
                    console.error('Error loading FontAwesome:', error);
                });
        }
    }

    // Handle input changes for form fields
    handleInputChange(event) {
        const field = event.target.name;
        this.formData = { ...this.formData, [field]: event.target.value };
    }
     // Load external CSS styles in renderedCallback
    

    // Handle ZIP file upload
    handleZipUpload(event) {
        const file = event.target.files[0];
        console.log('Selected ZIP file:', file); // Log the selected file
    
        if (file && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {  
            this.zipFile = file;
            this.zipFileName = file.name;
    
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                console.log('Base64 ZIP file data:', base64); // Log the base64 data
                this.uploadToSalesforce(file, base64, 'ZIP');
            };
            reader.readAsDataURL(file);
        } else {
            this.showToast('Error', 'Only ZIP files are allowed.', 'error');
        }
    }

    // Handle Image file upload (JPEG/PNG)
    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file && (file.type === 'image/jpeg' || file.type === 'image/png')) {  
            this.imageFile = file;
            this.imageFileName = file.name;

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                this.uploadToSalesforce(file, base64, 'IMAGE');
            };
            reader.readAsDataURL(file);
        } else {
            this.showToast('Error', 'Only JPEG/PNG files are allowed.', 'error');
        }
    }

    // Upload file to Salesforce (ZIP or Image)
    uploadToSalesforce(file, base64Data, fileType) {
        console.log('Uploading file to Salesforce:', fileType, file.name); // Log upload start
        console.log('Record ID for upload:', this.recordId); // Log the record ID being used
        uploadFile({ base64: base64Data, filename: file.name, recordId: this.recordId, fileType: fileType })
            .then(fileId => {
                this.showToast('Success', fileType + ' file uploaded successfully! ID: ' + fileId, 'success');
                console.log(fileType + ' file uploaded to Salesforce with ID:', fileId);
            })
            .catch(error => {
                this.showToast('Error', 'Error uploading ' + fileType + ' file: ' + error.body.message, 'error');
                console.error('Error uploading ' + fileType + ' file:', error);
            });
    }

    // Save the listing data
    handleSave() {
        const listingData = {
            Title__c: this.formData.title,
            TagLine__c: this.formData.tagline,
            Description__c: this.formData.description,
            Category__c: this.formData.category,
            Tags__c: this.formData.tags.join(';'),  
            Id: this.recordId
        };

        saveListing({ listingData })
            .then(result => {
                this.showToast('Success', 'Listing saved successfully!', 'success');
            })
            .catch(error => {
                this.showToast('Error', 'Error saving listing: ' + error.body.message, 'error');
            });
    }

    handleCancel() {
        this.formData = {
            title: '',
            tagline: '',
            description: '',
            category: '',
            tags: []
        };
        this.zipFile = null;
        this.zipFileName = '';
        this.imageFile = null;
        this.imageFileName = '';
    }

    // Utility method to show toast notifications
    showToast(title, message, variant) {
        const toastEvent = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(toastEvent);
    }
}