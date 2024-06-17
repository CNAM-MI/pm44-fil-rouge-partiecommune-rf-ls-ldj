import express from 'express'
import path from 'path'
import http from 'http'
import socketIO from 'socket.io'
import * as seq from 'sequelize';
import db from '../../models/index';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { fn, col, Op, Sequelize } from 'sequelize';

const port: number = 3000
interface createUserAction {
    pseudo: string,
    password: string,
    profilepicture?: Blob,
};

interface checkValidUserAction {
    pseudo: string,
    password: string,
};

interface createSondageAction {
    id_user: number,
    date_creation: Date,
    day_vote_time: number,
    hour_vote_time: number,
    title: string,
    description: string,
    associated_picture: Blob,
    background_color: string,
};

interface createVoteAction {
    id_user: number,
    id_sondage: number,
    day: string,
    hour: string,
};

class App {
    private server: http.Server
    private port: number
    private io: socketIO.Server
    private sequelizes = new seq.Sequelize({
        host: '84.235.235.229',
        dialect: 'postgres',
        port: 5432,
        database: 'bdmDB',
        username: 'postgres',
        password: 'bdmpwd',
    });

    constructor(port: number) {
        this.port = port;
        this.sequelizes.authenticate();

        const app = express()
        app.use(express.static(path.join(__dirname, '../client')));

        this.server = new http.Server(app)
        this.io = new socketIO.Server(this.server, {
            cors: {
                origin: "http://localhost:8100"
            }
        });

        this.io.on('connection', (socket: socketIO.Socket) => {
            // Log whenever a user connects
            console.log('a user connected : ' + socket.id);
            // Log whenever a client send a "talktome" event, for testing good reception and connection
            socket.on('talktome', async (data: { message: string }) => {
                console.log('Message reçu du client :', data.message);
                try {
                    // Answer to client for testing good reception and connection
                    this.io.emit("hi", "coucou wesh");
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('createSondageAction', async (data: createSondageAction) => {
                try {
                    const allSondagesCount = await db['Sondage'].count();
                    // Count every finished sondages
                    const alreadyVotedSondageCount = await db['Sondage'].findAll({
                        where: {
                            date_expiration: {
                                [Op.and]: [
                                    { [Op.ne]: null }, 
                                    { [Op.lte]: new Date() } 
                                ]
                            },
                        }
                    });
                    //Check if all sondages are already finished
                    const canCreateSondage = allSondagesCount === alreadyVotedSondageCount.length ?? false;
                    const noDataInSondage = !await db['Sondage'].findOne();
                    if (canCreateSondage || noDataInSondage) {
                        let createdSondage = await db['Sondage'].create({
                            id_user: data.id_user,
                            date_creation: data.date_creation,
                            day_vote_time: data.day_vote_time,
                            hour_vote_time: data.hour_vote_time,
                            title: data.title,
                            description: data.description,
                            associated_picture: data.associated_picture,
                            background_color: data.background_color,
                        });
                        await this.updateDateExpirationSondage(createdSondage.dataValues.id, data.date_creation, data.day_vote_time, data.hour_vote_time, data.title);
                        this.io.emit("canCreateSondageAnswer", true);
                    }
                    else {
                        this.io.emit("canCreateSondageAnswer", false);
                        return;
                    }

                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('getSondagesAction', async () => {
                try {
                    const sondagesWithUserInfo = await db.sequelize.query(
                        `SELECT "Sondages".*, "Users".pseudo, "Users".profile_picture
                        FROM "Sondages"
                        INNER JOIN "Users" ON "Sondages".id_user = "Users".id`,
                        { type: seq.QueryTypes.SELECT }
                    );
                    this.io.emit("getSondagesAnswer", sondagesWithUserInfo);
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('createVoteAction', async (data: createVoteAction) => {
                try {
                    await db['Vote'].create({
                        id_user: data.id_user,
                        id_sondage: data.id_sondage,
                        day: data.day,
                        hour: data.hour,
                    });
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('createUserAction', async (data: createUserAction) => {
                try {
                    const salt = await this.generateSalt();
                    const hashedPassword = await this.hashPassword(data.password, salt);
                    const allUserPseudo = await db['User'].findAll({
                        attributes: ['pseudo']
                    });
                    const userPseudosArray = allUserPseudo.map(user => user.dataValues.pseudo);
                    if (userPseudosArray.includes(data.pseudo)) {
                        this.io.emit("createUserAnswer", false);
                        return;
                    }
                    await db['User'].create({
                        pseudo: data.pseudo,
                        password_hash: hashedPassword,
                        profile_picture: data.profilepicture,
                    });
                    this.io.emit("createUserAnswer", true);
                } catch (error) {
                    this.io.emit("createUserAnswer", false);
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('checkValidUserAction', async (data: checkValidUserAction) => {
                try {
                    const isValidUserInfos = await this.authenticateUser(data.pseudo, data.password);
                    if (isValidUserInfos['isValidLogin']) {
                        this.io.emit("validUserAnswer", { isValidLogin: true, userId: isValidUserInfos['userId'] });
                    } else {
                        this.io.emit("validUserAnswer", { isValidLogin: false, userId: isValidUserInfos['userId'] });
                    }
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('disconnect', function () {
                console.log('socket disconnected : ' + socket.id)
            });
        })
    }

    public Start() {
        this.server.listen(this.port)
        console.log(`Server listening on port ${this.port}.`)
        console.log(`Socket.IO version: ${this.io}`);
    }

    public async generateSalt() {
        return await bcrypt.genSalt(10);
    }

    public async hashPassword(password: string, salt: string) {
        return await bcrypt.hash(password, salt);
    }

    public validatePassword(password: string, passwordHash: string) {
        return bcrypt.compare(password, passwordHash);
    }

    public async authenticateUser(pseudoInput: string, password: string): Promise<Object> {
        const user = await db['User'].findOne({ where: { pseudo: pseudoInput } });
        if (user === null || !(await this.validatePassword(password, user.password_hash))) {
            return {isValidLogin: false};
        }
        return {isValidLogin: true, userId: user.dataValues.id};
    }

    public createDateFromDayAndTime(day: string, time: string): Date | null {
        const days: string[] = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
        const today = new Date();
        const dayIndex = days.indexOf(day.toLowerCase());
        const dayDiff = dayIndex >= today.getDay() ? dayIndex - today.getDay() : 7 - (today.getDay() - dayIndex);
        const newDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + dayDiff);
        const separateMinuteHour = time.split(":").map((a) => parseInt(a));
        newDate.setHours(separateMinuteHour[0], separateMinuteHour[1]);
        return newDate.getTime() > today.getTime() ? newDate : null;
    }

    public async updateDateExpirationSondage(idCreatedSondage: number, dateCreationSondage: Date, dayVoteTime: number, hourVoteTime: number, sondateTitle: string) {
        let timeOut = new Date(dateCreationSondage);
        timeOut.setMinutes(timeOut.getMinutes() + dayVoteTime + hourVoteTime);
        let refreshIntervalId = setInterval(async () => {
            if (new Date() >= timeOut) {
                const allVotesOfSondage = await db['Vote'].findAll({
                    where: { id_sondage: idCreatedSondage },
                    attributes: [
                        'day',
                        'hour',
                        [fn('COUNT', col('*')), 'count']
                    ],
                    //expected example, day == 'lundi' and hour == '12:00'
                    group: ['day', 'hour'],
                    order: [['count', 'DESC']],
                    limit: 1
                });
            
                if (allVotesOfSondage.length > 0) {
                    await db['Sondage'].update(
                        { date_expiration: this.createDateFromDayAndTime(allVotesOfSondage[0].dataValues.day, allVotesOfSondage[0].dataValues.hour) },
                        {
                            where: {
                                id: idCreatedSondage,
                            },
                        },
                    );
                    clearInterval(refreshIntervalId);
                    return;
                }
                else {
                    await db['Sondage'].update(
                        { date_expiration: new Date()},
                        {
                            where: {
                                id: idCreatedSondage,
                            },
                        },
                    );
                    this.io.emit('noVotesAnswer', "Aucun vote sur le sondage " + sondateTitle + " numéro " + idCreatedSondage  + ". Sondage terminé");
                    clearInterval(refreshIntervalId);
                    return;
                }
            }
        }, 1);
    }
}

new App(port).Start();



