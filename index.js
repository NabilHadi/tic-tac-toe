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
    return "isDraw";
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

const DisplayController = ((doc) => {
  const gameboardContainer = doc.querySelector(".gameboard-container");
  const tiles = [];
  const restartBtn = doc.querySelector("#restart-game-btn");

  const playerOneInfo = {
    nameElm: doc.querySelector(".player-one-name"),
    scoreElm: doc.querySelector(".player-one-score"),
  };

  const playerTwoInfo = {
    nameElm: doc.querySelector(".player-two-name"),
    scoreElm: doc.querySelector(".player-two-score"),
  };

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

  PubSub.subscribe("tilePlayed", handleTilePlay);

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

  restartBtn.addEventListener("click", handleRestartBtnClick);

  const handleNewGameEvent = () => {};

  const handlePlayerWin = ({ indecies }) => {
    if (!indecies) return;

    indecies.forEach((i) => {
      const tile = getTileByIndex(i);
      tile.classList.add("winning-tile");
    });

    disableTilesClickListener();
  };

  PubSub.subscribe("playerWon", handlePlayerWin);

  const renderGameboard = (gameboard = []) => {
    gameboardContainer.innerHTML = "";
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

  return {
    renderGameboard,
    resetGameboard,
    setPlayersScores,
    setPlayersNames,
  };
})(document);

const GameCoordinator = ((Gameboard, DisplayController) => {
  const playerOne = playerFactory(1, "Joe", 1);
  const playerTwo = playerFactory(2, "Smith", 2);
  let currentPlayer = playerOne;

  DisplayController.setPlayersNames(playerOne.name, playerTwo.name);
  DisplayController.setPlayersScores(playerOne.score, playerTwo.score);

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
    Gameboard.isDraw();
  };
  PubSub.subscribe("tileClicked", handleTileClickEvent);

  const handleGameRestartRequest = () => {
    DisplayController.resetGameboard();
    Gameboard.resetGameBoardArray();
  };

  PubSub.subscribe("restartGameRequest", handleGameRestartRequest);
})(Gameboard, DisplayController);

DisplayController.renderGameboard(Gameboard.getGameboardArray());
