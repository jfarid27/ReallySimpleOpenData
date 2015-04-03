function getDataset(Controller){
    return function(request, response){

        var controller = Controller()
        var queryCollection = []

        if (!request.params) {
            var message = "Error: No request params set!"
            response.status(501).send({error: message})
            return
        }

        if ( !request.params('collection') || !request.params('id')){
            var message= "Error: Missing request params!"
            response.status(501).json({error: message})
            return
        }

        //unwrap request
        var params = {
            collection: request.param('collection'),
            id: request.param('id')
        }

        var resErrWrapper = function(msg) {
            response.status(501)
                .json({error:"Failed on dataset get", message: msg})

            response.end()
        }

        controller.on('error', function(error){
            resErrWrapper(error.msg)
        })

        controller.on('data', function(data){
            queryCollection.append(data)
        })

        controller.on('close', function(){
            response.send(queryCollection)
            response.end()
        })

        controller.emit('getDataset', params)
    }
}

exports.construct = getDataset
exports.partial = function(){
   
    var controller

    var partial = function(){
        return getDataset(controller)
    } 

    partial.controller = function(){
        if (arguments.length > 0){
            controller = arguments[0]
            return partial
        }
        return controller
    }

    return partial 

}
