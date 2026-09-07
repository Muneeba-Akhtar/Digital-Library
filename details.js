/*
    Digi-Library - Book Details
    Uses Open Library for dynamic book details.
*/

const detailsContainer = document.getElementById("book-details");

document.addEventListener("DOMContentLoaded", loadBookDetails);

async function loadBookDetails() {
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

    detailsContainer.innerHTML = "<p>Loading book details...</p>";

    try {
        const response = await fetch(
            `https://openlibrary.org${bookId}.json`
        );

        if (!response.ok) {
            throw new Error(`Failed to load book: ${response.status}`);
        }

        const book = await response.json();

        renderBookDetails(book);

    } catch (error) {
        console.error("Could not load book details:", error);
        showError("We couldn't load this book. Please try again.");
    }
}

function renderBookDetails(book) {

    const title = book.title || "Unknown title";

    const authors = book.authors
        ? book.authors.map(author => author.author?.key).filter(Boolean)
        : [];

    const cover = book.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
        : "https://via.placeholder.com/300x450?text=No+Cover";

    const description =
        typeof book.description === "string"
            ? book.description
            : book.description?.value ||
              "No description is available for this book.";

    const subjects = book.subjects || [];
    const genre = subjects.length
        ? subjects.slice(0, 3).join(", ")
        : "Genre not available";

    detailsContainer.innerHTML = `

        <img
            class="big-cover"
            src="${escapeAttribute(cover)}"
            alt="Cover of ${escapeAttribute(title)}"
        >

        <h1>${escapeHTML(title)}</h1>

        <p class="author">
            <strong>Author:</strong>
            Loading...
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
                Rating information is not available through Open Library.
            </p>
        </section>

        <section class="reading-section">
            <h2>Read Online</h2>

            <p>
                Check Open Library for available reading options.
            </p>

            <a
                class="action-link"
                href="https://openlibrary.org${escapeAttribute(book.key || "")}"
                target="_blank"
                rel="noopener noreferrer"
            >
                Open in Open Library
            </a>
        </section>

        <section class="listing-section">
            <h2>Where to Find This Book</h2>

            <div class="listings">

                <a
                    class="listing"
                    href="https://openlibrary.org${escapeAttribute(book.key || "")}"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Open Library
                </a>

            </div>
        </section>

    `;

    document.title = `${title} | Digi-Library`;

    loadAuthors(authors);
}

async function loadAuthors(authorKeys) {

    if (!authorKeys.length) return;

    try {
        const authorNames = [];

        for (const key of authorKeys.slice(0, 3)) {
            const response = await fetch(
                `https://openlibrary.org${key}.json`
            );

            if (response.ok) {
                const author = await response.json();

                if (author.name) {
                    authorNames.push(author.name);
                }
            }
        }

        const authorElement = document.querySelector(".author");

        if (authorElement && authorNames.length) {
            authorElement.innerHTML =
                `<strong>Author:</strong> ${escapeHTML(authorNames.join(", "))}`;
        }

    } catch (error) {
        console.error("Could not load author:", error);
    }
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