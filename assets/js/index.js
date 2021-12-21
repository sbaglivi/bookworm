let buttons = document.getElementsByTagName("button");
let resultsBox = document.getElementsByClassName("results")[0];
let currentPage = 0;
let resultsPerPage = document.getElementById("results_per_page");
let search = document.getElementById("search");
let searchButton = document.getElementsByClassName("searchButton")[0];
document.body.addEventListener("click", function () {
  let div = document.body.getElementsByClassName("modal")[0];
  if (!div.classList.contains("hidden")) div.classList.add("hidden");
});
// Currently if a user decides to change the # of results per page while not on first page I'm returning them to the first page,
// I'm not sure what the user intended behavior would be.
//e.g. if they're looking at 10 items per page and they're currently on the third page (index=2, results=20-29) and they change to 25
// do they want to see results that approximately start from the same index? therefore 25-49? Do they want to keep the same starting point and go from there? that would fuck my next page logic.
class ResultsTable {
  _currentPage = 0;
  _resultsPerPage = 10;
  genre;
  constructor(parentElement) {
    this._parentElement = parentElement;
  }
  set resultsPerPage(value) {
    if (!["10", "25", "50"].includes(value)) return;
    this._resultsPerPage = value;
  }
  set currentPage(value) {
    if (value < 0) return;
    this._currentPage = value;
  }
  async getBooks() {
    let response = await fetch(
      `https://openlibrary.org/subjects/${this.genre}.json?limit=${
        this._resultsPerPage
      }&offset=${this._resultsPerPage * this._currentPage}`
    );
    if (response.ok) {
      let books = await response.json();
      console.log(books);
      return books.works;
    } else {
      console.log(response);
    }
  }
  async displayBooks() {
    let books = await this.getBooks(this.genre);
    console.log(books.length);
    if (books.length == 0) {
      this._parentElement.innerHTML = "";
      let p = document.createElement("pre");
      p.textContent = `There doesn't seem to be any result for genre: ${this.genre}.\nSome popular choices are fantasy, fiction or history`;
      p.style.textDecoration = "underline";
      this._parentElement.append(p);
      return;
    }
    let table = this.createTable(books);
    this._parentElement.innerHTML = "";
    this._parentElement.append(table);
    if (this._currentPage > 0) {
      let previousButton = this.createPageButton("previous");
      this._parentElement.append(previousButton);
    }
    let pageLinks = this.generatePageLinks(this._currentPage + 1);
    this._parentElement.append(pageLinks);
    let nextButton = this.createPageButton("next");
    this._parentElement.append(nextButton);
  }
  getAuthor(authorsList) {
    let author = authorsList.map((author) => author.name).join(", ");
    if (author.length > 30) author = author.slice(0, 30) + "...";
    return author;
  }
  getNextPage() {
    this._currentPage++;
    this.displayBooks();
  }
  getPreviousPage() {
    this._currentPage--;
    this.displayBooks();
  }
  createPageButton(nextOrPrevious) {
    let button = document.createElement("button");
    if (nextOrPrevious == "next") {
      button.textContent = "Next page";
      button.addEventListener("click", this.getNextPage.bind(this));
    } else if (nextOrPrevious == "previous") {
      button.textContent = "Previous page";
      button.addEventListener("click", this.getPreviousPage.bind(this));
    }
    return button;
  }
  generatePageLinks(active) {
    let startIndex;
    if (this._currentPage < 3) startIndex = 1;
    else startIndex = this._currentPage - 1;
    let ul = document.createElement("ul");
    let li;
    for (let i = 0; i < 5; i++) {
      li = document.createElement("li");
      li.textContent = startIndex + i;
      li.style.cursor = "pointer";
      if (startIndex + i == active) {
        li.classList.add("active");
      } else {
        li.addEventListener(
          "click",
          function () {
            this._currentPage = startIndex + i - 1;
            this.displayBooks();
          }.bind(this)
        );
      }
      ul.append(li);
    }
    return ul;
  }
  createTable(books) {
    let table = document.createElement("table");
    let tr = document.createElement("tr");
    let th = document.createElement("th");
    let td;
    th.textContent = "Title";
    tr.append(th);
    th = document.createElement("th");
    th.textContent = "Author";
    tr.append(th);
    table.append(tr);
    books.forEach((book) => {
      tr = document.createElement("tr");
      td = document.createElement("td");
      let author = this.getAuthor(book.authors);
      td.textContent = book.title;
      tr.append(td);
      td = document.createElement("td");
      td.textContent = author;
      tr.append(td);
      tr.addEventListener("click", displayMore.bind(this, book.key));
      table.append(tr);
    });
    table.classList.add("tw-border-collapse");
    return table;
  }
}
let resultsTable = new ResultsTable(resultsBox);
searchButton.addEventListener("click", function () {
  resultsTable.displayBooks();
});
resultsPerPage.addEventListener("change", function () {
  resultsTable.currentPage = 0;
  resultsTable.resultsPerPage = this.value;
  resultsTable.displayBooks();
});
search.addEventListener("input", function (e) {
  // if (this.timeoutId) clearTimeout(this.timeoutId);
  // this.timeoutId = setTimeout(
  //   getBooksAndDisplay.bind(null, this.value, resultsPerPage.value),
  //   2000
  // );
  resultsTable.genre = this.value;
});
search.addEventListener("keydown", function (e) {
  if (e.key == "Enter") resultsTable.displayBooks();
});
async function getBooksByGenre(genre, amount = 10, offset = 0) {
  let response = await fetch(
    `https://openlibrary.org/subjects/${genre}.json?limit=${amount}&offset=${offset}`
  );
  if (response.ok) {
    let books = await response.json();
    return books.works;
  } else {
    console.log(response);
  }
}
function displayResults(books, parent = resultsBox) {
  let table = document.createElement("table");
  let tr = document.createElement("tr");
  let th = document.createElement("th");
  let td;
  th.textContent = "Title";
  tr.append(th);
  th = document.createElement("th");
  th.textContent = "Author";
  tr.append(th);
  table.append(tr);
  books.forEach((book) => {
    tr = document.createElement("tr");
    td = document.createElement("td");
    let author = getAuthor(book.authors);
    td.textContent = book.title;
    tr.append(td);
    td = document.createElement("td");
    td.textContent = author;
    tr.append(td);
    tr.addEventListener("click", displayMore.bind(this, book.key));
    table.append(tr);
  });
  parent.innerHTML = "";
  parent.append(table);

  if (currentPage > 0) {
    let previousPageButton = document.createElement("button");
    previousPageButton.textContent = "Previous page";
    previousPageButton.addEventListener("click", function () {
      currentPage--;
      getBooksAndDisplay(
        search.value,
        resultsPerPage.value,
        resultsPerPage.value * currentPage
      );
    });
    parent.append(previousPageButton);
  }
  let nextPageButton = document.createElement("button");
  nextPageButton.textContent = "Next page";
  nextPageButton.addEventListener("click", function () {
    currentPage++;
    getBooksAndDisplay(
      search.value,
      resultsPerPage.value,
      resultsPerPage.value * currentPage
    );
  });
  parent.append(nextPageButton);
}
function getAuthor(authorsList) {
  let author = authorsList.map((author) => author.name).join(", ");
  if (author.length > 30) author = author.slice(0, 30) + "...";
  return author;
}
let details;
async function displayMore(key) {
  let url = `https://openlibrary.org${key}.json`;
  let response = await fetch(url);
  if (response.ok) {
    details = await response.json();
    // 3 casi: descrizione normale, descrizione all'interno di un campo "value", nessuna descrizione. details.description?.value ?? details.description ?? "No description available"
    let description =
      details.description?.value ??
      details.description ??
      "No description available";
    updateModalBox(details.title, description);
    toggleModalBox();
  }
}
function updateModalBox(title, description) {
  let div = document.getElementsByClassName("modal")[0];
  div.querySelector("h2").textContent = title;
  div.querySelector("pre").textContent = description;
}
function toggleModalBox() {
  let div = document.getElementsByClassName("modal")[0];
  div.classList.toggle("hidden");
}

async function getBooksAndDisplay(
  genre,
  amount = 10,
  offset = 0,
  parent = resultsBox
) {
  let books = await getBooksByGenre(genre, amount, offset);
  displayResults(books, parent);
}

// class Memory {
//   static books = [];
//   static async getData(genre, results = 12) {
//     let url = `https://openlibrary.org/subjects/${genre}.json?limit=${results}`;
//     let response = await fetch(url);
//     if (response.ok) {
//       this.books = await response.json();
//       console.log(this.books[0]);
//     } else {
//       throw Error("response not ok");
//     }
//   }
// }
// for (let i = 0; i < 10; i++) {
//   console.log(
//     Memory.books.works[i].authors.map((author) => author.name).join(", ")
//   );
// }
// let ul = document.createElement("ul");
// books.forEach((book) => {
//   let li = document.createElement("li");
//   let author = getAuthor(book.authors);
//   li.textContent = `${book.title} - ${author}`;
//   let expandButton = document.createElement("button");
//   expandButton.textContent = "Learn more";
//   expandButton.addEventListener("click", displayMore.bind(this, book.key));
//   li.append(expandButton);
//   ul.append(li);
// });
// parent.innerHTML = "";
// parent.append(ul);
