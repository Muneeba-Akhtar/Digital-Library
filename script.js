/*
    Digi-Library
    API: Google Books API
    Documentation:
    https://developers.google.com/books/docs/v1/using
    https://developers.google.com/books/docs/v1/reference/volumes

    No API key is required for these basic public requests.
*/

const API_URL = "https://www.googleapis.com/books/v1/volumes";
const BOOKS_TO_SHOW = 6;

// A small starter collection. The API supplies the real title, author and cover.
const BOOK_QUERY = "subject:fiction";

// Run after the HTML has loaded.
document.addEventListener("DOMContentLoaded", loadBooks);

async function loadBooks() {
    const container = document.getElementById("books-container");

    try {
        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(BOOK_QUERY)}&maxResults=${BOOKS_TO_SHOW}&printType=books`
        );

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        // Remove books without the information needed by the homepage.
        const books = (data.items || [])
            .filter(book => book.volumeInfo?.title && book.volumeInfo?.authors)
            .slice(0, BOOKS_TO_SHOW);

        container.innerHTML = "";

        books.forEach(book => {
            container.appendChild(createBookCard(book));
        });

        if (books.length === 0) {
            container.innerHTML = "<p>No books were found.</p>";
        }
    } catch (error) {
        console.error("Could not load books:", error);
        container.innerHTML = "<p>Sorry, the books could not be loaded. Please try again.</p>";
    }
}

function createBookCard(book) {
    const info = book.volumeInfo;

    const card = document.createElement("div");
    card.className = "books";

    const image = document.createElement("div");
    image.className = "book-image";

    const cover =
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail ||
        "https://via.placeholder.com/130x200?text=No+Cover";

    image.style.backgroundImage = `url("${cover.replace("http:", "https:")}")`;
    image.setAttribute("role", "img");
    image.setAttribute("aria-label", `${info.title} cover`);

    const title = document.createElement("div");
    title.className = "book-title";
    title.textContent = info.title;
    title.style.cursor = "pointer";
    title.addEventListener("click", () => openDetails(book.id));

    const author = document.createElement("div");
    author.className = "book-author";

    const authorLabel = document.createElement("p");
    authorLabel.textContent = "Author";

    author.appendChild(authorLabel);
    author.appendChild(
        document.createTextNode((info.authors || ["Unknown author"]).join(", "))
    );

    const readButton = document.createElement("div");
    readButton.className = "view";
    readButton.textContent = " READ NOW ";
    readButton.style.cursor = "pointer";
    readButton.setAttribute("role", "button");
    readButton.setAttribute("tabindex", "0");

    readButton.addEventListener("click", () => openDetails(book.id));
    readButton.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            openDetails(book.id);
        }
    });

    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(author);
    card.appendChild(readButton);

    return card;
}

function openDetails(bookId) {
    // Opens the details page in a new tab and passes the Google Books ID.
    window.open(`book-details.html?id=${encodeURIComponent(bookId)}`, "_blank");
}
