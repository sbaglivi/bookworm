let buttons = document.getElementsByTagName("button");
let resultsBox = document.getElementsByClassName("results")[0];
let currentPage = 0;
let resultsPerPage = document.getElementById("results_per_page");
let search = document.getElementById("search");
resultsPerPage.addEventListener("change", function () {
  if (search.value !== "") {
    currentPage = 0;  
    getBooksAndDisplay(search.value, this.value);
  }
});
// Currently if a user decides to change the # of results per page while not on first page I'm returning them to the first page,
// I'm not sure what the user intended behavior would be. 
//e.g. if they're looking at 10 items per page and they're currently on the third page (index=2, results=20-29) and they change to 25
// do they want to see results that approximately start from the same index? therefore 25-49? Do they want to keep the same starting point and go from there? that would fuck my next page logic.
search.addEventListener("input", function (e) {
  if (this.timeoutId) clearTimeout(this.timeoutId);
  this.timeoutId = setTimeout(
    getBooksAndDisplay.bind(null, this.value, resultsPerPage.value),
    2000
  );
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
  div.querySelector("p").innerHTML =
    "<pre class='wrap'>" + description + "</pre>";
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
