import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import uploadFile from '@salesforce/apex/FileUploadController.uploadFile';

export default class FileUploader extends LightningElement {
    @api recordId; // Automatically captures the recordId of the current record page
    @track zipFileName;
    @track imageFileName;
    zipFile;
    imageFile;

    // Handle ZIP file upload
    handleZipUpload(event) {
        const file = event.target.files[0];
        if (file && (file.type === 'application/zip' || file.type === 'application/x-zip-compressed')) {
            this.zipFile = file;
            this.zipFileName = file.name;

            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
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
        if (!this.recordId) {
            this.showToast('Error', 'Record ID is not available for upload.', 'error');
            return;
        }

        uploadFile({ base64: base64Data, filename: file.name, recordId: this.recordId, fileType: fileType })
            .then((fileId) => {
                this.showToast('Success', `${fileType} file uploaded successfully!`, 'success');
            })
            .catch((error) => {
                this.showToast('Error', `Error uploading ${fileType} file: ${error.body.message}`, 'error');
            });
    }

    // Show toast message
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant,
        });
        this.dispatchEvent(event);
    }
}