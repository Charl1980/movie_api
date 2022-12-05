//Import Express & Morgan
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const app = express();

const {
  check,
  validationResult
} = require('express-validator');

const Movies = Models.Movie;
const Users = Models.User;

/* Connects to localhost database
 mongoose.connect('mongodb://localhost:27017/myFlixDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});*/

//Connects to online database
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

//Middleware functions
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//CORS implementation
const cors = require('cors');
app.use(cors());

//IMPORT auth.js file
let auth = require('./auth')(app);

//REQUIRE Passport module and IMPORT the passport.js file
const passport = require('passport');
require('./passport');

//CREATE Endpoints
//Add users

/**
 * POST new user. Username, password, and Email are required fields.
 * Request body: Bearer token, JSON with user information in this format:
 * {
 *  ID: Integer,
 *  Username: String,
 *  Password: String,
 *  Email: String,
 *  Birthday: Date
 * }
 * @name createUser
 * @kind function
 * @returns user object
 */

app.post('/users',
  [
    check('Username', 'Username is required').isLength({
      min: 5
    }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({
      Username: req.body.Username
    })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => {
              res.status(201).json(user)
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//Allow users to add a movie to their list of favorites

/**
 * POST a movie to a user's list of favorites
 * Request body: Bearer token
 * @name createFavorite
 * @kind function
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */

app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Users.findOneAndUpdate({
    Username: req.params.Username
  }, {
    $push: {
      FavoriteMovies: req.params.MovieID
    }
  }, {
    new: true
  }, (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//READ Endpoints
//GET all movies.

/**
 * GET a list of all movies
 * Request body: Bearer Token
 * @name getAllMovies
 * @kind function
 * @returns array of movie objects
 * @requires passport
 */

app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET request

/**
 * GET welcome message from '/' endpoint
 * @name welcomeMessage
 * @kind function
 * @returns Welcome message
 */

app.get('/', (req, res) => {
  res.send('Welcome to my myFlix app!');
});

//GET a movie by title

/**
 * GET data about a single movie by title
 * Request body: Bearer token
 * @name getMovie
 * @kind function
 * @param Title
 * @returns movie object
 * @requires passport
 */
app.get('/movies/:Title', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Movies.findOne({
    Title: req.params.Title
  })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a genre description by genre name

/**
 * GET data about a genre by genre name
 * Request body: Bearer token
 * @name getGenre
 * @kind function
 * @param Name
 * @returns genre object
 * @requires passport
 */

app.get('/genre/:Name', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Movies.findOne({
    'Genre.Name': req.params.Name
  })
    .then((movie) => {
      if (movie) {
        res.json(movie.Genre.Description);
      } else {
        res.status(400).send('Genre not found.');
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a director info by director name

/**
 * GET data about a director by name
 * Request body: Bearer token
 * @name getDirector
 * @kind function
 * @param Name
 * @returns director object
 * @requires passport
 */

app.get('/director/:Name', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Movies.findOne({
    'Director.Name': req.params.Name
  })
    .then((movie) => {
      if (movie) {
        res.json(movie.Director);
      } else {
        res.status(400).send('Director not found.');
      };
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET all users
app.get('/users', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a user by username

/**
 * GET user data on a single user
 * Request body: Bearer token
 * @name getUser
 * @kind function
 * @param Username
 * @returns user object
 * @requires passport
 */

app.get('/users/:Username', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Users.findOne({
    Username: req.params.Username
  })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//UPDATE Endpoints
//UPDATE user's info

/**
 * PUT new user info
 * Request body: Bearer token, updated user info in the following format:
 * {
 *  Username: String, (required)
 *  Password: String, (required)
 *  Email: String, (required)
 *  Birthday: Date
 * }
 * @name updateUser
 * @kind function
 * @param Username
 * @returns user object
 * @requires passport
 */

app.put('/users/:Username',
  [
    check('Username', 'Username is required').isLength({
      min: 5
    }),
    check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
    check('Email', 'Email does not appear to be valid').isEmail()
  ],
  passport.authenticate('jwt', {
    session: false
  }), (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array()
      });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({
      Username: req.params.Username
    }, {
      $set: {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    }, {
      new: true
    }, (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

//DELETE Endpoints
//Delete a movie from user's favorite list

/**
 * DELETE a movie from a user's list of favorites
 * Request body: Bearer token
 * @name deleteFavorite
 * @kind function
 * @param Username
 * @param MovieID
 * @returns user object
 * @requires passport
 */

app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Users.findOneAndUpdate({
    Username: req.params.Username
  }, {
    $pull: {
      FavoriteMovies: req.params.MovieID
    }
  }, {
    new: true
  }, (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

//Delete a user by username

/**
 * DELETE a user by username
 * Request body: Bearer token
 * @name deleteUser
 * @kind function
 * @param Username
 * @returns Success message
 * @requires passport
 */

app.delete('/users/:Username', passport.authenticate('jwt', {
  session: false
}), (req, res) => {
  Users.findOneAndRemove({
    Username: req.params.Username
  })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Error handling

/**
 * Error handler
 * @name errorHandler
 * @kind function
 */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Listening for a pre-configured port number

/**
 * Request listener
 */

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});

/*Listening for port 8080
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});*/
