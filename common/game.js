const gameSettings = {
  generics: {
    maxBlankCards: 999,
    pointsToWin: 5,
    roundDuration: 90, // number -> time in seconds before choosen cards will be taken (if somebody didn't submit card)
    cardsInHand: 10,
    maxPlayers: 20,
    voteMode: 1,
  },

  functions: {
    // function to be used on client for host to target only changed values
    getDifference(genericsObject) {
      const differenceObject = {};
      let newValue;
      for (const key in genericsObject) {
        newValue = Number.parseInt(genericsObject[key], 10);

        if (isNaN(newValue)) return false;
        // lower value if it's larger than 999 or set to 1 if value is under 0
        if (newValue > 999) newValue = 999;
        if (newValue <= 0) value = 1;

        if (gameSettings.generics[key] !== newValue)
          differenceObject[key] = newValue;
      }

      return differenceObject;
    },

    // function to be used on server to submit differences
    setDifference(differenceObject) {
      let differenceValue;
      for (const key in differenceObject) {
        differenceValue = Number.parseInt(differenceObject[key], 10);
        // exit if / when passed value is not a number or not boolean
        if (isNaN(differenceValue)) return false;
        gameSettings.generics[key] = differenceValue;
      }

      if (!differenceObject.voteMode) gameSettings.voteMode = 0;
    },
  },
};

const deck = {
  cards: new Map(),
  currentCard: false,

  setCard(cardId = false) {
    let card;
    // if no card id was provided, don't pull card from player

    switch (cardId) {
      case false: {
        console.log("you haven't picked a card in this round!");
        return false;
      }
      default: {
        break;
      }
    }

    card = deck.cards.get(cardId) ?? false;

    switch (card) {
      case false: {
        console.log("no such cards exists!");
        return false;
      }
      default: {
        deck.currentCard = card;
        break;
      }
    }
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

const game = {
  settings: false,
  player: false,
  running: false,
  score: 0,
  // endgame callback will take player nickname and shout it out to server
  // server will check players score and if it's correct, the game will end
  callback: false,

  setPlayer(player) {
    if (!player) {
      console.log("no player provided!");
      return null;
    }
    game.player = player;
    game.score = 0;
    return game;
  },

  setSettings(settings) {
    // settings are just common.gameSettings.generics
    if (!settings) {
      console.log("no game settings provided!");
      return null;
    }
    game.settings = settings;
    return game;
  },

  setCallback(callback) {
    if (!callback) {
      console.log("no callback provided!");
      return null;
    }
    game.callback = callback;
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
    //highlight winner's card
    //give winner a point
  },

  endRound() {
    let card;
    game.running = false;
    card = deck.getCard();

    switch (card) {
      case false: {
        return false;
      }
      default: {
        game.callback(card);
        break;
      }
    }
  },

  start() {
    clock
      .setCallback(game.endRound)
      .setTime(gameSettings.generics.roundDuration);
  },

  getCard() { },
};

const clock = {
  time: 0,
  // callback will be provided by game object
  callback: false,

  on: {},

  tick() {
    console.log("time's ticking, ", clock.time);
    switch (clock.time) {
      case 0: {
        // when time ends, clock invoke callback
        // this callback will send info about picked(?) card to server
        if (callback) callback();
        return clock;
      }
      // case false: {
      //   return null;
      // }
      default: {
        clock.time--;
        setTimeout(clock.tick, 1000);
        return clock;
      }
    }
  },

  stop() {
    // clock.time = false;
    clock.time = 0;
    return clock;
  },

  setTime(time) {
    clock.time = time;
    return clock;
  },

  setCallback(callback) {
    clock.callback = callback;
    return clock;
  },
};

const callback = function () {
  console.log("foo");
};

clock.setTime(3).setCallback(callback).tick();
