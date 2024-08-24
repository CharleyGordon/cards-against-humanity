const messageStructure = {
  standardHeader: "message",
  hostHeader: "host",
  newHostHeader: "newHost",
  playerListHeader: "playerList",
  newPlayerHeader: "newPlayer",
  playerLeftHeader: "playerLeft",
  settingsUpdateHeader: "settingsUpdate",
  gameWinnerHeader: "gameWinner",

  roundWinnerHeader: "roundWinner",

  // means that player had won round and requires client to set this player's score to + 1
  pointAddedHeader: "pointAdded",
  id: "id",
  requestHeader: "request",
  errorHeader: "error",
  // means server has processed client's request successfully
  successHeader: "success",
  body: "body",
  playerCardsHeader: "playerCards",
};

const subjects = {
  hello: "hello",
  confirm: "confirm",
  disconnect: "disconnect",
  connect: "connect",
  setNickName: "setNickName",
  settingsUpdate: "settingsUpdate",
  gameStarted: "gameStarted",

  //request made by each client to generate cards
  // server returns success header with array of requested number of cards
  generateCards: "generateCards",

  // sends whole cards alongside player info
  cardSend: "cardSend",

  // tells which card has been chosen as winning one
  // server actions will differ based on voteMode flag in gameSettings
  // by default, server will accept this subject only from host
  cardVote: "cardVote",

  // tells server card has been shown (if revealOneByOne setting is true)
  cardRevealed: "cardRevealed",

  cardValue: "cardValue",
};

const errors = {
  invalidNickName: "invalidNickName",
  nonHostError: "this action is permitted for host only",
  invalidValue: "invalid value passed!",
};

const gameSettings = {
  generics: {
    maxBlankCards: 999,
    pointsToWin: 5,
    roundDuration: 90, // number -> time in seconds before choosen cards will be taken (if somebody didn't submit card)
    cardsInHand: 10,
    maxPlayers: 20,
    // in vote mode, every player can vote for the best card
    voteMode: false,
    hostRotation: true,
    // cards are shown one by one on host's demand
    revealOneByOne: false,
  },

  functions: {
    // function to be used on client for host to target only changed values
    getDifference(genericsObject) {
      const differenceObject = {};
      console.dir({ differenceObject });
      let newValue;
      let numberValue;
      for (const key in genericsObject) {
        newValue = genericsObject[key];
        numberValue = Number.parseInt(newValue, 10);

        switch (isNaN(numberValue)) {
          case true: {
            break;
          }
          default: {
            newValue = numberValue;
            break;
          }
        }

        if (gameSettings.generics[key] !== newValue)
          differenceObject[key] = newValue;
      }

      return differenceObject;
    },

    // function to be used on server to submit differences
    setDifference(differenceObject) {
      let differenceValue, numberValue;
      for (const key in differenceObject) {
        differenceValue = differenceObject[key];
        numberValue = Number.parseInt(differenceValue, 10);

        switch (isNaN(numberValue)) {
          case false: {
            gameSettings.generics[key] = numberValue;
            break;
          }
          default: {
            gameSettings.generics[key] = differenceValue;
            break;
          }
        }
      }
    },
  },
};

const common = {
  subjects,
  errors,
  messageStructure,
  gameSettings,
};

export default common;
