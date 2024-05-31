import express from 'express'
import path from 'path'
import http from 'http'
import socketIO from 'socket.io'
import * as seq from 'sequelize';
import db from '../../models/index';

const port: number = 3000

class App {
    private server: http.Server
    private port: number

    private io: socketIO.Server

    constructor(port: number) {
        this.port = port

        const app = express()
        app.use(express.static(path.join(__dirname, '../client')))

        this.server = new http.Server(app)
        this.io = new socketIO.Server(this.server)

        this.io.on('connection', (socket: socketIO.Socket) => {
            console.log('a user connected : ' + socket.id)

            socket.emit('message', 'Hello ' + socket.id)

            socket.broadcast.emit(
                'message',
                'Everybody, say coucou to ' + socket.id
            )

            this.io.emit('hello', "wold");


            socket.on('disconnect', function () {
                console.log('socket disconnected : ' + socket.id)
            })
        })
    }

    public Start() {
        this.server.listen(this.port)
        console.log(`Server listening on port ${this.port}.`)
    }
}

//new App(port).Start();
const sequelizes = new seq.Sequelize({
    host: '84.235.235.229',
    dialect: 'postgres',
    port: 5432,
    database: 'bdmDB',
    username: 'postgres',
    password: 'bdmpwd',
});

try {
    sequelizes.authenticate();
    console.log('Connection has been established successfully.');
    // Obtenir une instance de QueryInterface
    const queryInterface = sequelizes.getQueryInterface();

    queryInterface.showAllTables()
        .then(tableNames => {
            // Afficher la liste des tables
            console.log('Tables:', tableNames);
        });
    // Create a new user
    //const jane =  Utilisateur.build({ pseudo: 'Jane', mot_de_passe: 'osekour', photo_profil: null});
    //console.log("Jane's auto-generated ID:", jane.id);

    const user = db['Utilisateur'].build({ pseudoe: 'Jane', mot_de_passe: 'osekour', photo_profil: null});
    user.save();
    
    const sondage = db['Sondage'].build({ pseudoe: 'Bonsoir', mot_de_passe: 'ouioui', photo_profil: null});
    sondage.save().then((e) => {console.log(e)});

    /**db['Utilisateur'].findAll().then((e) => {
        console.log("test", e);
    })**/

    db['Sondage'].findAll().then((e) => {
        console.log("test", e);
    })

    // Enregistrer la nouvelle instance dans la base de données
    /**Utilisateur.create(nouveauUtilisateur)
        .then(utilisateur => {
            console.log("utilisateur créée", utilisateur);
        })
        .catch(err => {
            console.error('Erreur lors de la création de l\'utilisateur :', err);
        });**/


} catch (error) {
    console.error('Unable to connect to the database:', error);
}
