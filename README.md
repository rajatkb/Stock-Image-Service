# Stock-Image-Service
It's an application to store stock images and the ability to search and view the images, based on queries,

The application built with three primary services
1. Fileserver (which can replaced with a S3 Bucket + CDN)
2. ImageProc Server (It's a standalone server responsible for storing image data and process it before storing)
3. API Server (it exposes the api and also interfaces with the database and the ImageProc server)

## Requirement (Dev or Build)

* Nodejs v12+
* Angular 8+ with latest cli installed 

## Build

### Backend
```
>> npm run build

```
### Frontend
```
>> npm run build:prod

or

>> ng build
```

## Deployment

```
>> cd backend_stock_service
>> npm run start:imageproc &

>> npm run start:api &

>> npm run start:fileserver &

```

* The api should be ideally launched after the imageproc but even if you dont the api service would repeatedly try to create a connection. While it does that all the upload request would fail.

* The application is configured using two files. The `.env` file which has all the environment variables. The `config` folder with `dev` , `production` and `test` settings.

* The application also requires a ssh pem key file with the supplied name of `keys.pem` and `keys`. These files should ideally be deleated from the server after deployment.


#### Deployment Strategy

* The api and imageproc applications are written for utilising the cluster module to distribute task. Although API module does not do much CPU intensive task except maintaining/searching an in memory cache inside it , the `imageproc` process can hugely benefit from clustered deployment.

* The library used `Sharp` link: [Sharp](https://sharp.pixelplumbing.com/) , already utilises `libvips` which natively runs in C and it's bindings are promisified plus the processing itslef is handled by the thread pool of `libuv` , keeping things fast. Which means it would perform well even without clustering. But clustering the application can allow us to utilise the individual core to it's fullest where we can also control distribution of new request.

* Clustering the `api` allows us to have each single request handling process get it's result from unique `imageproc` process. The application also uses a pool of socket connection which connects to individual imageproc processes automatically.

* Demo image

<img src="ImageServer.png"/>

* The image proc can further be deployed in more virtual machines (if deployed in cloud) with a load balancer infront of the cluster to redirect and rebalance request.


## Decisions for development

* The application uses MySQL for storage and also as an indexing service for search functionality. To do away with manual SQL statements and overlooking security , I opted for using an ORM. I used `sequelize` which fits the requirement really well.

* Given the application is written in nodejs , to keep the sanity of the project I stuck to two primary practice  
    1. Use Typescript for compile time type safety and targetting the latest ES features supported by node.
    2. Use Inversify.js for Dependency Injection or IOC pattern. This allows me to decouple the code and also not worry about initialisation of objects and duplicated.
    3. Use Rxjs where there is usage of socket. It's easier to reason about streams and also manage them without keeping counters and manual arrays to keep track of them.

* Due to scale of the application I did not emphasized on writing interfaces for each of the classes which generally is the case , since the interfaces/abstracts are binded with their concrete.

* For the api development express combined with `express-inversify-util` is used. This allows easy controller declaration that does automatic route binding.

* All the environment variables are loaded from a  `.env` file. Currently it only supports one `.env` file. You cannot have sepparate for different mode of deployment. You must introduce new `.env` file or customize existing one for deployment.

* Authentication is done for only safeguarding the routes so that they are not abused. It's done through a JWT Token

