import { RouthArray } from "./RouthArray.js";
const MAX_SYSTEM_ORDER = 8;

const systemOrderInput = document.getElementById("system-order-input");
const orderText = document.getElementById("order-text");
const denominatorInput = document.getElementById("denominator-input");
const routhMatrix = document.getElementById("routh-matrix");
const resultContainer = document.getElementById("result-container");
const solveButton = document.getElementById("solve-button");

function handleOrderChange() {
  let systemOrder = systemOrderInput.value;
  if (systemOrder > MAX_SYSTEM_ORDER) {
    systemOrder = MAX_SYSTEM_ORDER;
    systemOrderInput.value = MAX_SYSTEM_ORDER;
  }

  const order = getOrdinalNumber(systemOrder);
  orderText.textContent = `${order}-order system`;

  // Clear the denominator input container
  denominatorInput.innerHTML = "";

  // Add inputs and spans for each order
  for (let i = systemOrder; i >= 0; i--) {
    const input = document.createElement("input");
    input.type = "number";
    input.value = "0";

    const span = document.createElement("span");
    span.textContent = "s";
    const superScript = document.createElement("sup");
    superScript.textContent = i;

    span.appendChild(superScript);
    denominatorInput.appendChild(input);
    denominatorInput.appendChild(span);

    if (i > 0) {
      const plusSpan = document.createElement("span");
      plusSpan.textContent = " + ";
      denominatorInput.appendChild(plusSpan);
    }
  }
}

function getOrdinalNumber(number) {
  const suffixes = ["th", "st", "nd", "rd"];
  const lastDigit = number % 10;
  const suffix = suffixes[lastDigit] || suffixes[0];
  return number + suffix;
}

function createTableFromArray(routhArray) {
  // create table element
  const table = document.createElement("table");

  // iterate through routhArray and create table rows and data elements
  routhArray.forEach((row) => {
    const tr = document.createElement("tr");

    row.forEach((value) => {
      const td = document.createElement("td");
      td.innerText = value;
      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  return table;
}

function getCoefficientsFromInput() {
  const coefficientInputs = document.querySelectorAll(
    "#denominator-input input"
  );
  const coefficients = [];

  coefficientInputs.forEach((input) => {
    const value = parseFloat(input.value);
    coefficients.push(isNaN(value) ? 0 : value);
  });
  return coefficients;
}

function appendRouthArray(routhArray) {
  const maxtrixHeader = document.getElementById("matrix-header");
  maxtrixHeader.style.display = "block";

  routhMatrix.innerHTML = "";
  const tableDiv = document.createElement("div");

  const table = createTableFromArray(routhArray);
  tableDiv.appendChild(table);
  routhMatrix.appendChild(tableDiv);
}

function appendResult(result) {
  const resultHeader = document.getElementById("result-header");
  resultHeader.style.display = "block";
  resultContainer.innerHTML = result;
}

function handleRouthSolve() {
  const coefficients = getCoefficientsFromInput();
  if (
    coefficients.length === 0 ||
    coefficients.every((element) => element === 0)
  ) {
    return;
  }

  const routh = new RouthArray(coefficients);
  routh.calculateRouth(coefficients);
  const routhArray = routh.getTable();
  const result = routh.getResultMessage();
  appendRouthArray(routhArray);
  appendResult(result);
}

systemOrderInput.addEventListener("input", () => {
  handleOrderChange();
});

solveButton.addEventListener("click", () => {
  handleRouthSolve();
});
