// --- START OF FILE js/slider.js ---

function setupSlider(options) {
    const {
        containerSelector,
        slidesSelector,
        dotsSelector,
        prevButtonSelector,
        nextButtonSelector,
        itemsPerView: initialItemsPerView = 1,
        itemsToScroll = 1,
        loop = false,
        onSlideChange 
    } = options;

    const sliderContainer = document.querySelector(containerSelector);
    if (!sliderContainer) { console.error(`Container not found: ${containerSelector}`); return null; }
    const slidesWrapper = sliderContainer.querySelector(slidesSelector);
    const dotsContainer = sliderContainer.querySelector(dotsSelector);
    const prevButton = sliderContainer.querySelector(prevButtonSelector);
    const nextButton = sliderContainer.querySelector(nextButtonSelector);
    if (!slidesWrapper || !prevButton || !nextButton) { console.error(`Essential elements missing for "${containerSelector}"`); return null; }

    let slides = Array.from(slidesWrapper.children);
    let totalItems = slides.length;
    if (totalItems === 0) { console.warn(`No slides found for "${containerSelector}"`); return null; }

    let currentIndex = 0;
    let slideWidth = 0; let gap = 0;
    let currentItemsPerView = 1; let currentItemsToScroll = itemsToScroll;
    let disableControls = false; let currentLoop = false;
    let maxIndex = 0;
    let isTransitioning = false;


    function goToSlide(index, animate = true) {
        if (isTransitioning && animate) return;
        if (totalItems === 0) return;

        let requestedIndex = index;
        let newIndex;

        if (currentLoop) {
            if (requestedIndex < 0) newIndex = maxIndex;
            else if (requestedIndex > maxIndex) newIndex = 0;
            else newIndex = requestedIndex;
        } else {
            newIndex = Math.max(0, Math.min(requestedIndex, maxIndex));
            if (newIndex === currentIndex && requestedIndex !== currentIndex) return;
        }

        const previousIndex = currentIndex;
        currentIndex = newIndex;

        if (newIndex !== previousIndex && typeof onSlideChange === 'function') {
            try {
                onSlideChange(currentIndex);
            } catch (e) {
                console.error("Error in onSlideChange callback:", e);
            }
        }

        let offset = 0;
        if (isFinite(slideWidth) && slideWidth > 0 && isFinite(gap)) {
            offset = -currentIndex * (slideWidth + gap);
        } else {
             console.warn(`Invalid values for offset calculation in "${containerSelector}"`);
        }


        if (animate) {
            isTransitioning = true;
            slidesWrapper.style.transition = 'transform 0.5s ease-in-out';
            slidesWrapper.removeEventListener('transitionend', onTransitionEnd);
            slidesWrapper.addEventListener('transitionend', onTransitionEnd, { once: true });
        } else {
            slidesWrapper.style.transition = 'none';
        }
        slidesWrapper.style.transform = `translateX(${offset}px)`;

        updateDots();
        updateButtons();
    }

    function onTransitionEnd() {
        isTransitioning = false;
    }

    function updateSliderDimensions() {
         slides = Array.from(slidesWrapper.children);
         totalItems = slides.length;
         if (totalItems === 0) return;

        currentItemsPerView = (typeof initialItemsPerView === 'function') ? (parseInt(initialItemsPerView()) || 1) : (parseInt(initialItemsPerView) || 1);
        currentItemsToScroll = parseInt(itemsToScroll) || 1;
        if (currentItemsPerView <= 0) currentItemsPerView = 1;
        if (currentItemsToScroll <= 0) currentItemsToScroll = 1;

        disableControls = totalItems <= currentItemsPerView;
        currentLoop = loop && !disableControls;
        maxIndex = Math.max(0, totalItems - currentItemsPerView);

        const containerWidth = sliderContainer.offsetWidth;
        const computedStyle = window.getComputedStyle(slidesWrapper);
        gap = parseFloat(computedStyle.gap) || 0;

        if (currentItemsPerView <= 0) { slideWidth = 0; } else { slideWidth = (containerWidth - (gap * (currentItemsPerView - 1))) / currentItemsPerView; }
        if (!isFinite(slideWidth) || slideWidth <= 0) { slideWidth = 0; }

        slides.forEach(slide => {
             if (slideWidth > 0) slide.style.width = `${slideWidth}px`;
             else slide.style.width = `calc(${100 / currentItemsPerView}% - ${gap * (currentItemsPerView - 1) / currentItemsPerView}px)`;
             slide.style.flexShrink = '0';
        });

        if (prevButton) prevButton.style.display = disableControls ? 'none' : 'flex';
        if (nextButton) nextButton.style.display = disableControls ? 'none' : 'flex';

        currentIndex = Math.max(0, Math.min(currentIndex, maxIndex));
        goToSlide(currentIndex, false);

        createDots();
        updateButtons();
    }

     function createDots() {
        if (!dotsContainer) return;
        dotsContainer.innerHTML = '';
        if (disableControls) { dotsContainer.style.display = 'none'; return; }

        const numDots = maxIndex + 1;
        if (numDots <= 1) { dotsContainer.style.display = 'none'; return; }
        dotsContainer.style.display = 'flex';

        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('button'); dot.className = 'dot';
            dot.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
            dot.addEventListener('click', () => goToSlide(i));
            dotsContainer.appendChild(dot);
        }
        updateDots();
    }

    function updateDots() {
        if (!dotsContainer || disableControls) return;
        const dots = dotsContainer.querySelectorAll('.dot');
        if (dots.length === 0) return;
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    function updateButtons() {
        if (!prevButton || !nextButton || disableControls) return;
        if (currentLoop) {
            prevButton.disabled = false; nextButton.disabled = false;
        } else {
            prevButton.disabled = currentIndex <= 0;
            nextButton.disabled = currentIndex >= maxIndex;
        }
    }

    console.log(`[slider.js "${containerSelector}"] Initialization started.`);
    updateSliderDimensions();

    if (prevButton && !disableControls) { prevButton.addEventListener('click', () => { goToSlide(currentIndex - currentItemsToScroll); }); }
    if (nextButton && !disableControls) { nextButton.addEventListener('click', () => { goToSlide(currentIndex + currentItemsToScroll); }); }

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            console.log(`[slider.js "${containerSelector}"] Resize detected. Updating.`);
            updateSliderDimensions();
        }, 250);
     });

    sliderContainer.sliderInstance = {
         goTo: goToSlide,
         update: updateSliderDimensions,
         getCurrentIndex: () => currentIndex
    };
    console.log(`[slider.js "${containerSelector}"] Initialization complete.`);
    return sliderContainer.sliderInstance;
}
// --- END OF FILE js/slider.js ---