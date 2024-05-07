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

  const isCellEmpty = (index) => {
    if (board[index] == undefined) return;

    return !board[index].getValue();
  };

  const printBoard = () => {
    const b = board.map(cell => cell.getValue());
    console.log(`${b[0]}  ${b[1]}  ${b[2]}\n` +
      `${b[3]}  ${b[4]}  ${b[5]}\n` +
      `${b[6]}  ${b[7]}  ${b[8]}\n`
    );
  };

  const resetBoard = () => {
    board.forEach(cell => cell.setValue(null));
  };

  return {
    getBoard,
    setCellValue,
    printBoard,
    resetBoard,
    isCellEmpty,
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
      score: 0,
    },
    {
      name: playerTwoName,
      symbol: "O",
      score: 0,
    }
  ];


  let activePlayer = players[0];
  let remainingPlays = 9;
  let gameover = false;


  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    Gameboard.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };


  const playRound = (index) => {
    if (gameover) return;
    // Check if cell is playable
    if (!Gameboard.isCellEmpty(index)) return;

    Gameboard.setCellValue(index, getActivePlayer().symbol);
    console.log(`${getActivePlayer().name} played at (${index})`);

    remainingPlays--;
    let winner = checkForWin();
    if (winner.player) {
      console.log(`winner: ${winner.player.name}`);
      winner.player.score++;
      if (winner.player.score >= 3) {
        console.log(`Game over: ${winner.player.name} won the game!`);
        gameover = true;
      } else {
        startNewRound();
      }
    } else if (remainingPlays <= 0) {
      console.log(`Draw!!`);
      startNewRound();
    }
    switchPlayerTurn();
    printNewRound();
  };

  printNewRound();
  const winning = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 4, 6],
    [2, 5, 8],
    [3, 4, 5],
    [6, 7, 8],
  ];

  const checkForWin = () => {
    let board = Gameboard.getBoard().map(cell => cell.getValue());
    let indecies = winning.find(elm => {
      if (board[elm[0]] === null || board[elm[1]] === null || board[elm[2]] === null) return;
      if (board[elm[0]] === board[elm[1]] && board[elm[1]] === board[elm[2]]) return true;
    });

    let player = null;
    if (indecies) {
      player = indecies[0] === players[0].symbol ? players[0] : players[1];
    }



    return {
      indecies,
      player,
    };
  };

  const startNewRound = () => {
    Gameboard.resetBoard();
    remainingPlays = 9;
    console.log(`New Round started!`);
  };


  return {
    playRound,
    getActivePlayer
  };
})();