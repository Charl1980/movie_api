//Import Express & Morgan
const express = require('express'),
  morgan = require('morgan'),
  bodyParser = require('body-parser'),
  uuid = require('uuid');

const app = express();

//Middleware functions
app.use(morgan('common'));
app.use(express.static('public'));
app.use(bodyParser.json());

//Arrays of objects
let users = [{
    id: 1,
    name: 'Sue',
    favoriteMovies: []
  },
  {
    id: 2,
    name: 'Bob',
    favoriteMovies: ['Dogma']
  }
]

let movies = [{
    Title: 'Equilibrium',
    Description: 'In an oppressive future where all forms of feeling are illegal, a man in charge of enforcing the law rises to overthrow the system and state.',
    Genre: {
      Name: 'Action',
      Description: 'In the near future, Freedom is a thing of the past.',
    },
    Director: {
      Name: 'Kurt Wimmer',
      Birth: '1964',
      Death: '',
      Bio: 'Kurt Wimmer was born in 1964. He is a writer and producer, known for Equilibrium (2002), Point Break (2015) and Total Recall (2012).',
    },
    Actors: 'Christian Bale',
    imgURL: 'https://www.imdb.com/title/tt0238380/mediaviewer/rm4126777088/',
  },
  {
    Title: 'Lords of Dogtown',
    Description: 'The film follows the surf and skateboarding trends that originated in Venice, California during the 1970s.',
    Genre: {
      Name: 'Biography',
      Description: 'They came from nothing to change everything.',
    },
    Director: {
      Name: 'Catherine Hardwicke',
      Birth: '1955',
      Death: '',
      Bio: 'Catherine Hardwicke was born on October 21, 1955 in Cameron, Texas, USA. She is a director and production designer, known for Twilight (2008), Thirteen (2003) and Lords of Dogtown (2005).',
    },
    Actors: 'Heath Ledger',
    imgURL: 'https://www.imdb.com/title/tt0355702/mediaviewer/rm3419603456/',
  },
  {
    Title: 'Lost Highway',
    Description: 'Anonymous videotapes presage a musicians murder conviction, and a gangsters girlfriend leads a mechanic astray.',
    Genre: {
      Name: 'Thriller',
      Description: 'A lost road on the edge of strange...',
    },
    Director: {
      Name: 'David Lynch',
      Birth: '1946',
      Death: '',
      Bio: 'Born in precisely the kind of small-town American setting so familiar from his films, David Lynch spent his childhood being shunted from one state to another as his research scientist father kept getting relocated.',
    },
    Actors: 'Bill Pullman',
    imgURL: 'https://www.imdb.com/title/tt0116922/mediaviewer/rm2585795073/',
  },
  {
    Title: 'Old School',
    Description: 'Three friends attempt to recapture their glory days by opening up a fraternity near their alma mater.',
    Genre: {
      Name: 'Comedy',
      Description: 'Critics say, "Old School is dumb and pointless." We say, "WHO CARES?"',
    },
    Director: {
      Name: 'Todd Phillips',
      Birth: '1970',
      Death: '',
      Bio: 'Todd Phillips is an American filmmaker and actor who got his start by directing the comedy films Road Trip and Old School, the earlier inspired EuroTrip.',
    },
    Actors: 'Luke Wilson',
    imgURL: 'https://www.imdb.com/title/tt0302886/mediaviewer/rm1237925632/',
  },
  {
    Title: 'The Motorcycle Diaries',
    Description: 'The dramatization of a motorcycle road trip Che Guevara went on in his youth that showed him his lifes calling.',
    Genre: {
      Name: 'Biography',
      Description: 'Before he changed the world the world changed him',
    },
    Director: {
      Name: 'Walter Salles',
      Birth: '1956',
      Death: '',
      Bio: 'Walter Salles was born on April 12, 1956 in Rio de Janeiro, Rio de Janeiro, Brazil. He is a director and producer, known for Central Station (1998), The Motorcycle Diaries (2004) and Fremdes Land (1995).',
    },
    Actors: 'Gael García Bernal',
    imgURL: 'https://www.imdb.com/title/tt0318462/mediaviewer/rm4268689408/',
  },
];

//CREATE Endpoints
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser)
  } else {
    res.status(400).send('Users need names')
  }
});

app.post('/users/:id/:movieTitle', (req, res) => {
  const {
    id,
    movieTitle
  } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).send(`${movieTitle} has been added to user ${id}'s array`)
  } else {
    res.status(400).send('No such user')
  }
});

//DELETE Endpoints
app.delete('/users/:id/:movieTitle', (req, res) => {
  const {
    id,
    movieTitle
  } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been removed from user ${id}'s array`)
  } else {
    res.status(400).send('No such user')
  }
});

app.delete('/users/:id', (req, res) => {
  const {
    id
  } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    users = users.filter(user => user.id != id);
    res.status(200).send(`User ${id} has been removed`)
  } else {
    res.status(400).send('No such user')
  }
});

//UPDATE Endpoints
app.put('/users/:id', (req, res) => {
  const {
    id
  } = req.params;
  const updatedUser = req.body;

  let user = users.find(user => user.id == id);

  if (user) {
    user.name = updatedUser.name;
    res.status(200).json(user)
  } else {
    res.status(400).send('No such user')
  }
});

//READ Endpoints
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

app.get('/movies/:title', (req, res) => {
  const {
    title
  } = req.params;
  const movie = movies.find(movie => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('Movie not found')
  }
});

app.get('/movies/genres/:genreName', (req, res) => {
  const {
    genreName
  } = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('Genre not found')
  }
});

app.get('/movies/directors/:directorName', (req, res) => {
  const {
    directorName
  } = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('Genre not found')
  }
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
