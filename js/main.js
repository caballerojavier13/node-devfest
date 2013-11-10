/**
 * Created by dijkstra on 06/11/13.
 */

 var socket;

 function Chat(){

    var self = this;
    this.username = '';


    this.enterChat = function(){
        self.username = $('#username').val();
        if(self.username.length > 3){
            //hacerlo entrar al chat :D
            self.connect_socket();
            //instanciamos los listeners
            self.receiveChat();
            self.userDisconnect();
            self.userConnected();
            //creamos el entorno visual del chat
            $('#chat-container').html('<ul id="messages-container"></ul><div class="row-fluid"><input type="text" id="text-input" class="span12"></div>');
            //instanciamos el listener para el envío de mensajes
            $('#text-input').on('keypress',function(e){
                //si es "enter" enviamos el mensaje
                if(e.keyCode == '13'){
                    self.sendChat();
                }
            })
        }else{
            $('#username').focus();
            return false;
        }
    }

    this.connect_socket = function(){
        //armamos la conexion
        socket = io.connect('http://localhost:8081');
        // lo habilitamos para enviar su nombre
        socket.once('connected',function(){
            socket.emit('setName',self.username);
        })
    }

    //funcion para enviar chats
    this.sendChat = function(){
        //si no está conectado, imposible hacer el envío
        if(socket.socket.sessionid){
            //emitimos al servidor que hay un nuevo mensaje
            socket.emit('newChat',{username: self.username, text: $('#text-input').val()});
            //limpiamos el campo de texto
            $('#text-input').val('');
        }else{
            //alert molesto :D
            alert('Debes conectarte antes de enviar un chat');
        }
    }
    // listener para recibir los chats
    this.receiveChat = function(){
        //listener propiamente dicho
        socket.on('new_chat',function(data){
            //verificamos si soy yo para mostrar Yo o el nombre del usuario
            if(data.username == self.username){
                $('#messages-container').append('<li><strong> Yo : </strong>'+data.text+'</li>');
            }else{
                $('#messages-container').append('<li><strong>'+data.username+' : </strong>'+data.text+'</li>');
            }
            $("#messages-container").scrollTop($("#messages-container")[0].scrollHeight);

        });
    }
    // listener para el disconnect de usuarios
    this.userDisconnect = function(){
        socket.on('user_disconnected',function(user){
            $('#messages-container').append('<li style="color: red; font-style: italic">El usuario '+user+' ha salido del chat</li>');
        })
    }
    //
    this.userConnected = function(username){
        socket.on('newUser',function(user){
            $('#messages-container').append('<li style="color: blue; font-style: italic">El usuario '+user+' ha ingresado al chat</li>');
        })
    }

}

var chat = new Chat();