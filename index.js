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
    return "Winner";
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

  const renderGameboard = (gameboard = []) => {
    gameboardContainer.innerHTML = "";
    gameboard.forEach((item, index) => {
      const tile = createElement({ classNames: ["tile"], dataset: { index } });
      gameboardContainer.appendChild(tile);
    });
  };

  return {
    renderGameboard,
  };
})(document);
