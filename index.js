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

const PubSub = (() => {
  const events = [];
  return {
    subscribe(eventName, func) {
      if (events[eventName]) {
        events[eventName].push(func);
        console.log(`${func.name} has subscribed to ${eventName} Topic!`);
      } else {
        events[eventName] = [func];
        console.log(`${func.name} has subscribed to ${eventName} Topic!`);
      }
    },
    unsubscribe(eventName, func) {
      if (events[eventName]) {
        events[eventName] = events[eventName].filter((fn) => fn !== func);
        console.log(`${func.name} has unsubscribed from ${eventName} Topic!`);
      }
    },
    publish(eventName, ...args) {
      const funcs = events[eventName];
      if (Array.isArray(funcs)) {
        funcs.forEach((func) => {
          func.apply(null, args);
        });
      }
    },
  };
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

const playerFactory = (id, name, number) => {
  return {
    getId() {
      return id;
    },
    name,
    number,
    score: 0,
  };
};

const DisplayController = (() => {
  let doc;
  let modal;
  let gameboardContainer;
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

    const playerOne = playerFactory(1, playerOneName, 1);
    const playerTwo = playerFactory(2, playerTwoName, 2);

    resetGameboard();
    PubSub.publish("newGame", { playerOne, playerTwo });
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
    PubSub.publish("tileClicked", { index });
  };

  const handleTilePlay = (payload) => {
    const tile = getTileByIndex(payload.index);
    if (!tile) return;

    tile.textContent = payload.sign;
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

  const handleRestartBtnClick = (event) => {
    PubSub.publish("restartGameRequest");
  };

  const handlePlayerWin = ({ indecies }) => {
    if (!indecies) return;

    indecies.forEach((i) => {
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

  function init(document, _modal) {
    doc = document;
    modal = _modal;
    gameboardContainer = doc.querySelector(".gameboard-container");
    tiles = [];
    restartBtn = doc.querySelector("#restart-game-btn");
    newGameBtn = doc.querySelector("#new-game-btn");
    newGameForm = doc.querySelector("#new_game_form");

    playerOneInfo = {
      nameElm: doc.querySelector(".player-one-name"),
      scoreElm: doc.querySelector(".player-one-score"),
    };

    playerTwoInfo = {
      nameElm: doc.querySelector(".player-two-name"),
      scoreElm: doc.querySelector(".player-two-score"),
    };

    modal.setContent([newGameForm]);
    doc.body.appendChild(modal.getView());

    newGameBtn.addEventListener("click", handleNewGameBtnClick);
    newGameForm.addEventListener("submit", handleNewGamFormSubmit);
    PubSub.subscribe("tilePlayed", handleTilePlay);
    restartBtn.addEventListener("click", handleRestartBtnClick);
    PubSub.subscribe("playerWon", handlePlayerWin);
  }

  return {
    init,
    renderGameboard,
    resetGameboard,
    setPlayersScores,
    setPlayersNames,
    displayForm,
  };
})(document, modal);

const GameCoordinator = (() => {
  let Gameboard;
  let DisplayController;
  let playerOne = null;
  let playerTwo = null;
  let currentPlayer = playerOne;

  const handleTileClickEvent = (payload = {}) => {
    if (!payload.index) return;
    let index = Number(payload.index);

    if (!Gameboard.canPlayAt(index)) return;
    Gameboard.playAt(index, currentPlayer.number);

    PubSub.publish("tilePlayed", {
      index,
      sign: currentPlayer === playerOne ? "X" : "O",
    });

    const winner = Gameboard.getWinner();
    if (winner) {
      PubSub.publish("playerWon", {
        indecies: winner.winningArray,
      });
      currentPlayer.score++;
      DisplayController.setPlayersScores(playerOne.score, playerTwo.score);
    }
    currentPlayer = currentPlayer === playerOne ? playerTwo : playerOne;

    // TODO
    console.log(Gameboard.isDraw());
  };

  const handleGameRestartRequest = () => {
    DisplayController.resetGameboard();
    Gameboard.resetGameBoardArray();
  };

  const handleNewGame = (payload) => {
    playerOne = payload.playerOne;
    playerTwo = payload.playerTwo;
    currentPlayer = playerOne;
    Gameboard.resetGameBoardArray();
    DisplayController.setPlayersNames(playerOne.name, playerTwo.name);
    DisplayController.setPlayersScores(playerOne.score, playerTwo.score);
    DisplayController.renderGameboard(Gameboard.getGameboardArray());
  };

  function init(_Gameboard, _DisplayController) {
    Gameboard = _Gameboard;
    DisplayController = _DisplayController;
    PubSub.subscribe("tileClicked", handleTileClickEvent);
    PubSub.subscribe("newGame", handleNewGame);
    PubSub.subscribe("restartGameRequest", handleGameRestartRequest);
  }

  return {
    init,
  };
})();

DisplayController.init(document, modal);
GameCoordinator.init(Gameboard, DisplayController);
DisplayController.displayForm();
