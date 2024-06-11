"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const seq = __importStar(require("sequelize"));
const index_1 = __importDefault(require("../../models/index"));
const port = 3000;
class App {
    constructor(port) {
        this.sequelizes = new seq.Sequelize({
            host: '84.235.235.229',
            dialect: 'postgres',
            port: 5432,
            database: 'bdmDB',
            username: 'postgres',
            password: 'bdmpwd',
        });
        this.port = port;
        this.sequelizes.authenticate();
        const user = index_1.default['User'].build({ id: 2, pseudo: 'DarkJesus', age: 2 });
        user.save();
        const app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.default.Server(this.server, {
            cors: {
                origin: "http://localhost:8100"
            }
        });
        this.io.on('connection', (socket) => {
            console.log('a user connected : ' + socket.id);
            socket.emit('message', 'Hello ' + socket.id);
            socket.broadcast.emit('message', 'Everybody, say coucou to ' + socket.id);
            this.io.emit('hello', "wold");
            socket.on('talktome', (data) => {
                console.log('Message reçu du client :', data.message);
                try {
                    index_1.default['Logan'].findAll().then((e) => {
                        console.log("test", e);
                        this.io.emit("hi", e);
                    });
                }
                catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });
            socket.on('disconnect', function () {
                console.log('socket disconnected : ' + socket.id);
            });
        });
    }
    Start() {
        this.server.listen(this.port);
        console.log(`Server listening on port ${this.port}.`);
        console.log(`Socket.IO version: ${this.io}`);
    }
}
new App(port).Start();
// Obtenir une instance de QueryInterface
/**const queryInterface = sequelizes.getQueryInterface();

queryInterface.showAllTables()
    .then(tableNames => {
        // Afficher la liste des tables
        console.log('Tables:', tableNames);
    });
 */
/**const sondage = db['Sondage'].build({ pseudoe: 'Bonsoir', mot_de_passe: 'ouioui', photo_profil: null});
sondage.save().then((e) => {console.log(e)});**/
/**db['Utilisateur'].findAll().then((e) => {
    console.log("test", e);
})**/
// Enregistrer la nouvelle instance dans la base de données
/**Utilisateur.create(nouveauUtilisateur)
    .then(utilisateur => {
        console.log("utilisateur créée", utilisateur);
    })
    .catch(err => {
        console.error('Erreur lors de la création de l\'utilisateur :', err);
    });**/
//# sourceMappingURL=server.js.map