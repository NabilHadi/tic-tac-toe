// Player Factory
const Player = (name, symbol) => {
  return {
    get name() {
      return name;
    },
    get symbol() {
      return symbol;
    },
  };
};

// Display Module
const DisplayController = (() => {
  const gameBoardContainer = document.querySelector("#game-board");
  const resetBtn = document.querySelector("#reset-btn");
  const startBtn = document.querySelector("#start-btn");

  const formOverlay = document.querySelector("#overlay");
  const closeFormBtn = document.querySelector("#close-form-btn");

  let gameBoardBoxesArray = [];

  function showOverlayForm() {
    formOverlay.classList.remove("hide");
    formOverlay.classList.add("show");
  }

  function hideOverlayForm() {
    formOverlay.classList.remove("show");
    formOverlay.classList.add("hide");
  }

  closeFormBtn.addEventListener("click", (event) => {
    hideOverlayForm();
  });

  const startBtnClickHandler = () => {
    showOverlayForm();
    const playersForm = document.querySelector("#start-game-form");
    playersForm.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();

        const playerOneName = event.target.querySelector(
          "#form-first-player-name"
        );
        const playerOneSymbol = event.target.querySelector(
          "#form-first-player-symbol"
        );
        const playerTwoName = event.target.querySelector(
          "#form-second-player-name"
        );
        const playerTwoSymbol = event.target.querySelector(
          "#form-second-player-symbol"
        );

        const player1 = Player(playerOneName.value, playerOneSymbol.value);
        const player2 = Player(playerTwoName.value, playerTwoSymbol.value);

        Game.initGame(player1, player2);
        event.target.reset();
        hideOverlayForm(formOverlay);
      },
      { once: true }
    );
  };

  startBtn.addEventListener("click", startBtnClickHandler);

  const getResetBtn = () => {
    return resetBtn;
  };

  const renderBoxes = (boardArray) => {
    for (let i = 0; i < boardArray.length; i++) {
      const boxDiv = document.createElement("div");
      boxDiv.classList.add("box");
      boxDiv.dataset.position = i;

      gameBoardBoxesArray[i] = boxDiv;
      gameBoardContainer.appendChild(boxDiv);
    }
  };

  const removeBoxes = () => {
    for (const box of gameBoardBoxesArray) {
      box.remove();
    }
    // empty the array
    gameBoardBoxesArray.length = 0;
  };

  const displayWinner = (player) => {};

  const changeBoxContent = (boxNumber, content) => {
    gameBoardBoxesArray[boxNumber].textContent = content;
  };

  const changeBoxColor = (boxNumber, color) => {
    gameBoardBoxesArray[boxNumber].style["background-color"] = color;
  };

  return {
    gameBoardContainer,
    gameBoardBoxesArray,
    changeBoxColor,
    getResetBtn,
    renderBoxes,
    removeBoxes,
    changeBoxContent,
  };
})();

const Gameboard = (() => {
  const boardArray = [];

  const Box = () => {
    let state = "";

    const changeTo = (symbol) => {
      state = symbol;
    };

    const isPlayed = () => {
      return state != "";
    };

    const clear = () => {
      state = "";
    };

    return {
      changeTo,
      get state() {
        return state;
      },
      isPlayed,
      clear,
    };
  };

  const populateGameboardArray = () => {
    // clear array
    boardArray.length = 0;
    for (let i = 0; i < 9; i++) {
      boardArray.push(Box());
    }
    return boardArray;
  };

  const resetGameboard = () => {
    for (const box of boardArray) {
      box.clear();
    }
    return boardArray;
  };

  return {
    boardArray,
    populateGameboardArray,
    resetGameboard,
  };
})();

const Game = ((displayController, gameBoard) => {
  let boardArray;
  let isFirstPlayerTurn;
  let isGameEnded;
  let player1;
  let player2;

  const restartGame = () => {
    if (gameBoard.length === 0) {
      boardArray = gameBoard.resetGameboard();
    } else {
      boardArray = gameBoard.populateGameboardArray();
    }
    displayController.removeBoxes();
    displayController.renderBoxes(boardArray);
    isFirstPlayerTurn = true;
    isGameEnded = false;
  };

  const gameBoardClickHandler = (event) => {
    if (!event.target.dataset.position) return;
    if (isGameEnded) return;

    const boxPosition = Number(event.target.dataset.position);
    let msg;
    if (isFirstPlayerTurn) {
      msg = playTurn(player1, boxPosition);
    } else if (!isFirstPlayerTurn) {
      msg = playTurn(player2, boxPosition);
    }

    if (msg === true) {
      isFirstPlayerTurn = !isFirstPlayerTurn;
    }
  };

  const initGame = (_player1, _player2) => {
    restartGame();
    const gameBoardContainer = displayController.gameBoardContainer;
    gameBoardContainer.removeEventListener("click", gameBoardClickHandler);
    const resetBtn = displayController.getResetBtn();

    resetBtn.addEventListener("click", restartGame);

    gameBoardContainer.addEventListener("click", gameBoardClickHandler);
    player1 = _player1;
    player2 = _player2;
  };

  const playTurn = (player, gameboardPosition) => {
    if (gameboardPosition == null) {
      return "Error: gameboardPosition is null";
    }
    if (gameboardPosition < 0 || gameboardPosition >= boardArray.length) {
      return "Error: gameboardPosition is less than 0 or more than 8";
    }
    if (boardArray[gameboardPosition].isPlayed()) {
      return "Error: board at this position is not empty";
    }

    boardArray[gameboardPosition].changeTo(player.symbol);
    displayController.changeBoxContent(gameboardPosition, player.symbol);
    const result = checkForWinner(gameboardPosition);
    if (result.isWin) {
      for (const coordinate of result.coordinates) {
        displayController.changeBoxColor(coordinate, "green");
      }
      isGameEnded = true;
    }
    return true;
  };

  const checkForWinner = (position) => {
    if (!boardArray || boardArray.length <= 0) {
      console.log("Cant check for winner, when board array is empty");
    }

    let index = Number(position);
    const winLines = [
      [
        [1, 2],
        [4, 8],
        [3, 6],
      ],
      [
        [0, 2],
        [4, 7],
      ],
      [
        [0, 1],
        [4, 6],
        [5, 8],
      ],
      [
        [4, 5],
        [0, 6],
      ],
      [
        [3, 5],
        [0, 8],
        [2, 6],
        [1, 7],
      ],
      [
        [3, 4],
        [2, 8],
      ],
      [
        [7, 8],
        [2, 4],
        [0, 3],
      ],
      [
        [6, 8],
        [1, 4],
      ],
      [
        [6, 7],
        [0, 4],
        [2, 5],
      ],
    ];

    const box = boardArray[index];
    for (let i = 0; i < winLines[index].length; i++) {
      const line = winLines[index][i];
      if (
        box.state === boardArray[line[0]].state &&
        box.state === boardArray[line[1]].state
      ) {
        return {
          isWin: true,
          coordinates: [index, line[0], line[1]],
        };
      }
    }
    return {
      isWin: false,
      coordinates: [],
    };
  };

  return { initGame };
})(DisplayController, Gameboard);
