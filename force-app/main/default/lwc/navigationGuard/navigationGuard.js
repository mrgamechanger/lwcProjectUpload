import { LightningElement } from 'lwc';

export default class NavigationGuard extends LightningElement {
    isSubmitted = false;

    connectedCallback() {
        // Request notification permission
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        // Listen for visibility change
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        // Listen for tab/window close
        window.addEventListener('beforeunload', this.handleBeforeUnload);
    }

    disconnectedCallback() {
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
    }

    handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden' && !this.isSubmitted) {
            this.showNotification();
        }
    };

    handleBeforeUnload = (event) => {
        if (!this.isSubmitted) {
            event.preventDefault();
            event.returnValue = '';
            this.showNotification();
        }
    };

    showNotification() {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Please click on submit button');
        }
    }

    handleSubmit() {
        this.isSubmitted = true;
    }
}