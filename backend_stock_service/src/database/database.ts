import { injectable } from "inversify";

/**
 * Database interface to be used by other objects
 * The usage of it is dependent on the model interacting with it.
 * 
 * @export
 * @abstract
 * @class Database
 * @template T
 */
@injectable()
export abstract class Database<T>{
    protected readonly abstract dbName:string;
    public abstract async getConnection():Promise<T>;
    public abstract async close():Promise<void>;
}