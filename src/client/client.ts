class Client {
    private socket: SocketIOClient.Socket

    constructor() {
        this.socket = io()

        this.socket.on('connect', function () {
            console.log('connect')
        })

        this.socket.on('disconnect', function (message: any) {
            console.log('disconnect ' + message)
            location.reload()
        })
    }
}

const client = new Client()