'use strict';

const Hapi = require('hapi'),
    Datastore = require('nedb'),
    db = new Datastore({
        filename: 'data/learned.db',
        autoload: true
    });

const server = new Hapi.Server();
server.connection({
    port: 2000,
    host: 'localhost'
});

server.register(require('inert'), (err) => {

    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {
            reply.file('./public/index.html');
        }
    });

    server.route({
        method: 'GET',
        path: '/learned',
        handler: function (request, reply) {
            db.find({}, function(err, docs) {
                reply(docs)
            })
        }
    });

    server.route({
        method: 'POST',
        path: '/learn',
        config: {
            handler: function (req, reply) {
                db.insert(req.payload, function (err, newDoc) {
                    if(err) {
                        reply({success: false})
                    } else {
                        reply({success: true, data: newDoc})
                    }
                });
            },
            payload: {
                output: 'data',
                parse: true
            }
        }

    })

    server.route({
        method: "GET",
        path: "/public/{path*}",
        handler: {
            directory: {
                path: "./public",
                listing: false,
                index: false
            }
        }
    });
});


server.start((err) => {

    if (err) {
        throw err;
    }
    console.log(`LeafBot's Server is running at: ${server.info.uri}`);
});
