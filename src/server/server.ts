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

interface getUserAction {
    id: number,
};

interface createSondageAction {
    id_user: number,
    date_creation: Date,
    day_vote_time: string,
    hour_vote_time: number,
    associated_picture: Blob,
    background_color: string,
};

interface getCurrentSondageAction {
    table: string,
    action: string,
};

interface createVoteAction {
    id_user: number,
    id_sondage: number,
    day: string,
    hour: string,
};

interface getVotesHourSondage {
    id_sondage: number,
};

interface getVotesDaySondage {
    id_sondage: number,
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
            // Log whenever a client send a "talktome" event
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
                    const existingRow = await db['Sondage'].findOne({
                        where: {
                            myField: {
                                [Op.or]: [
                                    { [Op.ne]: null }, // Vérifie si le champ n'est pas null
                                    { [Op.lte]: new Date() } // Vérifie si le champ est inférieur ou égal à la date actuelle
                                ]
                            }
                        }
                    });

                    if (existingRow) {
                        let createdSondage = await db['Sondage'].create({
                            id_user: data.id_user,
                            date_creation: data.date_creation,
                            day_vote_time: data.day_vote_time,
                            hour_vote_time: data.hour_vote_time,
                            associated_picture: data.associated_picture,
                            background_color: data.background_color,
                        });
                        //this.updateDateExpirationSondage(createdSondage.dataValues.id, data.date_creation, data.day_vote_time, data.hour_vote_time);
                    }
                    else return;

                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('getSondagesAction', async () => {
                try {
                    const sondagesWithUserInfo = await db.sequelize.query(
                        `SELECT "Sondages".*, "Users".id AS user_id, "Users".pseudo, "Users".profile_picture
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
                    let createdUser = await db['User'].create({
                        pseudo: data.pseudo,
                        password_hash: hashedPassword,
                        profile_picture: data.profilepicture,
                    });
                    console.log(createdUser.dataValues.id);
                } catch (error) {
                    console.error('Unable to connect to the database:', error);
                }
            });

            socket.on('checkValidUserAction', async (data: checkValidUserAction) => {
                try {
                    const isValidUser = await this.authenticateUser(data.pseudo, data.password);
                    if (isValidUser) {
                        this.io.emit("validUserAnswer", true);
                    } else {
                        this.io.emit("validUserAnswer", false);
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

    public async authenticateUser(pseudoInput: string, password: string): Promise<boolean> {
        const user = await db['User'].findOne({ where: { pseudo: pseudoInput } });
        if (user === null || !(await this.validatePassword(password, user.password_hash))) {
            return false;
        }
        return true;
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

    public updateDateExpirationSondage(idCreatedSondage: number, dateCreationSondage: Date, dayVoteTime: number, hourVoteTime: number) {
        let timeOut = new Date(dateCreationSondage);
        timeOut.setMinutes(timeOut.getMinutes() + dayVoteTime + hourVoteTime);
        setInterval(async () => {
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

                await db['User'].update(
                    { date_expiration: this.createDateFromDayAndTime(allVotesOfSondage.day, allVotesOfSondage.hour) },
                    {
                        where: {
                            id: idCreatedSondage,
                        },
                    },
                );
            }
        }, 1);
    }
}

new App(port).Start();



