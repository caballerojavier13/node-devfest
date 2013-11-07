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
            self.receiveChat();
            self.userDisconnect();
            $('#chat-container').html('<ul id="messages-container"></ul><div class="row-fluid"><input type="text" id="text-input" class="span12"></div>');
            $('#text-input').on('keypress',function(e){
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
        socket = io.connect('http://localhost:8081');
    }

    this.sendChat = function(){

        if(socket.socket.sessionid){
            socket.emit('newChat',{username: self.username, text: $('#text-input').val()});
            $('#text-input').val('');
        }else{
            alert('Debes conectarte antes de enviar un chat');
        }
    }

    this.receiveChat = function(){
        socket.on('new_chat',function(data){
            if(data.username == self.username){
                $('#messages-container').append('<li><strong> Me :</strong>'+data.text+'</li>');
            }else{
                $('#messages-container').append('<li><strong>'+data.username+' :</strong>'+data.text+'</li>');
            }
            $("#messages-container").scrollTop($("#messages-container")[0].scrollHeight);

        });
    };

    this.userDisconnect = function(){
        socket.on('user_disconnected',function(user){
            $('#messages-container').append('<li style="color: red; font-style: italic">El usuario '+user+' ha salido del chat</li>');
        })
    }

}

var chat = new Chat();