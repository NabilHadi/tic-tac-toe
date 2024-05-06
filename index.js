const Gameboard = (() => {
  const board = [];
  let numSquares = 9;

  for (let i = 0; i < numSquares; i++) {
    board.push(Cell());
  }

  const getBoard = () => board;


  const setCellValue = (index, symbol) => {
    if (board[index] == undefined) return;

    board[index].setValue(symbol);
  };

  const printBoard = () => {
    const b = board.map(cell => cell.getValue());
    console.log(`${b[0]}  ${b[1]}  ${b[2]}\n` +
      `${b[3]}  ${b[4]}  ${b[5]}\n` +
      `${b[6]}  ${b[7]}  ${b[8]}\n`
    );
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


  const playRound = (index) => {
    Gameboard.setCellValue(index, getActivePlayer().symbol);
    console.log(`${getActivePlayer().name} played at (${index})`);

    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();


  return {
    playRound,
    getActivePlayer
  };
})();