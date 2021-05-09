const express = require('express');

const app = express();
const port = process.env.PORT || 4002;
app.use(express.json());

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

app.listen(port, () => console.log('Listening on port ' + port));
