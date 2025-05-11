// --- START OF FILE schedule.js ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[Schedule NEW] DOMContentLoaded");

    const filtersContainer = document.querySelector('.filters');
    const toggleDesktopBtn = document.getElementById('filter-toggle-desktop-btn');
    const panelDesktop = document.getElementById('filters-panel-desktop');
    const toggleMobileBtn = document.querySelector('.filter-toggle-mobile');
    const optionsMobile = document.getElementById('filters-options-mobile');

    const dateFilterDesktop = document.getElementById('date-filter');
    const genreFilterDesktop = document.getElementById('genre-filter');
    const ageFilterDesktop = document.getElementById('age-filter');
    const applyButtonDesktop = document.getElementById('apply-filters-desktop');

    const dateFilterMobile = document.getElementById('date-filter-mobile');
    const genreFilterMobile = document.getElementById('genre-filter-mobile');
    const ageFilterMobile = document.getElementById('age-filter-mobile');
    const applyButtonMobile = document.getElementById('apply-filters-mobile');

    const posterGrid = document.querySelector('.poster-grid');

    let lastAppliedDate = '';

    if (!filtersContainer || !toggleDesktopBtn || !panelDesktop || !toggleMobileBtn || !optionsMobile || !applyButtonDesktop || !applyButtonMobile || !posterGrid) {
        console.error("[Schedule NEW] Critical elements not found. Aborting.");
        if(posterGrid) posterGrid.innerHTML = "<p>Ошибка инициализации фильтров.</p>";
        return;
    }

    let allMovies = [];

    async function initialize() {
        console.log("[Schedule NEW] Initializing...");
        const loadedMovies = await loadJSON('data/movies.json');
        if (!loadedMovies) {
             if(posterGrid) posterGrid.innerHTML = "<p>Не удалось загрузить список фильмов.</p>";
             return;
         }
        allMovies = loadedMovies;
        console.log(`[Schedule NEW] ${allMovies.length} movies loaded.`);

        if (genreFilterDesktop && genreFilterMobile) populateGenreFilter(allMovies);
        if (dateFilterDesktop && dateFilterMobile) setDefaultDate();

        if (dateFilterDesktop) {
            lastAppliedDate = dateFilterDesktop.value;
        } else if (dateFilterMobile) {
            lastAppliedDate = dateFilterMobile.value;
        }

        applyFilters();

        setupListeners();
        console.log("[Schedule NEW] Initialization complete.");
    }

    function setupListeners() {
        toggleDesktopBtn.addEventListener('click', handleDesktopToggle);
        toggleMobileBtn.addEventListener('click', handleMobileToggle);
        applyButtonDesktop.addEventListener('click', () => handleApply('desktop'));
        applyButtonMobile.addEventListener('click', () => handleApply('mobile'));
        document.addEventListener('click', handleClickOutside);
        panelDesktop.addEventListener('click', (event) => event.stopPropagation());
        console.log("[Schedule NEW] Event listeners attached.");
    }

    function handleDesktopToggle(event) {
        event.stopPropagation();
        console.log("[Schedule NEW] Desktop toggle clicked.");
        if (optionsMobile.classList.contains('is-visible')) closeMobileFilters();

        const isOpen = panelDesktop.classList.toggle('is-visible');
        toggleDesktopBtn.classList.toggle('active', isOpen);
        toggleDesktopBtn.setAttribute('aria-expanded', String(isOpen));
    }

    function handleMobileToggle() {
        console.log("[Schedule NEW] Mobile toggle clicked.");
        if (panelDesktop.classList.contains('is-visible')) closeDesktopFilters();

        const isMobileOpen = optionsMobile.classList.toggle('is-visible');
        toggleMobileBtn.setAttribute('aria-expanded', String(isMobileOpen));
    }

    function handleApply(source) {
        console.log(`[Schedule NEW] Apply clicked from ${source}`);
        const dateInput = (source === 'mobile') ? dateFilterMobile : dateFilterDesktop;
        if (dateInput) {
            lastAppliedDate = dateInput.value;
            console.log("Updating lastAppliedDate to:", lastAppliedDate);
        }
        applyFilters(source);

        if (source === 'desktop' && panelDesktop.classList.contains('is-visible')) {
        } else if (source === 'mobile' && optionsMobile.classList.contains('is-visible')) {
            closeMobileFilters();
        }
    }

    function handleClickOutside(event) {
        if (panelDesktop.classList.contains('is-visible') &&
            !panelDesktop.contains(event.target) &&
            !toggleDesktopBtn.contains(event.target))
        {
            console.log("[Schedule NEW] Closing desktop panel on outside click.");
            closeDesktopFilters();
        }
    }

    function closeDesktopFilters() {
        panelDesktop.classList.remove('is-visible');
        toggleDesktopBtn.classList.remove('active');
        toggleDesktopBtn.setAttribute('aria-expanded', 'false');
    }
    function closeMobileFilters() {
        optionsMobile.classList.remove('is-visible');
        toggleMobileBtn.setAttribute('aria-expanded', 'false');
    }

    function populateGenreFilter(movies) {
        const genreSelects = [genreFilterDesktop, genreFilterMobile];
        if (!genreSelects[0] || !genreSelects[1]) return;
        const genres = new Set();
        movies.forEach(movie => { if(movie && Array.isArray(movie.genres)) movie.genres.forEach(genre => genres.add(genre)); });

        genreSelects.forEach(select => {
             while (select.options.length > 1) select.remove(1);
             Array.from(genres).sort().forEach(genre => {
                 const option = document.createElement('option');
                 option.value = genre; option.textContent = genre;
                 select.appendChild(option);
             });
        });
         console.log("[Schedule NEW] Genres populated.");
    }

    function setDefaultDate() {
        const dateInputs = [dateFilterDesktop, dateFilterMobile];
         if (!dateInputs[0] || !dateInputs[1]) return;
         const today = new Date(); const year = today.getFullYear(); const month = String(today.getMonth() + 1).padStart(2, '0'); const day = String(today.getDate()).padStart(2, '0'); const todayStr = `${year}-${month}-${day}`;
         const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 1); const maxYear = maxDate.getFullYear(); const maxMonth = String(maxDate.getMonth() + 1).padStart(2, '0'); const maxDay = String(maxDate.getDate()).padStart(2, '0'); const maxDateStr = `${maxYear}-${maxMonth}-${maxDay}`;

         dateInputs.forEach(input => {
            input.value = todayStr;
            input.min = todayStr;
            input.max = maxDateStr;
         });
         lastAppliedDate = todayStr;
         console.log("[Schedule NEW] Date set. Initial lastAppliedDate:", lastAppliedDate);
    }

    function renderPosters(moviesToRender) {
        if (!posterGrid) return;
        posterGrid.innerHTML = '';

        const currentDateForLink = lastAppliedDate;
        console.log("Using date for links:", currentDateForLink);

        if (!Array.isArray(moviesToRender) || moviesToRender.length === 0) {
            posterGrid.innerHTML = '<p>По вашему запросу фильмов не найдено.</p>';
            return;
        }

        moviesToRender.forEach(movie => {
            if (!movie || !movie.id) return;
            const posterElement = document.createElement('a');
            posterElement.classList.add('poster-item');

            let movieUrl = `movie-details.html?id=${movie.id}`;
            if (currentDateForLink) {
                movieUrl += `&date=${currentDateForLink}`;
            }
            posterElement.href = movieUrl;

            posterElement.innerHTML = `
                <img src="${movie.posterUrl || 'images/placeholder_poster.jpg'}" alt="Постер фильма ${movie.title || ''}" loading="lazy">
                <div class="poster-overlay">
                    <span class="poster-details-button">Подробнее</span>
                </div>
            `;
            posterGrid.appendChild(posterElement);
        });
        console.log(`[Schedule NEW] Rendered ${moviesToRender.length} posters.`);
    }

    function applyFilters(source = 'initial') {
        console.log(`--- Applying filters (source: ${source}) ---`);

        let selectedDate, selectedGenre, selectedAge;

        if (source !== 'initial') {
            const dateInput = (source === 'mobile') ? dateFilterMobile : dateFilterDesktop;
            const genreSelect = (source === 'mobile') ? genreFilterMobile : genreFilterDesktop;
            const ageSelect = (source === 'mobile') ? ageFilterMobile : ageFilterDesktop;

            if (!dateInput || !genreSelect || !ageSelect) {
                 console.error("Filter elements not found for source:", source);
                 return;
            }
            selectedDate = dateInput.value;
            selectedGenre = genreSelect.value;
            selectedAge = ageSelect.value;
             lastAppliedDate = selectedDate;

        } else {
             selectedDate = lastAppliedDate;
             selectedGenre = genreFilterDesktop ? genreFilterDesktop.value : 'all';
             selectedAge = ageFilterDesktop ? ageFilterDesktop.value : 'all';
        }


        console.log("Filtering with values:", { date: selectedDate, genre: selectedGenre, age: selectedAge });

        if (!Array.isArray(allMovies)) {
             console.error("Movies data is not available for filtering.");
             return;
         }

        const filteredMovies = allMovies.filter(movie => {
            if (!movie) return false;
            const hasShowtimeOnDate = selectedDate
                ? movie.showtimes && movie.showtimes[selectedDate] && movie.showtimes[selectedDate].length > 0
                : true;
            const genreMatch = selectedGenre === 'all' || (movie.genres && movie.genres.includes(selectedGenre));
            const parseAge = (ageString) => parseInt(String(ageString).replace(/\D/g, ''), 10) || 0;
            const movieAgeNum = movie.ageRating ? parseAge(movie.ageRating) : 0;
            const selectedAgeNum = selectedAge === 'all' ? 999 : parseAge(selectedAge);
            const ageMatch = movieAgeNum <= selectedAgeNum;
            return hasShowtimeOnDate && genreMatch && ageMatch;
        });

        console.log(`Found ${filteredMovies.length} movies after filtering.`);
        renderPosters(filteredMovies);
    }

    initialize();

});
// --- END OF FILE schedule.js ---