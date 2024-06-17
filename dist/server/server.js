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
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sequelize_1 = require("sequelize");
const port = 3000;
;
;
;
;
;
;
;
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
        const app = (0, express_1.default)();
        app.use(express_1.default.static(path_1.default.join(__dirname, '../client')));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.default.Server(this.server, {
            cors: {
                origin: "http://localhost:8100"
            }
        });
        this.io.on('connection', (socket) => {
            // Log whenever a user connects
            console.log('a user connected : ' + socket.id);
            // Log whenever a client send a "talktome" event
            socket.on('talktome', async (data) => {
                console.log('Message reçu du client :', data.message);
                try {
                    // Answer to client for testing good reception and connection
                    this.io.emit("hi", "coucou wesh");
                }
                catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });
            socket.on('createSondageAction', async (data) => {
                try {
                    // Check if a sondage is already voted
                    const canCreateSondage = await index_1.default['Sondage'].findOne({
                        where: {
                            date_expiration: {
                                [sequelize_1.Op.and]: [
                                    { [sequelize_1.Op.ne]: null }, // Vérifie si le champ n'est pas null
                                    { [sequelize_1.Op.lte]: new Date() } // Vérifie si le champ est inférieur ou égal à la date actuelle
                                ]
                            }
                        }
                    });
                    const noDataInSondage = !await index_1.default['Sondage'].findOne();
                    if (canCreateSondage || noDataInSondage) {
                        let createdSondage = await index_1.default['Sondage'].create({
                            id_user: data.id_user,
                            date_creation: data.date_creation,
                            day_vote_time: data.day_vote_time,
                            hour_vote_time: data.hour_vote_time,
                            title: data.title,
                            description: data.description,
                            associated_picture: data.associated_picture,
                            background_color: data.background_color,
                        });
                        //TODO: fix les types de date, voir en decommantant la ligne suivante
                        await this.updateDateExpirationSondage(createdSondage.dataValues.id, data.date_creation, data.day_vote_time, data.hour_vote_time);
                        this.io.emit("canCreateSondageAnswer", true);
                    }
                    else {
                        this.io.emit("canCreateSondageAnswer", false);
                        return;
                    }
                }
                catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });
            socket.on('getSondagesAction', async () => {
                try {
                    const sondagesWithUserInfo = await index_1.default.sequelize.query(`SELECT "Sondages".*, "Users".pseudo, "Users".profile_picture
                        FROM "Sondages"
                        INNER JOIN "Users" ON "Sondages".id_user = "Users".id`, { type: seq.QueryTypes.SELECT });
                    this.io.emit("getSondagesAnswer", sondagesWithUserInfo);
                }
                catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });
            socket.on('createVoteAction', async (data) => {
                try {
                    await index_1.default['Vote'].create({
                        id_user: data.id_user,
                        id_sondage: data.id_sondage,
                        day: data.day,
                        hour: data.hour,
                    });
                }
                catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });
            socket.on('createUserAction', async (data) => {
                try {
                    const salt = await this.generateSalt();
                    const hashedPassword = await this.hashPassword(data.password, salt);
                    let createdUser = await index_1.default['User'].create({
                        pseudo: data.pseudo,
                        password_hash: hashedPassword,
                        profile_picture: data.profilepicture,
                    });
                }
                catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });
            socket.on('checkValidUserAction', async (data) => {
                try {
                    const isValidUser = await this.authenticateUser(data.pseudo, data.password);
                    if (isValidUser) {
                        this.io.emit("validUserAnswer", true);
                    }
                    else {
                        this.io.emit("validUserAnswer", false);
                    }
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
    async generateSalt() {
        return await bcryptjs_1.default.genSalt(10);
    }
    async hashPassword(password, salt) {
        return await bcryptjs_1.default.hash(password, salt);
    }
    validatePassword(password, passwordHash) {
        return bcryptjs_1.default.compare(password, passwordHash);
    }
    async authenticateUser(pseudoInput, password) {
        const user = await index_1.default['User'].findOne({ where: { pseudo: pseudoInput } });
        if (user === null || !(await this.validatePassword(password, user.password_hash))) {
            return false;
        }
        return true;
    }
    createDateFromDayAndTime(day, time) {
        const days = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
        const today = new Date();
        const dayIndex = days.indexOf(day.toLowerCase());
        const dayDiff = dayIndex >= today.getDay() ? dayIndex - today.getDay() : 7 - (today.getDay() - dayIndex);
        const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayDiff);
        const separateMinuteHour = time.split(":").map((a) => parseInt(a));
        newDate.setHours(separateMinuteHour[0], separateMinuteHour[1]);
        return newDate.getTime() > today.getTime() ? newDate : null;
    }
    async updateDateExpirationSondage(idCreatedSondage, dateCreationSondage, dayVoteTime, hourVoteTime) {
        let timeOut = new Date(dateCreationSondage);
        timeOut.setMinutes(timeOut.getMinutes() + dayVoteTime + hourVoteTime);
        setInterval(async () => {
            if (new Date() >= timeOut) {
                const allVotesOfSondage = await index_1.default['Vote'].findAll({
                    where: { id_sondage: idCreatedSondage },
                    attributes: [
                        'day',
                        'hour',
                        [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('*')), 'count']
                    ],
                    //expected example, day == 'lundi' and hour == '12:00'
                    group: ['day', 'hour'],
                    order: [['count', 'DESC']],
                    limit: 1
                });
                await index_1.default['User'].update({ date_expiration: this.createDateFromDayAndTime(allVotesOfSondage.day, allVotesOfSondage.hour) }, {
                    where: {
                        id: idCreatedSondage,
                    },
                });
            }
        }, 1);
    }
}
new App(port).Start();
//# sourceMappingURL=server.js.map