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

let returnPlaces = () => {
    // Return all places
    return pool.query("SELECT p.name, a.street, a.city, a.state, a.postalcode, \
        json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'user',u.username)) AS reviews \
        FROM mynearbyplaces.places p \
        INNER JOIN mynearbyplaces.address a on p.addressid = a.id \
        INNER JOIN mynearbyplaces.review r ON p.id = r.placeid \
        LEFT JOIN mynearbyplaces.users u ON r.userid = u.id \
        WHERE p.name LIKE '%%' AND a.street LIKE '%%' \
        GROUP BY p.name, a.street, a.city, a.state, a.postalcode")
    .then(() => {console.log("Places returned"); return result.rows;})
};

module.exports = {addAddress, addPlace, returnPlaces };