import game from "./game.js";
import common from "../common/index.js";

const destination = "localhost";
const port = "8080";

const messenger = {
  webSocket: false,
  setSocket(passedSocket) {
    if (!messenger.webSocket) messenger.webSocket = passedSocket;
    return this;
  },

  respond(message) {
    message = JSON.parse(message);
    const subject = message.body?.subject ?? false;
    const value = message.body.value ?? true;
    let handler;
    switch (message.header) {
      case common.messageStructure.successHeader: {
        handler = successHandler;
        break;
      }
      case common.messageStructure.id: {
        handler = identifierHandler;
        break;
      }
      case common.messageStructure.newPlayerHeader: {
        handler = newPlayerHandler;
        break;
      }
      case common.messageStructure.playerListHeader: {
        handler = playerListHandler;
        break;
      }
      case common.messageStructure.playerLeftHeader: {
        handler = playerLeftHandler;
        break;
      }
      case common.messageStructure.hostHeader: {
        handler = hostHandler;
        break;
      }
      case common.messageStructure.newHostHeader: {
        handler = hostHandler;
        break;
      }
      case common.messageStructure.settingsUpdateHeader: {
        handler = settingsUpdateHandler;
        break;
      }
      case common.messageStructure.playerCardsHeader: {
        handler = playerCardsHandler;
        break;
      }
      case common.messageStructure.roundWinnerHeader: {
        handler = roundWinnerHandler;
        break;
      }
      case common.messageStructure.pointAddedHeader: {
        handler = pointAddedHandler;
        break;
      }
      case common.messageStructure.gameWinnerHeader: {
        handler = gameWinnerHandler;
        break;
      }
      default: {
        break;
      }
    }

    if (!handler) return false;
    handler.handle({ subject, value });
  },

  speak({ subject, value }) {
    // message containts subject and value parameters
    let talker;
    switch (subject) {
      case common.subjects.settingsUpdate: {
        talker = settingsUpdateTalker;
        break;
      }
      case common.subjects.gameStarted: {
        talker = gameStartTalker;
        break;
      }
      case common.subjects.cardValue: {
        talker = cardValueTalker;
        break;
      }
      case common.subjects.cardSend: {
        talker = cardSendTalker;
        break;
      }
      case common.subjects.cardVote: {
        talker = cardVoteTalker;
        break;
      }
      case common.subjects.cardRevealed: {
        talker = cardRevealedTalker;
        break;
      }
      case common.subjects.generateCards: {
        talker = generateCardsTalker;
        break;
      }
      default: {
        console.log("no talker was set!");
        return false;
      }
    }

    talker.talk(value);
  },
};

const successHandler = {
  handle({ subject, value }) {
    console.dir(`passed subject: ${subject}`);
    switch (subject) {
      case common.subjects.setNickName: {
        player.nickName = value;
        console.log(`player nickname was set as: ${value}`);
        // call update for player list element
        domElements.playerList.callbacks.addPlayer(value);
        break;
      }
      case common.subjects.gameStarted: {
        gameStartHandler.handle({ value });
        break;
      }
      case common.subjects.cardRevealed: {
        cardRevealedHandler.handle({ value });
        break;
      }
      case common.subjects.generateCards: {
        generateCardsHandler.handle({ value });
        break;
      }
    }
  },
};

const newPlayerHandler = {
  handle({ value }) {
    switch (player.nickName) {
      case value: {
        break;
      }
      default: {
        domElements.playerList.callbacks.addPlayer(value);
      }
    }
  },
};

const playerLeftHandler = {
  handle({ value }) {
    domElements.playerList.callbacks.removePlayer(value);
  },
};

const playerListHandler = {
  handle({ value }) {
    return domElements.playerList.callbacks.recreateList(value);
  },
};

const identifierHandler = {
  handle({ value }) {
    console.dir(`serever assigned id: ${value}`);
    player.id = Number.parseInt(value);
    player.setNickName();
  },
};

const hostHandler = {
  handle({ value }) {
    domElements.playerList.callbacks.setAsHost(value);
    game.playing = false;

    switch (value === player.nickName) {
      case false: {
        player.isHost = false;
        domElements.gameSettings.callbacks.hide();
        domElements.startButton.callbacks.hide();
        domElements.gameBox.callbacks.showCards();
        break;
      }
      default: {
        player.isHost = true;
        domElements.gameSettings.callbacks.show();
        domElements.startButton.callbacks.show();
        domElements.gameBox.callbacks.hideCards();
        break;
      }
    }
  },
};

const settingsUpdateHandler = {
  handle({ value }) {
    // update common.gameSettings according to passed value object
    common.gameSettings.functions.setDifference(value);
    domElements.gameSettings.callbacks.sync();
  },
};

// game start handler is invoked by success handler (server sends success header with gameStart value)
const gameStartHandler = {
  handle({ value }) {
    console.log("game started!");
    switch (value) {
      case false: {
        return false;
      }
      default: {
        // start game (locally)
        domElements.startButton.callbacks.startGame();
        domElements.gameBox.callbacks.setAsActive();
        domElements.gameBox.callbacks.clearWinner();
        domElements.gameBox.callbacks.displayQuestion(value);
        domElements.cardsFigure.callbacks.requestCards();

        // setTimeout(() => {
        // }, 0);
        break;
      }
    }
  },
};

// handles sent array with all players cards
const playerCardsHandler = {
  handle({ value }) {
    // value will be an array with [<player name>, <card as JSON>] values

    // revind game's clock
    console.log("revinding clock");
    game.revind();
    //set game box as voting class
    domElements.gameBox.callbacks.setAsVoting();
    domElements.cardCreationForm.callbacks.close();
    game.displayAnswers(value);
  },
};

const roundWinnerHandler = {
  handle({ value }) {
    console.dir(value);
    domElements.card.callbacks.mark(value);
  },
};

const gameWinnerHandler = {
  handle({ value }) {
    console.dir(value);
    game.clearDeck();
    game.instance = false;
    domElements.gameBox.callbacks.displayWinner(value);
    domElements.playerList.callbacks.clearScores();
    game.running = false;
  },
};

const pointAddedHandler = {
  handle({ value }) {
    domElements.playerList.callbacks.setScore(value);
  },
};

const cardRevealedHandler = {
  handle({ value }) {
    domElements.card.callbacks.markReveal(value);
  },
};

const generateCardsHandler = {
  handle({ value }) {
    domElements.cardsFigure.callbacks.populate(value);
  },
};

const settingsUpdateTalker = {
  talk(value) {
    console.dir("talking to server ", { value });
    // if the value is false, don't send it

    switch (value) {
      case false: {
        return false;
      }
      default: {
        break;
      }
    }

    value = JSON.stringify({
      header: common.messageStructure.requestHeader,
      body: { subject: common.subjects.settingsUpdate, id: player.id, value },
    });
    client.sendMessage(value);
  },
};

const gameStartTalker = {
  talk(value) {
    console.dir("talking to server ", { value });

    value = JSON.stringify({
      header: common.messageStructure.requestHeader,
      body: { subject: common.subjects.gameStarted, id: player.id, value },
    });

    client.sendMessage(value);
  },
};

const cardValueTalker = {
  talk(value) {
    console.log("sending to server info about played card...");

    value = JSON.stringify({
      header: common.messageStructure.requestHeader,
      body: { subject: common.subjects.cardValue, id: player.id, value },
    });

    client.sendMessage(value);
  },
};

const cardSendTalker = {
  talk(value) {
    console.log("telling server client picked a card");

    value = JSON.stringify({
      header: common.messageStructure.requestHeader,
      body: { subject: common.subjects.cardSend, id: player.id, value },
    });

    client.sendMessage(value);
  },
};

const cardVoteTalker = {
  talk(value) {
    console.log("telling server we've voted for winner card");

    value = JSON.stringify({
      header: common.messageStructure.requestHeader,
      body: { subject: common.subjects.cardVote, id: player.id, value },
    });

    client.sendMessage(value);
  },
};

// asks server to generate answer cards for us
// activates every time the game (or round) starts
const generateCardsTalker = {
  previousRequest: false,
  talk(value = 0) {
    // cardsArray in this case is nodeList of .card class elements.

    switch (generateCardsHandler.previousRequest) {
      case false: {
        generateCardsHandler.previousRequest = Date.now();
        break;
      }
      default: {
        if (Date.now() - generateCardsHandler.previousRequest <= 1000) {
          domElements.cardsFigure.callbacks.populate();
          return false;
        }
      }
    }

    switch (!common.gameSettings.voteMode && player.isHost) {
      case true: {
        return false;
      }
      default: {
        break;
      }
    }

    value = common.gameSettings.generics.cardsInHand - value;

    switch (value <= 0) {
      case true: {
        // if there's no cards in need for replacement, just display current cards
        domElements.cardsFigure.callbacks.populate();
        return false;
      }
      default: {
        break;
      }
    }

    console.log("asking server to generate cards for client");

    value = JSON.stringify({
      header: common.subjects.requestHeader,
      body: { subject: common.subjects.generateCards, id: player.id, value },
    });

    client.sendMessage(value);
  },
};

const cardRevealedTalker = {
  talk(value) {
    console.log("telling server card has been revealed");

    value = JSON.stringify({
      header: common.subjects.requestHeader,
      body: { subject: common.subjects.cardRevealed, id: player.id, value },
    });

    client.sendMessage(value);
  },
};

const player = {
  nickName: false,
  id: false,
  isHost: false,
  // setNickName fires right after connecting to webSocket

  setNickName(nickName = false) {
    while (!nickName) {
      nickName = prompt("please enter nickname").trim();
    }
    // send clients id via message
    const message = JSON.stringify({
      header: common.messageStructure.requestHeader,
      body: {
        subject: common.subjects.setNickName,
        value: nickName,
        id: player.id,
      },
    });

    console.dir(message);

    messenger.webSocket.send(message);
  },

  // connect function triggers after we get setNickName responce from server
  // takes status (bool) as an argument
  connect(status = false, nickName = "") {
    switch (status) {
      case false: {
        return player.setNickName();
      }
      default: {
        player.nickName = nickName;
      }
    }
  },
};

const domElements = {
  playerList: {
    element: document.getElementById("players"),

    idRefferences: {
      element: "players",
    },

    idLabels: {
      listNick: "list-nick",
    },

    classes: {
      host: "host",
      score: "score",
    },

    callbacks: {
      addPlayer(nickname) {
        const playerList = domElements.playerList;
        const playerListElement = document.getElementById(
          playerList.idRefferences.element
        );
        const trElement = document.createElement("tr");

        const nicknameElement = document.createElement("td");
        const score = document.createElement("td");
        nicknameElement.textContent = nickname;
        score.classList.add(playerList.classes.score);
        score.textContent = "0";
        trElement.append(nicknameElement, score);
        trElement.id = `${domElements.playerList.idLabels.listNick}-${nickname}`;
        playerListElement.append(trElement);
      },

      // appends every nickname (besides current player nickname) to list
      recreateList(playersArray) {
        const playerList = domElements.playerList;
        const playerListElement = document.getElementById(
          playerList.idRefferences.element
        );
        const documentFragment = new DocumentFragment();
        let playerElement, nickElement, currentNick, currentScore;
        let scoreElement;
        for (let iteration = 0; iteration < playersArray.length; iteration++) {
          currentNick = playersArray[iteration].nickname;
          currentScore = playersArray[iteration].score;
          playerElement = document.createElement("tr");
          playerElement.id = `${playerList.idLabels.listNick}-${currentNick}`;
          nickElement = document.createElement("td");
          scoreElement = document.createElement("td");
          nickElement.textContent = currentNick;
          scoreElement.classList.add(playerList.classes.score);
          scoreElement.textContent = currentScore || 0;
          playerElement.append(nickElement, scoreElement);
          documentFragment.append(playerElement);
        }
        playerListElement.append(documentFragment);
      },

      // set scores for all players as 0
      clearScores() {
        const playerList = domElements.playerList;
        const playerListElement = document.getElementById(
          playerList.idRefferences.element
        );

        const scores = playerListElement.querySelectorAll(
          `.${playerList.classes.score}`
        );

        for (let iteration = 0; iteration < scores.length; iteration++) {
          scores[iteration].textContent = "0";
        }
      },
      removePlayer(nickName) {
        const liElement = document.getElementById(
          `${domElements.playerList.idLabels.listNick}-${nickName}`
        );
        liElement?.remove();
      },
      setAsHost(nickName) {
        const playerList = domElements.playerList;

        const playerListElement = document.getElementById(
          playerList.idRefferences.element
        );

        if (playerListElement.children.length === 0) {
          return setTimeout(() => {
            domElements.playerList.callbacks.setAsHost(nickName);
          }, 0);
        }
        const previousHostElement = document.querySelector(
          `.${domElements.playerList.classes.host}`
        );

        previousHostElement?.classList.remove(
          domElements.playerList.classes.host
        );

        const targetElement = document.getElementById(
          `${domElements.playerList.idLabels.listNick}-${nickName}`
        );
        targetElement?.classList.add(domElements.playerList.classes.host);
      },

      // increases target player score
      setScore(passedObject) {
        const nickname = passedObject.nickname;
        const score = passedObject.score;
        const playerList = domElements.playerList;
        const liElement = document.getElementById(
          `${domElements.playerList.idLabels.listNick}-${nickname}`
        );
        const scoreElement =
          liElement?.querySelector(`.${playerList.classes.score}`) ?? false;

        switch (scoreElement) {
          case false: {
            return false;
          }
          default: {
            scoreElement.textContent = score;
            return true;
          }
        }
      },
    },
  },

  gameSettings: {
    element: document.getElementById("game-settings"),

    inputs: {
      roundDuration: document.getElementById("round-duration"),
      maxBlankCards: document.getElementById("max-blank-cards"),
      pointsToWin: document.getElementById("points-to-win"),
      maxPlayers: document.getElementById("max-players"),
      cardsInHand: document.getElementById("cards-in-hand"),
      voteMode: document.getElementById("vote-mode"),
      hostRotation: document.getElementById("host-rotation"),
      revealOneByOne: document.getElementById("reveal-one-by-one"),
    },

    idRefferences: {
      gameSettingsLink: "game-settings-link",
      element: "game-settings",
    },

    classes: {
      visible: "visible",
    },

    callbacks: {
      show() {
        const gameSettings = domElements.gameSettings;
        const gameSettingsElement = document.getElementById(
          gameSettings.idRefferences.element
        );
        const gameSettingsLink = document.getElementById(
          gameSettings.idRefferences.gameSettingsLink
        );
        gameSettingsLink.classList.add(gameSettings.classes.visible);
        gameSettingsElement.classList.add(gameSettings.classes.visible);
      },

      hide() {
        const gameSettings = domElements.gameSettings;
        const gameSettingsElement = document.getElementById(
          gameSettings.idRefferences.element
        );
        const gameSettingsLink = document.getElementById(
          gameSettings.idRefferences.gameSettingsLink
        );
        gameSettingsLink.classList.remove(gameSettings.classes.visible);

        gameSettingsElement.classList.remove(gameSettings.classes.visible);
      },

      gatherValues(event) {
        event.preventDefault();
        const gameSettings = domElements.gameSettings;
        const gameSettingsElement = document.getElementById(
          gameSettings.idRefferences.element
        );

        let inputValue;
        let differenceObject;
        let currentInput;
        const parameters = {};
        switch (gameSettingsElement.checkValidity()) {
          case false: {
            return false;
          }
          default: {
            break;
          }
        }

        for (const key in gameSettings.inputs) {
          currentInput = gameSettings.inputs[key];
          switch (currentInput.type) {
            case "checkbox": {
              inputValue = currentInput.checked;
              break;
            }
            default: {
              inputValue = currentInput.value;
              break;
            }
          }

          parameters[key] = inputValue;
        }

        differenceObject =
          common.gameSettings.functions.getDifference(parameters);

        window.location.assign(`${window.location}`.split("#")[0] + "#!");

        return messenger.speak({
          subject: common.subjects.settingsUpdate,
          value: differenceObject,
        });
      },

      sync() {
        const gameSettings = domElements.gameSettings;
        let currentInput, currentInputId;
        let settingValue;
        let inputs = Object.values(gameSettings.inputs);

        for (let iteration = 0; iteration < inputs.length; iteration++) {
          currentInput = inputs[iteration];
          currentInputId = currentInput.id;

          // switch this id from kebab-case to camelCase
          currentInputId = currentInputId.split("-");

          currentInputId = currentInputId.map((value, index) => {
            switch (index) {
              case 0: {
                return value;
              }
              default: {
                return `${value[0].toUpperCase()}${value.slice(
                  1,
                  value.length
                )}`;
              }
            }
          });

          currentInputId = currentInputId.join("");

          settingValue = common.gameSettings.generics[currentInputId];

          switch (typeof settingValue) {
            case "number": {
              currentInput.value = settingValue;
            }
            case "boolean": {
              if (settingValue === true) {
                currentInput.setAttribute("checked", "");
              } else {
                currentInput.removeAttribute("checked");
              }
            }
          }
        }
      },
    },
  },

  gameBox: {
    element: document.getElementById("game"),
    markup: false,

    classes: {
      voting: "voting",
      active: "active",
      hiddenCards: "hidden-cards",
    },

    idRefferences: {
      question: "question",
      winner: "winner",
      element: "game",
    },

    callbacks: {
      // indicate that game is in voting state (after cards have been picked)
      setAsVoting() {
        const gameBox = domElements.gameBox;
        const gameBoxElement = document.getElementById(
          gameBox.idRefferences.element
        );
        gameBoxElement.classList.add(gameBox.classes.voting);
      },

      unsetAsVoting() {
        const gameBox = domElements.gameBox;
        const gameBoxElement = document.getElementById(
          gameBox.idRefferences.element
        );
        gameBoxElement.classList.remove(gameBox.classes.voting);
      },

      setAsActive() {
        const gameBox = domElements.gameBox;
        const gameBoxElement = document.getElementById(
          gameBox.idRefferences.element
        );
        gameBoxElement.classList.add(gameBox.classes.active);
      },

      hideCards() {
        // hides all cards (if player is host AND voteMode is disabled)
        const gameBox = domElements.gameBox;
        const gameBoxElement = document.getElementById(
          gameBox.idRefferences.element
        );
        gameBoxElement.classList.add(gameBox.classes.hiddenCards);
      },

      showCards() {
        const gameBox = domElements.gameBox;
        const gameBoxElement = document.getElementById(
          gameBox.idRefferences.element
        );
        gameBoxElement.classList.remove(gameBox.classes.hiddenCards);
      },

      storeMarkup() {
        const gameBox = domElements.gameBox;
        const gameBoxElement = document.getElementById(
          gameBox.idRefferences.element
        );
        gameBox.markup = gameBoxElement.outerHTML;
      },

      restoreMarkup() {
        const gameBox = domElements.gameBox;
        const gameBoxElement = document.getElementById(
          gameBox.idRefferences.element
        );
        gameBoxElement.outerHTML = gameBox.markup;
      },

      displayWinner(winner) {
        const gameBox = domElements.gameBox;
        gameBox.callbacks.restoreMarkup();
        gameBox.callbacks.hideCards();
        const winnerElement = document.getElementById(
          gameBox.idRefferences.winner
        );
        winnerElement.textContent = `winner: ${winner}`;
      },

      clearWinner() {
        const gameBox = domElements.gameBox;
        const winnerElement = document.getElementById(
          gameBox.idRefferences.winner
        );
        winnerElement.textContent = "";
      },

      displayQuestion(question) {
        const questionElement = document.getElementById(
          domElements.gameBox.idRefferences.question
        );
        questionElement.textContent = question;
      },
    },
  },

  clock: {
    element: document.getElementById("clock"),
    idRefferences: {
      element: "clock",
    },
  },

  cardsFigure: {
    element: document.getElementById("cards"),
    markup: "",

    idRefferences: {
      element: "cards",
    },

    callbacks: {
      requestCards() {
        const size = game.getCards().size;
        return messenger.speak({
          subject: common.subjects.generateCards,
          value: size,
        });
      },

      // populates figure elements with cards sent by server
      // happens after sucess header with generateCards subject
      populate(cardsArray = []) {
        switch (game.instance) {
          case false: {
            domElements.startButton.callbacks.startGame();
            break;
          }
          default: {
            break;
          }
        }

        // catching bug from somewhere else (somehow card generation request is send twice)
        switch (
          game.getCards().size < common.gameSettings.generics.cardsInHand
        ) {
          case false: {
            break;
          }
          default: {
            for (
              let iteration = 0;
              iteration < cardsArray.length;
              iteration++
            ) {
              game.addCard(cardsArray[iteration]);
            }
          }
        }

        game.populateDeck();
      },
    },
  },

  card: {
    classes: {
      element: "card",
      votable: "votable",
      // class to indicate host can reveal this card
      hidden: "hidden",
      // class for button inside card to reveal this card
      reveal: "reveal",

      // currently selected card. Card of this class will be dumped after sending card info
      selected: "selected",

      pick: "pick",

      dump: "dump",

      nickname: "nickname",

      //winner card choosen by host or by most votes
      marked: "marked",
    },

    // holds cards created by user
    // {image: <src>, text: <text>}
    // inventory: [],

    idRefferences: {
      dumpAll: "dump-all",
    },

    selectors: {
      image: "img",
      text: "figcaption",
    },

    callbacks: {
      pick(event) {
        const selectors = domElements.card.selectors;
        let image, text;
        let card, cardElement;
        let isPickElement;
        const elementClass = domElements.card.classes.element;
        const pickElement = domElements.card.classes.pick;
        cardElement = event.target.closest(`.${elementClass}`) ?? false;
        isPickElement = event.target.matches(`.${pickElement}`);
        switch (isPickElement) {
          case false: {
            return false;
          }
          default: {
            break;
          }
        }
        console.log("setting card!");
        image = cardElement.querySelector(selectors.image);
        text = cardElement.querySelector(selectors.text);

        switch (!image.src && !text.textContent) {
          // if no image source or card text were given, set card as blank
          case true: {
            console.log("choosen card is blank!");
            card = false;
            break;
          }
          default: {
            card = {
              image: image.src ?? false,
              text: text.textContent ?? false,
            };
          }
        }

        game.setCard(card);
        domElements.card.callbacks.setCard(cardElement);

        // now tell server we picked a card
        messenger.speak({
          subject: common.subjects.cardSend,
          value: card,
        });
      },

      setCard(element) {
        const card = domElements.card;
        const selectedClass = card.classes.selected;
        const cardsFigureElement = document.getElementById(
          domElements.cardsFigure.idRefferences.element
        );
        const previousCard = cardsFigureElement.querySelector(
          `.${selectedClass}`
        );

        previousCard?.classList.remove(selectedClass);

        element.classList.add(selectedClass);
      },

      dumpCardOnEvent(event) {
        const card = domElements.card;
        const cardDumpClass = card.classes.dump;
        const cardElementSelector = card.classes.element;
        let cardElement;

        switch (event.target.matches(`.${cardDumpClass}`)) {
          case false: {
            return false;
          }
          default: {
            if (!confirm("do you really want to dump this card?")) return false;
            cardElement = event.target.closest(`.${cardElementSelector}`);
            card.callbacks.dumpCard(cardElement);
            domElements.cardsFigure.callbacks.requestCards();
            break;
          }
        }
      },

      // removes card after it's used
      dumpCard(selectedCard = false) {
        let cardText, cardImage;

        const card = domElements.card;
        const cardTextSelector = card.selectors.text;
        const cardImageSelector = card.selectors.image;
        const selectedClass = card.classes.selected;
        const cardsFigureElement = document.getElementById(
          domElements.cardsFigure.idRefferences.element
        );

        switch (selectedCard) {
          case false: {
            selectedCard = cardsFigureElement.querySelector(
              `.${selectedClass}`
            );
            break;
          }
          case null: {
            return false;
          }
          default: {
            break;
          }
        }

        cardText = selectedCard?.querySelector(cardTextSelector);
        cardText = cardText?.textContent ?? false;
        cardImage = selectedCard?.querySelector(cardImageSelector);
        cardImage = cardImage?.src ?? false;

        cardText = cardText || cardImage;

        switch (cardText) {
          case false: {
            return false;
          }
          default: {
            game.deleteCard(cardText);
          }
        }
      },

      dumpAllCards(event) {
        const card = domElements.card;
        const cardsFigure = domElements.cardsFigure;
        const dumpAllCard = document.getElementById(card.idRefferences.dumpAll);
        const isDumpAllCard = event.target === dumpAllCard;
        const cardsFigureElement = document.getElementById(
          cardsFigure.idRefferences.element
        );

        switch (isDumpAllCard) {
          case false: {
            return false;
          }
          default: {
            break;
          }
        }

        if (!confirm("do you really want do dump all cards?")) return false;

        const cards = cardsFigureElement.querySelectorAll(
          `.${card.classes.element}`
        );

        for (let iteration = 0; iteration < cards.length; iteration++) {
          card.callbacks.dumpCard(cards[iteration]);
        }

        // request new cards
        domElements.cardsFigure.callbacks.requestCards();
      },

      // allows host to show hidden card (if reveal one by one is set to true)
      reveal(event) {
        let cardId;
        const classes = domElements.card.classes;
        const revealClass = classes.reveal;
        // const hiddenClass = classes.hidden;
        const cardClass = classes.element;
        const isRevealElement = event.target.matches(`.${revealClass}`);
        const cardElement = event.target.closest(`.${cardClass}`);
        switch (cardElement && isRevealElement) {
          case false: {
            return false;
          }
          default: {
            cardId = cardElement?.id;

            if (!cardId) return false;

            // cardElement.classList.remove(hiddenClass);
            messenger.speak({
              subject: common.subjects.cardRevealed,
              value: cardId,
            });
            break;
          }
        }
      },

      // does simmillar thing as reveal but for player that recieved cardRevealed header from server
      markReveal(idRefference) {
        const classes = domElements.card.classes;
        const cardClass = classes.element;
        const hiddenClass = classes.hidden;
        const cardElement = document.getElementById(idRefference) ?? false;

        switch (cardElement && cardElement?.matches(`.${cardClass}`)) {
          case false: {
            return false;
          }
          default: {
            cardElement.classList.remove(hiddenClass);
            break;
          }
        }
      },

      vote(event) {
        const classes = domElements.card.classes;
        const selectors = domElements.card.selectors;
        let cardObject, image, text, nickname;

        const cardElement =
          event.target.closest(`.${classes.votable}`) ?? false;

        const isPickButton = event.target.matches(`.${classes.pick}`);
        // card was voted for ONLY if it has votable class AND pick button is present
        switch (cardElement && isPickButton) {
          case false: {
            return false;
          }
          default: {
            break;
          }
        }

        // if card is votable, vote for it
        image = cardElement.querySelector(selectors.image);
        text = cardElement.querySelector(selectors.text);
        nickname = cardElement.id;

        cardObject = {
          image: image.src ?? false,
          text: text.textContent ?? false,
          nickname: nickname ?? false,
        };
        game.voteForCard(cardObject);
      },

      // marks card as voted (for player that recieved roundWinnerHeader)
      mark(idRefference) {
        const cardClass = domElements.card.classes.element;
        const markedCardClass = domElements.card.classes.marked;
        const card = document.getElementById(idRefference) ?? false;

        if (!card) return false;

        switch (card.matches(`.${cardClass}`)) {
          case false: {
            return false;
          }
          default: {
            card.classList.add(markedCardClass);
            break;
          }
        }
      },
    },
  },

  cardCreationForm: {
    element: document.getElementById("card-creation"),

    classes: {
      active: "active",
    },

    idRefferences: {
      element: "card-creation",
      text: "creation-text",
      image: "creation-image",
      openButton: "create-card",
      saveButton: "creation-save",
      closeButton: "creation-exit",
      lookupCard: "creation-lookup",
      cardTemplate: "card",
    },

    callbacks: {
      toggleUi(event) {
        const cardCreationForm = domElements.cardCreationForm;
        const formOpenButton = document.getElementById(
          cardCreationForm.idRefferences.openButton
        );
        const formCloseButton = document.getElementById(
          cardCreationForm.idRefferences.closeButton
        );
        const formSaveButton = document.getElementById(
          cardCreationForm.idRefferences.saveButton
        );
        switch (event.target) {
          case formOpenButton: {
            return cardCreationForm.callbacks.open();
          }
          case formCloseButton: {
            return cardCreationForm.callbacks.close();
          }
          case formSaveButton: {
            return cardCreationForm.callbacks.save();
          }
          default: {
            return false;
          }
        }
      },

      updateLookup(event) {
        const cardCreationForm = domElements.cardCreationForm;
        const formImage = document.getElementById(
          cardCreationForm.idRefferences.image
        );
        const formText = document.getElementById(
          cardCreationForm.idRefferences.text
        );

        switch (event.target) {
          case formImage: {
            return cardCreationForm.callbacks.updateCardImage();
          }
          case formText: {
            return cardCreationForm.callbacks.updateCardText();
          }
          default: {
            return false;
          }
        }
      },

      save() {
        const cardCreationForm = domElements.cardCreationForm;
        const card = domElements.card;
        const cardsFigure = domElements.cardsFigure;
        const image = document.getElementById(
          cardCreationForm.idRefferences.image
        );
        const text = document.getElementById(
          cardCreationForm.idRefferences.text
        );
        let cardElement = document.getElementById(
          cardCreationForm.idRefferences.cardTemplate
        );
        let cardElementImage, cardElementText;
        cardElement = cardElement.content.cloneNode(true);
        cardElementImage = cardElement.querySelector(card.selectors.image);
        cardElementText = cardElement.querySelector(card.selectors.text);
        const cardsFigureElement = document.getElementById(
          cardsFigure.idRefferences.element
        );

        switch (image.value || false) {
          case false: {
            break;
          }
          default: {
            cardElementImage.src = image.value;
            break;
          }
        }
        cardElementText.textContent = text.value || "";

        cardElementImage.removeAttribute("id");
        cardElementText.removeAttribute("id");
        cardsFigureElement.prepend(cardElement);

        cardCreationForm.callbacks.close();
      },

      open() {
        const cardCreationForm = domElements.cardCreationForm;
        const cardCreationFormElement = document.getElementById(
          cardCreationForm.idRefferences.element
        );

        cardCreationFormElement.classList.add(cardCreationForm.classes.active);
      },

      close() {
        const cardCreationForm = domElements.cardCreationForm;
        const cardCreationFormElement = document.getElementById(
          cardCreationForm.idRefferences.element
        );
        cardCreationFormElement.classList.remove(
          cardCreationForm.classes.active
        );
      },

      updateCardText() {
        const cardCreationForm = domElements.cardCreationForm;
        const card = domElements.card;
        const lookupCard = document.getElementById(
          cardCreationForm.idRefferences.lookupCard
        );
        const lookupCardText = lookupCard.querySelector(card.selectors.text);

        const creationText = document.getElementById(
          cardCreationForm.idRefferences.text
        );
        const cardText = creationText.value;
        lookupCardText.textContent = cardText;
      },

      updateCardImage() {
        const cardCreationForm = domElements.cardCreationForm;
        const card = domElements.card;
        const lookupCard = document.getElementById(
          cardCreationForm.idRefferences.lookupCard
        );
        const lookupCardImage = lookupCard.querySelector(card.selectors.image);

        const creationImage = document.getElementById(
          cardCreationForm.idRefferences.image
        );
        const imageSource = creationImage.value;

        lookupCardImage.src = imageSource;
      },
    },
  },

  startButton: {
    element: document.getElementById("start-game"),

    idRefferences: {
      element: "start-game",
    },

    classes: {
      visible: "visible",
    },

    callbacks: {
      show() {
        const startButton = domElements.startButton;
        const startButtonElement = document.getElementById(
          startButton.idRefferences.element
        );

        startButtonElement.classList.add(startButton.classes.visible);
      },

      hide() {
        const startButton = domElements.startButton;
        const startButtonElement = document.getElementById(
          startButton.idRefferences.element
        );

        startButtonElement.classList.remove(startButton.classes.visible);
      },

      prepareGameStart(event) {
        // additional click event check to decide if game should be started
        // this is done so when server sends message to all players about game start client wouldn't dispatch click event on startButton element (YUCK!)
        game.playing = false;

        const startButton = domElements.startButton;
        const startButtonElement = document.getElementById(
          startButton.idRefferences.element
        );

        switch (event.target) {
          case startButtonElement: {
            return domElements.startButton.callbacks.startGame();
          }
          default: {
            return false;
          }
        }
      },

      startGame() {
        // set game box element to stock value
        domElements.gameBox.callbacks.unsetAsVoting();

        const clockElement = document.getElementById(
          domElements.clock.idRefferences.element
        );
        const cardsFigureElement = document.getElementById(
          domElements.cardsFigure.idRefferences.element
        );

        const gameInstance =
          game
            .set({
              clockDomRefference: clockElement,
              cardAppendDestination: cardsFigureElement,
              cardVoteCallback: (card) => {
                // send only player nickname
                messenger.speak({
                  subject: common.subjects.cardVote,
                  value: card.nickname,
                });
              },
              timeOutCallback: () => {
                domElements.card.callbacks.dumpCard();
              },
              votableClass: domElements.card.classes.votable,
              gameSettings: common.gameSettings.generics,
              hiddenClass: common.gameSettings.generics.revealOneByOne
                ? domElements.card.classes.hidden
                : false,
            })
            ?.startGame() ?? false;

        switch (gameInstance) {
          case false: {
            console.log("failed to set game!");
            return false;
          }
          default: {
            // tell server that game started
            messenger.speak({
              subject: common.subjects.gameStarted,
              value: true,
            });

            return true;
          }
        }
      },
    },
  },
};

const client = {
  webSocket: new WebSocket(`ws://${destination}:${port}`),
  init() {
    client.webSocket.addEventListener("open", (event) => {
      console.log("connected to server!");
      messenger.setSocket(client.webSocket);
    });
    client.webSocket.addEventListener("message", (event) => {
      console.dir(event.data);

      messenger.respond(event.data);
    });
  },

  sendMessage(string) {
    if (typeof string !== "string") return false;
    client.webSocket.send(string);
  },
};

window.addEventListener("submit", (event) => {
  domElements.gameSettings.callbacks.gatherValues(event);
});

window.addEventListener("click", (event) => {
  domElements.startButton.callbacks.prepareGameStart(event);
  domElements.card.callbacks.pick(event);
  domElements.card.callbacks.vote(event);
  domElements.card.callbacks.reveal(event);
  domElements.card.callbacks.dumpCardOnEvent(event);
  domElements.card.callbacks.dumpAllCards(event);
  domElements.cardCreationForm.callbacks.toggleUi(event);
});

window.addEventListener("input", (event) => {
  domElements.cardCreationForm.callbacks.updateLookup(event);
});

window.addEventListener("load", (event) => {
  domElements.gameBox.callbacks.storeMarkup();
});

client.init();
