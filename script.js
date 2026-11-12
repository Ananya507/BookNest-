

/* =========================================
   BOOKNEST — MAIN JAVASCRIPT
========================================= */

const API_URL = "https://booknest-backend-h49h.onrender.com";

/* =========================================
   1. SEARCH AND CATEGORY FILTERS
========================================= */

const searchForm = document.getElementById("search-form");
const searchInput = document.getElementById("search-input");
const categoryButtons = document.querySelectorAll(".category-button");
const noResults = document.getElementById("no-results");
const clearFiltersButton = document.getElementById("clear-filters");

let activeCategory = "all";

function filterBooks() {
    const query = searchInput.value.trim().toLowerCase();
    let visibleBooks = 0;

    document.querySelectorAll(".explore-library .book-card").forEach((card) => {
        const title = card.querySelector(".book-title");

        if (!title) return;

        const category = card.dataset.category || "";

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

// Search button and Enter key
searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    filterBooks();
});

// Category filters
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

// Clear filters
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


/* =========================================
   2. BOOK PREVIEW
========================================= */

const previewDialog = document.getElementById("book-preview");
const previewTitle = document.getElementById("preview-title");
const previewAuthor = document.getElementById("preview-author");
const previewDescription = document.getElementById("preview-description");
const closePreviewButton = document.getElementById("close-preview");

closePreviewButton.addEventListener("click", () => {
    previewDialog.close();
});

function openBookPreview(bookCard) {
    const title = bookCard.querySelector(".book-title");
    const author = bookCard.querySelector("p");

    if (!title || !author) return;

    previewTitle.textContent = title.textContent;
    previewAuthor.textContent = author.textContent;

    previewDescription.textContent =
        `Discover ${title.textContent} and learn more about this book on BookNest.`;

    previewDialog.showModal();
}


/* =========================================
   3. BOOKMARK BUTTON CREATION
========================================= */

function createBookmarkButton(bookId) {
    const saveButton = document.createElement("button");

    saveButton.classList.add("save-button", "bookmark-button");

    saveButton.dataset.bookId = bookId;

    saveButton.setAttribute("aria-label", "Save to My Library");
    saveButton.title = "Save to My Library";

    saveButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg"
             width="26"
             height="30"
             viewBox="0 0 24 24">
            <path
                d="M6 3h12v18l-6-4-6 4V3z"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"/>
        </svg>
    `;

    return saveButton;
}


/* =========================================
   4. ADD BOOKMARKS TO EXISTING HTML BOOKS
========================================= */

async function addBookmarksToExistingBooks(books) {
    const existingCards = document.querySelectorAll(
        ".featured-books .book-card, .explore-library .book-card"
    );

    existingCards.forEach((card) => {
        const title = card.querySelector(".book-title");

        if (!title) return;

        // Avoid creating duplicate bookmark buttons
        if (card.querySelector(".save-button")) return;

        const matchingBook = books.find(
            (book) =>
                book.title.trim().toLowerCase() ===
                title.textContent.trim().toLowerCase()
        );

        if (!matchingBook) return;

        const saveButton = createBookmarkButton(matchingBook.id);

        const buttonGroup = card.querySelector(".button-group");

        if (buttonGroup) {
            card.insertBefore(saveButton, buttonGroup);
        }
    });
}


/* =========================================
   5. LOAD BOOKS FROM DATABASE
========================================= */

async function loadBooks() {
    try {
        const response = await fetch(`${API_URL}/books`);

        if (!response.ok) {
            throw new Error("Could not load books from database.");
        }

        const books = await response.json();

        // Add bookmarks to existing HTML books
        await addBookmarksToExistingBooks(books);

        const container = document.getElementById("library");

        books.forEach((book) => {
            const bookElement = document.createElement("article");

            bookElement.classList.add("book-card");
            bookElement.dataset.category =
                (book.category || "").toLowerCase();

            // Book cover
            const imageElement = document.createElement("img");

            imageElement.classList.add("book-cover");
            imageElement.src = `./${book.image}`;
            imageElement.alt = book.title;

            bookElement.appendChild(imageElement);

            // Book title
            const titleElement = document.createElement("h3");

            titleElement.classList.add("book-title");
            titleElement.textContent = book.title;

            bookElement.appendChild(titleElement);

            // Author
            const authorElement = document.createElement("p");

            authorElement.textContent = `Author: ${book.author}`;

            bookElement.appendChild(authorElement);

            // Category
            const categoryElement = document.createElement("p");

            categoryElement.textContent =
                `Category: ${book.category || "Uncategorized"}`;

            bookElement.appendChild(categoryElement);

            // Preview button
            const previewButton = document.createElement("button");

            previewButton.textContent = "Preview";
            previewButton.classList.add("preview-button");

            // Read Now button
            const readButton = document.createElement("button");

            readButton.textContent = "Read Now";
            readButton.classList.add("read-button");
            readButton.dataset.bookUrl = book.book_url || "";

            // Bookmark button
            const saveButton = createBookmarkButton(book.id);

            // Button group
            const buttonGroup = document.createElement("div");

            buttonGroup.classList.add("button-group");

            buttonGroup.appendChild(previewButton);
            buttonGroup.appendChild(readButton);

            bookElement.appendChild(saveButton);
            bookElement.appendChild(buttonGroup);

            container.appendChild(bookElement);
        });

        // Update bookmarks after all books have loaded
        await updateBookmarkStates();

        // Apply current search and category filters
        filterBooks();

        console.log("Books loaded successfully:", books);

    } catch (error) {
        console.error("Error loading books:", error);
    }
}


/* =========================================
   6. UPDATE SAVED BOOKMARK STATES
========================================= */

async function updateBookmarkStates() {
    const token = localStorage.getItem("access_token");

    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/my-library`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const savedBooks = await response.json();

        const savedBookIds = new Set(
            savedBooks.map((book) => String(book.id))
        );

        document.querySelectorAll(".save-button").forEach((button) => {
            const isSaved = savedBookIds.has(button.dataset.bookId);

            button.classList.toggle("saved", isSaved);
        });

    } catch (error) {
        console.error("Could not load bookmark states:", error);
    }
}


/* =========================================
   7. LOGIN VERIFICATION
========================================= */

async function checkLogin() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.log("User is not logged in.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();

            console.log("Logged-in user:", user.email);

        } else {
            console.log("Authentication failed.");
        }

    } catch (error) {
        console.error("Login verification failed:", error);
    }
}


/* =========================================
   8. LOAD MY LIBRARY DATA
========================================= */

async function loadMyLibrary() {
    const token = localStorage.getItem("access_token");

    if (!token) {
        console.log("Please log in to view your library.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/my-library`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.log("Could not load your library.");
            return;
        }

        const books = await response.json();

        console.log("My saved books:", books);

    } catch (error) {
        console.error("Error loading library:", error);
    }
}


/* =========================================
   9. CLICK HANDLER
   Preview, Read Now and Save/Remove
========================================= */

document.addEventListener("click", async (event) => {

    // Preview button
    const previewButton = event.target.closest(".preview-button");

    if (previewButton) {
        const bookCard = previewButton.closest(".book-card");

        if (bookCard) {
            openBookPreview(bookCard);
        }

        return;
    }

    // Read Now button
    const readButton = event.target.closest(".read-button");

    if (readButton) {
        const bookUrl = readButton.dataset.bookUrl;

        if (bookUrl) {
            window.open(bookUrl, "_blank", "noopener,noreferrer");
        } else {
            alert("Reading link is not available for this book yet.");
        }

        return;
    }

    // Save or remove bookmark
    const clickedSaveButton = event.target.closest(".save-button");

    if (!clickedSaveButton) return;

    const bookId = clickedSaveButton.dataset.bookId;
    const token = localStorage.getItem("access_token");

    if (!token) {
        alert("Please log in first!");
        return;
    }

    const isSaved = clickedSaveButton.classList.contains("saved");

    // Prevent repeated clicks while the request is processing
    if (clickedSaveButton.disabled) return;

    clickedSaveButton.disabled = true;

    try {
        const response = await fetch(
            `${API_URL}/my-library/${bookId}`,
            {
                method: isSaved ? "DELETE" : "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.detail || "Could not update your library."
            );
        }

        // Update bookmark appearance
        clickedSaveButton.classList.toggle("saved", !isSaved);

        alert(
            isSaved
                ? "Book removed from your library!"
                : "Book saved to your library!"
        );

    } catch (error) {
        console.error("Bookmark error:", error);
        alert(error.message);

    } finally {
        clickedSaveButton.disabled = false;
    }
});


/* =========================================
   10. START BOOKNEST
========================================= */

checkLogin();
loadMyLibrary();
loadBooks();
