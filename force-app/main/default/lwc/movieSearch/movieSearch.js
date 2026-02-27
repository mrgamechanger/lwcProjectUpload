import { LightningElement, track, wire } from 'lwc';
import searchContent from '@salesforce/apex/MovieApiCallout.searchContent';
import getContentDetails from '@salesforce/apex/MovieApiCallout.getContentDetails';
import getSeasonEpisodes from '@salesforce/apex/MovieApiCallout.getSeasonEpisodes';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class MovieSearch extends LightningElement {
    @track searchTerm = '';
    @track contentType = 'movie'; // Default to movies
    @track contentTypes = [
        { label: 'All', value: '' },
        { label: 'Movies', value: 'movie' },
        { label: 'TV Series', value: 'series' },
        { label: 'Episodes', value: 'episode' }
    ];
    @track movies = [];
    @track isLoading = false;
    @track error = null;
    @track currentPage = 1;
    @track totalResults = 0;
    @track totalPages = 1;
    @track showMovieDetails = false;
    @track selectedMovie = null;
    @track selectedSeason = null;
    @track selectedEpisode = null;
    @track seasons = [];
    @track episodes = [];
    searchTimeout;

    get hasResults() {
        return this.movies && this.movies.length > 0;
    }

    get noResults() {
        return !this.isLoading && this.searchTerm && (!this.movies || this.movies.length === 0);
    }

    get isFirstPage() {
        return this.currentPage === 1;
    }

    get isLastPage() {
        return this.currentPage >= this.totalPages;
    }

    get showSeasonSelector() {
        return this.selectedMovie && this.selectedMovie.Type === 'series' && this.seasons.length > 0;
    }

    get showEpisodeSelector() {
        return this.selectedSeason && this.episodes.length > 0;
    }

    handleSearchChange(event) {
        this.searchTerm = event.target.value;
        
        // Clear previous timeout
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Set new timeout for search
        this.searchTimeout = setTimeout(() => {
            this.currentPage = 1;
            this.performSearch();
        }, 900);
    }

    handleContentTypeChange(event) {
        this.contentType = event.target.value;
        this.currentPage = 1;
        this.performSearch();
    }

    async performSearch() {
        if (!this.searchTerm) {
            this.movies = [];
            return;
        }

        this.isLoading = true;
        this.error = null;

        try {
            const result = await searchContent({ 
                searchTerm: this.searchTerm, 
                contentType: this.contentType,
                page: this.currentPage 
            });

            if (result.Response === 'True') {
                this.movies = result.Search;
                this.totalResults = parseInt(result.totalResults);
                this.totalPages = Math.ceil(this.totalResults / 10);
                
                // Fetch additional details for each item
                await this.fetchContentDetails();
            } else {
                this.movies = [];
                this.error = result.Error || 'No results found';
            }
        } catch (error) {
            this.error = 'Error searching content: ' + error.body.message;
            this.movies = [];
        } finally {
            this.isLoading = false;
        }
    }
    
    async fetchContentDetails() {
        const contentPromises = this.movies.map(async (item) => {
            try {
                const details = await getContentDetails({ 
                    imdbId: item.imdbID,
                    season: null,
                    episode: null
                });
                return {
                    ...item,
                    Plot: details.Plot || 'No plot available',
                    imdbRating: details.imdbRating || 'N/A',
                    Director: details.Director || 'N/A',
                    Actors: details.Actors || 'N/A',
                    Type: details.Type || 'movie',
                    totalSeasons: details.totalSeasons || null
                };
            } catch (error) {
                console.error('Error fetching details for item:', item.imdbID, error);
                return {
                    ...item,
                    Plot: 'Error loading plot',
                    imdbRating: 'N/A',
                    Type: 'movie'
                };
            }
        });
        
        try {
            const updatedContent = await Promise.all(contentPromises);
            this.movies = updatedContent;
        } catch (error) {
            console.error('Error updating content details:', error);
        }
    }

    handlePreviousPage() {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.performSearch();
        }
    }

    handleNextPage() {
        if (!this.isLastPage) {
            this.currentPage++;
            this.performSearch();
        }
    }

    async handleViewDetails(event) {
        const imdbId = event.currentTarget.dataset.imdbid;
        this.isLoading = true;
        this.seasons = [];
        this.episodes = [];
        this.selectedSeason = null;
        this.selectedEpisode = null;

        try {
            const contentDetails = await getContentDetails({ 
                imdbId: imdbId,
                season: null,
                episode: null
            });
            
            this.selectedMovie = contentDetails;
            
            // If it's a TV series, fetch seasons
            if (contentDetails.Type === 'series' && contentDetails.totalSeasons) {
                await this.fetchSeasons(imdbId, contentDetails.totalSeasons);
            }
            
            this.showMovieDetails = true;
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error fetching content details: ' + error.body.message,
                    variant: 'error'
                })
            );
        } finally {
            this.isLoading = false;
        }
    }
    
    async fetchSeasons(imdbId, totalSeasons) {
        this.seasons = [];
        for (let i = 1; i <= totalSeasons; i++) {
            this.seasons.push({ label: `Season ${i}`, value: i });
        }
    }
    
    async handleSeasonChange(event) {
        this.selectedSeason = parseInt(event.target.value);
        this.episodes = [];
        this.selectedEpisode = null;
        
        if (this.selectedSeason) {
            this.isLoading = true;
            try {
                const seasonData = await getSeasonEpisodes({ 
                    imdbId: this.selectedMovie.imdbID,
                    season: this.selectedSeason
                });
                
                if (seasonData.Episodes) {
                    this.episodes = seasonData.Episodes.map((episode, index) => ({
                        label: `Episode ${index + 1}: ${episode.Title}`,
                        value: index + 1
                    }));
                }
            } catch (error) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error fetching episodes: ' + error.body.message,
                        variant: 'error'
                    })
                );
            } finally {
                this.isLoading = false;
            }
        }
    }
    
    async handleEpisodeChange(event) {
        this.selectedEpisode = parseInt(event.target.value);
        
        if (this.selectedEpisode) {
            this.isLoading = true;
            try {
                const episodeDetails = await getContentDetails({ 
                    imdbId: this.selectedMovie.imdbID,
                    season: this.selectedSeason,
                    episode: this.selectedEpisode
                });
                
                // Update the selected movie with episode details
                this.selectedMovie = {
                    ...this.selectedMovie,
                    EpisodeTitle: episodeDetails.Title,
                    Plot: episodeDetails.Plot,
                    Released: episodeDetails.Released,
                    Episode: episodeDetails.Episode,
                    imdbRating: episodeDetails.imdbRating
                };
            } catch (error) {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'Error fetching episode details: ' + error.body.message,
                        variant: 'error'
                    })
                );
            } finally {
                this.isLoading = false;
            }
        }
    }

    handleCloseModal() {
        this.showMovieDetails = false;
        this.selectedMovie = null;
        this.seasons = [];
        this.episodes = [];
        this.selectedSeason = null;
        this.selectedEpisode = null;
    }

    handleImageError(event) {
        event.target.src = 'https://via.placeholder.com/150x225?text=No+Poster';
    }
}