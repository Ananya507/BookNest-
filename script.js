
const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const bookCards = document.querySelectorAll(
    ".explore-library .book-card"
);
const categoryButtons = document.querySelectorAll(".category-button");
const noResults = document.getElementById("no-results");

let activeCategory = "all";

function filterBooks() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleBooks = 0;

    bookCards.forEach((card) => {
        const title = card.querySelector(".book-title");
        const category = card.dataset.category;
        const titleMatches = title.textContent.toLowerCase().includes(query);
        const categoryMatches =
            activeCategory === "all" || category === activeCategory;

        if (titleMatches && categoryMatches) {
            card.style.display = "flex";
            visibleBooks++;
        } else {
            card.style.display = "none";
        }
    });

    noResults.hidden = visibleBooks > 0;
}

// Search as the user types
searchInput.addEventListener("input", filterBooks);

// Keep the Search button and Enter key working
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterBooks();
});

// Filter by category
categoryButtons.forEach((button) => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.filter;

        categoryButtons.forEach((categoryButton) => {
            const isActive = categoryButton === button;
            categoryButton.classList.toggle("active", isActive);
            categoryButton.setAttribute("aria-pressed", isActive);
        });

        filterBooks();
    });
});
const clearFiltersButton = document.getElementById("clear-filters");

clearFiltersButton.addEventListener("click", () => {
    searchInput.value = "";
    activeCategory = "all";

    categoryButtons.forEach((button) => {
        const isActive = button.dataset.filter === "all";

        button.classList.toggle("active", isActive);
        button.setAttribute("aria-pressed", isActive);
    });

    filterBooks();
});

// Book preview functionality
const previewDialog = document.getElementById("book-preview");
const previewTitle = document.getElementById("preview-title");
const previewAuthor = document.getElementById("preview-author");
const previewDescription = document.getElementById("preview-description");
const closePreviewButton = document.getElementById("close-preview");

const previewButtons = document.querySelectorAll(".book-card button");

previewButtons.forEach((button) => {
    if (button.textContent.trim().toLowerCase() !== "preview") {
        return;
    }

    button.addEventListener("click", () => {
        const bookCard = button.closest(".book-card");
        const title = bookCard.querySelector(".book-title").textContent;
        const author = bookCard.querySelector("p").textContent;

        previewTitle.textContent = title;
        previewAuthor.textContent = author;
        previewDescription.textContent =
            `Discover ${title} and learn more about this book on BookNest.`;

        previewDialog.showModal();
    });
});

closePreviewButton.addEventListener("click", () => {
    previewDialog.close();
});
// Read Now button functionality
const readButtons = document.querySelectorAll(".read-button");

readButtons.forEach((button) => {
    button.addEventListener("click", () => {
        const bookUrl = button.dataset.bookUrl;

        if (bookUrl) {
            window.open(bookUrl, "_blank", "noopener,noreferrer");
        } else {
            alert("Reading link is not available for this book yet.");
        }
    });
});