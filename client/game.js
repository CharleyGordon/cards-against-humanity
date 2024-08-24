const deck = {
  cards: new Map(),
  currentCard: false,
  votableClass: false,
  hiddenClass: false,

  templates: {
    card: {
      element: document.getElementById("card"),
      idRefferences: {
        text: "card-text",
        image: "card-image",
      },
      selectors: {
        card: ".card",
      },
      classes: {
        nickname: "nickname",
        nonDeletable: "non-deletable",
        voting: "voting",
      },
    },
  },

  setCard(cardElement = false) {
    let card;
    // if no card id was provided, don't pull card from player

    switch (cardElement) {
      case false: {
        console.log("you haven't picked a card in this round!");
        return false;
      }
      default: {
        break;
      }
    }

    card = cardElement;

    switch (!!card) {
      case false: {
        console.log("no such cards exists!");
        return false;
      }
      default: {
        deck.currentCard = card;
        return true;
      }
    }
  },

  clearCard() {
    deck.currentCard = false;
  },

  populateDeck() {
    // here cards will be fetched from server
    game.cardAppendDestination.innerHTML = "";
    const cardTemplate = deck.templates.card;
    const documentFragment = new DocumentFragment();
    let cardElement, cardText, cardImage;

    deck.cards.forEach((value, cardString) => {
      cardElement = cardTemplate.element.content.cloneNode(true);
      cardText = cardElement.getElementById(cardTemplate.idRefferences.text);
      cardText.removeAttribute("id");
      cardText.textContent = cardString;
      cardImage = cardElement.getElementById(cardTemplate.idRefferences.image);
      cardImage.removeAttribute("id");
      documentFragment.append(cardElement);
    });

    game.cardAppendDestination.append(documentFragment);
  },

  populateDeckWithAnswers(pickedCardsArray = []) {
    game.cardAppendDestination.innerHTML = "";
    const cardTemplate = deck.templates.card;
    let card, cardElement, cardText, cardImage;
    let currentArray, arrayCard;
    let playerNickname, image, text;
    const documentFragment = new DocumentFragment();

    for (let iteration = 0; iteration < pickedCardsArray.length; iteration++) {
      currentArray = pickedCardsArray[iteration];
      playerNickname = currentArray[0];
      arrayCard = currentArray[1] ?? false;

      switch (arrayCard) {
        case false: {
          continue;
        }
        default: {
          break;
        }
      }

      image = arrayCard.image ?? false;
      text = arrayCard.text;

      card = cardTemplate.element.content.cloneNode(true);
      cardElement = card.querySelector(deck.templates.card.selectors.card);
      cardElement.classList.add(deck.templates.card.classes.nonDeletable);
      cardElement.id = playerNickname;
      cardText = card.getElementById(cardTemplate.idRefferences.text);
      cardText.removeAttribute("id");
      cardText.textContent = text;
      cardImage = card.getElementById(cardTemplate.idRefferences.image);

      switch (image) {
        case false: {
          break;
        }
        default: {
          if (image) cardImage.src = image;
          break;
        }
      }
      cardImage.removeAttribute("id");

      documentFragment.append(card);
    }

    for (
      let iteration = 0;
      iteration < documentFragment.children.length;
      iteration++
    ) {
      card = documentFragment.children[iteration];
      card.classList.add(deck.votableClass);
      switch (deck.hiddenClass) {
        case false: {
          break;
        }
        default: {
          card.classList.add(deck.hiddenClass);
        }
      }
    }

    game.cardAppendDestination.append(documentFragment);
  },

  // adds cards after sever message
  addCard(cardText = "") {
    deck.cards.set(cardText, true);
  },

  deleteCard(cardText = "") {
    deck.cards.delete(cardText);
  },

  getCard() {
    return deck.currentCard;
  },

  removeCard(cardId) {
    deck.cards.delete(cardId);
  },

  replaceDeck() {
    deck.cards.forEach((card, key) => {
      deck.cards.remove(key);
    });
  },
};

const playerScore = {
  limit: 0,
  score: 0,

  setLimit(limitInteger) {
    playerScore.limit = limitInteger;
  },

  addPoint() {
    playerScore.score++;
    switch (playerScore.score) {
      case playerScore.limit: {
        break;
      }
      default: {
        break;
      }
    }
  },
};

const game = {
  settings: false,
  player: false,
  running: false,
  playing: false,
  score: 0,
  instance: false,

  // cardChoosenCallback: false,
  cardVoteCallback: false,
  choosenCard: false,
  cardAppendDestination: false,
  gameSettings: false,
  clockDomRefference: false,
  timeOutCallback: false,

  set({
    clockDomRefference,
    cardAppendDestination,
    // cardChoosenCallback,
    cardVoteCallback,
    // callback that invokes after time runs out
    timeOutCallback,
    gameSettings,
    votableClass,
    // class to indicate card can be revealed. Can be ommited
    hiddenClass,
  }) {
    const result =
      game
        ?.setClockDomRefference(clockDomRefference)
        ?.setCardAppendDestination(cardAppendDestination)
        ?.setTimeOutCallback(timeOutCallback)
        ?.setCardVoteCallback(cardVoteCallback)
        ?.setGameSettings(gameSettings)
        ?.setVotableClass(votableClass)
        ?.setHiddenClass(hiddenClass) ?? false;

    switch (result) {
      case false: {
        console.log("fail during game object initiation!");
        return null;
      }
      default: {
        game.instance = true;
        return game;
      }
    }
  },

  addCard(card) {
    deck.addCard(card);
  },

  getCards() {
    return deck.cards;
  },

  deleteCard(cardText) {
    deck.deleteCard(cardText);
  },

  setClockDomRefference(domElement) {
    switch (!domElement) {
      case true: {
        console.log("invalid dom refference!");
        return null;
      }
      default: {
        clock.setDomRefference(domElement);
        return game;
      }
    }
  },

  setGameSettings(gameSettings = false) {
    switch (gameSettings) {
      case false: {
        console.log("invalid settings object!");
        return null;
      }
      default: {
        game.settings = gameSettings;
        return game;
      }
    }
  },

  setPlayer(player) {
    if (!player) {
      console.log("no player provided!");
      return null;
    }
    game.player = player;
    game.score = 0;
    return game;
  },

  setCard(cardElement, voteMode = false) {
    switch (deck.setCard(cardElement)) {
      case false: {
        console.log("card has not been set!");
        return null;
      }
      default: {
        if (!voteMode) {
          // game.cardChoosenCallback(cardElement);
        } else {
        }
        return game;
      }
    }
  },

  getCard() {
    return deck.getCard() ?? false;
  },

  setCardAppendDestination(domElement = document.body) {
    switch (!domElement) {
      case true: {
        console.log("invalid dom destination!");
        return null;
      }
      default: {
        game.cardAppendDestination = domElement;
        return game;
      }
    }
  },

  setHiddenClass(hiddenClass = false) {
    deck.hiddenClass = hiddenClass;
    return game;
  },

  setCardVoteCallback(callback) {
    game.cardVoteCallback = callback;
    return game;
  },

  setTimeOutCallback(callback) {
    game.timeOutCallback = callback;
    return game;
  },

  setVotableClass(className) {
    deck.votableClass = className;
    return game;
  },

  winRound() {
    game.score++;
    if (game.score !== gameSettings.generics.pointsToWin) return game;
  },

  hadleRoundWinner({ card, nickName }) {
    //highlight winner's card
    //give winner a point
  },

  // endGame will be invoked after server responce
  endGame() {
    // highlight winner
  },
  // returns locally picked card of user (NOT host)
  returnChoosenCard() {
    console.log("card submitted!");

    //highlight winner's card
    //give winner a point
    game.running = false;
    return game.getCard();
  },

  startGame() {
    if (game.playing) {
      console.dir("game is already running!");
      return null;
    }
    game.playing = true;
    return game.startRound();
  },

  populateDeck(cardsArray) {
    deck.populateDeck(cardsArray);
    return game;
  },

  startRound() {
    game.running = true;
    // remove previously choosen card
    deck.clearCard();
    // deck.populateDeck();
    // set time based on gameSettings object
    clock.setTime(game.settings.roundDuration).tick();
    return game;
  },

  revind() {
    clock.revind();
    return game;
  },

  displayAnswers(cardsArray) {
    deck.populateDeckWithAnswers(cardsArray);
    return game;
  },

  // function for vote mode. Will be invoked with provided cardVoteCallback
  voteForCard(cardElement) {
    switch (deck.setCard(cardElement)) {
      case false: {
        return null;
      }
      default: {
        game.cardVoteCallback(deck.getCard());
        return game;
      }
    }
  },
};

const clock = {
  time: 0,

  domRefference: false,

  tick() {
    console.log("time's ticking, ", clock.time);
    switch (clock.time) {
      case 0: {
        // when time ends, game object will take card (if provided) and invoke passed callback
        // passed callback will send this card to server
        game.timeOutCallback();
        game.returnChoosenCard();
        game.instance = false;
        console.log("sending choosen card");
        return clock;
      }
      // case false: {
      //   return null;
      // }
      default: {
        // debugger;
        clock.time--;
        setTimeout(clock.tick, 1000);
        // update html
        if (!clock.domRefference) return null;
        clock.domRefference.textContent = clock.time;
        return clock;
      }
    }
  },
  revind() {
    // revinds round clock to end
    clock.time = 0;
    return clock.tick();
  },

  setTime(time) {
    clock.time = time;
    return clock;
  },

  setDomRefference(domElement = document.getElementById("clock")) {
    clock.domRefference = domElement;
    return clock;
  },
};

// const callback = function () {
//   console.log("foo");
// };

// clock.setTime(3).setCallback(callback).tick();

export default game;
