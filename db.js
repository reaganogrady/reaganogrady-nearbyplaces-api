const { Pool } = require('pg');
let connectionString = '';

let connection = {
    connectionString: process.env.DATABASE_URL ? process.env.DATABASE_URL : connectionString,
    ssl : {rejectUnauthorized: false}
};

const pool = new Pool(connection);

let addAddress = (street, city, state, postalCode) =>{
    // Add an address
   return pool.query('INSERT INTO mynearbyplaces.address(street, city, postalcode, state) values ($1, $2, $3, $4) returning id', 
        [street, city, postalCode, state])
        .then(result => {console.log("Address created"); return result.rows[0].id;})
        .catch(e => console.log(e)); 
};

let addPlace = (name, addressID) => {
    // Add a Place
    return pool.query('INSERT INTO mynearbyplaces.places(place, addressid) values ($1, $2)', 
    [name, addressID])
    .then(() => console.log("Place created"))
    .catch(e => console.log(e)); 
};

let returnPlaces = () => {
    // Return all places
    return pool.query("SELECT p.place, a.street, a.city, a.postalcode, a.state, \
        json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'user',u.username)) AS reviews \
        FROM mynearbyplaces.places p \
        LEFT JOIN mynearbyplaces.address a on p.addressid = a.id \
        LEFT JOIN mynearbyplaces.review r ON p.id = r.placeid \
        LEFT JOIN mynearbyplaces.users u ON r.userid = u.id \
        WHERE p.place LIKE '%%' AND a.street LIKE '%%' \
        GROUP BY p.place, a.street, a.city, a.postalcode, a.state")
    .then(result => {console.log("Places returned"); return result.rows;})
};

let getPlace = (name) => {
    // Return the place information with the given name
    return pool.query(`SELECT p.place, a.street , a.city , a.postalcode, a.state,
    json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'userid', r.userid)) AS reviews
    FROM mynearbyplaces.places p 
    LEFT JOIN mynearbyplaces.address a ON p.addressid  = a.id 
    LEFT JOIN mynearbyplaces.review r ON p.id = r.placeid 
    WHERE p.place = $1
    GROUP BY p.place, a.street , a.city , a.postalcode, a.state`, [name])
    .then(result => result.rows);
}

let addReview = (placeid, comment, rating, userid) => {
    // Add a Review
    return pool.query('INSERT INTO mynearbyplaces.review(placeid, comment, rating, userid) values($1, $2, $3, $4)', 
        [placeid, comment, rating, userid])
        .then(() => console.log("Review created"))
        .catch(e => console.log(e));
}

let returnPlaceID = (name, city) => {
    // Return the address ID for a place
    return pool.query("SELECT id FROM mynearbyplaces.places \
    WHERE place = $1 AND addressid = (SELECT id FROM mynearbyplaces.address WHERE city = $2)\
    ", [name, city])
    .then(result => result.rows);
}

let returnUserID = (username) => {
    // Given a username, return their userid
    return pool.query("SELECT id FROM mynearbyplaces.users \
    WHERE username = $1", [username])
    .then(result => result.rows);
}

let addUser = (username, password) => {
    // Add a user 
    return pool.query("INSERT INTO mynearbyplaces.users(username, password) values ($1, $2)", [username, password])
    .then(() => console.log("User created"))
    .catch(e => console.log(e));
}

let search = (name, street, city, state, postalcode) => {
    // Return places with the given name and location
    return pool.query(`SELECT p.place, a.street, a.city, a.postalcode, a.state, \
        json_agg(json_build_object('comment', r.comment, 'rating', r.rating, 'user', u.username)) AS review \
        FROM mynearbyplaces.places p \
        INNER JOIN mynearbyplaces.address a on p.addressid = a.id \
        LEFT JOIN mynearbyplaces.review r ON p.id = r.placeid \
        LEFT JOIN mynearbyplaces.users u ON r.userid = u.id \
        WHERE (lower(p.place) like lower('${!name ? '%%' : `%${name}%`}')) 
        and (lower(a.street) like lower('${!street ? '%%' : `%${street}%`}')) 
        and (lower(a.city) like lower('${!city ? '%%' : `%${city}%`}')) 
        and (lower(a.state) like lower('${!state ? '%%' : `%${state}%`}')) 
        and (cast(a.postalcode as text) like '${!postalcode ? '%%' : `%${postalcode}%`}') 
        GROUP BY p.place, a.street , a.city , a.state , a.postalcode`)
    .then(result => result.rows);
};


module.exports = { addAddress, addPlace, returnPlaces, getPlace, addReview, returnPlaceID, returnUserID, addUser, search };