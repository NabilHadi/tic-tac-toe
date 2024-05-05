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

const GameController = ((
  playerOneName = "Player One",
  playerTwoName = "Player Two",
) => {

  const players = [
    {
      name: playerOneName,
      symbol: "X",
    },
    {
      name: playerTwoName,
      symbol: "O",
    }
  ];


  let activePlayer = players[0];


  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    Gameboard.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };


  const playRound = (rowIndex, columnIndex) => {
    Gameboard.setCellValue({ rowIndex, columnIndex }, getActivePlayer().symbol);
    console.log(`${getActivePlayer().name} played at (${rowIndex},${columnIndex})`);

    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();


  return {
    playRound,
    getActivePlayer
  };
})();