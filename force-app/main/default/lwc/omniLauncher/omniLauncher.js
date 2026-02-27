import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class OmniLauncher extends NavigationMixin(LightningElement) {
    launchOmni() {
      this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'omnistudio__vlocityLWCOmniWrapper'
            },
            state: {
                c__target: 'c:khelDragonEnglish',
                c__layout: 'lightning', // or can be 'newport'
                c__tabIcon: 'custom:custom18',
            }
        });
     }

}