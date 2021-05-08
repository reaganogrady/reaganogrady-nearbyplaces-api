require('dotenv').config();
const { Pool } = require('pg');

let host = process.env.host;
let database = process.env.database;
let port = process.env.port;
let username = process.env.username;
let password = process.env.password;

let connectionString = 
`postgres://${username}:${password}@${host}:${port}/${database}`;

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

let getPlace = (name) => {
    // Return the place information with the given name
    return pool.query(`SELECT p.name, a.street , a.city , a.state , a.postalcode, 
    json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'userid', r.userid)) AS review
    FROM mynearbyplaces.places p 
    INNER JOIN mynearbyplaces.address a ON p.addressid  = a.id 
    INNER JOIN mynearbyplaces.review r ON p.id = r.placeid 
    WHERE p.name = $1
    GROUP BY p.name, a.street , a.city , a.state , a.postalcode`, [name])
    .then(result => result.rows);
}

let addReview = (placeid, comment, rating, userid) => {
    // Add a Review
    return pool.query('INSERT INTO mynearbyplaces.review(placeid, comment, rating, userid) values ($1, $2, $3, $4)', 
        [placeid, comment, rating, userid])
        .then(result => {console.log("Review created created");})
        .catch(e => console.log(e));
}

let search = (name, street, city, state, postalcode) => {
    // Return places with the given name and location
    return pool.query(`SELECT p.name, a.street, a.city, a.state, a.postalcode, \
        json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'user', u.username)) AS reviews \
        FROM mynearbyplaces.places p \
        INNER JOIN mynearbyplaces.address a on p.addressid = a.id \
        LEFT JOIN mynearbyplaces.review r ON p.id = r.placeid \
        LEFT JOIN mynearbyplaces.users u ON r.userid = u.id \
        WHERE lower(p.name) LIKE lower(${!name ? '%%' :   `%${name}%`}')) \
            AND (lower(a.street) LIKE lower("${!street ? '%%' : `%${street}%`}")) \
            AND (lower(a.city) LIKE lower("${!city ? '%%' : `%${city}%`}")) \
            AND (lower(a.state) LIKE lower("${!state ? '%%' : `%${state}%`}")) \
            AND (cast(a.postalcode AS text) like "${!postalcode ? '%%' : `%${postalcode}%`}") 
        GROUP BY p.name, a.street , a.city , a.state , a.postalcode`)
    .then(result => result.rows);
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

let returnUserID = (username) => {
    // Given a username, return their userid
    return pool.query("SELECT id FROM FROM mynearbyplaces.users \
    WHERE username = $1", [username])
    .then(() => result.rows);
}

let returnAddressID = (name, city) => {
    // Return the address ID for a place
    return pool.query("SELECT id FROM mynearbyplaces.address \
    WHERE place = $1 AND city = $2", [name, city])
}

let returnAddressID = (name, addressID) => {
    // Return the address ID for a place
    return pool.query("SELECT id FROM mynearbyplaces.places \
    WHERE place = $1 AND addressid = $2", [name, addressID])
}

let login = (username, pass) => {
    // Return true if the username and pasword are correct and in the system
    return pool.query("SELECT * FROM mynearbyplaces.users WHERE username = $1 AND password = $2",
    [username, pass])
    .then(result => result.rows.length == 1);
}
module.exports = { addAddress, addPlace, returnPlaces, search, addReview, login, returnUserID, returnAddressID, getPlace }
