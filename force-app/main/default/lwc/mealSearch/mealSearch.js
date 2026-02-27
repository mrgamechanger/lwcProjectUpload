import { LightningElement, track, wire } from 'lwc';
import searchMeal from '@salesforce/apex/MealController.searchMeal';
import getCategories from '@salesforce/apex/MealController.getCategories';
import getAreas from '@salesforce/apex/MealController.getAreas';
import filterByArea from '@salesforce/apex/MealController.filterByArea';
import filterByCategory from '@salesforce/apex/MealController.filterByCategory';
import getMealDetails from '@salesforce/apex/MealController.getMealDetails';
import { OmniscriptBaseMixin } from 'omnistudio/omniscriptBaseMixin';
import { OmniscriptActionCommonUtil } from 'omnistudio/omniscriptActionUtils';

const ITEMS_PER_PAGE = 10;

export default class MealSearch extends OmniscriptBaseMixin(LightningElement) {
    @track searchTerm = '';
    @track meals = [];
    @track error;
    @track isLoading = false;
    @track selectedArea = '';
    @track selectedCategory = '';
    @track areaOptions = [];
    @track categoryOptions = [];
    @track showMealDetails = false;
    @track selectedMeal = {};
    @track ingredients = [];
    @track currentPage = 1;
    @track totalPages = 1;
    debounceTimeout;


    connectedCallback() {
        this.actionUtilClass = new OmniscriptActionCommonUtil();
    }

    // Wire the categories and areas on component initialization
    @wire(getCategories)
    wiredCategories({ error, data }) {
        if (data) {
            try {
                const result = JSON.parse(data);
                if (result.categories) {
                    this.categoryOptions = result.categories.map(category => ({
                        label: category.strCategory,
                        value: category.strCategory
                    }));
                }
            } catch (e) {
                console.error('Error parsing categories:', e);
            }
        } else if (error) {
            console.error('Error fetching categories:', error);
        }
    }

    @wire(getAreas)
    wiredAreas({ error, data }) {
        if (data) {
            try {
                const result = JSON.parse(data);
                if (result.meals) {
                    this.areaOptions = result.meals.map(area => ({
                        label: area.strArea,
                        value: area.strArea
                    }));
                }
            } catch (e) {
                console.error('Error parsing areas:', e);
            }
        } else if (error) {
            console.error('Error fetching areas:', error);
        }
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        
        // Clear any existing timeout
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }

        // Set new timeout
        this.debounceTimeout = setTimeout(() => {
            if (this.searchTerm.length >= 2) {
                this.fetchMeals();
            } else {
                this.meals = [];
            }
        }, 3000); // 3 seconds debounce
    }

    handleAreaChange(event) {
        this.selectedArea = event.target.value;
        this.selectedCategory = ''; // Clear category when area is selected
        if (this.selectedArea) {
            this.fetchMealsByArea();
        } else {
            this.meals = [];
        }
    }

    handleCategoryChange(event) {
        this.selectedCategory = event.target.value;
        this.selectedArea = ''; // Clear area when category is selected
        if (this.selectedCategory) {
            this.fetchMealsByCategory();
        } else {
            this.meals = [];
        }
    }

    handleReset() {
        this.searchTerm = '';
        this.selectedArea = '';
        this.selectedCategory = '';
        this.meals = [];
        this.error = null;
        this.currentPage = 1;
        this.totalPages = 1;
        
        // Clear the comboboxes
        this.template.querySelector('lightning-combobox[data-id="areaCombo"]').value = '';
        this.template.querySelector('lightning-combobox[data-id="categoryCombo"]').value = '';
    }

    get paginatedMeals() {
        const startIndex = (this.currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return this.meals.slice(startIndex, endIndex);
    }

    get showPagination() {
        return this.meals.length > ITEMS_PER_PAGE;
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage === this.totalPages;
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
        }
    }

    handleNextPage() {
        if (this.currentPage < this.totalPages) {
            this.currentPage++;
        }
    }

    async fetchMeals() {
        this.isLoading = true;
        this.error = null;
        this.currentPage = 1;
        
        try {
            const result = await searchMeal({ searchTerm: this.searchTerm });
            const data = JSON.parse(result);
            
            if (data.meals) {
                this.meals = data.meals;
                this.totalPages = Math.ceil(this.meals.length / ITEMS_PER_PAGE);
            } else {
                this.meals = [];
                this.totalPages = 1;
            }
        } catch (error) {
            this.error = 'Error fetching meals: ' + error.body.message;
            this.meals = [];
            this.totalPages = 1;
        } finally {
            this.isLoading = false;
        }
    }

    async fetchMealsByArea() {
        this.isLoading = true;
        this.error = null;
        this.currentPage = 1;
        
        try {
            const result = await filterByArea({ area: this.selectedArea });
            const data = JSON.parse(result);
            
            if (data.meals) {
                this.meals = data.meals;
                this.totalPages = Math.ceil(this.meals.length / ITEMS_PER_PAGE);
            } else {
                this.meals = [];
                this.totalPages = 1;
            }
        } catch (error) {
            this.error = 'Error filtering by area: ' + error.body.message;
            this.meals = [];
            this.totalPages = 1;
        } finally {
            this.isLoading = false;
        }
    }

    async fetchMealsByCategory() {
        this.isLoading = true;
        this.error = null;
        this.currentPage = 1;
        
        try {
            const result = await filterByCategory({ category: this.selectedCategory });
            const data = JSON.parse(result);
            
            if (data.meals) {
                this.meals = data.meals;
                this.totalPages = Math.ceil(this.meals.length / ITEMS_PER_PAGE);
            } else {
                this.meals = [];
                this.totalPages = 1;
            }
        } catch (error) {
            this.error = 'Error filtering by category: ' + error.body.message;
            this.meals = [];
            this.totalPages = 1;
        } finally {
            this.isLoading = false;
        }
    }

    async handleMealClick(event) {
        const mealId = event.currentTarget.dataset.mealId;
        this.isLoading = true;
        
        try {
            const result = await getMealDetails({ mealId: mealId });
            const data = JSON.parse(result);
            
            if (data.meals && data.meals.length > 0) {
                this.selectedMeal = data.meals[0];
                this.extractIngredients();
                this.showMealDetails = true;
            }
        } catch (error) {
            this.error = 'Error fetching meal details: ' + error.body.message;
        } finally {
            this.isLoading = false;
        }
    }

    closeMealDetails() {
        this.showMealDetails = false;
        this.selectedMeal = {};
        this.ingredients = [];
    }

    extractIngredients() {
        const ingredients = [];
        const meal = this.selectedMeal;
        
        // The API returns ingredients as strIngredient1, strIngredient2, etc.
        // and measures as strMeasure1, strMeasure2, etc.
        for (let i = 1; i <= 20; i++) {
            const ingredientKey = `strIngredient${i}`;
            const measureKey = `strMeasure${i}`;
            
            if (meal[ingredientKey] && meal[ingredientKey].trim() !== '') {
                ingredients.push({
                    id: i,
                    name: meal[ingredientKey],
                    measure: meal[measureKey] || 'To taste'
                });
            }
        }
        
        this.ingredients = ingredients;
    }

    // Clean up the timeout when the component is destroyed
    disconnectedCallback() {
        if (this.debounceTimeout) {
            clearTimeout(this.debounceTimeout);
        }
    }
}