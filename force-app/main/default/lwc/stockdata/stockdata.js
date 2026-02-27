import { LightningElement, track } from 'lwc';
import searchStockdata from '@salesforce/apex/FinanceDataCallout.searchStockdata';
import getTrendingStocks from '@salesforce/apex/FinanceDataCallout.getTrendingStocks';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class Stockdata extends LightningElement {
    @track display = false;
    @track showSpinner = false;
    @track showTrendingModal = false;
    stockInfo = '';
    stock = '';
    @track StockDisplay = [];
    @track trendingStocks = [];
    @track activeTab = 'gainers'; // Track active tab

    get activeTabGainers() {
        return this.activeTab === 'gainers';
    }

    get activeTabLosers() {
        return this.activeTab === 'losers';
    }

    get gainersTabClass() {
        return `slds-tabs_default__content ${this.activeTab === 'gainers' ? 'slds-show' : 'slds-hide'}`;
    }

    get losersTabClass() {
        return `slds-tabs_default__content ${this.activeTab === 'losers' ? 'slds-show' : 'slds-hide'}`;
    }

    handleInputChange(event) {
        this.stock = event.target.value;
    }

    handleStockInfo() {
        if (!this.stock) {
            // Show error toast if stock symbol is empty
            this.showToast('Error', 'Please enter a stock symbol', 'error');
            return;
        }

        this.showSpinner = true;
        this.StockDisplay = []; // Clear previous results

        searchStockdata({ Stockname: this.stock })
            .then((result) => {
                this.showSpinner = false;
                console.log('Data received:', result);
                this.stockInfo = JSON.parse(result);
                this.stockArray = this.stockInfo.data.stock;
                
                this.stockArray.forEach((stock, index) => {
                    const changeValue = parseFloat(stock.change);
                    const changeClass = changeValue >= 0 ? 'slds-text-color_success' : 'slds-text-color_error';
                    
                    const formattedStockobj = {
                        id: index,
                        symbol: stock.symbol,
                        name: stock.name,
                        price: parseFloat(stock.price).toFixed(2),
                        change: parseFloat(stock.change).toFixed(2),
                        change_percent: parseFloat(stock.change_percent).toFixed(2),
                        previous_close: parseFloat(stock.previous_close).toFixed(2),
                        exchange: stock.exchange,
                        changeClass: changeClass
                    };

                    this.StockDisplay.push(formattedStockobj);
                });

                this.display = true;
            })
            .catch((error) => {
                this.showSpinner = false;
                console.error('Error occurred:', error);
                this.showToast('Error', 'Failed to fetch stock data. Please try again.', 'error');
            });
    }

    handleTrendingStocks() {
        this.showSpinner = true;
        this.showTrendingModal = true;

        getTrendingStocks()
            .then(result => {
                this.showSpinner = false;
                const data = JSON.parse(result);
                console.log('Trending stocks:', JSON.stringify(data));
                
                // Process both gainers and losers
                const gainers = data.trending_stocks.top_gainers.map((stock, index) => ({
                    id: `gainer-${index}`,
                    symbol: stock.ticker_id,
                    name: stock.company_name,
                    price: parseFloat(stock.price).toFixed(2),
                    change: parseFloat(stock.net_change).toFixed(2),
                    change_percent: parseFloat(stock.percent_change).toFixed(2),
                    changeClass: 'slds-text-color_success',
                    high: parseFloat(stock.high).toFixed(2),
                    low: parseFloat(stock.low).toFixed(2),
                    volume: stock.volume,
                    rating: stock.overall_rating,
                    shortTermTrend: stock.short_term_trends,
                    longTermTrend: stock.long_term_trends
                }));

                const losers = data.trending_stocks.top_losers.map((stock, index) => ({
                    id: `loser-${index}`,
                    symbol: stock.ticker_id,
                    name: stock.company_name,
                    price: parseFloat(stock.price).toFixed(2),
                    change: parseFloat(stock.net_change).toFixed(2),
                    change_percent: parseFloat(stock.percent_change).toFixed(2),
                    changeClass: 'slds-text-color_error',
                    high: parseFloat(stock.high).toFixed(2),
                    low: parseFloat(stock.low).toFixed(2),
                    volume: stock.volume,
                    rating: stock.overall_rating,
                    shortTermTrend: stock.short_term_trends,
                    longTermTrend: stock.long_term_trends
                }));

                this.trendingStocks = {
                    gainers: gainers,
                    losers: losers
                };
            })
            .catch(error => {
                this.showSpinner = false;
                this.showTrendingModal = false;
                console.error('Error fetching trending stocks:', error);
                this.showToast('Error', 'Failed to fetch trending stocks', 'error');
            });
    }

    handleTabChange(event) {
        this.activeTab = event.target.dataset.tab;
    }

    closeTrendingModal() {
        this.showTrendingModal = false;
        this.trendingStocks = [];
        this.activeTab = 'gainers';
    }

    Reset() {
        this.display = false;
        this.stock = '';
        this.stockInfo = '';
        this.StockDisplay = [];
        this.template.querySelector('form').reset();
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}