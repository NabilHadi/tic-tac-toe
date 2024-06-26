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
  let roundover = false;


  const switchPlayerTurn = () => {
    activePlayer = activePlayer === players[0] ? players[1] : players[0];
  };

  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    Gameboard.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };


  const playRound = (index) => {
    if (gameover || roundover) return;
    // Check if cell is playable
    if (!Gameboard.isCellEmpty(index)) return;

    Gameboard.setCellValue(index, getActivePlayer().symbol);
    console.log(`${getActivePlayer().name} played at (${index})`);

    remainingPlays--;
    let result = checkForWin();
    if (result.player) {
      console.log(`winner: ${result.player.name}`);
      result.player.score++;
      if (result.player.score >= 3) {
        console.log(`Game over: ${result.player.name} won the game!`);
        gameover = true;
      }
      roundover = true;
    } else if (remainingPlays <= 0) {
      console.log(`Draw!!`);
      roundover = true;
      result.draw = true;
    }
    switchPlayerTurn();
    printNewRound();
    return result;
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
      player = board[indecies[0]] === players[0].symbol ? players[0] : players[1];
    }



    return {
      indecies,
      player,
    };
  };

  const startNewRound = () => {
    remainingPlays = 9;
    roundover = false;
    Gameboard.resetBoard();
    console.log(`New Round started!`);
  };

  const startNewGame = (playerOneName = "Player One", playerTwoName = "Player Two") => {
    startNewRound();
    gameover = false;
    players[0].name = playerOneName;
    players[0].score = 0;
    players[1].name = playerTwoName;
    players[1].score = 0;
    activePlayer = players[0];
    console.log("New Game Started!");
  };


  return {
    playRound,
    getActivePlayer,
    getBoard: Gameboard.getBoard,
    startNewRound,
    startNewGame
  };
})();


const DisplayController = (function () {
  const gameContainer = document.querySelector("#game_container");
  const playerOneNameElm = gameContainer.querySelector("#player_one_name");
  const playerOneScoreElm = gameContainer.querySelector("#player_one_score");
  const playerTwoNameElm = gameContainer.querySelector("#player_two_name");
  const playerTwoScoreElm = gameContainer.querySelector("#player_two_score");
  const newRoundBtn = gameContainer.querySelector("#new_round_btn");
  const newGameBtn = gameContainer.querySelector("#new_game_btn");
  const gameboardDiv = gameContainer.querySelector("#gameboard");
  const formDialog = gameContainer.querySelector("#form_dialog");
  const form = gameContainer.querySelector("#new_game_form");
  const formDialogCloseBtn = formDialog.querySelector(".dialog_close_btn");
  const resultDialog = gameContainer.querySelector("#result_dialog");
  const resultElm = resultDialog.querySelector("#result");
  const resultDialogCloseBtn = resultDialog.querySelector(".dialog_close_btn");

  let roundover = false;
  let gameover = false;
  let playerOneScore = 0;
  let playerTwoScore = 0;

  // Bind event
  function handleGameboardClick(e) {
    if (roundover === true || gameover === true) return;
    if (e.target.dataset.index == undefined) return;
    const target = e.target;
    const index = target.dataset.index;

    let result = GameController.playRound(index);
    updateScreen();
    if (result.player) {
      showWinner(result.player.name, result.indecies);
      roundover = true;
      if (result.player.symbol === "X") {
        playerOneScore = result.player.score;
      } else {
        playerTwoScore = result.player.score;
      }

      if (result.player.score >= 3) {
        gameover = true;
        resultElm.textContent = `${result.player.name} Won!!`;
        resultDialog.showModal();
      }
    }
    updateScore();
  }
  gameboardDiv.addEventListener("click", handleGameboardClick);

  function startNewRound() {
    if (gameover) {
      return;
    }
    roundover = false;
    GameController.startNewRound();
    updateScreen();
  }
  newRoundBtn.addEventListener("click", startNewRound);

  function startNewGame(playerOneName = "Player One", playerTwoName = "Player Two") {
    roundover = false;
    gameover = false;
    playerOneScore = 0;
    playerTwoScore = 0;
    GameController.startNewGame(playerOneName, playerTwoName);
    updateScreen();
    updateScore();
    updatePlayerNames(playerOneName, playerTwoName);
  }
  newGameBtn.addEventListener("click", () => {
    formDialog.showModal();
  });

  formDialogCloseBtn.addEventListener("click", () => {
    formDialog.close();
  });

  resultDialogCloseBtn.addEventListener("click", () => {
    resultDialog.close();
  });

  form.addEventListener("submit", (e) => {
    const playerOneName = form.querySelector("#player_one_name_input").value;
    const playerTwoName = form.querySelector("#player_two_name_input").value;

    startNewGame(playerOneName, playerTwoName);
  });



  const showWinner = (playerName, indecies = []) => {
    indecies.forEach(index => {
      let square = gameboardDiv.querySelector(`.square[data-index='${index}']`);
      square.classList.add("win");
    });
  };

  const updateScreen = () => {
    updateScore();
    const gameboard = GameController.getBoard();
    gameboardDiv.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const square = document.createElement("div");
      square.classList.add("square");
      square.dataset.index = i;
      square.textContent = gameboard[i]?.getValue() || "";
      gameboardDiv.appendChild(square);
    }
  };

  const updateScore = () => {
    playerOneScoreElm.textContent = playerOneScore;
    playerTwoScoreElm.textContent = playerTwoScore;
  };

  const updatePlayerNames = (playerOneName, playerTwoName) => {
    playerOneNameElm.textContent = playerOneName;
    playerTwoNameElm.textContent = playerTwoName;
  };


  updateScreen();
  formDialog.showModal();


  return {
    updateScreen,
  };

})();