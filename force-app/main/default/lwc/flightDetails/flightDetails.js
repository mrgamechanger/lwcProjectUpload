import { LightningElement,track } from 'lwc';
import searchOneWayFlights from '@salesforce/apex/SkyScannerApiCallout.searchOneWayFlights';


export default class FlightDetails extends LightningElement {
    to='';
    from="";
    Adult="";
     Amt="INR";
    flightDetails="";
    itinerariesArray=[];
   @track showSpinner = false;
    itinerary;
    @track ItinerariesDisplay = [];
    @track display=false;
    @track durationInMinutes ;
    @track marketingCarrierName;
    @track originCity ;
    @track destinationCity ;
    @track formattedPrice ;
    handleInputChange(event)
    {

        let {name,value}=event.target;

         if(name==="TO")
         {
        this.to=value;
        console.log("display to",this.to);
         }
        else if(name==="FROM")
        {
            this.from=value;
            console.log("display to",this.from);
        }
        else if(name==="Adult")
            {
                this.Adult=value;
                console.log("display to",this.Adult);
            } 
        else if(name==="date")
                {

                    this.date=value;
                    console.log("display to",this.date);
                }
    }
    extractTime = (dateTimeString) => {
        return dateTimeString.split('T')[1].substr(0, 5); // Get HH:mm:ss
    };

    handleflightInfo(){
       
        this.showSpinner = true;
        searchOneWayFlights({ 
            Amt:this.Amt,
            toEntityId:this.to,
            fromEntityId:this.from,
            adults:this.Adult,
            departDate:this.date
        })
        .then((result) => {
            this.showSpinner = false;
                console.log('Data received:',result);
                this.ItinerariesDisplay = [];
                this.flightDetails = JSON.parse(result);
                this.display=true;
                // Assuming your data contains an array of  itineraries
               this.itinerariesArray = this.flightDetails.data.itineraries;

// Loop through each itinerary
                    for (let i = 0; i <  this.itinerariesArray.length; i++) {
                        const itinerary =  this.itinerariesArray[i];

                        // Extract relevant information
                        const id=itinerary.id;
                        const durationInMinutes = itinerary.legs[0].durationInMinutes;
                        const marketingCarrierName = itinerary.legs[0].segments[0].marketingCarrier.name;
                        const originCity = itinerary.legs[0].origin.city;
                        const destinationCity = itinerary.legs[0].destination.city;
                        const formattedPrice = itinerary.price.formatted;
                        const departureTime = this.extractTime(itinerary.legs[0].departure);
                        const arrivalTime = this.extractTime(itinerary.legs[0].arrival);
                        const URl=itinerary.legs[0].carriers.marketing[0].logoUrl
                        const formattedItinerary = {
                            id: id,
                            duration: durationInMinutes,
                            carrier: marketingCarrierName,
                            origin: originCity,
                            destination: destinationCity,
                            price: formattedPrice,
                            url:URl,
                            departureTime:departureTime,
                            arrivalTime:arrivalTime
                          };

                          this.ItinerariesDisplay.push(formattedItinerary);
                        // Display the information
                        console.log(`Itinerary ${i + 1}: ${id}`);
                        console.log(`Duration of the flight: ${durationInMinutes} minutes`);
                        console.log(`Marketing carrier name: ${marketingCarrierName}`);
                        console.log(`Origin city: ${originCity}`);
                        console.log(`Destination city: ${destinationCity}`);
                        console.log(`Formatted price: ${formattedPrice}`);
                        console.log('----------------------------------');
         }
        

        })
        .catch((error) =>{
                
                
                console.log('Some error occurred while fetching flight details',error);
        });
}
Reset()
{
    this.to=" ";
    this.from=" ";
    this.Adult=" ";
    this.date=" ";
    this.display=false;
    this.ItinerariesDisplay=[];
    this.template.querySelector('form').reset();

}

    


}