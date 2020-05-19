export class File{
    public size:number;
    constructor(public filename:string , 
                public encoding:string , 
                public mimetype:string, 
                public buffer:Buffer){
                    this.size = this.buffer.length
                }
    static asMessage(id:string , fileBuffer:Buffer){
        const idb = Buffer.from(id)
        if(idb.length !== 36)
            throw new Error(`BUffer cannot be constructed , id must be 36 char or 256 bit uuid`)
        return Buffer.concat([idb , fileBuffer]) 
    }

    static getIdandBuffer(buffer: Buffer):[string , Buffer]{
        const id = buffer.slice(0,36)
        const img = buffer.slice(36 , buffer.length)
        return [id.toString('utf8') , img ]
    }
}