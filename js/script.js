const menuBtn = document.querySelector(".menuBtn");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {
    menuBtn.addEventListener("click", () => {
        nav.classList.toggle("open");
    });

    nav.addEventListener("click", (event) => {
        const link = event.target.closest("a");

        if (!link) {
            return;
        }

        nav.classList.remove("open");
    });
}

let cats = [];

const catsGrid = document.querySelector("#catsGrid");
const template = document.querySelector("#catCardTemplate");
const filtersContainer = document.querySelector(".filters");

const showMoreButton = document.querySelector("#showMoreCats");
const showAllButton = document.querySelector("#showAllCats");
const catsMore = document.querySelector(".catsMore");

const CATS_PER_PAGE = 3;

let activeFilter = "all";
let visibleCatsCount = CATS_PER_PAGE;

function createCatCard(cat) {
    const card = template.content.cloneNode(true);

    const article = card.querySelector(".catCard");
    const image = card.querySelector(".catImg");
    const name = card.querySelector(".catName");
    const birthday = card.querySelector(".catBirthday");
    const description = card.querySelector(".catDescription");

    article.dataset.cat = cat.id;
    article.dataset.tags = cat.location;

    image.src = cat.image;
    image.alt = `Кот ${cat.name}`;

    name.textContent = cat.name;

    birthday.textContent = cat.birthday;
    description.textContent = cat.description;

    return card;
}

function getFilteredCats() {
    if (activeFilter === "all") {
        return cats;
    }

    return cats.filter((cat) => {
        return cat.location === activeFilter;
    });
}

function updateButtons(totalCats) {
    const hasHiddenCats = visibleCatsCount < totalCats;

    showMoreButton.hidden = !hasHiddenCats;
    showAllButton.hidden = !hasHiddenCats;

    catsMore.hidden = totalCats <= CATS_PER_PAGE;
}

function renderCats() {
    const filteredCats = getFilteredCats();
    const visibleCats = filteredCats.slice(0, visibleCatsCount);

    const fragment = document.createDocumentFragment();

    visibleCats.forEach((cat) => {
        fragment.append(createCatCard(cat));
    });

    catsGrid.replaceChildren(fragment);

    updateButtons(filteredCats.length);
}

async function loadCats() {
    if (!catsGrid || !template) {
        return;
    }

    try {
        const response = await fetch("/data/cats.json");

        if (!response.ok) {
            throw new Error(
                `Ошибка загрузки cats.json: ${response.status}`
            );
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            throw new TypeError(
                "cats.json должен содержать массив котов"
            );
        }

        cats = data;
        renderCats();
    } catch (error) {
        console.error("Не удалось загрузить котов:", error);

        catsGrid.innerHTML =
            '<p class="catsError">' +
            "Не удалось загрузить список котиков. " +
            "Обновите страницу позже." +
            "</p>";

        if (catsMore) {
            catsMore.hidden = true;
        }
    }
}

showMoreButton?.addEventListener("click", () => {
    visibleCatsCount += CATS_PER_PAGE;
    renderCats();
});
showAllButton?.addEventListener("click", () => {
    visibleCatsCount = getFilteredCats().length;
    renderCats();
});

filtersContainer?.addEventListener("click", (event) => {
    const button = event.target.closest(".filter");

    if (!button) {
        return;
    }

    filtersContainer.querySelectorAll(".filter").forEach((item) => {
        item.classList.remove("active");
    });

    button.classList.add("active");

    activeFilter = button.dataset.filter;
    visibleCatsCount = CATS_PER_PAGE;

    renderCats();
});


const modal = document.querySelector("#catModal");

if (!modal) {
    console.error("Модальное окно не найдено");
}
const modalTitle = document.querySelector("#modalTitle");
const modalLocation = document.querySelector("#modalLocation");
const modalText = document.querySelector("#modalText");
const modalImg = document.querySelector("#modalImg");
const modalClose = document.querySelector(".modalClose");
const modalOverlay = document.querySelector(".modalOverlay");
let lastFocusedElement = null;

function getLocationName(location) {
    const filterButton = document.querySelector(
        `.filter[data-filter="${location}"]`
    );

    return filterButton ?
        filterButton.textContent.trim() :
        location;
}

function openCatModal(id) {
    const cat = cats.find((item) => item.id === id);

    if (
        !cat ||
        !modal ||
        !modalTitle ||
        !modalLocation ||
        !modalText ||
        !modalImg
    ) {
        return;
    }

    lastFocusedElement = document.activeElement;

    modal.removeAttribute("inert");

    modalTitle.textContent = cat.name;
    modalLocation.textContent = getLocationName(cat.location);
    modalText.textContent = cat.text;

    modalImg.src = cat.image;
    modalImg.alt = `Кот ${cat.name}`;

    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}

function closeCatModal() {
    if (!modal) {
        return;
    }

    modal.classList.remove("open");

    modal.setAttribute("aria-hidden", "true");
    modal.setAttribute("inert", "");

    document.body.style.overflow = "";

    lastFocusedElement?.focus();
}


catsGrid?.addEventListener("click", (event) => {
    const card = event.target.closest(".catCard");

    if (!card) {
        return;
    }

    openCatModal(card.dataset.cat);
});


modalClose?.addEventListener("click", closeCatModal);
modalOverlay?.addEventListener("click", closeCatModal);

document.addEventListener("keydown", (event) => {
    if (
        event.key === "Escape" &&
        modal?.classList.contains("open")
    ) {
        closeCatModal();
    }
});

loadCats();

document.addEventListener("DOMContentLoaded", function () {

    function lockPage() {
        document.body.style.overflow = "hidden";
    }

    function unlockPage() {
        document.body.style.overflow = "";
    }

    function normalizeIndex(index, length) {
        if (length === 0) {
            return 0;
        }

        if (index < 0) {
            return length - 1;
        }

        if (index >= length) {
            return 0;
        }

        return index;
    }


    var teamImages = Array.from(
        document.querySelectorAll(".teamGallery__image")
    );

    var teamModal = document.querySelector(".teamModal");
    var teamModalWindow = document.querySelector(".teamModal__window");
    var teamModalImage = document.querySelector(".teamModal__image");
    var teamModalOverlay = document.querySelector(".teamModal__overlay");
    var teamCloseButton = document.querySelector(".teamModal__close");
    var teamPreviousButton = document.querySelector(
        ".teamModal__nav--prev"
    );
    var teamNextButton = document.querySelector(
        ".teamModal__nav--next"
    );

    var currentTeamIndex = 0;

    function updateTeamImage() {
        if (!teamModalImage || teamImages.length === 0) {
            return;
        }

        currentTeamIndex = normalizeIndex(
            currentTeamIndex,
            teamImages.length
        );

        var selectedImage = teamImages[currentTeamIndex];

        teamModalImage.src = selectedImage.currentSrc || selectedImage.src;
        teamModalImage.alt = selectedImage.alt || "Фотография команды";
    }

    function openTeamModal(index) {
        if (!teamModal || !teamModalImage) {
            return;
        }

        currentTeamIndex = index;
        updateTeamImage();

        teamModal.classList.add("open");
        teamModal.setAttribute("aria-hidden", "false");

        lockPage();
    }

    function closeTeamModal() {
        if (!teamModal) {
            return;
        }

        teamModal.classList.remove("open");
        teamModal.setAttribute("aria-hidden", "true");

        resetSwipeElement(teamModalImage);
        unlockPage();
    }

    function showPreviousTeamImage() {
        currentTeamIndex = currentTeamIndex - 1;
        updateTeamImage();
    }

    function showNextTeamImage() {
        currentTeamIndex = currentTeamIndex + 1;
        updateTeamImage();
    }

    teamImages.forEach(function (image, index) {
        image.addEventListener("click", function () {
            openTeamModal(index);
        });
    });

    if (teamCloseButton) {
        teamCloseButton.addEventListener("click", closeTeamModal);
    }

    if (teamPreviousButton) {
        teamPreviousButton.addEventListener(
            "click",
            showPreviousTeamImage
        );
    }

    if (teamNextButton) {
        teamNextButton.addEventListener(
            "click",
            showNextTeamImage
        );
    }

    if (teamModalOverlay) {
        teamModalOverlay.addEventListener(
            "click",
            closeTeamModal
        );
    }
    var nannyTrack = document.querySelector(
        ".catNannyGallery__track"
    );

    var nannyGalleryPreviousButton = document.querySelector(
        ".catNannyGallery__arrow--prev"
    );

    var nannyGalleryNextButton = document.querySelector(
        ".catNannyGallery__arrow--next"
    );
    var nannyItems = Array.from(
        document.querySelectorAll(".catNannyGallery__item")
    );

    var nannyImages = nannyItems
        .map(function (item) {
            return item.querySelector("img");
        })
        .filter(function (image) {
            return image !== null;
        });

    var nannyModal = document.querySelector("#nannyModal");
    var nannyModalWindow = document.querySelector(
        ".nannyModal__window"
    );
    var nannyModalImageWrap = document.querySelector(
        ".nannyModal__imageWrap"
    );
    var nannyModalImage = document.querySelector(
        ".nannyModal__image"
    );
    var nannyCloseButton = document.querySelector(
        ".nannyModal__close"
    );
    var nannyPreviousButton = document.querySelector(
        ".nannyModal__nav--prev"
    );
    var nannyNextButton = document.querySelector(
        ".nannyModal__nav--next"
    );

    var currentNannyIndex = 0;

    function scrollNannyGallery(direction) {
        if (!nannyTrack || nannyItems.length === 0) {
            return;
        }

        var isMobile = window.matchMedia(
            "(max-width: 560px)"
        ).matches;

        if (isMobile) {
            var gap = parseFloat(
                window.getComputedStyle(nannyTrack).gap
            ) || 0;

            var itemWidth =
                nannyItems[0].getBoundingClientRect().width;

            var itemStep = itemWidth + gap;

            var currentIndex = Math.round(
                nannyTrack.scrollLeft / itemStep
            );

            var nextIndex = currentIndex + direction;

            if (nextIndex >= nannyItems.length) {
                nextIndex = 0;
            }

            if (nextIndex < 0) {
                nextIndex = nannyItems.length - 1;
            }

            nannyTrack.scrollTo({
                left: nextIndex * itemStep,
                behavior: "smooth"
            });

            return;
        }

        var maxScrollLeft =
            nannyTrack.scrollWidth - nannyTrack.clientWidth;

        var nearStart = nannyTrack.scrollLeft <= 5;

        var nearEnd =
            nannyTrack.scrollLeft >= maxScrollLeft - 5;

        if (direction > 0 && nearEnd) {
            nannyTrack.scrollTo({
                left: 0,
                behavior: "smooth"
            });

            return;
        }

        if (direction < 0 && nearStart) {
            nannyTrack.scrollTo({
                left: maxScrollLeft,
                behavior: "smooth"
            });

            return;
        }

        nannyTrack.scrollBy({
            left: direction *
                nannyTrack.clientWidth *
                0.85,
            behavior: "smooth"
        });
    }

    if (nannyGalleryPreviousButton) {
        nannyGalleryPreviousButton.addEventListener(
            "click",
            function () {
                scrollNannyGallery(-1);
            }
        );
    }

    if (nannyGalleryNextButton) {
        nannyGalleryNextButton.addEventListener(
            "click",
            function () {
                scrollNannyGallery(1);
            }
        );
    }


    function updateNannyImage() {
        if (!nannyModalImage || nannyImages.length === 0) {
            return;
        }

        currentNannyIndex = normalizeIndex(
            currentNannyIndex,
            nannyImages.length
        );

        var selectedImage = nannyImages[currentNannyIndex];

        nannyModalImage.src =
            selectedImage.currentSrc || selectedImage.src;

        nannyModalImage.alt =
            selectedImage.alt || "Отзыв о работе котоняни";
    }

    function openNannyModal(index) {
        if (!nannyModal || !nannyModalImage) {
            return;
        }

        currentNannyIndex = index;
        updateNannyImage();

        if (typeof nannyModal.showModal === "function") {
            if (!nannyModal.open) {
                nannyModal.showModal();
            }
        } else {
            nannyModal.setAttribute("open", "");
        }

        lockPage();
    }

    function closeNannyModal() {
        if (!nannyModal) {
            return;
        }

        if (
            typeof nannyModal.close === "function" &&
            nannyModal.open
        ) {
            nannyModal.close();
        } else {
            nannyModal.removeAttribute("open");
        }

        resetSwipeElement(nannyModalImageWrap);
        unlockPage();
    }

    function showPreviousNannyImage() {
        currentNannyIndex = currentNannyIndex - 1;
        updateNannyImage();
    }

    function showNextNannyImage() {
        currentNannyIndex = currentNannyIndex + 1;
        updateNannyImage();
    }

    nannyItems.forEach(function (item, index) {
        item.addEventListener("click", function () {
            openNannyModal(index);
        });
    });

    if (nannyCloseButton) {
        nannyCloseButton.addEventListener(
            "click",
            closeNannyModal
        );
    }

    if (nannyPreviousButton) {
        nannyPreviousButton.addEventListener(
            "click",
            showPreviousNannyImage
        );
    }

    if (nannyNextButton) {
        nannyNextButton.addEventListener(
            "click",
            showNextNannyImage
        );
    }

    if (nannyModal) {
        nannyModal.addEventListener("click", function (event) {
            if (event.target === nannyModal) {
                closeNannyModal();
            }
        });

        nannyModal.addEventListener("cancel", function (event) {
            event.preventDefault();
            closeNannyModal();
        });

        nannyModal.addEventListener("close", function () {
            resetSwipeElement(nannyModalImageWrap);
            unlockPage();
        });
    }


    var helpPhotoButton = document.querySelector(
        ".helpInfo__photoButton"
    );
    var helpPhoto = document.querySelector(
        ".helpInfo__photo"
    );
    var helpPhotoModal = document.querySelector(
        "#helpPhotoModal"
    );
    var helpPhotoModalImage = document.querySelector(
        ".helpPhotoModal__image"
    );
    var helpPhotoCloseButton = document.querySelector(
        ".helpPhotoModal__close"
    );

    function openHelpPhotoModal() {
        if (
            !helpPhoto ||
            !helpPhotoModal ||
            !helpPhotoModalImage
        ) {
            return;
        }

        helpPhotoModalImage.src =
            helpPhoto.currentSrc || helpPhoto.src;

        helpPhotoModalImage.alt =
            helpPhoto.alt || "Изображение";

        if (typeof helpPhotoModal.showModal === "function") {
            if (!helpPhotoModal.open) {
                helpPhotoModal.showModal();
            }
        } else {
            helpPhotoModal.setAttribute("open", "");
        }

        lockPage();
    }

    function closeHelpPhotoModal() {
        if (!helpPhotoModal) {
            return;
        }

        if (
            typeof helpPhotoModal.close === "function" &&
            helpPhotoModal.open
        ) {
            helpPhotoModal.close();
        } else {
            helpPhotoModal.removeAttribute("open");
        }

        resetSwipeElement(helpPhotoModalImage);
        unlockPage();
    }

    if (helpPhotoButton) {
        helpPhotoButton.addEventListener(
            "click",
            openHelpPhotoModal
        );
    } else if (helpPhoto) {
        helpPhoto.addEventListener(
            "click",
            openHelpPhotoModal
        );
    }

    if (helpPhotoCloseButton) {
        helpPhotoCloseButton.addEventListener(
            "click",
            closeHelpPhotoModal
        );
    }

    if (helpPhotoModal) {
        helpPhotoModal.addEventListener(
            "click",
            function (event) {
                if (event.target === helpPhotoModal) {
                    closeHelpPhotoModal();
                }
            }
        );

        helpPhotoModal.addEventListener(
            "cancel",
            function (event) {
                event.preventDefault();
                closeHelpPhotoModal();
            }
        );

        helpPhotoModal.addEventListener(
            "close",
            function () {
                resetSwipeElement(helpPhotoModalImage);
                unlockPage();
            }
        );
    }



    function resetSwipeElement(element) {
        if (!element) {
            return;
        }

        element.style.transition =
            "transform 0.2s ease, opacity 0.2s ease";

        element.style.transform = "";
        element.style.opacity = "";
    }

    function addModalSwipe(options) {
        var swipeArea = options.swipeArea;
        var movingElement = options.movingElement;
        var onPrevious = options.onPrevious;
        var onNext = options.onNext;
        var onClose = options.onClose;

        if (!swipeArea || !movingElement) {
            return;
        }

        var startX = 0;
        var startY = 0;
        var currentX = 0;
        var currentY = 0;
        var pointerId = null;
        var isSwiping = false;

        var horizontalLimit = 60;
        var closeLimit = 90;

        function isMobile() {
            return window.matchMedia(
                "(max-width: 560px)"
            ).matches;
        }

        function releasePointer(event) {
            try {
                if (
                    swipeArea.hasPointerCapture &&
                    swipeArea.hasPointerCapture(event.pointerId)
                ) {
                    swipeArea.releasePointerCapture(
                        event.pointerId
                    );
                }
            } catch (error) {

            }

            pointerId = null;
        }

        function cancelSwipe(event) {
            isSwiping = false;
            resetSwipeElement(movingElement);

            if (event) {
                releasePointer(event);
            }
        }

        swipeArea.addEventListener(
            "pointerdown",
            function (event) {
                if (!isMobile()) {
                    return;
                }

                if (event.pointerType === "mouse") {
                    return;
                }

                if (
                    event.target.closest &&
                    event.target.closest("button")
                ) {
                    return;
                }

                startX = event.clientX;
                startY = event.clientY;
                currentX = event.clientX;
                currentY = event.clientY;

                pointerId = event.pointerId;
                isSwiping = true;

                movingElement.style.transition = "none";

                try {
                    if (swipeArea.setPointerCapture) {
                        swipeArea.setPointerCapture(
                            event.pointerId
                        );
                    }
                } catch (error) {

                }
            }
        );

        swipeArea.addEventListener(
            "pointermove",
            function (event) {
                if (
                    !isSwiping ||
                    event.pointerId !== pointerId ||
                    !isMobile()
                ) {
                    return;
                }

                currentX = event.clientX;
                currentY = event.clientY;

                var differenceX = currentX - startX;
                var differenceY = currentY - startY;

                movingElement.style.transform =
                    "translate3d(" +
                    differenceX +
                    "px, " +
                    differenceY +
                    "px, 0)";

                var distance = Math.min(
                    Math.abs(differenceX) +
                    Math.abs(differenceY),
                    240
                );

                movingElement.style.opacity = String(
                    Math.max(0.5, 1 - distance / 450)
                );
            }
        );

        swipeArea.addEventListener(
            "pointerup",
            function (event) {
                if (
                    !isSwiping ||
                    event.pointerId !== pointerId
                ) {
                    return;
                }

                isSwiping = false;

                var differenceX = currentX - startX;
                var differenceY = currentY - startY;

                var horizontalDistance =
                    Math.abs(differenceX);

                var verticalDistance =
                    Math.abs(differenceY);

                resetSwipeElement(movingElement);

                if (
                    differenceY > closeLimit &&
                    verticalDistance > horizontalDistance
                ) {
                    if (typeof onClose === "function") {
                        onClose();
                    }

                    releasePointer(event);
                    return;
                }

                if (
                    differenceX < -horizontalLimit &&
                    horizontalDistance > verticalDistance
                ) {
                    if (typeof onNext === "function") {
                        onNext();
                    }

                    releasePointer(event);
                    return;
                }

                if (
                    differenceX > horizontalLimit &&
                    horizontalDistance > verticalDistance
                ) {
                    if (typeof onPrevious === "function") {
                        onPrevious();
                    }

                    releasePointer(event);
                    return;
                }

                releasePointer(event);
            }
        );

        swipeArea.addEventListener(
            "pointercancel",
            function (event) {
                cancelSwipe(event);
            }
        );
    }


    addModalSwipe({
        swipeArea: teamModalWindow,
        movingElement: teamModalImage,
        onPrevious: showPreviousTeamImage,
        onNext: showNextTeamImage,
        onClose: closeTeamModal
    });

    addModalSwipe({
        swipeArea: nannyModalWindow,
        movingElement: nannyModalImageWrap,
        onPrevious: showPreviousNannyImage,
        onNext: showNextNannyImage,
        onClose: closeNannyModal
    });

    addModalSwipe({
        swipeArea: helpPhotoModal,
        movingElement: helpPhotoModalImage,
        onClose: closeHelpPhotoModal
    });

    document.addEventListener("keydown", function (event) {

        if (
            teamModal &&
            teamModal.classList.contains("open")
        ) {
            if (event.key === "Escape") {
                closeTeamModal();
            }

            if (event.key === "ArrowLeft") {
                showPreviousTeamImage();
            }

            if (event.key === "ArrowRight") {
                showNextTeamImage();
            }

            return;
        }

        if (nannyModal && nannyModal.open) {
            if (event.key === "ArrowLeft") {
                showPreviousNannyImage();
            }

            if (event.key === "ArrowRight") {
                showNextNannyImage();
            }
        }
    });

});
