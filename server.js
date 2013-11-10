/**
 * Created by dijkstra on 06/11/13.
 */
 
// llamamos todas las dependecias necesarias
var sys = require("sys"),my_http = require("http"),
    path = require("path"),url = require("url"),
    filesys = require("fs"),io = require('socket.io').listen(8081);

//creamos nuestro servidos (así de simple)
my_http.createServer(function(request,response){
    //tomamos el nombre de la ruta a la que el cliente quiere acceder
    var my_path = url.parse(request.url).pathname;
    //si la ruta es el raíz, declaramos la ruta como '/index.html'
    if(my_path == '/'){
        my_path = '/index.html';
    }
    // obtenemos la ruta completa del archivo (ruta_servidor+ruta_solicitada)
    var full_path = path.join(process.cwd(),my_path);
    // verificamos que el archivo exista
    filesys.exists(full_path,function(exists){
        //si no existe, le damos un 404
        if(!exists){
            //pero no 404, sino uno personalizado, uno con un html propio
            //seteamos los headers para que sea realmente un 404
            response.writeHeader(404, {"Content-Type": "text/html"});
            //leemos nuestro archivo de 404
            filesys.readFile(path.join(process.cwd(),'/404.html'),function(err,file){
                //se lo enviamos al cliente
                response.write(file,"binary");
                response.end();
            })
        }
        else{
            filesys.readFile(full_path, "binary", function(err, file) {
                if(err) {
                    //en caso de surgir error al leer el archivo le enviamos un 500
                    response.writeHeader(500, {"Content-Type": "text/plain"});
                    // y tambien le enviamos el error que nos dio
                    response.write('Ha ocurrido un error en el servidor, por favor intente mas tarde...' + "\n");
                    response.end();

                }else{
                    //si todo sale bien, le enviamos nuestro archivo
                    response.writeHeader(200);
                    response.write(file, "binary");
                    response.end();
                }

            });
        }
    });
}).listen(8080);
sys.puts("Server Running on 8080");
var users = [];
io.on('connection',function(socket){
    console.log(io.sockets);
    //confirmamos que se conectó
    socket.emit('connected');
    //esperamos el nombre
    socket.once('setName',function(name){
        users[socket.id] = name;
        socket.broadcast.emit('newUser',name);
    })
    //cuando envíe un chat
    socket.on('newChat',function(text){
        var new_chat = {username:text.username,text:text.text};
        io.sockets.emit('new_chat',new_chat);
    });
    //cuando alguien se desconecta, avisamos a todos los conectados
    socket.on('disconnect',function(){
        io.sockets.emit('user_disconnected',users[socket.id]);
        delete users[socket.id];
    })
})