//Import Express & Morgan
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid'),
  mongoose = require('mongoose'),
  Models = require('./models.js');

const app = express();

const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', {
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

//Arrays of objects
//let users = [{
//    id: 1,
//    name: 'Sue',
//    favoriteMovies: []
//  },
//  {
//    id: 2,
//    name: 'Bob',
//    favoriteMovies: ['Dogma']
//  }
//]

//let movies = [{
//    Title: 'Equilibrium',
//    Description: 'In an oppressive future where all forms of feeling are illegal, a man in charge of enforcing the law rises to overthrow the system and state.',
//    Genre: {
//      Name: 'Action',
//      Description: 'In the near future, Freedom is a thing of the past.',
//    },
//    Director: {
//      Name: 'Kurt Wimmer',
//      Birth: '1964',
//      Death: '',
//      Bio: 'Kurt Wimmer was born in 1964. He is a writer and producer, known for Equilibrium (2002), Point Break (2015) and Total Recall (2012).',
//    },
//    Actors: 'Christian Bale',
//    imgURL: 'https://www.imdb.com/title/tt0238380/mediaviewer/rm4126777088/',
//  },
//  {
//    Title: 'Lords of Dogtown',
//    Description: 'The film follows the surf and skateboarding trends that originated in Venice, California during the 1970s.',
//    Genre: {
//      Name: 'Biography',
//      Description: 'They came from nothing to change everything.',
//    },
//    Director: {
//      Name: 'Catherine Hardwicke',
//      Birth: '1955',
//      Death: '',
//      Bio: 'Catherine Hardwicke was born on October 21, 1955 in Cameron, Texas, USA. She is a director and production designer, known for Twilight (2008), Thirteen (2003) and Lords of Dogtown (2005).',
//    },
//    Actors: 'Heath Ledger',
//    imgURL: 'https://www.imdb.com/title/tt0355702/mediaviewer/rm3419603456/',
//  },
//  {
//    Title: 'Lost Highway',
//    Description: 'Anonymous videotapes presage a musicians murder conviction, and a gangsters girlfriend leads a mechanic astray.',
//    Genre: {
//      Name: 'Thriller',
//      Description: 'A lost road on the edge of strange...',
//    },
//    Director: {
//      Name: 'David Lynch',
//      Birth: '1946',
//      Death: '',
//      Bio: 'Born in precisely the kind of small-town American setting so familiar from his films, David Lynch spent his childhood being shunted from one state to another as his research scientist father kept getting relocated.',
//    },
//    Actors: 'Bill Pullman',
//    imgURL: 'https://www.imdb.com/title/tt0116922/mediaviewer/rm2585795073/',
//  },
//  {
//    Title: 'Old School',
//    Description: 'Three friends attempt to recapture their glory days by opening up a fraternity near their alma mater.',
//    Genre: {
//      Name: 'Comedy',
//      Description: 'Critics say, "Old School is dumb and pointless." We say, "WHO CARES?"',
//    },
//    Director: {
//      Name: 'Todd Phillips',
//      Birth: '1970',
//      Death: '',
//      Bio: 'Todd Phillips is an American filmmaker and actor who got his start by directing the comedy films Road Trip and Old School, the earlier inspired EuroTrip.',
//    },
//    Actors: 'Luke Wilson',
//    imgURL: 'https://www.imdb.com/title/tt0302886/mediaviewer/rm1237925632/',
//  },
//  {
//    Title: 'The Motorcycle Diaries',
//    Description: 'The dramatization of a motorcycle road trip Che Guevara went on in his youth that showed him his lifes calling.',
//    Genre: {
//      Name: 'Biography',
//      Description: 'Before he changed the world the world changed him',
//    },
//    Director: {
//      Name: 'Walter Salles',
//      Birth: '1956',
//      Death: '',
//      Bio: 'Walter Salles was born on April 12, 1956 in Rio de Janeiro, Rio de Janeiro, Brazil. He is a director and producer, known for Central Station (1998), The Motorcycle Diaries (2004) and Fremdes Land (1995).',
//    },
//    Actors: 'Gael García Bernal',
//    imgURL: 'https://www.imdb.com/title/tt0318462/mediaviewer/rm4268689408/',
//  },
//];

//CREATE Endpoints
//Add users
app.post('/users', (req, res) => {
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
            Password: req.body.Password,
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
app.post('/users/:Username/movies/:MovieID', (req, res) => {
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
//GET all movies
app.get('/movies', (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//GET a movie by title
app.get('/movies/:Title', (req, res) => {
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
app.get('/genre/:Name', (req, res) => {
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
app.get('/director/:Name', (req, res) => {
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
app.get('/users', (req, res) => {
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
app.get('/users/:Username', (req, res) => {
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
app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({
    Username: req.params.Username
  }, {
    $set: {
      Username: req.body.Username,
      Password: req.body.Password,
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
app.delete('/users/:Username/movies/:MovieID', (req, res) => {
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
app.delete('/users/:Username', (req, res) => {
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
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

//Listening for port 8080
app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});
