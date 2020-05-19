export interface FileS{
    id:string,
    name:string,
    description:string,
    createdAt:Date,
    location:string, 
    location240:string,
    location720:string,
    HashTags:HashTagS[]
}

export interface HashTagS {
    tag:string,
}