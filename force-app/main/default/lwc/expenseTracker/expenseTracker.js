import { LightningElement, track } from 'lwc';
import { loadScript } from 'lightning/platformResourceLoader';
import CHARTJS from '@salesforce/resourceUrl/ChartJs';

export default class ExpenseTracker extends LightningElement {
    @track expenses = [];
    @track newExpense = { category: '', amount: '' };
    @track totalExpenses = 0;
    @track currentPage = 1;
    pageSize = 5;
    chart;
    chartJsInitialized = false;

    categoryOptions = [
        { label: 'Food', value: 'food' },
        { label: 'Rent', value: 'rent' },
        { label: 'Petrol', value: 'petrol' },
        { label: 'BlinkIt', value: 'blinkit' },
        { label: 'Swiggy', value: 'swiggy' },
        { label: 'Zomato', value: 'zomato' },
        { label: 'Grocery', value: 'grocery' },
        { label: 'Utility', value: 'utility' },
    ];

    get paginatedExpenses() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = this.currentPage * this.pageSize;
        return this.expenses.slice(start, end);
    }

    get totalPages() {
        return Math.ceil(this.expenses.length / this.pageSize);
    }

    get isPreviousDisabled() {
        return this.currentPage <= 1;
    }

    get isNextDisabled() {
        return this.currentPage >= this.totalPages;
    }

    get chartData() {
        const data = {};
        this.expenses.forEach(exp => {
            if (!data[exp.category]) {
                data[exp.category] = 0;
            }
            data[exp.category] += exp.amount;
        });
        return {
            labels: Object.keys(data),
            values: Object.values(data)
        };
    }

    renderedCallback() {
        if (this.chartJsInitialized) {
            return;
        }
        this.chartJsInitialized = true;
        loadScript(this, CHARTJS)
            .then(() => {
                if (this.expenses.length > 0) {
                    this.initializeChart();
                }
            })
            .catch(error => {
                console.error('ChartJS load error', error);
            });
    }

    initializeChart() {
        requestAnimationFrame(() => {
            const ctx = this.template.querySelector('canvas.expense-chart');
            if (!ctx) {
                console.log('Canvas element not found, retrying...');
                setTimeout(() => this.initializeChart(), 100);
                return;
            }
            this.renderChart();
        });
    }

    renderChart() {
        const ctx = this.template.querySelector('canvas.expense-chart');
        if (!ctx) {
            console.log('Canvas element not found');
            return;
        }
        
        if (this.chart) {
            this.chart.destroy();
        }

        const data = this.chartData;
        if (!data.labels.length) {
            console.log('No data available for chart');
            return;
        }

        this.chart = new window.Chart(ctx, {
            type: 'pie',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Expenses by Category',
                    data: data.values,
                    backgroundColor: [
                        '#6366f1', '#f59e42', '#10b981', '#ef4444', '#fbbf24', '#3b82f6', '#a21caf', '#f472b6'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        display: true,
                        position: 'right'
                    }
                }
            }
        });
    }

    updateChart() {
        if (this.chart) {
            const data = this.chartData;
            this.chart.data.labels = data.labels;
            this.chart.data.datasets[0].data = data.values;
            this.chart.update();
        }
    }

    handleInputChange(event) {
        const { name, value } = event.target;
        this.newExpense = { ...this.newExpense, [name]: value };
    }

    addExpense() {
        const { category, amount } = this.newExpense;

        if (!category || !amount) {
            alert('Please fill out both category and amount.');
            return;
        }

        const expense = {
            id: Date.now().toString(),
            category,
            amount: parseFloat(amount),
        };

        this.expenses = [...this.expenses, expense];
        this.newExpense = { category: '', amount: '' };
        this.calculateTotal();
        this.currentPage = this.totalPages;
        
        if (this.chartJsInitialized) {
            this.initializeChart();
        }
    }

    calculateTotal() {
        this.totalExpenses = this.expenses
            .reduce((total, expense) => total + expense.amount, 0)
            .toFixed(2);
    }

    handlePrevious() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNext() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }
}