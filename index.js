function createElement({
  tag = "div",
  classNames = [],
  textContent,
  dataset = {},
  attributes = {},
  eventHandlers = {},
} = {}) {
  // Create elm with tag
  const elm = document.createElement(tag);

  // Add classes
  classNames.forEach((className) => {
    elm.classList.add(className);
  });

  // Set textContent
  if (textContent) {
    elm.textContent = textContent;
  }

  // Set dataset
  for (const key in dataset) {
    elm.dataset[key] = dataset[key];
  }

  // Set Attribuites
  for (const key in attributes) {
    elm.setAttribute(key, attributes[key]);
  }

  // Set Handlers
  for (const key in eventHandlers) {
    elm.addEventListener(key, eventHandlers[key]);
  }

  return elm;
}

const modal = (function () {
  let closeable = true;
  const view = createElement({
    tag: "div",
    classNames: ["modal"],
    attributes: { id: "modal" },
  });

  const modalContent = createElement({
    tag: "div",
    classNames: ["modal-content"],
    attributes: {
      id: "modal-content",
    },
  });
  view.append(modalContent);

  const closeBtn = createElement({
    tag: "span",
    classNames: ["close"],
    textContent: "×",
  });
  modalContent.append(closeBtn);

  closeBtn.addEventListener("click", () => {
    if (closeable) {
      hideModal();
    }
  });

  view.addEventListener(
    "click",
    (e) => {
      if (view !== e.target || !closeable) return;
      hideModal();
    },
    false
  );

  function setContent(content = []) {
    modalContent.innerHTML = "";
    modalContent.append(closeBtn);

    modalContent.append(...content);
  }

  function showModal() {
    view.classList.add("show");
  }

  function hideModal() {
    view.classList.remove("show");
  }

  function getView() {
    return view;
  }

  function setCloseable(bool) {
    closeable = bool;
  }

  return { setContent, showModal, hideModal, getView, setCloseable };
})();

const Gameboard = (() => {
  const gameBoardArray = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  const canPlayAt = (index) => {
    if (index < 0 || index >= gameBoardArray.length) return false;
    return gameBoardArray[index] === 0;
  };

  const playAt = (index, number) => {
    gameBoardArray[index] = number;
  };

  const resetGameBoardArray = () => {
    for (let i = 0; i < gameBoardArray.length; i++) {
      gameBoardArray[i] = 0;
    }
  };

  const getGameboardArray = () => [...gameBoardArray];

  const getWinner = () => {
    const winningCombinations = [
      [0, 1, 2],
      [0, 4, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [2, 4, 6],
      [3, 4, 5],
      [6, 7, 8],
    ];

    const winningArray = winningCombinations.find((comb) => {
      if (comb.some((elm) => gameBoardArray[elm] === 0)) return;
      return (
        gameBoardArray[comb[0]] === gameBoardArray[comb[1]] &&
        gameBoardArray[comb[0]] === gameBoardArray[comb[2]]
      );
    });

    if (winningArray) {
      return {
        winnerNumber: gameBoardArray[winningArray[0]],
        winningArray: winningArray,
      };
    }
  };

  const isDraw = () => {
    return !getWinner() && gameBoardArray.every((v) => v !== 0);
  };

  return {
    canPlayAt,
    playAt,
    resetGameBoardArray,
    getGameboardArray,
    getWinner,
    isDraw,
  };
})();

const playerFactory = (id, name, number, sign) => {
  return {
    getId() {
      return id;
    },
    name,
    number,
    sign,
    score: 0,
  };
};

const DisplayController = (() => {
  let gameboardContainer;
  let overlay;
  let tiles;
  let restartBtn;
  let newGameBtn;
  let newGameForm;

  let playerOneInfo;

  let playerTwoInfo;

  function handleNewGameBtnClick() {
    modal.showModal();
  }

  function handleNewGamFormSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const playerOneName = formData.get("p1_name");
    const playerTwoName = formData.get("p2_name");

    const playerOne = playerFactory(1, playerOneName, 1, "X");
    const playerTwo = playerFactory(2, playerTwoName, 2, "O");

    resetGameboard();
    GameCoordinator.startNewGame(playerOne, playerTwo);
    modal.hideModal();
  }

  const clearTiles = () => {
    tiles.forEach((t) => {
      t.textContent = "";
      t.classList.remove("winning-tile");
    });
  };

  const getTileByIndex = (index) => {
    return tiles.find((t) => {
      return t.dataset.index == index;
    });
  };

  const handleTileClick = (event) => {
    const index = event.target.dataset.index;
    if (!index) return;
    GameCoordinator.playAt(index);
  };

  const setTileContent = (index, content) => {
    const tile = getTileByIndex(index);
    if (!tile) return;

    tile.textContent = content;
  };

  const disableTilesClickListener = () => {
    tiles.forEach((t) => {
      t.removeEventListener("click", handleTileClick);
    });
  };

  const enableTilesClickListener = () => {
    tiles.forEach((t) => {
      t.addEventListener("click", handleTileClick);
    });
  };

  const handleRestartBtnClick = () => {
    GameCoordinator.restartGame();
  };

  const handlePlayerWin = (tileIndecies) => {
    if (!tileIndecies) return;

    tileIndecies.forEach((i) => {
      const tile = getTileByIndex(i);
      tile.classList.add("winning-tile");
    });

    disableTilesClickListener();
  };

  const renderGameboard = (gameboard = []) => {
    // Clear state
    disableTilesClickListener();
    tiles.forEach((t) => t.remove());
    tiles = [];
    gameboardContainer.innerHTML = "";
    gameboardContainer.appendChild(overlay);

    // Set State
    gameboard.forEach((item, index) => {
      const tile = createElement({
        classNames: ["tile"],
        dataset: { index },
        eventHandlers: { click: handleTileClick },
      });
      gameboardContainer.appendChild(tile);
      tiles.push(tile);
    });
  };

  function resetGameboard() {
    clearTiles();
    enableTilesClickListener();
  }

  function setPlayersNames(p1Name, p2Name) {
    playerOneInfo.nameElm.textContent = p1Name;
    playerTwoInfo.nameElm.textContent = p2Name;
  }

  function setPlayersScores(p1Score, p2Score) {
    playerOneInfo.scoreElm.textContent = p1Score;
    playerTwoInfo.scoreElm.textContent = p2Score;
  }

  function displayForm() {
    modal.showModal();
    modal.setCloseable(false);
  }

  function displayOverlay(content) {
    overlay.textContent = content;
    overlay.classList.remove("hide");
  }

  function hideOverlay() {
    overlay.classList.add("hide");
  }

  function enableRestartGameBtn() {
    restartBtn.disabled = false;
  }

  function disableRestartGameBtn() {
    restartBtn.disabled = true;
  }

  function init() {
    gameboardContainer = document.querySelector(".gameboard-container");
    overlay = document.querySelector(".overlay");
    tiles = [];
    restartBtn = document.querySelector("#restart-game-btn");
    newGameBtn = document.querySelector("#new-game-btn");
    newGameForm = document.querySelector("#new_game_form");

    playerOneInfo = {
      nameElm: document.querySelector(".player-one-name"),
      scoreElm: document.querySelector(".player-one-score"),
    };

    playerTwoInfo = {
      nameElm: document.querySelector(".player-two-name"),
      scoreElm: document.querySelector(".player-two-score"),
    };

    modal.setContent([newGameForm]);
    document.body.appendChild(modal.getView());

    newGameBtn.addEventListener("click", handleNewGameBtnClick);
    restartBtn.addEventListener("click", handleRestartBtnClick);
    newGameForm.addEventListener("submit", handleNewGamFormSubmit);
  }

  return {
    init,
    setTileContent,
    handlePlayerWin,
    renderGameboard,
    resetGameboard,
    setPlayersScores,
    setPlayersNames,
    displayForm,
    displayOverlay,
    hideOverlay,
    enableRestartGameBtn,
    disableRestartGameBtn,
  };
})();

const GameCoordinator = (() => {
  let playerOne = null;
  let playerTwo = null;
  let currentPlayer = playerOne;

  const playAt = (index) => {
    index = Number(index);

    if (!Gameboard.canPlayAt(index)) return;
    Gameboard.playAt(index, currentPlayer.number);

    DisplayController.setTileContent(index, currentPlayer.sign);

    if (!checkForWinner()) {
      if (Gameboard.isDraw()) {
        DisplayController.displayOverlay("DRAW!");
        setTimeout(() => {
          restartGame();
          DisplayController.hideOverlay();
        }, 1000);
      }
    } else {
      DisplayController.displayOverlay(`${currentPlayer.name} Won!!!`);
      if (currentPlayer.score < 3) {
        setTimeout(() => {
          restartGame();
          DisplayController.hideOverlay();
        }, 1000);
      } else {
        DisplayController.disableRestartGameBtn();
      }
    }
    currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;
  };

  function checkForWinner() {
    const winner = Gameboard.getWinner();
    if (winner) {
      DisplayController.handlePlayerWin(winner.winningArray);
      currentPlayer.score++;
      DisplayController.setPlayersScores(playerOne.score, playerTwo.score);
      return true;
    }
  }

  const restartGame = () => {
    DisplayController.resetGameboard();
    Gameboard.resetGameBoardArray();
  };

  const startNewGame = (player1, player2) => {
    playerOne = player1;
    playerTwo = player2;
    currentPlayer = playerOne;
    Gameboard.resetGameBoardArray();
    DisplayController.hideOverlay();
    DisplayController.enableRestartGameBtn();
    DisplayController.setPlayersNames(playerOne.name, playerTwo.name);
    DisplayController.setPlayersScores(playerOne.score, playerTwo.score);
    DisplayController.renderGameboard(Gameboard.getGameboardArray());
  };

  return {
    playAt,
    startNewGame,
    restartGame,
  };
})();

DisplayController.init();
DisplayController.displayForm();
