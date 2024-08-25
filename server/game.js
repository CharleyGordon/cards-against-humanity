const game = {
  // holds [nickname -> score] map
  players: new Map(),
  // holds [card -> nickname] map
  playerCards: new Map(),
  //holds all players that have choosen card this round
  readyPlayers: new Map(),

  // votes for cards during player vote section (ONLY IF voteMode is enabled). Comes after everybody use a card or game times out
  // altered by voteForCard function
  cardVotes: new Map(),

  // activates when everyone is ready / when time for card picking expires
  allReadyCallback: false,

  // activates every round when best card is picked. contains object with card and it's value
  roundWonCallback: false,
  // activates on game end (that is, when one player reaches limit score). Broadcasts winner
  gameWonCallback: false,

  // callback that activates if host rotation is on
  rotateHostCallback: false,

  // activastes after player is rewarded a point
  pointAddedCallback: false,

  // will hold common.gameSettings.generics values
  settings: {},
  playing: false,

  setPlayers(playersNames) {
    playersNames.forEach((playerName) => {
      game.players.set(playerName, 0);
    });
    return game;
  },

  setPlayerCard(playerName, card) {
    game.playerCards.set(playerName, card);

    const targetAmount = game.settings.voteMode
      ? game.players.size
      : game.players.size - 1;

    console.dir(`${game.playerCards.size} ready of ${targetAmount}`);

    switch (game.playerCards.size) {
      case targetAmount: {
        // when player cards amount will be equal to player amount, start all ready callback
        // the callback will be started after revinding the clock
        console.log("all players ready! revinding clock!");

        clock.revind();
        return game;
      }
      default: {
        return game;
      }
    }
  },

  getPlayerCards() {
    return game.playerCards ?? false;
  },

  voteForCard({ nickname, isHost }) {
    switch (game.settings.voteMode) {
      case false: {
        // get card author nickname
        if (isHost) {
          game.roundWonCallback(nickname);
          playersScore.addPoint(nickname);
        }
      }
      default: {
        break;
      }
    }

    return game;
  },

  setPlayerVotes() {},

  // allReadyCallback will be activated by clock
  // activates when time is out
  // will invoke function and pass playerCards map into that function
  // check clock.tick() method to see map binding to this callback
  setReadyCallback(callback = false) {
    switch (callback) {
      case false: {
        console.log("failed to set players ready callback");
        return null;
      }
      default: {
        game.allReadyCallback = callback;
        return game;
      }
    }
  },

  setRoundWonCallback(callback) {
    // this callback will be called with playerName
    switch (typeof callback) {
      case "function": {
        game.roundWonCallback = callback;
        return game;
      }

      default: {
        console.log("failed to set player won callback");

        return null;
      }
    }
  },

  setGameWonCallback(callback) {
    game.gameWonCallback = callback;
    return game;
  },

  setPointAddedCallback(callback) {
    game.pointAddedCallback = callback;
    return game;
  },

  setSettings(settings) {
    switch (typeof settings) {
      case "object": {
        game.settings = settings;
        return game;
      }
      default: {
        return null;
      }
    }
  },

  setAsReady(targetPlayers) {
    game.readyPlayers++;

    switch (game.readyPlayers) {
      case targetPlayers: {
        game.callback();
        break;
      }
      default: {
        break;
      }
    }

    return game;
  },

  unsetAsReady() {
    game.readyPlayers--;
    return game;
  },

  startRound() {
    game.playing = true;
    game.playerCards.clear();
    game.readyPlayers.clear();
    clock.set(game.settings.roundDuration).tick();
    return game;
  },

  set({
    players,
    settings,
    roundWonCallback,
    //  when every player have choosen card (only fact that client picked a card)
    allReadyCallback,
    gameWonCallback,
    //  when cards from clients are gathered
    // allSetCallback,
    pointAddedCallback,
  }) {
    game.players.clear();
    const gameInstance =
      game
        ?.setSettings(settings)
        ?.setPlayers(players)
        ?.setRoundWonCallback(roundWonCallback)
        ?.setGameWonCallback(gameWonCallback)
        ?.setPointAddedCallback(pointAddedCallback)
        ?.setReadyCallback(allReadyCallback) ?? false;

    switch (gameInstance) {
      case false: {
        console.log("failed to initialize game instance");
        return false;
      }
      default: {
        return true;
      }
    }
  },

  getPlayerPoints(playerNick) {
    return playersScore.getPoints(playerNick);
  },
};

const clock = {
  time: false,
  startTimestamp: false,

  set(time) {
    switch (isNaN(time)) {
      case true: {
        return null;
      }
      default: {
        clock.startTimestamp = false;
        clock.time = time * 1000;
        return clock;
      }
    }
  },

  revind() {
    //  revinds clock to 0 -> starts game allReady callback
    clock.time = 0;
  },

  // something is invoking tick method twice and I haven't figured out what yet
  // probably startRound invoked in server/index.js ???
  // this second invokation happens only on second (and after second) round
  // for now, this idiot-proof way of doing countdown should work
  tick() {
    const currentTime = Date.now();

    let exactTime;

    switch (clock.time) {
      case false: {
        return false;
      }

      default: {
        break;
      }
    }

    switch (clock.startTimestamp) {
      case false: {
        clock.startTimestamp = Date.now();

        break;
      }

      default: {
        break;
      }
    }

    exactTime = currentTime - clock.startTimestamp;

    console.log(
      `time in seconds before clock runs out: ${Number.parseInt(
        Math.ceil(Math.abs((clock.time - exactTime) / 1000))
      )}`
    );

    exactTime = exactTime >= clock.time;

    switch (exactTime) {
      case false: {
        setTimeout(clock.tick, 1000);

        return clock;
      }

      default: {
        break;
      }
    }

    game.playing = false;
    game.allReadyCallback(Array.from(game.playerCards));

    clock.time = false;

    return clock;
  },
};

const playersScore = {
  // roundWonCallback: false,

  addPoint(playerNick) {
    console.dir({ playerNick });
    console.log("starting add point function");
    let score = game.players.get(playerNick) ?? false;
    // console.dir(game.players.keys());
    switch (score) {
      case false: {
        return false;
      }
      default: {
        break;
      }
    }

    score++;

    game.players.set(playerNick, score);

    console.log("invoking point added calback");

    game.pointAddedCallback(playerNick, score);

    console.log("checking if player won...");
    console.dir({ score, pointsToWin: game.settings.pointsToWin });

    switch (score) {
      case game.settings.pointsToWin: {
        game.gameWonCallback(playerNick);
        break;
      }
      default: {
        break;
      }
    }
    return playersScore;
  },

  getPoints(playerNick) {
    return game.players.get(playerNick) ?? false;
  },
};

export default game;
