import { Component, OnInit } from '@angular/core';
import { UploadData, UploadStatus } from '../schema/upload';
import { UploadService } from '../services/upload.service';
import { reduce, map } from 'rxjs/operators';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss' , ]
})
export class UploadComponent implements OnInit {

  private imageExtension = ['jpg' , 'png' , 'jpeg' , 'gif' , 'webp']
  
  private readonly defaultmessage = "Note: Accept Image size with smaller edge >= 500px, rest will be dropped"
  uploadmessage:string = this.defaultmessage

  uploadSuccess:boolean = false
  uploadFail:boolean = false

  uploads:UploadData[] = []

  uploadStateText:string= "Select File";

  progressBarPercentage:number = 0

  constructor(
    private readonly uploadService:UploadService,
    ) {
      
   }


  ngOnInit(): void {
    
  }

  private filterFiles = async function*(files:FileList){
    
    for(let i = 0 ; i < files.length ; i++){
        const name = files.item(i).name.split('.')
        if(name.length == 2 && this.imageExtension.indexOf(name[1]) > -1){
          const imageString = this.convertFile2Url(files.item(i))
          const image = new Image()
          image.src = imageString
          
          const result:UploadData | undefined = await new Promise<UploadData>((resolve , reject) => {
            image.onload = (ev) => {
              let shorterEdge = Math.min(image.height, image.width)
              if(shorterEdge < 500){
                this.failUploadMessage('Some files are dropped for lower resolution !!')
                resolve(undefined)
              }else{
                resolve({
                  file: files.item(i),
                  name: name[0],
                  description:"",
                  fileString: imageString
                })
              }
            }    
          })
          yield result
        }
    }
  }

  async filesButton(event){
    const files = event.target.files
    for await(const file of this.filterFiles(files))
      if(file !== undefined)
        this.uploads.push(file)
    this.uploadStateText = "Files Selected!!"
    event.target.value= ""
  }

  uploadClick(){    
    if(this.uploads.length == 0)
      return;
    if(!this.verifyNames(this.uploads)){
      this.failUploadMessage("some names are empty , cannot upload !!")
      return;
    }
    this.uploadService.uploadFiles(this.uploads)
    .pipe(
      map( (value) => {
        this.progressBarPercentage += value.percentage
        return value
      }),
      reduce( (acc:UploadData[] , value:UploadStatus) => {
        if(value.uploadData !== undefined)
          acc.push( value.uploadData )
        return acc
      } ,  [])
    )
    .subscribe( this.successUpload )
  }

  removePhoto(i:number){
    this.uploads.splice(i,1)
    if(this.uploads.length == 0)
      this.uploadStateText = "Select File"
  }

  private verifyNames(uploads:UploadData[]){
    return uploads.reduce( (pre:boolean , current:UploadData) => {
      return pre && current.name.length !== 0
    } , true)
  }

  private successUpload = (value:UploadData[]) => {
    if(value.length == 0){
      this.uploads = value
      this.uploadStateText = "Select File"
      this.successUploadMessage("Uploaded Successfully")
    }
    else{
      this.failUploadMessage("Failed to upload few files")
      this.uploads = value
    }
  }

  private convertFile2Url(file:File){
    return URL.createObjectURL(file)
  }



  private successUploadMessage(message:string){
    this.uploadmessage = message
    this.uploadSuccess = true
    let interval = setInterval( ()=> {
      this.uploadmessage = this.defaultmessage
      this.uploadSuccess = false
      this.progressBarPercentage = 0
      clearInterval(interval)
    } , 3000)
  }

  private failUploadMessage(message:string){
    this.uploadmessage = message
    this.uploadFail = true
    let interval = setInterval( ()=> {
      this.uploadmessage = this.defaultmessage
      this.uploadFail = false
      this.progressBarPercentage = 0
      clearInterval(interval)
    } , 3000)
  }

}
