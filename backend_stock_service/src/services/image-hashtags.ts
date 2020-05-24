import { injectable } from "inversify";


@injectable()
export class ImageHashTags{

    private readonly hashtags =  [  "Interiors", 
                                    "Wallpapers", 
                                    "Experimental", 
                                    "People", 
                                    "Textures", 
                                    "Food", 
                                    "Spirituality", 
                                    "Wellness", 
                                    "Nature", 
                                    "Events", 
                                    "Culture", 
                                    "Architecture", 
                                    "Technology", 
                                    "Athletics", 
                                    "Work", 
                                    "History", 
                                    "Film", 
                                    "Animals", 
                                    "Travel", 
                                    "Fashion"
                                ]

    shuffle(a:string[]) {
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
    async getHashTags():Promise<string[]>{
        const count = Math.floor(Math.random() * (5))
        const a = this.shuffle(this.hashtags)
        return new Promise((resolve , reject) => {
            const time = setTimeout(() => {
                resolve(a.slice(0 , count))
                clearTimeout(time)
            }, 5000)
        }) 
    }
}