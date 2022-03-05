// Player Factory
const Player = (symbol) => {
  return { symbol };
};

// Display Module
const DisplayController = (() => {
  const gameBoardContainer = document.querySelector("#game-board");
  let gameBoardBoxesArray = [];
  const resetBtn = document.querySelector("#reset-btn");

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

const Gameboard = ((maxNumOfBoxes) => {
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
    for (let i = 0; i < maxNumOfBoxes; i++) {
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
})(9);

// Players
const player1 = Player("x");
const player2 = Player("o");

const Game = ((displayController, gameBoard, player1, player2) => {
  let boardArray;
  let isFirstPlayerTurn = true;
  let isGameEnded = false;

  const initGame = () => {
    boardArray = gameBoard.populateGameboardArray();
    displayController.renderBoxes(boardArray);
    const gameBoardContainer = displayController.gameBoardContainer;
    const resetBtn = displayController.getResetBtn();

    resetBtn.addEventListener("click", () => {
      gameBoard.resetGameboard();
      displayController.removeBoxes();
      displayController.renderBoxes(boardArray);
      isFirstPlayerTurn = true;
      isGameEnded = false;
    });

    gameBoardContainer.addEventListener("click", (event) => {
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
      console.log(msg);
    });

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
  };

  return { initGame };
})(DisplayController, Gameboard, player1, player2);

Game.initGame();
