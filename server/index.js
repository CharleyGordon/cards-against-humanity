import { WebSocketServer } from "ws";
// inversed pool is just double map that allows you to access key while giving it's value and vice versa
import inversedPool from "./inversedPool.js";
import linkedList from "./linkedList.js";
import common from "../common/index.js";
import game from "./game.js";
import cards from "./cards.js";

const question = cards.question;
const answers = cards.answers;

// request handler stores all clients and processes every message given to client and recieved from client
const requestHandler = {
  connectionInstance: false,
  clients: {
    pool: inversedPool.create(),
    counter: 0,
  },
  gameEnded: false,

  broadcast(message) {
    // excludedClients can be null or set (keeping instances of client connections)
    requestHandler.clients.pool.getGenericPool().forEach((client) => {
      client.send(message);
    });
  },

  sendError({ subject, errorString, client }) {
    const message = JSON.stringify({
      header: common.messageStructure.errorHeader,
      body: { subject, value: errorString },
    });

    client.send(message);
  },

  sendSuccess({ subject, value, client }) {
    const message = JSON.stringify({
      header: common.messageStructure.successHeader,
      body: { subject, value },
    });
    client.send(message);
  },

  broadcastSuccess({ subject, value }) {
    const message = JSON.stringify({
      header: common.messageStructure.successHeader,
      body: { subject, value },
    });
    requestHandler.broadcast(message);
  },

  sendRequest({ requestHeader, subject }) {
    const message = JSON.stringify({
      header: requestHeader,
      body: { subject },
    });
    requestHandler.broadcast(message);
  },

  sendRoundWinner(playerCard) {
    const message = JSON.stringify({
      header: common.messageStructure.roundWinnerHeader,
      body: { value: playerCard },
    });

    requestHandler.broadcast(message);
  },

  sendGameWinner(playerNick) {
    const message = JSON.stringify({
      header: common.messageStructure.gameWinnerHeader,
      body: { value: playerNick },
    });

    requestHandler.broadcast(message);
  },

  sendPointAdded(playerNick, score) {
    const message = JSON.stringify({
      header: common.messageStructure.pointAddedHeader,
      body: { value: { nickname: playerNick, score } },
    });

    requestHandler.broadcast(message);
  },

  sendMessage(messageString) {
    const header = [common.messageStructure.standardHeader];
    const message = JSON.stringify({
      header,
      body: messageString,
    });
    requestHandler.broadcast(message);
  },

  sendIdentifier({ connectionInstance, counter }) {
    const header = common.messageStructure.id;
    const message = JSON.stringify({
      header,
      body: { value: counter },
    });
    connectionInstance.send(message);
  },

  sendNewPlayerMessage(nickName) {
    const message = JSON.stringify({
      header: common.messageStructure.newPlayerHeader,
      body: {
        value: nickName,
      },
    });

    console.dir("sending message about new player...");

    requestHandler.broadcast(message);
  },

  sendPlayerLeftMessage(nickName) {
    const message = JSON.stringify({
      header: common.messageStructure.playerLeftHeader,
      body: {
        value: nickName,
      },
    });
    requestHandler.broadcast(message);
  },

  sendPlayerList(connectionInstance) {
    const message = JSON.stringify({
      header: common.messageStructure.playerListHeader,
      body: {
        value: players.getPlayersInfo(),
      },
    });
    connectionInstance.send(message);
  },

  sendSettingsDifference(differenceObject) {
    const message = JSON.stringify({
      header: common.messageStructure.settingsUpdateHeader,
      body: {
        value: differenceObject,
      },
    });
    requestHandler.broadcast(message);
  },

  sendCards(cardsArray = []) {
    cardsArray = cardsArray.filter((value) => {
      return value !== false;
    });
    console.dir("sending cards to clients...");
    const message = JSON.stringify({
      header: common.messageStructure.playerCardsHeader,
      body: { value: cardsArray },
    });
    requestHandler.broadcast(message);
  },

  // broadcast to everyone there's new host
  callNextHost(nextHostId) {
    console.log("calling for new host of id: ", nextHostId);
    if (!nextHostId) return false;
    host.setHost(nextHostId);
    const nextHost =
      players.pool.get(nextHostId) || players.getPlayerById(nextHostId);

    console.dir({ nextHostToCall: nextHost });
    const message = JSON.stringify({
      header: common.messageStructure.newHostHeader,
      body: {
        value: nextHost,
      },
    });
    requestHandler.broadcast(message);
  },

  rotateHost(timeout = 0) {
    setTimeout(async () => {
      // check if someone won the game
      switch (requestHandler.gameEnded) {
        case false: {
          host.rotateHost();
          host.broadcastCurrentHost();
          gameStartHandler.handle({
            value: true,
            clientId: host.getHostId(),
          });
          break;
        }
        default: {
          host.setRootHost();
          host.broadcastCurrentHost();
          break;
        }
      }
    }, timeout);
  },

  async processRequest(message) {
    let value, client, clientId, handler;
    try {
      message = JSON.parse(message);
    } catch (exception) {
      console.log(`error while parsing client message: ${exception}`);
      return false;
    }

    clientId = message.body.id;

    console.dir({ message });

    switch (clientId) {
      case false: {
        //if there's no id, it means client haven't got one yet
        break;
      }
      default: {
        client = requestHandler.clients.pool.get(message.body.id);
        // if client is unregistered, stop the process
        if (!client) {
          console.log("client not found!");
          return false;
        }
      }
    }

    console.log("setting handler...");

    value = message.body.value;

    console.dir({ subject: message.body.subject });

    switch (message.body.subject) {
      case common.subjects.setNickName: {
        handler = nickNameHandler;
        break;
      }
      case common.subjects.settingsUpdate: {
        handler = settingsHandler;
        break;
      }
      case common.subjects.gameStarted: {
        handler = gameStartHandler;
        break;
      }
      case common.subjects.cardSend: {
        handler = cardSendHandler;
        break;
      }
      case common.subjects.cardVote: {
        handler = cardVoteHandler;
        break;
      }
      case common.subjects.cardRevealed: {
        handler = cardRevealedHandler;
        break;
      }
      case common.subjects.generateCards: {
        handler = generateCardsHandler;
        break;
      }
      default: {
        console.log("no handler was set");
        return false;
      }
    }
    await handler.handle({ value, clientId, client });
  },
};

const nickNameHandler = {
  handle({ value, clientId, client }) {
    let newHost, result;
    console.dir({ value });

    if (!client) return false;

    result = !!players.add({ nickName: value, id: clientId });
    if (result) {
      requestHandler.sendSuccess({
        subject: common.subjects.setNickName,
        value,
        client,
      });
      // let game handle all current players
      game.setPlayers(players.pool.getObjectPool());

      requestHandler.sendNewPlayerMessage(value);

      switch (host.getHostId()) {
        case false: {
          // is the is no current host, make player the host
          newHost = host.setNextHost();
          if (!newHost) return false;
          newHost = host.getHostId();
          requestHandler.callNextHost(newHost);
          break;
        }
        default: {
          break;
        }
      }
    }
    return requestHandler.sendError({
      subject: common.subjects.setNickName,
      errorString: "value already exists!",
      client,
    });
  },
};

// handles settings updates
const settingsHandler = {
  handle({ value, client, clientId }) {
    let message;
    console.dir("passed value to settings handler: ", { passedValue: value });
    // if clientId is not host id, send error and return

    switch (clientId === host.getHostId()) {
      case false: {
        message = {
          subject: common.subjects.settingsUpdate,
          errorString: common.errors.nonHostError,
          client,
        };
        requestHandler.sendError(message);
        return false;
      }
      default: {
        break;
      }
    }

    // value is a difference object. It will be passed to other function to find and replace pointed differences
    switch (value) {
      case false: {
        console.log("settings object was send, but it's empty!");
        message = {
          subject: common.subjects.settingsUpdate,
          errorString: common.errors.invalidValue,
          client,
        };
        requestHandler.sendError(message);
        return false;
      }
      default: {
        break;
      }
    }
    // here we replace gameSettings generics values with provided
    common.gameSettings.functions.setDifference(value);
    // send same value to client to perform setDifference on client side
    requestHandler.sendSettingsDifference(value);
  },
};

const gameStartHandler = {
  async handle({ value, client, clientId }) {
    // if client is not host, return
    const hostId = host.getHostId();
    console.dir({ hostId: host.getHostId(), clientId });
    switch (clientId) {
      case hostId: {
        console.log("sending game start message");
        requestHandler.broadcastSuccess({
          subject: common.subjects.gameStarted,
          value: await question.generate({}),
        });
        // start game server side
        requestHandler.gameEnded = false;
        game.startRound();
        break;
      }
      default: {
        console.log("game start request was sent by non-host!");
        return false;
      }
    }
  },
};

const cardSendHandler = {
  // is a rardsReadyCallback
  handle({ value, client, clientId }) {
    const playerName = players.getPlayerById(clientId);
    console.dir({ playerCard: value });
    game.setPlayerCard(playerName, value);
  },
};

const cardVoteHandler = {
  handle({ value, clientId }) {
    const hostId = host.getHostId();
    const isHost = clientId === hostId;
    console.log("sending voted by player card...");
    game.voteForCard({
      isHost,
      nickname: value,
    });
  },
};

const cardRevealedHandler = {
  handle({ value, clientId }) {
    console.log("card revealed handler activated");
    const hostId = host.getHostId();
    const isHost = clientId === hostId;

    switch (isHost) {
      case false: {
        return false;
      }
      default: {
        requestHandler.broadcastSuccess({
          subject: common.subjects.cardRevealed,
          value,
        });
        break;
      }
    }
  },
};

// responds to client's request of generating "answers" table (SQLite) card deck
const generateCardsHandler = {
  async handle({ value = common.gameSettings.generics.cardsInHand, client }) {
    console.log(
      `---------------------------- cards to send: ${value} ---------------------------`
    );
    let deck;
    switch (isNaN(value)) {
      case true: {
        deck = [];
      }
      default: {
        deck = await answers.generate({ amount: value });
        break;
      }
    }
    requestHandler.sendSuccess({
      subject: common.subjects.generateCards,
      value: deck,
      client,
    });
  },
};

const players = {
  // keeps nickName -> id pairs
  pool: inversedPool.create(),

  add({ nickName, id }) {
    let playerConnection;
    if (!nickName) return false;
    // console.log("checking for nickname...");

    if (host.id === id) {
      host.nickName = nickName;
    }

    host.addToList({ id, nickName });

    switch (!!players.pool.get(nickName)) {
      case false: {
        playerConnection = requestHandler.clients.pool.get(id);
        players.pool.set(nickName, playerConnection);
        console.log("player added!");
        return playerConnection;
      }
      default: {
        console.log("such player name already exists!");
        return false;
      }
    }
  },

  getPlayersList() {
    return Array.from(players.pool.getGenericPool().keys());
  },

  // return players nicks and points in game
  getPlayersInfo() {
    let nickname, score;
    const result = [];
    const playersList = players.getPlayersList();
    for (let iteration = 0; iteration < playersList.length; iteration++) {
      nickname = playersList[iteration];
      score = game.getPlayerPoints(nickname) ?? 0;
      result.push({ nickname, score });
    }
    return result;
  },

  getPlayerById(id) {
    const client = requestHandler.clients.pool.get(id);
    return players.pool.get(client);
  },

  getPlayersId() {
    return Array.from(
      requestHandler.clients.pool.get(players.pool.getObjectPool().keys())
    );
  },

  getPlayer(identifier) {
    // identifier can be both id and nickName
    // returns id or nickname (opposite value / key of identifier)
    return players.pool.get(identifier);
  },

  // somewhat in here f's up
  delete(connectionInstance) {
    const playerName = players.pool.get(connectionInstance);
    players.pool.delete(connectionInstance);
    return playerName;
  },
};

// host is type of player that decides of best card and can tweak config
const host = {
  id: false,
  nickName: false,
  // linked list that holds objects of potential host id's as key and potential host nicknames as values . list head is used as REAL host and other (next) pointers point to potential host rotation hosts
  // when host leaves, his node inside list is deleted
  // REAL host will be always taken from list.head
  list: linkedList.create(),
  listEntries: {},
  setHost(id) {
    let hostId;
    switch (typeof id) {
      case "number": {
        hostId = Number.parseInt(id, 10);
        host.id = hostId;

        console.log(`current game host has id of: ${id}`);
        return true;
      }
      case "boolean": {
        if (id) return false;
        host.id = false;
        break;
      }
      default: {
        console.dir({ hostId: id });
        console.log("invalid id to set for host");
        break;
      }
    }
  },

  removeHost(hostId) {
    if (!hostId) return false;
    switch (hostId) {
      case host.getHostId(): {
        // delete host only if refferenced player id is identical to host id
        host.id = false;
        host.nickName = false;
        host.list.remove(host.listEntries[hostId]);
        return true;
      }
      default: {
        return false;
      }
    }
  },

  addToList({ id, nickName }) {
    let potentialHost;
    switch (!!host.listEntries[id]) {
      case false: {
        potentialHost = host.list.append({ what: { id, nickName } });
        host.listEntries[id] = potentialHost;
        break;
      }
      default: {
        break;
      }
    }
  },

  broadcastCurrentHost() {
    let message;
    switch (host.getHostId()) {
      case false: {
        // set last player as host
        host.setNextHost();
        requestHandler.callNextHost(host.getHostId());
        break;
      }
      default: {
        console.dir({ hostId: host.getHostId() });
        message = JSON.stringify({
          header: common.messageStructure.hostHeader,
          body: {
            value: players.getPlayerById(host.getHostId()),
          },
        });

        console.dir({ hostMessage: message });
        requestHandler.broadcast(message);
        break;
      }
    }
  },

  setNextHost() {
    let newId;
    console.log("setting next host...");
    console.dir({ hostId: host.id });

    switch (host.id) {
      // if there's no id, there's currently no host, so firs host on the list will be choosen
      case false: {
        newId = host.list.head?.value?.id ?? requestHandler.clients.counter;
        return host.setHost(newId);
      }
      default: {
        // if there is currently a host, find next client ID and set it as (TEMP) host
        host.list.forEach({
          callback: (value) => {
            switch (value.id > host.id) {
              case false: {
                break;
              }
              default: {
                host.id = value.id;
                host.nickName = value.nickName;
                return "DONE";
              }
            }
          },
          exitValue: "DONE",
        });
      }
    }
  },

  // sets next player as temporal host and messages every player about it. Works only if host rotation is on
  rotateHost() {
    console.log("starting host rotation...");
    const currentHost = host.listEntries[host.id] ?? false;
    console.dir({ currentHost });
    switch (currentHost) {
      case false: {
        console.log("current host is absent, setting first free host");
        host.setHost(host.list.head.value.id);
        break;
      }
      default: {
        console.log("current host is present, setting next host in line");
        host.setHost(currentHost.next?.value?.id || host.list.head?.value?.id);
        break;
      }
    }
  },

  // gets HEAD in host list and set it as host
  setRootHost() {
    host.setHost(host.list.head.value.id);
  },

  getHostId() {
    return host.id;
  },

  getHostName() {
    if (!host.id) return false;
    return host.nickName;
    // return players.getPlayerById(host.id);
  },

  handler: {
    handle({ subject, value }) {
      if (!host.id) return false;

      switch (subject) {
        case common.subjects.game.setDuration: {
          common.gameSettings.flags.setDuration(value);
          break;
        }
        case common.subjects.game.setCardsInHand: {
          common.gameSettings.flags.setCardsInHand(value);
          break;
        }
        case common.subjects.game.setMaxBlankCards: {
          common.gameSettings.flags.setMaxBlankCards(value);
          break;
        }
        case common.subjects.game.setMaxPlayers: {
          common.gameSettings.flags.setMaxPlayers(value);
          break;
        }
        case common.subjects.game.setPointsToWin: {
          common.gameSettings.flags.setPointsToWin(value);
          break;
        }
      }
    },
  },
};

const server = {
  webSocket: new WebSocketServer({ port: 8080 }),
  init(connectionInstance) {
    server.addClient(connectionInstance);
    requestHandler.sendPlayerList(connectionInstance);
    connectionInstance.on("close", () => {
      server.removeClient(connectionInstance);
      console.log("connection closed");
    });
    connectionInstance.on("message", async (passedData) => {
      await requestHandler.processRequest(passedData);
    });
    // messenger.set(connectionInstance).askForNickName();
  },

  async addClient(connectionInstance) {
    requestHandler.clients.counter++;
    requestHandler.clients.pool.set(
      requestHandler.clients.counter,
      connectionInstance
    );
    // send to client it's id
    requestHandler.sendIdentifier({
      connectionInstance,
      counter: requestHandler.clients.counter,
    });

    // check if game is running. If so, send generated cards to player

    switch (game.playing) {
      case false: {
        break;
      }
      case true: {
        generateCardsHandler.handle({ client: connectionInstance });
      }
    }

    // if there isn't any hosts, set current client as host

    console.dir({
      clientAmount: requestHandler.clients.pool.getGenericPool().size,
    });

    console.dir({ hostId: host.getHostId() });

    host.broadcastCurrentHost();

    // set players for game object
  },

  removeClient(connectionInstance) {
    let playerNick;
    let nextHost;
    let hostRemoved;
    console.log("trying to remove client..");
    const id = requestHandler.clients.pool.get(connectionInstance);
    if (!id) {
      console.log("no client was found");
      return false;
    }

    // free nickname from nicknames pool
    requestHandler.clients.pool.delete(id);
    playerNick = players.delete(connectionInstance);
    requestHandler.sendPlayerLeftMessage(playerNick);

    console.dir(`client with nickname of ${playerNick} was removed`);

    // hos gets removed if players id mathces current host id
    hostRemoved = host.removeHost(id);

    if (!hostRemoved) {
      console.log("non-host player was removed");
      return true;
    }

    //

    nextHost = host.setNextHost();

    if (!nextHost) return true;

    console.dir({ nextFoundHost: host.getHostId() });

    requestHandler.callNextHost(host.getHostId());
  },
};

// setting game object (and injecting dependencies)

function setGame() {
  game.set({
    players: players.pool.getObjectPool(),
    settings: common.gameSettings.generics,

    // allSetCallback: requestHandler.sendCardRequest,
    allReadyCallback: (cardsArray = []) => {
      switch (cardsArray.length) {
        case 0: {
          // in case of no cards, just rotate host and start new round
          console.log("no cards were sent! Rotating hosts...");
          requestHandler.rotateHost(2000);
          break;
        }
        default: {
          requestHandler.sendCards(cardsArray);
          break;
        }
      }
    },
    roundWonCallback: (playerCard) => {
      requestHandler.sendRoundWinner(playerCard);
      // sets next player in line as host
      requestHandler.rotateHost(2000);
    },
    gameWonCallback: (playerNick) => {
      requestHandler.sendGameWinner(playerNick);
      requestHandler.gameEnded = true;
      setGame();
      host.rotateHost();
      // host.broadcastCurrentHost();
    },
    pointAddedCallback: (playerNick, score) => {
      requestHandler.sendPointAdded(playerNick, score);
    },
  });
}

setGame();

server.webSocket.on("connection", server.init);
