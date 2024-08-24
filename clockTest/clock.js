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
      case true: {
        // invoke  callback function and pass playerCards map (to) array into that function
        game.allReadyCallback(Array.from(game.playerCards));
        clock.time = false;
        return clock;
      }
      default: {
        setTimeout(clock.tick, 1000);
        return clock;
      }
    }
  },
};

// const clock = {
//   time: 0,
//   startTimestamp: false,

//   set(time) {
//     switch (isNaN(time)) {
//       case true: {
//         return null;
//       }
//       default: {
//         clock.startTimestamp = false;
//         clock.time = time * 1000;
//         return clock;
//       }
//     }
//   },

//   revind() {
//     //  revinds clock to 0 -> starts game allReady callback
//     clock.time = 0;
//   },

//   tick() {
//     if (!clock.startTimestamp) clock.startTimestamp = Date.now();
//     const currentTime = Date.now();
//     const difference = currentTime - clock.startTimestamp;
//     switch (difference) {
//       case clock.time: {
//         // invoke  callback function and pass playerCards map (to) array into that function
//         game.allReadyCallback(Array.from(game.playerCards));
//         return clock;
//       }
//       default: {
//         console.log(`time left before tour end: ${clock.time}`);
//         setTimeout(clock.tick, 1000);
//         return clock;
//       }
//     }
//   },
// };

clock.set(5).tick();
