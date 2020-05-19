import { injectable } from "inversify";
import sharp from 'sharp'
import { ImageSource } from "./image";
import os from 'os'
import fs from 'fs'
import path from 'path'

@injectable()
export class ImageTransformPipeline extends ImageSource {
    
    constructor(){
        super()
        if(!fs.existsSync(this.getPrimaryLocation())){
            fs.mkdirSync(this.getPrimaryLocation())
            fs.mkdirSync(this.get720Location())
            fs.mkdirSync(this.get240Location())
        }

    }

    resizeTransorm = (height:number , width:number):number[][] => {
        if(height >= width)
            return [[ Math.floor(height*240/width) , 240 ] , [ Math.floor(720*height/width) , 720 ] ]
        else
            return [[240 , Math.floor(width*240/height )] , [ 720 , Math.floor(width*720/height) ] ]
    }

   
    async saveFile(id:string , file:Buffer){
        const image = sharp(file)
        return image.metadata().then((val) => {
            if(val.height === undefined || val.width === undefined)
                return Promise.reject(new Error(`Image dimension not available , bad encoded image`))
            const [dim240 , dim720] = this.resizeTransorm(val.height , val.width)
            return [    image.clone().resize(dim240[1] , dim240[0] ,).png(), 
                        image.clone().resize(dim720[1] , dim720[0]).png(),
                        image
                    ]   
        }).then( images => {
            const file240name = path.join(this.get240Location() , id+".png")
            const file720name = path.join(this.get720Location() , id+".png")
            const filename = path.join(this.getPrimaryLocation() , id +".png")
            
            return Promise.all(
            [
                images[0].toFile(file240name),
                images[1].toFile(file720name),
                images[2].toFile(filename)
            ])
        })
        
    }

    
}