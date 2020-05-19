import { injectable } from "inversify";
import { ImageSource } from "./image";
import { Logger } from "../../utility/logger";
import ws from 'ws'
import { Observable, fromEvent } from 'rxjs'
import { share , map, mergeMap } from 'rxjs/operators'
import { File } from "../../utility/File";
import { ImageTransformPipeline } from "./image-tf-pipeline";

type socketData = { socket:ws , data: ws.Data , client:string|undefined}
type clientSocket = {socket:ws , client:string|undefined}

class SocketManager{
    constructor(private csocket:clientSocket){}
    getMessageStream = () => {
        return new Observable<socketData>((subscriber) => {
            
            this.csocket.socket.on("error" , (err) => {
                subscriber.error(err)
            })
            this.csocket.socket.on("close", (reason) => {
                
                this.csocket.socket.close()
                subscriber.complete()
                
            })
            this.csocket.socket.on("message" , (data) => {
                subscriber.next({
                    socket:this.csocket.socket,
                    client: this.csocket.client,
                    data:data
                })
            })
        })
    }
}


@injectable()
export class ImageTransformServer extends ImageSource{

    private readonly logger = new Logger('Image-Transform-Server').getLogger()

    private readonly server:ws.Server;

    private readonly socketServer$:Observable<socketData>;


    constructor(
        private imagePipe:ImageTransformPipeline
    ){
        super()

        this.logger.info(`Started Image-Transform-Server  process id :${process.pid} at port: ${this.port}`)
        this.server = new ws.Server({
            port:this.port,
            perMessageDeflate: {
                zlibDeflateOptions: {
                  // See zlib defaults.
                  chunkSize: 1024,
                  memLevel: 7,
                  level: 3
                },
                zlibInflateOptions: {
                  chunkSize: 10 * 1024
                },
                // Other options settable:
                clientNoContextTakeover: true, // Defaults to negotiated value.
                serverNoContextTakeover: true, // Defaults to negotiated value.
                serverMaxWindowBits: 10, // Defaults to negotiated value.
                // Below options specified as default values.
                concurrencyLimit: 10, // Limits zlib concurrency for perf.
                threshold: 1024 // Size (in bytes) below which messages
                // should not be compressed.
              }
        })

        this.server.on("listening", () => {
            this.logger.info(`Image Transformation Server listening on port :${this.port} pid: ${process.pid}`)
        })

        this.socketServer$ = new Observable<clientSocket>((subscriber) => {
            
            this.server.on("connection" ,  (socket , req) => {
                this.logger.info(`new client connected from ip :${req.socket.remoteAddress}  on process : ${process.pid}`)
                subscriber.next({
                    socket:socket,
                    client: req.socket.remoteAddress
                })
            })

            this.server.on("close" , () => {
                this.logger.info(`closing socket observer on process : ${process.pid}`)
                subscriber.complete()
            })

        }).pipe(
            share(),
            mergeMap( (socket , index) => {
                return new SocketManager(socket).getMessageStream()
            }),    
        )
        this.socketServer$.subscribe( (val:socketData) => {
            this.logger.debug(`Recieved data from client :${val.client} in process pid :${process.pid}`)
            const [id , file ] = File.getIdandBuffer(val.data as Buffer)
            
            this.imagePipe.saveFile(id , file)
            .then( status => {
                val.socket.send(id , (err) => {
                    if(err !== undefined)
                        this.logger.error(`failed to send data basck to client : ${val.client}`)
                })
            })
            .catch(err => {
                this.logger.error(`Failed to process image error: ${err}`)
            })
            
        })
    }
}

    

