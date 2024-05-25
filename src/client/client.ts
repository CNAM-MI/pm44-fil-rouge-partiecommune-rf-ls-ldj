class Client {
    private socket: SocketIOClient.Socket

    constructor() {
        this.socket = io()
        this.socket.on('connection',  () => {
            document.body.innerHTML += 'Id de la socket client' + this.socket.id + '<br/>'
            this.socket.emit('message', 'Hello from client');
        })
        this.socket.on('message', function (message: any) {
            document.body.innerHTML += 'Message du serveur ' + message + '<br/>'
        })
        
    }
}

const client = new Client()
