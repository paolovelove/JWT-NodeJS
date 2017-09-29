// Import Hapi Module
const Hapi = require('hapi');
const server = new Hapi.Server();
const HapiAuth = require('hapi-auth-jwt2');

// used to create, sign, and verify tokens
const jwt = require('jsonwebtoken'); 

// Example data ---------------

let user = {
	id: 1,
	name: 'pao',
	password: 'justForTesting',
	admin: true
};

// ----------------------------

server.connection({
	host: 'localhost',
	port: 8000
});

function validate(decoded, request, callback) {
	if (decoded.name === user.name) {
		return callback(null, true);
	} else {
		return callback(null, false);
	}
}

server.register(HapiAuth, err => {
	if (err) {
		return reply(err);
	}
	server.auth.strategy('jwt', 'jwt', {
		key: 'mysecretKey',
		validateFunc: validate // validate function defined above
	});
	server.auth.default('jwt');
});

// routes ---------------------

server.route({
	method: 'POST',
	path: '/api/public/authenticate',
	config: {
		// public route
		auth: false
	},
	handler: (request, reply) => {
		// check if password matches, assume we only have an only user
		if (user.name != request.payload.name || user.password != request.payload.password) {
			reply({
				success: false,
				message: 'Wrong password!'
			});
		} else {
			// create a token
			let token = jwt.sign(user, 'mysecretKey', {
				expiresIn: '2d'
			});
			reply({
				success: true,
				message: 'Enjoy your token!',
				token: token
			});
		 }
	}
});

server.route({
	method: 'GET',
	path: '/api/protected/hello',
	handler: (request, reply) => {
		reply(request.auth.credentials);
	}
});

// Run the app ----------------

server.start(() => {
	console.log("Server is running");
});
