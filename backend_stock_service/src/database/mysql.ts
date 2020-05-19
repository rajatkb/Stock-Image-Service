import { Database } from "./database";
import { Sequelize } from 'sequelize'
import mysql from 'mysql2'
import { UndefinedEnvironmentVariable } from "../errors/server";
import { injectable } from "inversify";
import { hostname } from "os";
import { DatabaseConnectionError } from "../errors/database";
import { Logger } from "../utility/logger";

@injectable()
export class MYSQLDatabase extends Database<Sequelize>{
    protected readonly dbName:string = process.env.MYSQL_DB_NAME !== undefined ? process.env.MYSQL_DB_NAME : "image_db"; 
    private readonly sequelizeP:Promise<Sequelize>;
    private readonly status:any;

    private logger = new Logger(this.constructor.name).getLogger()

    constructor(){
        super()

        const username = process.env.MYSQL_DB_USERNAME
        const password = process.env.MYSQL_DB_PASSWORD
        const host = process.env.MYSQL_DB_HOST
        const port = process.env.MYSQL_DB_PORT
        if(username === undefined)
            throw new UndefinedEnvironmentVariable("MYSQL_DB_USERNAME not defined")
        if(password === undefined)
            throw new UndefinedEnvironmentVariable("MYSQL_DB_PASSWORD not defined")
        if(port === undefined) 
            throw new UndefinedEnvironmentVariable("MYSQL_DB_PORT not defined")   
        if(Number.parseInt(port) === NaN)
            throw new UndefinedEnvironmentVariable("MYSQL_DB_PORT not a valid number")
        if(host === undefined)
            throw new UndefinedEnvironmentVariable("MYSQL_DB_HOST not defined")

        this.sequelizeP = new Promise<Sequelize>( ( resolve , reject) => {
            let conn = mysql.createConnection({
                host:host,
                port:Number.parseInt(port),
                user:username,
                password:password
            })
            conn.query(`create database if not exists ${this.dbName}`  , (err , results) => {
                if(!err){
                    const seq = new Sequelize( {
                        dialect: 'mysql',
                        host: `${host}`,
                        port: Number.parseInt(port),
                        username: username,
                        password: password,
                        database:this.dbName,
                        logging: (msg ) => this.logger.debug(msg) 
                    })
                    conn.end()
                    this.logger.info(`started database connection !!`)
                    resolve(seq)
                }
                else{
                    reject(new DatabaseConnectionError(`Failed to connect to database error :${err}`))
                }
            } )
        })
        
    }   
    
    public  async getConnection(){
        let seq = await this.sequelizeP
        return Promise.resolve(seq)
    }
    public  async close():Promise<void>{
        this.logger.info("Closing database connection !!!");
        (await this.sequelizeP).close()
    }
}