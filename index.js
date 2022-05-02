//Import Express & Morgan
const express = require('express'),
  morgan = require('morgan');

const app = express();

//Middleware functions
app.use(morgan('common'));
app.use(express.static('public'));

//Endpoints
app.get('/', (req, res) => {
  res.send('Welcome to myFlix!');
});

app.get('/movies', (req, res) => {
  res.json(topTenMovies);
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
