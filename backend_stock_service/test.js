const rxjs = require('rxjs')
const operators = require('rxjs/operators')
const sharp = require('sharp')
const fs = require('fs')
const WebSocket = require('ws')
const NodeCache = require('node-cache')
const jwt = require('jsonwebtoken')

const private_key = fs.readFileSync('keys')
var a = jwt.sign({user:"admin" , pass:"password"} ,private_key , {
    expiresIn:"2 days",
    algorithm:"RS256"
})

console.log(a)

const public_key = fs.readFileSync('keys.pem')
var b = jwt.verify(a , public_key)

console.log(b)
// const nc = new NodeCache()

// nc.set("hello" , { val: "hello"} , 1)
// setTimeout( () => {
//     console.log(nc.get("hello"))
// } , 900)



// resizeTransorm = (height , width) => {
//     if(height > width)
//         return [[ Math.floor(height*240/width) , 240 ] , [ Math.floor(720*height/width) , 720 ] ]
//     if(width > height)
//         return [[240 , Math.floor(height*240/width )] , [ 720 , Math.floor(height*720/width) ] ]
// }



// const file = fs.readFileSync('banner.jpg')


// const image = sharp(file)


// const obj = [Buffer.from("some"),image.options.input.buffer]
// const buffer = new ArrayBuffer( obj[0].length+obj[1].length)

// // Buffer.from()
// console.log(obj)
// console.log(Buffer.from(obj))



// const pipe = image.metadata().then((val) => {
//     const [dim240 , dim720] = resizeTransorm(val.height , val.width)

//     return [image.resize(dim240[0] , dim240[1]).png(), image.resize(dim720[0] , dim720[1]).png()]   
// })

// pipe.then( (val) => {
//     return val[0].withMetadata().toFile('240.png')
// }).then( data => {
//     console.log(data)
// } ).catch(err => {
//     console.log(`240 px erro ${err}`)
// })

// pipe.then( (val) => {
//     return val[1].withMetadata().toFile('720.png')
// }).then( data => {
//     console.log(data)
// } ).catch(err => {
//     console.log(`720 px erro ${err}`)
// })

// class SocketHandler{
//     constructor(i){
//         this.requester = i
//     }   
//     createEvents = () => {
//         console.log(` Created listener for socket ${this.requester}`)
//         return rxjs.interval(1000).pipe(operators.map( (inter)=> {
//             return {
//                 inter: `socket ${this.requester}  event ${inter}`
//             }
//         } ))
//     }
// }


// const obs = new rxjs.Observable((subscriber) => {
//     console.log("Socket listener started")
//     let i = 0
//     const interval = setInterval(() => {
//         subscriber.next(new SocketHandler(i))
//         ++i;        
//     } , 5000)

//     subscriber.add(() => {
//         console.log("Stopped emitting")
//         clearInterval(interval)
//     })
// }).pipe( operators.share() )

// const sub =  obs
// .pipe(
//     operators.map((val) => {
//         return val.createEvents()
//     }),
//     operators.mergeMap( val => {
//         return val
//     })
// )
// .subscribe( val => {
//     console.log(val)
// })


// let obs = new rxjs.Observable((subscriber) => {
//     console.log("started observable !!")
//     subscriber.next("started")
//     let i = 0
//     const interval = setInterval(() => {
//         i++
//         console.log(i)
//         if(i > 5){
//             subscriber.error("failed")
//             clearInterval(interval)
//         }
//     } , 1000)
// }).pipe(
//     operators.retry(),
//     operators.share()
// )

// for(let i = 0 ; i < 10 ; i++){
//     obs.subscribe({ 
//         next: (val) => {
//             console.log(val)
//         } ,
//         error: (err) => {
//             console.log(err)
//         }
//     })
// }

// let websocket = new WebSocket(`ws://localhost:3200`)

// websocket.on("open" , () => {
//     console.log("connected")
// })

// websocket.on("message" , (data) => {
//     console.log(data)
// })