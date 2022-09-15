// Gameborad Module
const Gameboard = (function () {
  // gameboard = [undefined, undefined, ...] length= 9
  let gameboard = Array.from(Array(9));

  const resetGameboard = () => {
    gameboard = gameboard.map(() => undefined);
  };

  const putSignAt = (index, sign) => {
    gameboard[index] = sign;
  };

  const getSignAt = (index) => {
    return gameboard[index];
  };

  const getGameboardValues = () => {
    return [...gameboard];
  };

  return {
    resetGameboard,
    putSignAt,
    getGameboardValues,
    getSignAt,
  };
})();

// Player Factory Function
const playerFactory = (name, sign) => {
  return {
    name,
    sign,
  };
};

// Display Controller Module
const DisplayController = (function () {
  // Needed for not allowing to close form modal on page load
  let isFirstGame = true;
  // DOM Cacheing
  const gameboardTiles = [];
  const gameboardContainer = document.querySelector("#gameboard-container");
  const resetButton = document.querySelector("#reset-button");
  const newGameButton = document.querySelector("#new-game-button");
  const modal = document.querySelector(".modal");

  //Reset Button Click Handler
  resetButton.addEventListener("click", () => {
    resetGameboard();
    Game.nextPlayerTurn();
  });

  newGameButton.addEventListener("click", startNewGame);
  window.addEventListener("load", startNewGame);

  function startNewGame() {
    modal.style.display = "block";
    const form = modal.querySelector("#new-game-form");

    form.addEventListener("submit", formSubmitHandler);

    function formSubmitHandler(e) {
      e.preventDefault();
      const p1Name = form.querySelector("#player1-name-input").value;
      const p1Sign = form.querySelector("#player1-sign-input").value;
      const p2Name = form.querySelector("#player2-name-input").value;
      const p2Sign = form.querySelector("#player2-sign-input").value;

      const player1 = playerFactory(p1Name, p1Sign);
      const player2 = playerFactory(p2Name, p2Sign);

      Game.initGame(player1, player2);

      form.removeEventListener("submit", formSubmitHandler);
      form.reset();
      modal.style.display = "none";
      isFirstGame = false;
    }

    // When the user clicks anywhere outside of the modal, close it
    window.addEventListener("click", function modalClickHandler(event) {
      if (event.target == modal && !isFirstGame) {
        form.removeEventListener("submit", formSubmitHandler);
        modal.style.display = "none";
        window.removeEventListener("click", modalClickHandler);
      }
    });
  }

  // Binding Events
  function bindClickHandler() {
    gameboardContainer.addEventListener("click", clickHandler);
    gameboardTiles.forEach((tile) => {
      tile.addEventListener("mouseenter", mouseEnterHandler);
      tile.addEventListener("mouseleave", mouseLeaveHandler);
    });
  }

  // Unbinding Events
  function unbindClickHandler() {
    gameboardContainer.removeEventListener("click", clickHandler);
    gameboardTiles.forEach((tile) => {
      tile.removeEventListener("mouseenter", mouseEnterHandler);
      tile.removeEventListener("mouseleave", mouseLeaveHandler);
    });
  }

  // Event Handlers
  function clickHandler(e) {
    const index = e.target.dataset.index;
    if (index === undefined) return;
    if (Game.isPlayedAt(index)) return;

    Game.playAt(index);
    e.target.classList.remove("hovering");
  }

  function mouseEnterHandler(e) {
    const index = e.target.dataset.index;
    if (index === undefined) return;
    if (Game.isPlayedAt(index)) return;

    e.target.classList.add("hovering");
    e.target.setAttribute("data-content", Game.getCurrentPlayerTurn().sign);
  }

  function mouseLeaveHandler(e) {
    const index = e.target.dataset.index;
    if (index === undefined) return;
    if (Game.isPlayedAt(index)) return;

    e.target.classList.remove("hovering");
    e.target.setAttribute("data-content", "");
  }

  // DOM manipulation Functions
  function showWinningTiles(winingTilesIndecies) {
    winingTilesIndecies.forEach((i) => {
      gameboardTiles[i].classList.add("winning");
    });
  }

  function resetGameboard() {
    Gameboard.resetGameboard();
    gameboardTiles.forEach((tile) => {
      tile.textContent = undefined;
      tile.classList.remove("winning");
    });
    bindClickHandler();
  }

  function renderGameboard() {
    gameboardTiles.forEach((tile) => tile.remove());
    Gameboard.getGameboardValues().map((v, i) => {
      const tile = document.createElement("div");
      tile.textContent = v;
      tile.classList.add("tile");
      tile.dataset.index = i;
      gameboardTiles[i] = tile;
      gameboardContainer.append(tile);
    });
  }

  // Exporting Functions
  return {
    bindClickHandler,
    unbindClickHandler,
    showWinningTiles,
    renderGameboard,
    gameboardContainer,
    gameboardTiles,
  };
})();

// Game Module
const Game = (function () {
  let player1;
  let player2;
  let currPlayerTurn;

  // Initialize Game
  const initGame = (p1, p2) => {
    player1 = p1;
    player2 = p2;
    currPlayerTurn = p1;
    DisplayController.unbindClickHandler();
    Gameboard.resetGameboard();
    DisplayController.renderGameboard();
    DisplayController.bindClickHandler();
  };

  let winingCombinations = [
    [0, 1, 2],
    [0, 3, 6],
    [0, 4, 8],
    [1, 4, 7],
    [2, 4, 6],
    [2, 5, 8],
    [3, 4, 5],
    [6, 7, 8],
  ];
  const checkForWinner = (index) => {
    index = Number(index);
    const combinations = winingCombinations.filter((arr) => {
      return arr.indexOf(index) === -1 ? false : true;
    });

    const signAtIndex = Gameboard.getSignAt(index);
    const isWinning = combinations.find((arr) => {
      return arr.every((num) => {
        if (signAtIndex === undefined) return;
        return Gameboard.getSignAt(num) === signAtIndex;
      });
    });

    return isWinning;
  };

  const isDraw = () => {
    return Gameboard.getGameboardValues().every((v) => {
      return v !== undefined;
    });
  };

  const playAt = (index) => {
    Gameboard.putSignAt(index, currPlayerTurn.sign);
    DisplayController.gameboardTiles[index].textContent = currPlayerTurn.sign;
    const winner = checkForWinner(index);
    if (!winner) {
      if (isDraw()) {
        DisplayController.unbindClickHandler();
      } else {
        nextPlayerTurn();
      }
    } else {
      DisplayController.unbindClickHandler();
      DisplayController.showWinningTiles(winner);
    }
  };

  function isPlayedAt(index) {
    return !!Gameboard.getSignAt(index);
  }

  function getCurrentPlayerTurn() {
    return currPlayerTurn;
  }

  function nextPlayerTurn() {
    if (currPlayerTurn === player1) {
      currPlayerTurn = player2;
    } else {
      currPlayerTurn = player1;
    }
  }

  return {
    initGame,
    playAt,
    isPlayedAt,
    nextPlayerTurn,
    getCurrentPlayerTurn,
  };
})();

Game.initGame(playerFactory("John", "X"), playerFactory("Doe", "O"));
