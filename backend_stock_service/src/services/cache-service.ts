import { injectable } from "inversify";
import NodeCache from 'node-cache'
import config from 'config'

@injectable()
export class CacheService<T>{
    private stdttl = Number.parseInt(config.get("CacheService.ttl"))
    private nodecache = new NodeCache()
    
    public set(key:string , value:T, ttl:number){
        this.nodecache.set(key , value  , ttl)
    }

    public get(key:string):T{
        return this.nodecache.get(key) as T
    }

    public invalidateAll():void{
        this.nodecache.flushAll()
    }
}