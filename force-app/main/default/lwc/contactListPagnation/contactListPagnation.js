import { LightningElement ,track,wire} from 'lwc';
import  getContact  from '@salesforce/apex/ContactFetch.getContact';
const PAGE_SIZE = 10;


export default class ContactListPagnation extends LightningElement {
    

  @track contacts;
  @track pageNumber = 1;
  @track totalPages = 0;
  @wire(getContact, { pageNumber: '$pageNumber', pageSize: PAGE_SIZE })
  wiredContacts({ data, error }) {
    if (data) {
      this.contacts = data;
    } else if (error) {
      // Handle error
    }
  }
  previousPage() {
    if (this.pageNumber > 1) {
      this.pageNumber --;
    }
  }
  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
    }
  }
}