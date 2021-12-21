import css from "../css/output.css";
import ResultsTable from "./resultsTable";
let search = document.getElementById("search");
let searchButton = document.getElementsByClassName("searchButton")[0];
let resultsPerPage = document.getElementById("results_per_page");
let resultsBox = document.getElementsByClassName("results")[0];
let modal = document.getElementsByClassName("modal")[0];
let resultsTable = new ResultsTable(resultsBox);

searchButton.addEventListener("click", function () {
  resultsTable.genre = search.value;
  resultsTable.displayBooks();
});
search.addEventListener("keydown", function (e) {
  if (e.key == "Enter") {
    resultsTable.genre = this.value;
    resultsTable.displayBooks();
  }
});
resultsPerPage.addEventListener("change", function () {
  resultsTable.genre = search.value;
  resultsTable.resultsPerPage = this.value;
  resultsTable._currentPage = 0;
  resultsTable.displayBooks();
});
document.body.addEventListener("click", function (e) {
  if (
    (!modal.contains(e.target) || e.target.classList.contains("closeSpan")) &&
    !modal.classList.contains("hidden")
  )
    modal.classList.add("hidden");
});
