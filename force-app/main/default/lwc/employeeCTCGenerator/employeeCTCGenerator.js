import { LightningElement, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript } from 'lightning/platformResourceLoader';
import jsPDF from '@salesforce/resourceUrl/JSPDFsample';

export default class EmployeeCTCGenerator extends LightningElement {
    @track employeeDetails = {
        name: '',
        id: '',
        basicSalary: ''
    };
    jsPdfInitialized = false;

    connectedCallback() {
        loadScript(this, jsPDF)
            .then(() => {
                this.jsPdfInitialized = true;
            })
            .catch(error => {
                this.showToast('Error', 'Error loading jsPDF library.', 'error');
                console.error('Error loading jsPDF', error);
            });
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.employeeDetails = { ...this.employeeDetails, [name]: value };
    }

    generatePDF() {
        if (!this.jsPdfInitialized) {
            this.showToast('Error', 'PDF generation library is not initialized.', 'error');
            return;
        }

        const { name, id, basicSalary } = this.employeeDetails;
        if (!name || !id || isNaN(basicSalary) || basicSalary <= 0) {
            this.showToast('Error', 'Please provide valid input for all fields.', 'error');
            return;
        }

        const hra = parseFloat(basicSalary) * 0.4;
        const specialAllowance = parseFloat(basicSalary) * 0.3;
        const totalCTC = parseFloat(basicSalary) + hra + specialAllowance;

        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text('Employee CTC Details', 105, 15, null, null, 'center');
        doc.setFontSize(12);
        doc.text(`Name: ${name}`, 20, 30);
        doc.text(`Employee ID: ${id}`, 20, 40);
        doc.text(`Basic Salary: $${basicSalary}`, 20, 50);
        doc.text(`HRA (40%): $${hra.toFixed(2)}`, 20, 60);
        doc.text(`Special Allowance (30%): $${specialAllowance.toFixed(2)}`, 20, 70);
        doc.text(`Total CTC: $${totalCTC.toFixed(2)}`, 20, 80);
        doc.save('employee_ctc.pdf');

        this.showToast('Success', 'PDF generated successfully!', 'success');
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title,
            message,
            variant
        });
        this.dispatchEvent(event);
    }
}