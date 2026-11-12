
const API_URL = "https://booknest-backend-h49h.onrender.com";

// Get the saved books container
const libraryContainer = document.getElementById("my-library-books");

// Load books saved by the logged-in user
async function loadMyLibrary() {

    const token = localStorage.getItem("access_token");

    // Check whether the user is logged in
    if (!token) {
        libraryContainer.innerHTML = `
            <p>Please log in to view your personal library.</p>
            <a href="auth.html">Login here</a>
        `;
        return;
    }

    try {

        const response = await fetch(`${API_URL}/my-library`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Could not load your library");
        }

        const books = await response.json();

        libraryContainer.innerHTML = "";

        // Show message if no books are saved
        if (books.length === 0) {
            libraryContainer.innerHTML = `
                <p>You haven't saved any books yet.</p>
                <a href="index.html#library">Explore books</a>
            `;
            return;
        }

        // Display each saved book
        books.forEach(book => {

            const bookCard = document.createElement("div");
            bookCard.classList.add("book-card");

            bookCard.innerHTML = `
                <img src="${book.image || ''}"
                     alt="${book.title}"
                     class="book-cover">

                <h3>${book.title}</h3>
                <p>${book.author}</p>

                <a href="${book.book_url || '#'}"
                   target="_blank"
                   rel="noopener noreferrer"
                   class="read-button">
                    Read Now
                </a>

                <button class="remove-button"
                        data-book-id="${book.id}">
                    Remove
                </button>
            `;

            libraryContainer.appendChild(bookCard);
        });

    } catch (error) {
        console.error(error);
        libraryContainer.innerHTML = `
            <p>Unable to load your library. Please try again.</p>
        `;
    }
}

// Load the library when the page opens
loadMyLibrary();
libraryContainer.addEventListener("click", async function(event) {

    const removeButton = event.target.closest(".remove-button");

    if (!removeButton) {
        return;
    }

    const bookId = removeButton.dataset.bookId;
    const token = localStorage.getItem("access_token");

    try {

        const response = await fetch(`${API_URL}/my-library/${bookId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error("Could not remove book");
        }

        alert("Book removed from your library!");

        loadMyLibrary();

    } catch (error) {
        console.error(error);
        alert("Unable to remove book.");
    }

});