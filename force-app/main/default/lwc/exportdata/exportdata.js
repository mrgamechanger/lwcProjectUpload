import { LightningElement, wire } from 'lwc';
import AccountSearch from '@salesforce/apex/AccountS.AccountSearch';

export default class Exportdata extends LightningElement {
    accounts = [];
    error;

    columnsList = [
        { label: 'Account Name', fieldName: 'Name', type: 'text' },
        { label: 'Account Type', fieldName: 'Type', type: 'text' },
        { label: 'Account Industry', fieldName: 'Industry', type: 'text' },
        { label: 'Account Annual Revenue', fieldName: 'AnnualRevenue', type: 'text' },
        { label: 'Account Phone', fieldName: 'Phone', type: 'text' },
        {
            label: 'Account Website',
            fieldName: 'Website',
            type: 'url',
            typeAttributes: {
                label: { fieldName: 'Website' },
                target: '_blank'
            }
        }
    ];

    @wire(AccountSearch)
    wiredAccounts({ data, error }) {
        if (data) {
            this.accounts = data;
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.accounts = [];
        }
    }

    handleClick() {
        let selectedRows = this.template.querySelector("lightning-datatable").getSelectedRows();
        let downloadRows = selectedRows.length > 0 ? [...selectedRows] : [...this.accounts];

        if (downloadRows.length === 0) {
            console.warn('No data available to download.');
            return;
        }

        console.log(JSON.stringify(downloadRows));

        let csv = this.convertArrayToCSV(downloadRows);
        this.downloadCSV(csv);
    }

    convertArrayToCSV(arr) {
        if (!arr || arr.length === 0) {
            return '';
        }

        let header = Object.keys(arr[0]).join(',');
        let body = arr.map(e => Object.values(e).join(',')).join('\n');
        let csv = `${header}\n${body}`;

        return csv;
    }

    downloadCSV(csv) {
        const downlink = document.createElement('a');
        downlink.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        downlink.target = '_blank';
        downlink.download = 'Accounts.csv';
        downlink.click();
    }

    get hasData() {
        return this.accounts.length > 0 ? false : true;
    }
}