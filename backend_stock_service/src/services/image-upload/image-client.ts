import { inject, injectable } from "inversify";
import { UndefinedEnvironmentVariable, ImageUploadError } from "../../errors/server";
import path from 'path'
import { File } from '../../utility/File'
import { ImageSource } from "./image";
import {Subject, Observable, combineLatest, forkJoin, Subscriber, interval} from 'rxjs'
import WebSocket from 'ws'
import { Logger } from "../../utility/logger";
import {  share , retryWhen , delay, last, tap, take, shareReplay, retry, catchError, map, mergeMap, switchMap } from "rxjs/operators";
import config from 'config'



@injectable()
export class ImageUploadClient extends ImageSource {
    
    private readonly serverEventSource$ = new Subject<Buffer>()
    private readonly serverEventSink$ = new Subject<WebSocket.Data>()
    private readonly server$:Observable<WebSocket>; 

    private sendData2Server = (data:Buffer) => {
        this.serverEventSource$.next(data)
        this.serverEventSource$.next(undefined)
    }

    private logger = new Logger(this.constructor.name).getLogger()

    private requestTimeout:number = 1000* Number.parseInt(config.get("ImageUploadClient.requestTimeout"))

    private setupSocket = (subscribe:Subscriber<WebSocket>) => {
        let websocket:WebSocket 
        this.logger.warn(`trying to connect to server`)
        websocket = new WebSocket(`ws://${this.host}:${this.port}`)
            
        websocket.on("error" , (err) => {
            this.logger.error(`could not connect to image processing serevr error :${err}`)
            websocket.terminate()
            websocket.close()
        })

        websocket.on("close" , (err) => {
            this.logger.error(`connection lost to image processing serevr error :${err}`)
            websocket.terminate()
            websocket.close()
        })

        websocket.on("open" , () => {
            this.logger.info(`Connected with ImageTransormServer made at port : ${this.port}`)
            subscribe.next(websocket)
        })

        websocket.on("message" , (data) => {
            this.serverEventSink$.next(data)
        })

        return websocket

    }


    private getSocketObs = () => new Observable<WebSocket>((subscribe) => {
        let websocket = this.setupSocket(subscribe)
        const interval = setInterval(() => {
           if(websocket.readyState !== websocket.OPEN)
                websocket = this.setupSocket(subscribe) 
        } , 10000)          
    })

    constructor(){
        

        super()
        
        this.logger.info(`Started Image Upload Client`)
        this.logger.debug(`trying to connected at ws://${this.host}:${this.port}`)

        
        this.server$ = combineLatest(
                            Array.from(
                                Array(this.tfservercount),
                                () => this.getSocketObs()
                            )).pipe(
                                switchMap( v => {
                                    return interval(500).pipe(
                                        map(num => {
                                            (v[num%v.length] as any).id = num%v.length
                                            return v[num%v.length]
                                        })
                                    )
                                })
                            )
        
        
        this.serverEventSource$.next(undefined)


        const sub = combineLatest([this.serverEventSource$ , this.server$]).subscribe(([data , socket]) => {            
            if(data !== undefined)
                socket.send(data , (err) => {
                    if(err !== undefined){
                        this.logger.error(`failed to send data error: ${err}`)
                    }
                    this.logger.info(`Send data using Socket connection number : ${(socket as any).id}`)
                })
        })

        

       
        

            
    }

  

    public async createFile(id:string , file:File){
        this.logger.debug(`recieved createFile request for id :${id} and file :${file.filename}`)
        
        const data = File.asMessage(id , file.buffer)
        
        return new Promise((resolve , reject) => {

            const sub = this.serverEventSink$.subscribe( data => {
                if(data == id){
                    this.logger.debug(`file uploaded successfully id : ${id}`)
                    sub.unsubscribe()
                    resolve(data)
                }
            })
            this.sendData2Server(data) // to stop restarts sending in duplicate data
            setTimeout(() => {
                sub.unsubscribe()
                reject(new ImageUploadError(`took too much time for upload, above ${this.requestTimeout/1000}s`))
            },this.requestTimeout);
        })
    }
}