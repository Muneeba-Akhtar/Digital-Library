/*
    Digi-Library
    API: Google Books API

    Google Books API documentation:
    https://developers.google.com/books/docs/v1/using
    https://developers.google.com/books/docs/v1/reference/volumes
*/

const API_URL = "https://www.googleapis.com/books/v1/volumes";
const BOOKS_TO_SHOW = 6;
const BOOK_QUERY = "harry potter";

// Run when the HTML page has finished loading
document.addEventListener("DOMContentLoaded", loadBooks);

async function loadBooks() {
    const container = document.getElementById("books-container");

    if (!container) return;

    container.innerHTML = `
    <div class="loading-books">
        <div class="loader"></div>
        <p>Finding your books...</p>
    </div>
`;

    try {
        const subjects = [
            "fiction",
            "romance",
            "mystery",
            "science",
            "history",
            "fantasy",
            "technology",
            "psychology"
        ];

        // Pick a random category every time the page loads
        const subject = subjects[Math.floor(Math.random() * subjects.length)];

        const response = await fetch(
            `https://openlibrary.org/subjects/${subject}.json?limit=12`
        );

        if (!response.ok) {
            throw new Error(`Failed to load books: ${response.status}`);
        }

        const data = await response.json();

        const books = (data.works || [])
            .filter(book => book.title)
            .map(book => ({
                id: book.key,
                volumeInfo: {
                    title: book.title,
                    authors: (book.authors || []).map(author => author.name),
                    imageLinks: book.cover_id
                        ? {
                            thumbnail: `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`
                        }
                        : {}
                }
            }));

        container.innerHTML = "";

        books.forEach(book => {
            container.appendChild(createBookCard(book));
        });

    } catch (error) {
        console.error("Could not load books:", error);
        container.innerHTML =
            "<p>Sorry, the books could not be loaded. Please try again.</p>";
    }
}


function createBookCard(book) {
    const info = book.volumeInfo;

    // Main card
    const card = document.createElement("div");
    card.className = "books";

    // Book cover
    const image = document.createElement("div");
    image.className = "book-image";

    const cover =
        info.imageLinks?.thumbnail ||
        info.imageLinks?.smallThumbnail ||
        "https://via.placeholder.com/130x200?text=No+Cover";

    image.style.backgroundImage =
        `url("${cover.replace("http:", "https:")}")`;

    image.setAttribute("role", "img");
    image.setAttribute(
        "aria-label",
        `${info.title} cover`
    );


    // Book title
    const title = document.createElement("div");
    title.className = "book-title";
    title.textContent = info.title;
    title.style.cursor = "pointer";

    title.addEventListener("click", () => {
        openDetails(book.id);
    });


    // Author
    const author = document.createElement("div");
    author.className = "book-author";

    const authorLabel = document.createElement("p");
    authorLabel.textContent = "Author";

    author.appendChild(authorLabel);

    author.appendChild(
        document.createTextNode(
            (info.authors || ["Unknown author"]).join(", ")
        )
    );


    // Read Now button
    const readButton = document.createElement("div");
    readButton.className = "view";
    readButton.textContent = "READ NOW";
    readButton.style.cursor = "pointer";
    readButton.setAttribute("role", "button");
    readButton.setAttribute("tabindex", "0");

    readButton.addEventListener("click", () => {
        openDetails(book.id);
    });

    readButton.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openDetails(book.id);
        }
    });


    // Put everything inside the card
    card.appendChild(image);
    card.appendChild(title);
    card.appendChild(author);
    card.appendChild(readButton);

    return card;
}


// Open the book details page
function openDetails(bookId) {
    window.open(
        `book-details.html?id=${encodeURIComponent(bookId)}`,
        "_blank"
    );
}
const searchForm = document.getElementById("search-form");

if (searchForm) {
    searchForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const query = document.getElementById("site-search").value.trim();
        const container = document.getElementById("books-container");

        if (!query || !container) return;

        container.innerHTML = "<p>Searching for books...</p>";

        try {
            const response = await fetch(
                `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12&fields=key,title,author_name,cover_i`
            );

            if (!response.ok) {
                throw new Error(`Search failed: ${response.status}`);
            }

            const data = await response.json();

            const books = data.docs
                .filter(book => book.title)
                .map(book => ({
                    id: book.key,
                    volumeInfo: {
                        title: book.title,
                        authors: book.author_name || ["Unknown author"],
                        imageLinks: book.cover_i
                            ? {
                                thumbnail: `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                            }
                            : {}
                    }
                }));

            container.innerHTML = "";

            if (books.length === 0) {
                container.innerHTML = "<p>No books found. Try another search.</p>";
                return;
            }

            books.forEach(book => {
                container.appendChild(createBookCard(book));
            });

        } catch (error) {
            console.error("Search error:", error);
            container.innerHTML =
                "<p>Sorry, we couldn't search for books. Please try again.</p>";
        }
    });
}





// /*
//     Digi-Library
//     API: Google Books API
//     Documentation:
//     https://developers.google.com/books/docs/v1/using
//     https://developers.google.com/books/docs/v1/reference/volumes

//     No API key is required for these basic public requests.
// */

// const API_URL = "https://www.googleapis.com/books/v1/volumes";
// const BOOKS_TO_SHOW = 6;

// // A small starter collection. The API supplies the real title, author and cover.
// const BOOK_QUERY = "subject:fiction";

// // Run after the HTML has loaded.
// document.addEventListener("DOMContentLoaded", loadBooks);

// async function loadBooks() {
//     const container = document.getElementById("books-container");

//     try {
//         const response = await fetch(
//             `${API_URL}?q=${encodeURIComponent(BOOK_QUERY)}&maxResults=${BOOKS_TO_SHOW}&printType=books`
//         );

//         if (!response.ok) {
//             throw new Error(`API request failed: ${response.status}`);
//         }

//         const data = await response.json();

//         // Remove books without the information needed by the homepage.
//         const books = (data.items || [])
//             .filter(book => book.volumeInfo?.title && book.volumeInfo?.authors)
//             .slice(0, BOOKS_TO_SHOW);

//         container.innerHTML = "";

//         books.forEach(book => {
//             container.appendChild(createBookCard(book));
//         });

//         if (books.length === 0) {
//             container.innerHTML = "<p>No books were found.</p>";
//         }
//     } catch (error) {
//         console.error("Could not load books:", error);
//         container.innerHTML = "<p>Sorry, the books could not be loaded. Please try again.</p>";
//     }
// }

// function createBookCard(book) {
//     const info = book.volumeInfo;

//     const card = document.createElement("div");
//     card.className = "books";

//     const image = document.createElement("div");
//     image.className = "book-image";

//     const cover =
//         info.imageLinks?.thumbnail ||
//         info.imageLinks?.smallThumbnail ||
//         "https://via.placeholder.com/130x200?text=No+Cover";

//     image.style.backgroundImage = `url("${cover.replace("http:", "https:")}")`;
//     image.setAttribute("role", "img");
//     image.setAttribute("aria-label", `${info.title} cover`);

//     const title = document.createElement("div");
//     title.className = "book-title";
//     title.textContent = info.title;
//     title.style.cursor = "pointer";
//     title.addEventListener("click", () => openDetails(book.id));

//     const author = document.createElement("div");
//     author.className = "book-author";

//     const authorLabel = document.createElement("p");
//     authorLabel.textContent = "Author";

//     author.appendChild(authorLabel);
//     author.appendChild(
//         document.createTextNode((info.authors || ["Unknown author"]).join(", "))
//     );

//     const readButton = document.createElement("div");
//     readButton.className = "view";
//     readButton.textContent = " READ NOW ";
//     readButton.style.cursor = "pointer";
//     readButton.setAttribute("role", "button");
//     readButton.setAttribute("tabindex", "0");

//     readButton.addEventListener("click", () => openDetails(book.id));
//     readButton.addEventListener("keydown", (event) => {
//         if (event.key === "Enter" || event.key === " ") {
//             openDetails(book.id);
//         }
//     });

//     card.appendChild(image);
//     card.appendChild(title);
//     card.appendChild(author);
//     card.appendChild(readButton);

//     return card;
// }

// function openDetails(bookId) {
//     // Opens the details page in a new tab and passes the Google Books ID.
//     window.open(`book-details.html?id=${encodeURIComponent(bookId)}`, "_blank");
// }
