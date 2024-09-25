# Cards against humanity (clone)
  Azala's picture cards online inspired analogue

## Features
+ Vote mode available (and set by default)
+ Host rotation available (and set by default)
+ Blank card creation
+ (properly) scaled images inside blank cards


## Installation:
  Clone this git repository

  ```git clone git@github.com:CharleyGordon/cards-against-humanity.git```

  Or download and extract .zip file.

  Change path to repo

  ```cd <path-to-repo>```

  run npm install

  ```npm i```

  Change path to server

  ```cd server```

  Install ws npm package

  ```npm i ws```

## Execution
  Check file client/index.js and change line 7 value to your server's public address

  ```const destination = "<server-ip>";```

  If you run locally, leave address as localhost

  ```const destination = "localhost";```

  Change path to repo

  ```cd <path-to-repo>```

  Run server (e.g. IIS, Apache for non-local use, live-server extension or live-server npm package for local use)
  Example showing live-server npm command

  ```live-server --port=5050```

  Change path to server

  ```cd server```

  Run node

  ```node index.js```
