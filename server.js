var cors = require('cors');
const express = require('express');
const db = require('./db');

const app = express();
const port = process.env.PORT || 4002;
app.use(express.json());
app.use(cors());

app.get('/', (request, response) => {
    response.send("mynearbyplaces server side");
});

app.post('/place', (request, response) => {
    let name = request.body.name;
    let street = request.body.street;
    let city = request.body.city;
    let state = request.body.state;
    let postalCode = request.body.postalcode;

    console.log('place');

    db.addAddress(street, city, state, postalCode)
        .then(addressid => db.addPlace(name, addressid))
        .then(() => response.send(`The place ${name} has been added.`))
        .catch(e => response.status(500).send('There was an error'));
});

app.get('/places', (request, response) => {
    db.returnPlaces()
    .then(places => response.json(places))
    .catch(e => {console.log(e); response.status(500).send('There was an error in finding the places.')});  
});

app.get('/place/:name', (request, response) => {  
    let name = request.params.name;
    db.getPlace(name)
    .then(places => {
        if(places.length == 0) {
          response.status(404).send('The place could not be found.');
        } else {
          response.json(places[0]);
        }
    })  
    .catch(e => {console.log(e); response.status(500).send('There was an error in finding the place.')});  
    
  });

  app.post('/review/:placeName', (request, response) => {
    let placeName = request.params.placeName;
    let comment = request.body.comment;
    let rating = request.body.rating;
    let user = request.body.user;
    let city = request.body.city;
    let placeID = 0;

    db.returnPlaceID(placeName, city)
    .then(result => {placeID = result[0].id; db.returnUserID(user)
    .then(userid =>  { db.addReview(placeID, comment, rating, userid[0].id);})})
    .catch(e => {console.log(e); response.status(500).send('There was an error in adding your review.')});  
});

app.post('/signup', (request, response) => {
    let user = request.body.username;
    let password = request.body.password;

    db.addUser(user, password)
    .catch(e => {console.log(e); response.status(500).send('There was an error in adding your review.')});  
})

app.get('/search/:name?/:street?/:city?/:state?/:postalcode?', (request, response) => {
    let name = request.params.name;
    let street = request.params.street;
    let city = request.params.city;
    let state = request.params.state;
    let postalcode = request.params.postalcode;

    db.search(name, street, city, state, postalcode)
        .then(places => response.json(places))
        .catch(e => {console.log(e); response.status(500).send('There was an error in finding the places.')});  
});

app.post('/login/:username/:pass', (request, response) => {  
    let username = request.params.username;
    let password = request.params.pass; 
    
    db.login(username, password)    
    .then(result => {
      response.json({success: result})
    })
    .catch(e => {console.log(e); response.status(500).send('There was an error in validating the user.')});
    
  });

app.listen(port, () => console.log('Listening on port ' + port));
