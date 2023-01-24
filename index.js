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
  let playerOneNumber = 1;
  let playerTwoNumber = 2;

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
    playerOneNumber,
    playerTwoNumber,
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
  };
};

const DisplayController = ((doc) => {
  const gameboardContainer = doc.querySelector(".gameboard-container");
  const tiles = [];
  const restartBtn = doc.querySelector("#restart-game-btn");

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

  const handlePlayerWin = ({ player, indecies }) => {
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

  return {
    renderGameboard,
    resetGameboard,
  };
})(document);

const GameCoordinator = ((Gameboard, DisplayController) => {
  let currentPlayer = 1;

  const handleTileClickEvent = (payload = {}) => {
    if (!payload.index) return;
    let index = Number(payload.index);

    if (!Gameboard.canPlayAt(index)) return;
    Gameboard.playAt(index, currentPlayer);

    PubSub.publish("tilePlayed", {
      index,
      sign: currentPlayer === 1 ? "X" : "O",
    });

    const winner = Gameboard.getWinner();
    if (winner) {
      PubSub.publish("playerWon", {
        player: winner.winnerNumber,
        indecies: winner.winningArray,
      });
    }

    // TODO
    Gameboard.isDraw();
    currentPlayer = currentPlayer === 1 ? 2 : 1;
  };
  PubSub.subscribe("tileClicked", handleTileClickEvent);

  const handleGameRestartRequest = () => {
    DisplayController.resetGameboard();
    Gameboard.resetGameBoardArray();
  };

  PubSub.subscribe("restartGameRequest", handleGameRestartRequest);
})(Gameboard, DisplayController);

DisplayController.renderGameboard(Gameboard.getGameboardArray());
