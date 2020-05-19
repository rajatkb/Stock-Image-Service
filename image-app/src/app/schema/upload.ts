export interface UploadData{
    file:File,
    name:string,
    description:string,
    fileString:string
}

export interface UploadStatus{
    percentage:number,
    uploadData:UploadData,
    index:number,
}