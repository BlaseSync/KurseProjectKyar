// --- START OF FILE js/home.js ---
document.addEventListener('DOMContentLoaded', async () => {
    console.log("[home.js NEW STRUCTURE] DOMContentLoaded");

    const recContainer = document.querySelector('.recommendations-slider-container');
    const recSlidesWrapper = recContainer?.querySelector('.recommendations-slides');

    const recContentOverlay = document.getElementById('rec-content-overlay');
    const recTitleOverlay = document.getElementById('rec-title-overlay');
    const recDescriptionOverlay = document.getElementById('rec-description-overlay');
    const recDetailsButtonOverlay = document.getElementById('rec-details-button-overlay');

    const recContentBelow = document.getElementById('rec-content-below');
    const recTitleBelow = document.getElementById('rec-title-below');
    const recDescriptionBelow = document.getElementById('rec-description-below');
    const recDetailsButtonBelow = document.getElementById('rec-details-button-below');

    const newsContainer = document.querySelector('.news-slider-container');
    const newsSlidesWrapper = newsContainer?.querySelector('.news-slides');

    if (!recContainer || !recSlidesWrapper || !recContentOverlay || !recContentBelow ||
        !recTitleOverlay || !recDescriptionOverlay || !recDetailsButtonOverlay ||
        !recTitleBelow || !recDescriptionBelow || !recDetailsButtonBelow) {
        console.error("[home.js NEW STRUCTURE] Missing critical recommendation elements.");
        const recSection = document.querySelector('section.recommendations');
        if(recSection) recSection.style.display = 'none';
    }

    console.log("[home.js NEW STRUCTURE] Loading data...");
    const movies = await loadJSON('data/movies.json');
    const news = await loadJSON('data/news.json');
    console.log("[home.js NEW STRUCTURE] Data loaded:", { movies: movies?.length, news: news?.length });

    if (!movies) { console.error("[home.js NEW STRUCTURE] Movies failed to load"); }
    if (!news) { console.error("[home.js NEW STRUCTURE] News failed to load"); }


    const recommendedMovies = movies ? movies.filter(m => m && m.isRecommended) : [];
    console.log(`[home.js NEW STRUCTURE] Found ${recommendedMovies.length} recommended movies.`);

    if (recommendedMovies.length > 0 && recSlidesWrapper) {
        recSlidesWrapper.innerHTML = '';
        recommendedMovies.forEach((movie, index) => {
            if (!movie || !movie.id) return;
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.dataset.title = movie.title || '';
            slide.dataset.description = movie.description || '';
            slide.dataset.detailsUrl = `movie-details.html?id=${movie.id}`;
            slide.dataset.index = index;

            slide.innerHTML = `
                <img src="${movie.heroImageUrl || movie.posterUrl || 'images/placeholder_hero.jpg'}" alt="${movie.title || 'Рекомендованный фильм'}">
            `;
            recSlidesWrapper.appendChild(slide);
        });

        let isUpdatingContent = false; 
        const updateRecommendationContent = (index) => {
            if (isUpdatingContent) return;
            isUpdatingContent = true;

            const currentSlide = recSlidesWrapper.children[index];
            if (!currentSlide || !currentSlide.dataset) {
                console.warn(`Slide data for index ${index} not found.`);
                 if(recContentOverlay) recContentOverlay.style.opacity = '0';
                 if(recContentBelow) recContentBelow.style.opacity = '0';
                isUpdatingContent = false;
                return;
            }

            const title = currentSlide.dataset.title || '';
            const description = currentSlide.dataset.description || '';
            const url = currentSlide.dataset.detailsUrl || '#';


            if(recContentOverlay) recContentOverlay.style.opacity = '0';
            if(recContentBelow) recContentBelow.style.opacity = '0';

            setTimeout(() => {

                if(recTitleOverlay) recTitleOverlay.textContent = title;
                if(recDescriptionOverlay) recDescriptionOverlay.textContent = description;
                if(recDetailsButtonOverlay) recDetailsButtonOverlay.href = url;

                if(recTitleBelow) recTitleBelow.textContent = title;
                if(recDescriptionBelow) recDescriptionBelow.textContent = description;
                if(recDetailsButtonBelow) recDetailsButtonBelow.href = url;

                 if(recContentOverlay) recContentOverlay.style.opacity = '1';
                 if(recContentBelow) recContentBelow.style.opacity = '1';

                console.log(`Updated content for slide ${index}: ${title}`);
                isUpdatingContent = false; 
            }, 180); 
        };

        const sliderInstance = setupSlider({ 
            containerSelector: '.recommendations-slider-container',
            slidesSelector: '.recommendations-slides',
            dotsSelector: '.recommendations-dots',
            prevButtonSelector: '.rec-prev',
            nextButtonSelector: '.rec-next',
            itemsPerView: 1,
            itemsToScroll: 1,
            loop: recommendedMovies.length > 1,
            onSlideChange: updateRecommendationContent 
        });

        if (recommendedMovies.length > 0) {
            updateRecommendationContent(0);
        }

    } else {
        console.log("[home.js NEW STRUCTURE] No recommended movies to display.");
        const recSection = document.querySelector('section.recommendations');
        if(recSection) recSection.style.display = 'none';
    }


    if (news && news.length > 0 && newsSlidesWrapper) {
        newsSlidesWrapper.innerHTML = '';
        news.forEach(newsItem => {
             if (!newsItem) return;
             const slide = document.createElement('div');
             slide.className = 'slide news-slide';
             const imageUrl = newsItem.imageUrl || 'images/placeholder_news.jpg';
             const title = newsItem.title || 'Без заголовка';
             const text = newsItem.text || '';
             const date = newsItem.date ? new Date(newsItem.date).toLocaleDateString('ru-RU') : '';
             slide.innerHTML = `
                <article class="news-item">
                    <img src="${imageUrl}" alt="${title}">
                    <div class="news-item-content">
                        <h3>${title}</h3>
                        <p>${text}</p>
                        <div class="news-item-date">${date}</div>
                    </div>
                </article>`;
             newsSlidesWrapper.appendChild(slide);
        });

        const getNewsItemsToShow = () => {
             const width = window.innerWidth;
             if (width > 992) return 3;
             if (width <= 768) return 1;
             return 2;
         };
        const itemsToShow = getNewsItemsToShow();

        setupSlider({
            containerSelector: '.news-slider-container',
            slidesSelector: '.news-slides',
            dotsSelector: '.news-dots',
            prevButtonSelector: '.news-prev',
            nextButtonSelector: '.news-next',
            itemsPerView: itemsToShow,
            itemsToScroll: 1,
            loop: news.length > itemsToShow
        });

        let resizeTimerNews;
        window.addEventListener('resize', () => {
             clearTimeout(resizeTimerNews);
             resizeTimerNews = setTimeout(() => {
                const currentNewsContainer = document.querySelector('.news-slider-container');
                if (currentNewsContainer && currentNewsContainer.sliderInstance) {
                     console.log("[home.js NEW STRUCTURE] Resizing news slider");
                     const newItemsToShow = getNewsItemsToShow();
                     const currentNewsSlides = currentNewsContainer.querySelector('.news-slides');
                     if (currentNewsSlides) currentNewsSlides.style.transform = '';
                      setupSlider({
                         containerSelector: '.news-slider-container',
                         slidesSelector: '.news-slides',
                         dotsSelector: '.news-dots',
                         prevButtonSelector: '.news-prev',
                         nextButtonSelector: '.news-next',
                         itemsPerView: newItemsToShow,
                         itemsToScroll: 1,
                         loop: news.length > newItemsToShow
                     });
                }
             }, 250);
        });

    } else {
        console.log("[home.js NEW STRUCTURE] No news to display.");
         if (newsContainer) newsContainer.style.display = 'none';
    }

    console.log("[home.js NEW STRUCTURE] Script finished.");
});
// --- END OF FILE js/home.js ---