/*
    Digi-Library - Book Details

    Uses the same local book collection as the homepage.
    This keeps the details page working even when Google Books
    API is unavailable or rate-limited.
*/

const detailsContainer = document.getElementById("book-details");

document.addEventListener("DOMContentLoaded", loadBookDetails);


const BOOKS = {
    "pride-prejudice": {
        title: "Pride and Prejudice",
        authors: ["Jane Austen"],
        genre: "Classic Fiction",
        cover: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        description:
            "Pride and Prejudice is Jane Austen's celebrated novel about Elizabeth Bennet, Mr. Darcy, love, social expectations, and the misunderstandings that stand between people.",
        rating: 4.5,
        ratingsCount: 1200000,
        onlineReading: false,
        link: "https://www.gutenberg.org/ebooks/1342"
    },

    "great-gatsby": {
        title: "The Great Gatsby",
        authors: ["F. Scott Fitzgerald"],
        genre: "Classic Fiction",
        cover: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
        description:
            "The Great Gatsby explores wealth, ambition, love, and the American Dream through the mysterious Jay Gatsby and his obsession with the past.",
        rating: 4.2,
        ratingsCount: 900000,
        onlineReading: false,
        link: "https://www.gutenberg.org/ebooks/64317"
    },

    "1984": {
        title: "1984",
        authors: ["George Orwell"],
        genre: "Dystopian Fiction",
        cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        description:
            "George Orwell's 1984 presents a dystopian society dominated by surveillance, propaganda, censorship, and the control of truth.",
        rating: 4.4,
        ratingsCount: 1100000,
        onlineReading: false,
        link: "https://www.gutenberg.org/ebooks/26184"
    },

    "jane-eyre": {
        title: "Jane Eyre",
        authors: ["Charlotte Brontë"],
        genre: "Classic Fiction",
        cover: "https://covers.openlibrary.org/b/isbn/9780141441146-L.jpg",
        description:
            "Jane Eyre follows an independent young woman as she searches for love, identity, independence, and a place in the world.",
        rating: 4.5,
        ratingsCount: 800000,
        onlineReading: false,
        link: "https://www.gutenberg.org/ebooks/1260"
    },

    "dorian-gray": {
        title: "The Picture of Dorian Gray",
        authors: ["Oscar Wilde"],
        genre: "Gothic Fiction",
        cover: "https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg",
        description:
            "Oscar Wilde's novel follows Dorian Gray, whose portrait ages and records the consequences of his increasingly immoral life.",
        rating: 4.2,
        ratingsCount: 600000,
        onlineReading: false,
        link: "https://www.gutenberg.org/ebooks/174"
    },

    "little-women": {
        title: "Little Women",
        authors: ["Louisa May Alcott"],
        genre: "Classic Fiction",
        cover: "https://covers.openlibrary.org/b/isbn/9780147514011-L.jpg",
        description:
            "Little Women follows the four March sisters as they grow up, face challenges, discover love, and build lives of their own.",
        rating: 4.5,
        ratingsCount: 700000,
        onlineReading: false,
        link: "https://www.gutenberg.org/ebooks/37106"
    }
};


function loadBookDetails() {

    if (!detailsContainer) {
        console.error('Could not find element with id="book-details".');
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    if (!bookId) {
        showError("No book was selected.");
        return;
    }

    const book = BOOKS[bookId];

    if (!book) {
        showError("We couldn't find this book.");
        return;
    }

    renderBookDetails(book);
}


function renderBookDetails(book) {

    const title = book.title || "Unknown title";

    const authors =
        (book.authors || ["Unknown author"]).join(", ");

    const genre =
        book.genre || "Genre not available";

    const cover =
        book.cover ||
        "https://via.placeholder.com/300x450?text=No+Cover";

    const description =
        book.description ||
        "No description is available for this book.";

    const rating =
        book.rating
            ? `⭐ ${book.rating.toFixed(1)} / 5`
            : "No rating available.";


    detailsContainer.innerHTML = `

        <img
            class="big-cover"
            src="${escapeAttribute(cover)}"
            alt="Cover of ${escapeAttribute(title)}"
        >

        <h1>${escapeHTML(title)}</h1>

        <p class="author">
            <strong>Author:</strong>
            ${escapeHTML(authors)}
        </p>

        <p class="genre">
            <strong>Genre:</strong>
            ${escapeHTML(genre)}
        </p>


        <section class="blurb-section">
            <h2>About the Book</h2>

            <div class="blurb">
                <p>${escapeHTML(description)}</p>
            </div>
        </section>


        <section class="rating-section">
            <h2>Rating</h2>

            <p class="rating">
                ${rating}
            </p>
        </section>


        <section class="reading-section">
            <h2>Read Online</h2>

            <p>
                This book is available to read online.
            </p>

            <a
                class="action-link"
                href="${escapeAttribute(book.link)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Open Online Reader
            </a>
        </section>


        <section class="listing-section">
            <h2>Where to Find This Book</h2>

            <div class="listings">

                <a
                    class="listing"
                    href="${escapeAttribute(book.link)}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Project Gutenberg
                </a>

            </div>
        </section>

    `;

    document.title = `${title} | Digi-Library`;
}


function showError(message) {

    detailsContainer.innerHTML = `

        <p class="error">
            ${escapeHTML(message)}
        </p>

        <a
            class="action-link"
            href="index.html"
        >
            Return to Home
        </a>

    `;
}


function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = String(value ?? "");

    return div.innerHTML;
}


function escapeAttribute(value) {

    return escapeHTML(value)
        .replace(/"/g, "&quot;");
}