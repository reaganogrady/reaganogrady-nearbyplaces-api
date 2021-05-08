//var cors = require('cors');
const express = require('express');

const app = express();
const port = process.env.PORT || 4002;

const db = require('./db');
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
    let postalCode = request.body.state;

    db.addAddress(street, city, state, postalCode)
        .then(addressid => db.addPlace(name, addressid))
        .then(() => response.send('The place ${name} has been added.'))
        .catch(e => response.status(500).send('There was an error'));
});

app.get('/places', (request, response) => {
    db.returnPlaces()
    .then(places => response.json(places))
    .catch(e => {console.log(e); response.status(500).send('There was an error in finding the places.')});  
});

app.post('/review/:placeName', (request, response) => {
    let placeName = request.query.placeName;
    let comment = request.body.comment;
    let rating = request.body.rating;
    let user = request.body.user;
    let city = request.body.city;

    let placeID = db.returnAddressID(placeName, city)
        .then(addressID => db.returnPlaceID(placeName, addressID));

    db.returnUserID(user)
        .then(userid => db.addReview(placeID, comment, rating, userid))
        .catch(e => {console.log(e); response.status(500).send('There was an error in adding your review.')});  
});

app.get('/search/:name?/:street?/:city?/:state?/:postalcode?', (request, response) => {
    let name = request.query.name;
    let street = request.query.street;
    let city = request.query.city;
    let state = request.query.state;
    let postalcode = request.query.postalcode;

    db.search(name, street, city, state, postalcode)
        .then(places => response.json(places))
        .catch(e => {console.log(e); response.status(500).send('There was an error in finding the places.')});  
});

app.get('/place/:name', (request, response) => {  
    let name = request.params.name;
    db.getPlace(name)
    .then(places => response.json(places))
    .catch(e => {console.log(e); response.status(500).send('There was an error in finding the place.')});  
    
  });

app.post('/login/:username/:pass', (request, response) => {  
    let username = request.query.username;
    let password = request.query.pass; 
    
    db.login(username, password)    
    .then(result => {
      response.json({success: result})
    })
    .catch(e => {console.log(e); response.status(500).send('There was an error in validating the user.')});
    
  });

app.listen(port, () => console.log('Listening on port ' + port));
