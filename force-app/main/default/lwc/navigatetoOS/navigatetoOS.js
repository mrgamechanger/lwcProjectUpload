import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavigatetoOS extends NavigationMixin(LightningElement) {
    
    handleNavigateToOS() {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'omnistudio__vlocityLWCOmniWrapper'
            },
            state: {
                c__target: 'c:testTravelEnglish',
                c__layout: 'lightning', // or can be 'newport'
                c__tabIcon: 'custom:custom18',
            }
        });
    }
}