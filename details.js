/*
    Loads one specific book from the Google Books API.

    The homepage sends the book's Google Books volume ID like:
    book-details.html?id=zyTCAlFPjgYC
*/

const API_URL = "https://www.googleapis.com/books/v1/volumes";
const detailsContainer = document.getElementById("book-details");

document.addEventListener("DOMContentLoaded", loadBookDetails);

async function loadBookDetails() {
    const params = new URLSearchParams(window.location.search);
    const bookId = params.get("id");

    if (!bookId) {
        showError("No book was selected.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(bookId)}`);

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const book = await response.json();
        renderBookDetails(book);
    } catch (error) {
        console.error("Could not load book details:", error);
        showError("We couldn't load this book. Please go back and try again.");
    }
}

function renderBookDetails(book) {
    const info = book.volumeInfo || {};
    const sale = book.saleInfo || {};
    const access = book.accessInfo || {};

    const title = info.title || "Unknown title";
    const authors = (info.authors || ["Unknown author"]).join(", ");
    const genres = (info.categories || ["Genre not available"]).join(", ");

    const cover =
        info.imageLinks?.large ||
        info.imageLinks?.medium ||
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail ||
        "https://via.placeholder.com/300x450?text=No+Cover";

    const description = cleanDescription(info.description);
    const rating = formatRating(info.averageRating, info.ratingsCount);

    const onlineReading = getOnlineReadingStatus(access);
    const listings = createListings(book, sale, access);

    detailsContainer.innerHTML = `
        <img class="big-cover"
             src="${escapeAttribute(cover.replace("http:", "https:"))}"
             alt="Cover of ${escapeAttribute(title)}">

        <h1>${escapeHTML(title)}</h1>

        <p class="author"><strong>Author:</strong> ${escapeHTML(authors)}</p>
        <p class="genre"><strong>Genre:</strong> ${escapeHTML(genres)}</p>

        <section class="blurb-section">
            <h2>About the Book</h2>
            <div class="blurb">${description}</div>
        </section>

        <section class="rating-section">
            <h2>Rating</h2>
            <p class="rating">${rating}</p>
        </section>

        <section class="reading-section">
            <h2>Read Online</h2>
            <p>${onlineReading.text}</p>
            ${onlineReading.link ? `
                <a class="action-link"
                   href="${escapeAttribute(onlineReading.link)}"
                   target="_blank"
                   rel="noopener noreferrer">
                   Open Online Reader
                </a>` : ""}
        </section>

        <section class="listing-section">
            <h2>Where to Find This Book</h2>
            <div class="listings">${listings}</div>
        </section>
    `;

    document.title = `${title} | Digi-Library`;
}

function cleanDescription(description) {
    if (!description) {
        return `<p>No long description is available for this edition through the API.</p>`;
    }

    // Google Books descriptions sometimes contain HTML.
    // We keep simple paragraph/line-break formatting but remove unsafe elements.
    const temp = document.createElement("div");
    temp.innerHTML = description;

    temp.querySelectorAll("script, iframe, object, style").forEach(el => el.remove());

    return temp.innerHTML;
}

function formatRating(averageRating, ratingsCount) {
    if (!averageRating) {
        return "No rating available.";
    }

    const countText = ratingsCount
        ? ` (${ratingsCount.toLocaleString()} ratings)`
        : "";

    return `⭐ ${averageRating.toFixed(1)} / 5${countText}`;
}

function getOnlineReadingStatus(access) {
    if (access.viewability === "ALL_PAGES" && access.webReaderLink) {
        return {
            text: "Yes — this book has a full online preview/reading option.",
            link: access.webReaderLink
        };
    }

    if (access.embeddable && access.webReaderLink) {
        return {
            text: "A preview is available online.",
            link: access.webReaderLink
        };
    }

    return {
        text: "No free full-text reading option was reported by the API for this book."
    };
}

function createListings(book, sale, access) {
    const links = [];

    // Google Books / preview link.
    if (infoLink(book)) {
        links.push({
            name: "Google Books",
            url: infoLink(book)
        });
    }

    // Google Play purchase link, when Google Books supplies one.
    if (sale.buyLink) {
        links.push({
            name: "Google Play / Buy",
            url: sale.buyLink
        });
    }

    // Publisher link, when supplied.
    if (sale?.retailPrice && book.volumeInfo?.publisher) {
        // We don't invent a publisher URL because the API doesn't necessarily provide one.
    }

    if (links.length === 0) {
        return "<p>No retailer or catalogue links were supplied by the API for this book.</p>";
    }

    return links.map(link => `
        <a class="listing"
           href="${escapeAttribute(link.url)}"
           target="_blank"
           rel="noopener noreferrer">
            ${escapeHTML(link.name)}
        </a>
    `).join("");
}

function infoLink(book) {
    return book.volumeInfo?.infoLink || book.accessInfo?.webReaderLink || null;
}

function showError(message) {
    detailsContainer.innerHTML = `
        <p class="error">${escapeHTML(message)}</p>
        <a class="action-link" href="index.html">Return to Home</a>
    `;
}

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function escapeAttribute(value) {
    return escapeHTML(value).replace(/"/g, "&quot;");
}
