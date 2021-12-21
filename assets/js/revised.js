import css from "../css/output.css"
let search = document.getElementById("search");
let searchButton = document.getElementsByClassName("searchButton")[0];
let resultsPerPage = document.getElementById("results_per_page");
let resultsBox = document.getElementsByClassName("results")[0];
let modal = document.getElementsByClassName("modal")[0];

class ResultsTable {
  constructor(parent) {
    this._currentPage = 0;
    this._parentElement = parent;
  }
  async getBooksByGenre(genre) {
    let response = await fetch(
      `https://openlibrary.org/subjects/${genre}.json?limit=${
        resultsPerPage.value
      }&offset=${resultsPerPage.value * this._currentPage}`
    );
    if (response.ok) {
      let books = await response.json();
      return books.works;
    } else {
      console.log(response);
    }
  }
  async displayBooks() {
    let books = await this.getBooksByGenre(search.value);
    if (books.length == 0) {
      this._parentElement.innerHTML = "";
      let p = document.createElement("pre");
      p.textContent = `There doesn't seem to be any result for genre: ${search.value}.\nSome popular choices are fantasy, fiction or history`;
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
  formatAuthor(authorsList) {
    let author = authorsList.map((author) => author.name).join(", ");
    if (author.length > 30) author = author.slice(0, 30) + "...";
    return author;
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
      let author = this.formatAuthor(book.authors);
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
}

let resultsTable = new ResultsTable(resultsBox);
searchButton.addEventListener("click", function () {
  resultsTable.displayBooks();
});
search.addEventListener("keydown", function (e) {
  if (e.key == "Enter") resultsTable.displayBooks();
});
resultsPerPage.addEventListener("change", function () {
  resultsTable.displayBooks();
});
document.body.addEventListener("click", function () {
  if (!modal.classList.contains("hidden")) modal.classList.add("hidden");
});

async function displayMore(key) {
  let response = await fetch(`https://openlibrary.org${key}.json`);
  if (response.ok) {
    let details = await response.json();
    let description =
      details.description?.value ??
      details.description ??
      "No description available";
    updateModalBox(details.title, description);
    toggleModalBox();
  }
}
function updateModalBox(title, description) {
  modal.querySelector("h2").textContent = title;
  modal.querySelector("pre").textContent = description;
}
function toggleModalBox() {
  modal.classList.toggle("hidden");
}
