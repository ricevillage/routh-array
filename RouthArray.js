const RouthCase = {
  NORMAL_CASE: "Normal case",
  NEGATIVE_COEFFICIENT: "easy case",
  SPECIAL_CASE_1: "Special case 1",
  SPECIAL_CASE_2: "Special case 2",
};

export class RouthArray {
  constructor(input) {
    // normal: [1,6,11,6], [1,4,1,16]
    // case 1: [1, 2, 3, 6, 2, 1]
    // case 2: [1,2,8,12,20,16,16]
    this.coefficients = input;
    this.numRows = this.coefficients.length;
    this.initRows = this.coefficients.length > 1 ? 2 : 1;
    this.numColumns = Math.ceil(this.coefficients.length / 2);
    this.table = new Array(this.numRows)
      .fill(0)
      .map(() => new Array(this.numColumns).fill(0));
    this.routhCase = RouthCase.NORMAL_CASE;
    this.stability = undefined;
    this.signChanges = 0;
    this.auxiliaryPackage = [];
    this.resultMessage = "";
  }

  fillInitRows = () => {
    // Fill in the first/second (if needed) row of the table
    let rowOneColumn = 0;
    let rowTwoColumn = 0;
    for (let i = 0; i < this.coefficients.length; i++) {
      let coefficients = i + 1;
      if (coefficients % 2 !== 0) {
        this.table[0][rowOneColumn++] = this.coefficients[i];
      } else if (coefficients % 2 === 0 && this.initRows > 1) {
        this.table[1][rowTwoColumn++] = this.coefficients[i];
      }
    }
  };

  fillAllRows = (startingRow) => {
    // Fill in the rest of the table
    for (let i = startingRow; i < this.numRows; i++) {
      for (let j = 0; j < this.numColumns; j++) {
        if (i - 2 < 0 || i - 1 < 0 || j + 1 >= this.numColumns) continue;
        const a = this.table[i - 2][0];
        const b = this.table[i - 2][(j + 1) % this.numColumns];
        const c = this.table[i - 1][0];
        const d = this.table[i - 1][(j + 1) % this.numColumns];

        const numerator = c * b - a * d;
        const denominator = c;

        if (denominator === 0) {
          continue;
        }

        const routhCoefficient = numerator / denominator;
        const routhCoefficientPrecision = Number(routhCoefficient.toFixed(4));
        this.table[i][j] = routhCoefficientPrecision;
      }
    }
  };

  isAllRowsZero = (row) => {
    return row.every((elem) => elem === 0);
  };

  checkStability = () => {
    let zeroElementRow = -1;
    let previousNumber = this.table[0][0];
    let allRowsNegative = true;

    for (let i = 1; i < this.numRows; i++) {
      const currentNumber = this.table[i][0];

      if (
        (previousNumber < 0 && currentNumber > 0) ||
        (previousNumber > 0 && currentNumber < 0)
      ) {
        this.signChanges++;
      }

      previousNumber = currentNumber;

      if (currentNumber > 0) allRowsNegative = false;

      if (this.table[i - 1][0] === 0) {
        zeroElementRow = i - 1;
        break;
      }
    }

    if (zeroElementRow === -1 && this.table[this.numRows - 1][0] === 0) {
      zeroElementRow = this.numRows - 1;
    }

    let allRowsZero = false;
    if (zeroElementRow >= 0) {
      allRowsZero = this.isAllRowsZero(this.table[zeroElementRow]);
    }

    if (allRowsZero && zeroElementRow !== -1) {
      this.handleSpecialCase2(zeroElementRow);
    } else if (!allRowsZero && zeroElementRow !== -1) {
      this.handleSpecialCase1(zeroElementRow);
    }

    this.stability =
      this.signChanges > 0 || allRowsNegative ? "unstable" : "stable";
  };

  handleSpecialCase1 = (zeroElementRow) => {
    // Special case 1
    // zeroElementRow is replaced with a small positive number (epsilon)
    // and the calculations continue as normal
    this.routhCase = RouthCase.SPECIAL_CASE_1;
    const epsilon = Number.EPSILON;
    this.table[zeroElementRow][0] = epsilon;
    this.signChanges = 0;
    this.fillAllRows(zeroElementRow + 1);
    this.checkStability();
  };

  extractCoefficients = (equation) => {
    const coefficients = [];
    const terms = equation.split(" + ");

    for (let i = 0; i < terms.length; i++) {
      const [coefficient, power] = terms[i].split(" s<sup>");
      coefficients.push(Number(coefficient));
    }

    return coefficients;
  };

  handleSpecialCase2 = (zeroElementRow) => {
    this.routhCase = RouthCase.SPECIAL_CASE_2;

    // Special case 2
    // Find auxiliary equation and derivative
    let auxiliaryEquation = "";
    // console.log(this.table);
    let power = this.numRows - zeroElementRow;
    for (let i = 0; i < this.numColumns; i++) {
      const coefficient = this.table[zeroElementRow - 1][i];
      if (coefficient === 0) continue;
      if (i > 0) power -= 2;
      auxiliaryEquation += `${coefficient} s<sup>${power}</sup> + `;
    }
    auxiliaryEquation = auxiliaryEquation.slice(0, -3);
    // console.log(`Auxiliary polynomial: ${auxiliaryEquation}`);

    // Take derivative
    const auxiliaryDerivative = auxiliaryEquation
      .split(" + ")
      .map((term) => {
        const [coeff, power] = term.split(" s<sup>");
        const newCoeff = Number(coeff) * Number(power.replace("</sup>", ""));
        const newPower = Number(power.replace("</sup>", "")) - 1;
        if (newPower <= 0) return `${newCoeff}`;
        return `${newCoeff} s<sup>${newPower}</sup>`;
      })
      .join(" + ");

    const newCoefficients = this.extractCoefficients(auxiliaryDerivative);
    // console.log(newCoefficients)

    for (let i = 0; i < newCoefficients.length; i++) {
      this.table[zeroElementRow][i] = newCoefficients[i];
    }
    this.fillAllRows(zeroElementRow + 1);
    this.signChanges = 0;
    this.checkStability();

    this.auxiliaryPackage = {
      equation: auxiliaryEquation,
      derivative: auxiliaryDerivative,
    };
  };

  countNegativeCoefficients = () => {
    let count = 0;
    for (let i = 0; i < this.coefficients.length; i++) {
      if (this.coefficients[i] < 0) count++;
    }
    return count;
  };

  calculateRouth = () => {
    const negativeCoefficientCount = this.countNegativeCoefficients();
    if (negativeCoefficientCount === this.coefficients.length) {
      this.coefficients = this.coefficients.map((coefficient) =>
        coefficient < 0 ? -coefficient : coefficient
      );
    } else if (negativeCoefficientCount > 0) {
      this.routhCase = RouthCase.NEGATIVE_COEFFICIENT;
      this.stability = "unstable";
      this.writeResultMessage();
      this.routhCase = RouthCase.NORMAL_CASE;
    }

    this.fillInitRows();
    if (this.initRows === 2) {
      this.fillAllRows(this.initRows);
    }

    this.checkStability();
    this.writeResultMessage();
  };

  getTable = () => {
    return this.table;
  };

  getStability = () => {
    return this.stability;
  };

  writeResultMessage = () => {
    if (this.routhCase === RouthCase.SPECIAL_CASE_1) {
      this.resultMessage +=
        "<b>Special Case: Zero First-Column Element</b><br>";
      this.resultMessage +=
        "Replaced the zero in the first row with a small positive number (epsilon).<br>";
      this.resultMessage +=
        "Then, the calculations continue as normal.<br><br>";
    } else if (this.routhCase === RouthCase.SPECIAL_CASE_2) {
      this.resultMessage += "<b>Special Case: Zero Row</b><br>";
      this.resultMessage += `Number of sign changes: <b>${this.signChanges}</b>. Therefore, the polynomial has ${this.signChanges} roots with positive real parts.<br>`;

      const { equation, derivative } = this.auxiliaryPackage;

      this.resultMessage += `<br> Auxiliary Equation: ${equation} <br>`;
      this.resultMessage += `Auxiliary Derivative: ${derivative} <br>`;
      this.resultMessage += `Solve the Auxiliary Equation (roots) to determine if system is <b>unstable</b> or <b>marginally stable.</b>`;
    } else if (this.routhCase === RouthCase.NEGATIVE_COEFFICIENT) {
      this.resultMessage += `<b>The system is ${this.stability}</b><br>`;
      this.resultMessage += `The Characteristic Equation contains a negative coefficients. Solving the Routh Array anyways, we get the following: <br><br>`;
    }

    if (
      this.routhCase === RouthCase.NORMAL_CASE ||
      this.routhCase === RouthCase.SPECIAL_CASE_1
    ) {
      this.resultMessage += `<b>The system is ${this.stability}</b>`;
      this.resultMessage += `<br>Number of sign changes: <b>${this.signChanges}</b>. Therefore, the polynomial has ${this.signChanges} roots with positive real parts.`;
    }
  };

  getResultMessage = () => {
    return this.resultMessage;
  };
}
