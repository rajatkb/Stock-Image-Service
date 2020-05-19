import { inject, injectable } from "inversify";
import { UndefinedEnvironmentVariable, ImageUploadError } from "../../errors/server";
import path from 'path'
import { File } from '../../utility/File'
import { ImageSource } from "./image";
import {Subject, Observable, combineLatest, forkJoin} from 'rxjs'
import WebSocket from 'ws'
import { Logger } from "../../utility/logger";
import {  share , retryWhen , delay, last, tap, take, shareReplay } from "rxjs/operators";
import config from 'config'



@injectable()
export class ImageUploadClient extends ImageSource {
    
    private readonly serverEventSource$ = new Subject<Buffer>()
    private readonly serverEventSink$ = new Subject<WebSocket.Data>()
    private readonly server$:Observable<WebSocket>; 

    private logger = new Logger(this.constructor.name).getLogger()

    private requestTimeout:number = 1000* Number.parseInt(config.get("ImageUploadClient.requestTimeout"))

    

    constructor(){
        

        super()
        
        this.logger.info(`Started Image Upload Client`)
        this.logger.debug(`trying to connected at ws://${this.host}:${this.port}`)

        this.server$ = new Observable<WebSocket>((subscribe) => {
                
                this.logger.warn(`trying to connect to server`)
                let websocket = new WebSocket(`ws://${this.host}:${this.port}`)
                websocket.on("error" , (err) => {
                    this.logger.error(`could not connect to image processing serevr error :${err}`)
                    subscribe.error(err)
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

            }).pipe(
                retryWhen(error => error.pipe(delay(1000))),
            )
        

        // initial server connection
        const sub = this.server$.subscribe((socket) => {
            this.logger.info(`Established socket connection !!`)
        })
        
        

        // setting up request handler
        this.serverEventSource$.subscribe((data) => {
            const sub = this.server$.subscribe((socket) =>{
                if(socket.readyState == socket.OPEN)
                    socket.send(data, (err) => {
                        if(err !== undefined){
                            this.logger.error(`failed to send data error: ${err}`)
                        }
                        sub.unsubscribe()
                    })
                else
                    sub.unsubscribe()
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
            this.serverEventSource$.next(data)

            setTimeout(() => {
                sub.unsubscribe()
                reject(new ImageUploadError(`took too much time for upload, above ${this.requestTimeout/1000}s`))
            },this.requestTimeout);
        })
    }
}