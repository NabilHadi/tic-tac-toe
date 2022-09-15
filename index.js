const Gameboard = (function () {
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

const playerFactory = (name, sign) => {
  return {
    name,
    sign,
  };
};

const DisplayController = (function () {
  const gameboardTiles = [];
  const gameboardContainer = document.querySelector("#gameboard-container");
  const resetButton = document.querySelector("#reset-button");

  resetButton.addEventListener("click", () => {
    resetGameboard();
    Game.nextPlayerTurn();
  });

  function bindClickHandler() {
    gameboardContainer.addEventListener("click", clickHandler);
    gameboardTiles.forEach((tile) => {
      tile.addEventListener("mouseenter", mouseEnterHandler);
      tile.addEventListener("mouseleave", mouseLeaveHandler);
    });
  }

  function unbindClickHandler() {
    gameboardContainer.removeEventListener("click", clickHandler);
    gameboardTiles.forEach((tile) => {
      tile.removeEventListener("mouseenter", mouseEnterHandler);
      tile.removeEventListener("mouseleave", mouseLeaveHandler);
    });
  }

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
    Gameboard.getGameboardValues().map((v, i) => {
      const tile = document.createElement("div");
      tile.textContent = v;
      tile.classList.add("tile");
      tile.dataset.index = i;
      gameboardTiles[i] = tile;
      gameboardContainer.append(tile);
    });
  }

  return {
    bindClickHandler,
    unbindClickHandler,
    showWinningTiles,
    renderGameboard,
    gameboardContainer,
    gameboardTiles,
  };
})();

const Game = (function () {
  let player1;
  let player2;
  let currPlayerTurn;

  const setPlayers = (p1, p2) => {
    player1 = p1;
    player2 = p2;
    currPlayerTurn = p1;
    Gameboard.resetGameboard();
    DisplayController.renderGameboard();
    DisplayController.bindClickHandler();
  };

  const nextPlayerTurn = () => {
    if (currPlayerTurn === player1) {
      currPlayerTurn = player2;
    } else {
      currPlayerTurn = player1;
    }
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
        console.log("draw");
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

  return {
    setPlayers,
    playAt,
    isPlayedAt,
    nextPlayerTurn,
    getCurrentPlayerTurn,
  };
})();

Game.setPlayers(playerFactory("John", "X"), playerFactory("Doe", "O"));
