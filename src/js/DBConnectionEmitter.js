var events = require('events'),
    util = require('util')

function DBConnectionEmitter(dburl, dbClient){

    var self = this

    events.EventEmitter.call(self)


    self.on('getDataset', function(params){
        if (!params || !params.collection){

            self.emit('error', {msg: "DBConnectionEmitter Error: Missing getDataset params"})
            return
        }

        dbClient.connect(dburl, function(err, db){

            if (err){

                var message = "DBConnectionEmitter Error: dbClient connection failed!"
                self.emit('error', {msg:message})
                return
            }

            db.collection(params.collection, function(err, collection){

                if (err){
                    var message = "DBConnectionEmitter Error: db collection instance creation failed!"
                    self.emit('error', {msg:message})
                    return
                }

                var query = {
                    id: params.id
                }

                var cursorStream = collection.find(query, {_id:0}).stream()

                cursorStream.on('data', function(data){
                    self.emit('data', data)
                })

                cursorStream.on('close', function(){

                    db.close()
                    self.emit('close')

                })
            })

        })
    })

}
util.inherits(DBConnectionEmitter, events.EventEmitter)

exports.construct = DBConnectionEmitter
exports.partial = function(){

    var dburl, dbClient

    function exports(){
        return new DBConnectionEmitter(dburl, dbClient)
    }

    exports.url = function(connectionUrl){
        if(arguments.length > 0){
            dburl = connectionUrl
            return this
        }

        return dburl
    }

    exports.dbClient = function(client){
        if(arguments.length > 0){
            dbClient = client
            return this
        }

        return dbClient
    }

    return exports
}
