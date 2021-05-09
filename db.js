const { Pool } = require('pg');
let connectionString = 'postgres://bqlodeqyfeofes:bcbdb384b7c1e39b9e587f75712aa14b67855594c91272348740a5a2112d360b@ec2-54-90-211-192.compute-1.amazonaws.com:5432/d2hk7nb7q12lah';

let connection = {
    connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL : connectionString,
    ssl : {rejectUnauthorized: false}
};

const pool = new Pool(connection);

let addAddress = (street, city, state, postalCode) =>{
    // Add an address
   return pool.query('INSERT INTO mynearbyplaces.address(street, city, state, postalcode) values ($1, $2, $3, $4) returning id', 
        [street, city, state, postalCode])
        .then(result => {console.log("Address created"); return result.rows[0];})
        .catch(e => console.log(e)); 
};

let addPlace = (name, addressID) => {
    // Add a Place
    return pool.query('INSERT INTO mynearbyplaces.places(name, addressid) values ($1, $2)', 
    [name, addressID])
    .then(() => console.log("Place created"))
    .catch(e => console.log(e)); 
};

module.exports = {addAddress, addPlace};