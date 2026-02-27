import { LightningElement } from 'lwc';

export default class StudentForm extends LightningElement {

    columnsList=[
        {label:'Student Name',fieldName:'Student_Name'},
        {label:'Student Age',fieldName:'Student_Age'},
        {label:'Student Email',fieldName:'Student_Email'}
    ];

    studentdetailevent(event)
    {
        const field = event.target.name;
        this[field] = event.target.value;
        console.log(this.Student_Name);
    }
}