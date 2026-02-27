// utilityclass.js
export function overrideOpt() {
    return [
        { label: 'LWC', value: 'LWC' },
        { label: 'Apex', value: 'Apex' },
        { label: 'Velocity', value: 'Others' },
        { label: 'Admin', value: 'Others' },
        { label: 'Others', value: 'Others' }
    ];
}

// You can export other functions or constants if needed
export function formatDate(date) {
    return new Intl.DateTimeFormat('en-US').format(new Date(date));
}