// --- START OF FILE js/moviePage.js ---
document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const movieId = urlParams.get('id');
    const selectedDateFromUrl = urlParams.get('date');

    const mainContent = document.querySelector('.movie-detail-page');
    const heroImage = document.getElementById('movie-hero-image');
    const movieTitle = document.getElementById('movie-title');
    const movieGenres = document.getElementById('movie-genres');
    const movieRelease = document.getElementById('movie-release');
    const movieDuration = document.getElementById('movie-duration');
    const movieAge = document.getElementById('movie-age');
    const directorInfoElement = document.querySelector('.director-info');
    const movieDirectorSpan = document.getElementById('movie-director');
    const movieDescription = document.getElementById('movie-description');
    const playButton = document.getElementById('play-trailer-btn');
    const trailerModal = document.getElementById('trailer-modal');
    const closeModalButton = document.getElementById('close-trailer-modal');
    const trailerIframe = document.getElementById('trailer-iframe');
    const scheduleSection = document.getElementById('movie-schedule');
    const dateSelector = document.getElementById('movie-date-selector');
    const showtimesListContainer = document.getElementById('movie-showtimes-list');
    const scheduleControls = scheduleSection?.querySelector('.schedule-controls');
    const noShowtimesMessage = scheduleSection?.querySelector('.no-showtimes-message');
    const noScheduleMessage = scheduleSection?.querySelector('.no-schedule-message');

    if (!mainContent || !heroImage || !movieTitle || !movieGenres || !movieRelease || !movieDuration || !movieAge || !movieDescription ||
        !scheduleSection || !dateSelector || !showtimesListContainer || !scheduleControls || !noShowtimesMessage || !noScheduleMessage) {
        console.error("Критическая ошибка: Не найдены необходимые элементы на странице фильма или в секции расписания!");
        if (mainContent) {
             mainContent.innerHTML = `<p style="text-align: center; padding: 50px; color: red;">Ошибка загрузки страницы фильма. Пожалуйста, попробуйте позже.</p>`;
        } else {
             alert("Критическая ошибка загрузки страницы фильма.");
        }
        return;
    }
    if (!playButton || !trailerModal || !trailerIframe || !closeModalButton) {
        console.warn("Элементы для трейлера могут отсутствовать.");
    }

    const movies = await loadJSON('data/movies.json');
    if (!movies) {
        showError("Не удалось загрузить данные о фильмах. Расписание недоступно.");
        return;
    }
    const movie = movies.find(m => m && m.id === movieId);
    if (!movie) {
        showError(`Ошибка: Фильм с ID "${movieId}" не найден.`);
        return;
    }

    const setText = (element, text) => { if (element) element.textContent = text || ''; };
    const setSrc = (element, src, alt) => {
        if (element) {
            const defaultSrc = element.dataset.defaultSrc || 'images/placeholder_hero.jpg';
            element.src = src || defaultSrc;
            element.alt = alt || 'Изображение';
            element.onerror = () => {
                console.warn(`Не удалось загрузить изображение: ${src}. Используется заглушка: ${defaultSrc}`);
                element.src = defaultSrc;
            };
        }
     };
     function formatDate(dateString) {
        if (!dateString) return 'Неизвестно';
        try {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
            const date = new Date(dateString + 'T00:00:00');
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (e) {
            console.error("Ошибка форматирования даты:", e);
            return dateString;
        }
    }
    function showError(message) {
        console.error(message);
        if (mainContent) {
            mainContent.innerHTML = '';
            const errorP = document.createElement('p');
            errorP.style.textAlign = 'center';
            errorP.style.padding = '50px';
            errorP.style.color = 'red';
            errorP.textContent = message;
            mainContent.appendChild(errorP);
            if (scheduleSection) scheduleSection.style.display = 'none';
        } else {
            alert(message);
        }
    }
    function formatShortDate(dateString) {
        if (!dateString) return '';
        try {
            if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
            const date = new Date(dateString + 'T00:00:00');
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('ru-RU', { month: 'long', day: 'numeric' });
        } catch (e) {
            console.error("Ошибка форматирования короткой даты:", e);
            return dateString;
        }
    }

    document.title = `${movie.title || 'Фильм'} - Сеть Кинотеатров`;
    setSrc(heroImage, movie.heroImageUrl || movie.posterUrl, `Кадр из фильма ${movie.title || ''}`);
    setText(movieTitle, movie.title);
    setText(movieGenres, Array.isArray(movie.genres) ? movie.genres.join(', ') : 'Жанр не указан');
    setText(movieRelease, `Премьера: ${formatDate(movie.releaseDate)}`);
    setText(movieDuration, `Продолжительность: ${movie.duration ? movie.duration + ' мин.' : 'н/д'}`);
    setText(movieAge, movie.ageRating || 'н/д');
    if (directorInfoElement) {
        if (movieDirectorSpan && movie.director) {
             setText(movieDirectorSpan, movie.director);
             directorInfoElement.style.display = 'block';
        } else {
             directorInfoElement.style.display = 'none';
        }
    }
    setText(movieDescription, movie.description);

    let isUpdatingShowtimes = false;

    function displayShowtimes(selectedDate) {
        if (isUpdatingShowtimes) return;
        isUpdatingShowtimes = true;

        console.log("Обновление времени для даты:", selectedDate);
        if (!showtimesListContainer || !noShowtimesMessage) {
             console.error("Не найдены элементы контейнера времени или сообщения 'нет сеансов'.");
             isUpdatingShowtimes = false;
             return;
        }

        showtimesListContainer.classList.add('fade-out');
        noShowtimesMessage.classList.add('fade-out');

        setTimeout(() => {
            showtimesListContainer.innerHTML = '';

            const times = movie.showtimes && selectedDate && movie.showtimes[selectedDate];
            console.log("Найденное время:", times);

            if (times && Array.isArray(times) && times.length > 0) {
                noShowtimesMessage.style.display = 'none';
                times.forEach(time => {
                    const timeElement = document.createElement('span');
                    timeElement.classList.add('time-slot');
                    timeElement.textContent = time;
                    showtimesListContainer.appendChild(timeElement);
                });
                showtimesListContainer.style.display = 'flex';
                requestAnimationFrame(() => { requestAnimationFrame(() => {
                     showtimesListContainer.classList.remove('fade-out');
                }); });

            } else {
                console.log("Сеансы не найдены, показываем сообщение.");
                 showtimesListContainer.style.display = 'none';
                 noShowtimesMessage.style.display = 'block';
                  requestAnimationFrame(() => { requestAnimationFrame(() => {
                     noShowtimesMessage.classList.remove('fade-out');
                  }); });
            }

             setTimeout(() => { isUpdatingShowtimes = false; }, 50);

        }, 300);
    }

    if (movie.showtimes && typeof movie.showtimes === 'object' && Object.keys(movie.showtimes).length > 0) {
        scheduleSection.style.display = 'block';
        noScheduleMessage.style.display = 'none';
        scheduleControls.style.display = 'flex';

        const availableDates = Object.keys(movie.showtimes).sort((a, b) => new Date(a) - new Date(b));
        console.log("Доступные даты:", availableDates);

        dateSelector.innerHTML = '';
        availableDates.forEach(date => {
            const option = document.createElement('option');
            option.value = date;
            option.textContent = formatShortDate(date);
            dateSelector.appendChild(option);
        });

        let initialDate = '';
        console.log("Дата из URL:", selectedDateFromUrl);
        if (selectedDateFromUrl && availableDates.includes(selectedDateFromUrl)) {
            initialDate = selectedDateFromUrl;
            console.log("Используем дату из URL:", initialDate);
        } else if (availableDates.length > 0) {
            initialDate = availableDates[0];
            console.log("Используем первую доступную дату:", initialDate);
        } else {
             console.log("Не удалось определить начальную дату.");
        }

        if (initialDate) {
            dateSelector.value = initialDate;
            console.log("Установлено значение селектора:", dateSelector.value);
            displayShowtimes(initialDate);
        } else {
             scheduleControls.style.display = 'none';
             displayShowtimes(null);
        }
        dateSelector.addEventListener('change', (event) => {
            displayShowtimes(event.target.value);
        });

    } else {
        scheduleSection.style.display = 'block';
        scheduleControls.style.display = 'none';
        showtimesListContainer.style.display = 'none';
        noScheduleMessage.style.display = 'block';
        console.log("Расписание для фильма отсутствует.");
    }

    function closeModal() {
        if (trailerModal && trailerIframe) {
            trailerModal.classList.remove('open');
            trailerIframe.src = "";
            document.body.classList.remove('no-scroll');
        }
    }

    if (playButton && trailerModal && closeModalButton && trailerIframe && movie.trailerUrl) {
        playButton.style.display = 'flex';
        playButton.style.opacity = '1';
        playButton.style.visibility = 'visible';

        playButton.addEventListener('click', () => {
            const separator = movie.trailerUrl.includes('?') ? '&' : '?';
            trailerIframe.src = `${movie.trailerUrl}${separator}autoplay=1`;
            trailerModal.classList.add('open');
            document.body.classList.add('no-scroll');
        });

        closeModalButton.addEventListener('click', closeModal);

        trailerModal.addEventListener('click', (event) => {
            if (event.target === trailerModal) {
                closeModal();
            }
        });

    } else {
        if (playButton) {
            playButton.style.display = 'none';
        }
        console.log("Функционал трейлера отключен.");
    }

});
// --- END OF FILE js/moviePage.js ---