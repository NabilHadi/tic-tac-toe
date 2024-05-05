const Gameboard = (() => {
  const board = [];
  let rows = 3;
  let columns = 3;

  for (let i = 0; i < rows; i++) {
    board[i] = [];
    for (let j = 0; j < columns; j++) {
      board[i].push(Cell());
    }
  }

  const getBoard = () => board;


  const setCellValue = ({ rowIndex, columnIndex }, symbol) => {
    if (board[rowIndex][columnIndex] == undefined) return;

    board[rowIndex][columnIndex].setValue(symbol);
  };

  const printBoard = () => {
    const boardWithCellValues = board.map((row) => row.map((cell) => cell.getValue()));
    console.log(boardWithCellValues);
  };

  return {
    getBoard,
    setCellValue,
    printBoard
  };
})();

function Cell() {
  let _value = null;

  const setValue = (value) => {
    _value = value;
  };

  const getValue = () => {
    return _value;
  };

  return {
    setValue,
    getValue
  };
}