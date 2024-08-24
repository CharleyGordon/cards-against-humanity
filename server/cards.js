import sqlite3 from "sqlite3";

const question = {
  async generate({ databasePath = "../questions/generic.db" }) {
    const database = new sqlite3.Database(
      databasePath,
      sqlite3.OPEN_READONLY,
      (error) => {
        if (error) return console.error(error);
      }
    );
    const query = `
    SELECT text 
    FROM questions
    ORDER BY RANDOM()
    LIMIT 1
    `;

    const returnValue = await new Promise((resolve, reject) => {
      database.all(query, [], (error, rows = []) => {
        // console.dir({ rows });
        if (error) {
          console.error(error);
          reject(false);
        }

        for (let iteration = 0; iteration < rows.length; iteration++) {
          console.dir(rows[iteration]);
        }
        resolve(rows[0]);
      });
    });

    return returnValue.text;
  },
};

const answers = {
  async generate({ databasePath = "../answers/generic.db", amount = 10 }) {
    let result;
    const database = new sqlite3.Database(
      databasePath,
      sqlite3.OPEN_READONLY,
      (error) => {
        if (error) {
          console.error(error);
          return false;
        }
      }
    );

    const query = `
    SELECT text
    FROM answers
    ORDER BY RANDOM()
    LIMIT ${amount}
    `;

    result = await new Promise((resolve, reject) => {
      database.all(query, [], (error, rows) => {
        switch (!!error) {
          case false: {
            resolve(rows);
          }
          default: {
            console.error(error);
            reject(false);
          }
        }
      });
    });

    switch (typeof answers) {
      case "boolean": {
        return false;
      }
      default: {
        for (let iteration = 0; iteration < result.length; iteration++) {
          result[iteration] = result[iteration].text;
        }

        return result;
      }
    }
  },
};

const cards = {
  question,
  answers,
};

export default cards;
