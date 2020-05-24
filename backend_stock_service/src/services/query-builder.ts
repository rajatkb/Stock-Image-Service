import { injectable } from "inversify";
import { Query } from '../models/file'
import { IllegalDateFormat } from "../errors/query";
import { Logger } from "../utility/logger";

import config from 'config'

@injectable()
export class QueryBuilder {

    
    private tagPat:RegExp = /(?:tags\:((?:[a-z0-9A-Z_-]+)(?:\,[a-z0-9A-Z_-]+)*))\s?/;
    private datePat:RegExp = /date\:(?:(?:([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{4}))|(?:([0-9]{4}))|(?:([0-9]{1,2})\-([0-9]{4})))|date\:(?:(?:([0-9]{1,2}|\*)\-([0-9]{1,2}|\*)\-([0-9]{4}|\*)))\s?/;
    private datePatRangeFrom:RegExp = /from\:(?:([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{4}))\s?/;
    private datePatRangeTo:RegExp = /to\:(?:([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{4}))\s?/
    private descPat:RegExp = /desc\:(?:(?:\"(.*?)\")|(?:([a-z0-9A-Z_-]+)))\s/
    

    private logger = new Logger(this.constructor.name).getLogger()
    


    private timeout = Number.parseInt(config.get('QueryBuilder.timeout')) * 1000

    constructor(){
        this.logger.info("Query Builder started !!")
    }

    private parseTags(query:string):string[]{
        const tagr =this.tagPat.exec(query)
        if(tagr !== null)
            return tagr[1].split(',')
        else
            return []
    }

    private getInitDate = (str:string) => {
        let begDate = new Date(str)
        let dat = begDate.getDate()
        begDate.setHours(0, 0 , 0 , 0)
        return begDate
    }
    
    
    private parseFromTo(query:string):[Date|undefined , Date|undefined] | undefined {
        
        const datePatFromRes = this.datePatRangeFrom.exec(query)
        const datePatToRes = this.datePatRangeTo.exec(query)
        if(datePatFromRes == null && datePatToRes == null)
            return undefined
        
        const arr:[Date|undefined , Date|undefined] = [undefined , undefined]
        if(datePatFromRes !== null)
        if(datePatFromRes[1] !== undefined && datePatFromRes[2] !== undefined && datePatFromRes[3] !== undefined ){
            // single date mode date:24-12-2020
            const day = datePatFromRes[1]
            const month = datePatFromRes[2]
            const year = datePatFromRes[3]
            let begDate = this.getInitDate(`${month}/${day}/${year}`)
            
            if(begDate.toString() !== 'Invalid Date')
                arr[0] = begDate
        }
        if(datePatToRes !== null)
        if(datePatToRes[1] !== undefined && datePatToRes[2] !== undefined && datePatToRes[3] !== undefined ){
            // single date mode date:24-12-2020
            const day = datePatToRes[1]
            const month = datePatToRes[2]
            const year = datePatToRes[3]
            let endDate = this.getInitDate(`${month}/${day}/${year}`)
            if(endDate.toString() !== 'Invalid Date')
                arr[1] = endDate
        }
        return arr
    }

    private parseDate(query:string):[Date|undefined, Date|undefined]|[number|undefined, number|undefined , number|undefined]|undefined{
        let datePatRes = this.datePat.exec(query)
        
        if(datePatRes === null)
            return undefined
        try{
            if(datePatRes[1] !== undefined && datePatRes[2] !== undefined && datePatRes[3] !== undefined ){
                // single date mode date:24-12-2020
                const day = datePatRes[1]
                const month = datePatRes[2]
                const year = datePatRes[3]
                let begDate = this.getInitDate(`${month}/${day}/${year}`)
                if(begDate.toString() == 'Invalid Date')
                    throw new IllegalDateFormat(`Bad date format give (d , m , yyyy) : ${`${day}/${month}/${year}`}`)
                let endDate = new Date(begDate.getTime() + 24*60*60*1000)
                console.log([begDate , endDate])
                return [begDate , endDate]
            }else if(datePatRes[4] !== undefined){
                // single year mode date:2016
                const dateStr = datePatRes[4]
                const dateNum = Number.parseInt(dateStr)
                
                if(isNaN(dateNum))
                    throw new IllegalDateFormat(`Bad date format given (yyyy):${dateStr}`)
                let begDate = this.getInitDate(`${dateNum}`)
                
                if(begDate.toString() == 'Invalid Date')
                    throw new IllegalDateFormat(`Bad date format given (yyyy):${dateStr}`)
                let endDate = this.getInitDate(`${dateNum+1}`)
                return [begDate , endDate]
            }else if (datePatRes[5] !== undefined && datePatRes[6] !== undefined  ){
                // month and date date:03-2018
                const month = Number.parseInt(datePatRes[5])
                const year = Number.parseInt(datePatRes[6])
                if(!isNaN(month) && !isNaN(year))
                    return [ undefined , month , year]
                else   
                    throw new IllegalDateFormat(`Bad Date format give (m-yyyy): ${datePatRes[4]}-${datePatRes[5]}`)
            }else if(datePatRes[7] !== undefined && datePatRes[8] !== undefined && datePatRes[9] !== undefined ){
                
                const day = Number.parseInt(datePatRes[7])
                const month = Number.parseInt(datePatRes[8])
                const year = Number.parseInt(datePatRes[9])
                const arr:[number| undefined , number |undefined , number | undefined] = [undefined , undefined , undefined]
                if(!isNaN(day))
                    arr[0] = day
                if(!isNaN(month))
                    arr[1] = month
                if(!isNaN(year))
                    arr[2] = year
                
                return arr
            }

        }catch(err){
            this.logger.error(err)
            return undefined
        }
    }   


    private parseDescription(query:string):string | undefined{

        const res = this.descPat.exec(query)
        if(res !== null){
            if(res[1] !== undefined ){
                if(res[1].length !== 0)
                    return res[1]
            }
            else(res[2] !== undefined)
            {
                if(res[2].length !== 0)
                    return res[2]
            }
        }       
    }

    public parseQuery(query:string){

        if(query.length > 10000){
            this.logger.warn(`Extremely long query has been send for parsing !!`)
            return {}
        }
            
        query = " "+query+" "
        this.logger.debug(`query parser called`)
        let response:Query = {};
            
            
        response.tags = this.parseTags(query)
        const date = this.parseDate(query)
        response.dateTime = date == undefined ? this.parseFromTo(query) : date 
        response.desc = this.parseDescription(query)

        return response
    }

    public parseHashTags = (desc:string) => {
        const hashTagPat:RegExp = /\#([a-z0-9A-Z_-]+)/g
        const data:string[] = [];
        for(const d of desc.matchAll(hashTagPat))
            data.push(d[1])
        return data
    }


}