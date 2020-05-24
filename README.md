# Stock-Image-Service 📱
It's an application to store stock images and the ability to search and view the images, based on queries,

The application built with three primary services
1. Fileserver (which can be replaced with an S3 Bucket + CDN)
2. ImageProc Server (It's a standalone server responsible for storing image data and process it before storing)
3. API Server (it exposes the API and also interfaces with the database and the ImageProc server)

## Requirement (Dev or Build) 🛠

* Nodejs v12+
* Angular 8+ with latest cli installed 

## Build 🔧

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

## Deployment ☁

```
>> cd backend_stock_service
>> npm run start:imageproc &

>> npm run start:api &

>> npm run start:fileserver &

```

* The `api` should be ideally launched after the `imageproc` but even if you don't the api service would repeatedly try to create a connection. While it does that all the upload request would fail.

* The application is configured using two files. The `.env` file which has all the environment variables. The `config` folder with `dev` , `production` and `test` settings.

* The application also requires an ssh pem key file with the supplied name of `keys.pem` and `keys`. These files should ideally be deleted from the server after deployment.


#### Deployment Strategy 💭

* The api and imageproc applications are written for utilising the cluster module to distribute the task. Although API module does not do much CPU intensive task except maintaining/searching an in-memory cache inside it , the `imageproc` process can hugely benefit from clustered deployment.

* The library used `Sharp` link: [Sharp](https://sharp.pixelplumbing.com/) , already utilises `libvips` which natively runs in C and it's bindings are promisified plus the processing itself is handled by the thread pool of `libuv` , keeping things fast. Which means it would perform well even without clustering. But clustering the application can allow us to utilise the individual core to it's fullest where we can also control distribution of new request.

* Clustering the `api` allows us to have each single request handling process get its result from unique `imageproc` process. The application also uses a pool of socket connection which connects to individual imageproc processes automatically.

* Demo image

<img src="ImageServer.png"/>

* The image proc can further be deployed in more virtual machines (if deployed in cloud) with a load balancer in front of the cluster to redirect and rebalance request.


## Decisions for development 🛣

* The application uses MySQL for storage and also as an indexing service for search functionality. To do away with manual SQL statements and overlooking security , I opted for using an ORM. I used `sequelize` which fits the requirement really well.

* Given the application is written in nodejs , to keep the sanity of the project I stuck to two primary practice  
    1. Use Typescript for compile-time type safety and targetting the latest ES features supported by node.
    2. Use Inversify.js for Dependency Injection or IOC pattern. This allows me to decouple the code and also not worry about initialisation of objects and duplicated.
    3. Use Rxjs where there is the usage of socket. It's easier to reason about streams and also manage them without keeping counters and manual arrays to keep track of them.

* Due to scale of the application I did not emphasize on writing interfaces for each of the classes which generally is the case , since the interfaces/abstracts are bound with their concrete.

* For the api development express combined with `express-inversify-util` is used. This allows easy controller declaration that does automatic route binding.

* All the environment variables are loaded from a  `.env` file. Currently, it only supports one `.env` file. You cannot have separate for a different mode of deployment. You must introduce new `.env` file or customize existing one for deployment.

* Authentication is done for only safeguarding the routes so that they are not abused. It's done through a JWT Tokens.

* The pem key files are used for signing the tokens and validating them.

* The application logs its activity using winston , and generates file for each independent unit of class objects. Like the `File` model class that contains code for committing and searching data creates its own file for logging. This sepparates the logs and makes it easy to isolate any bug if there is associated with that module. All the logs are also redirected to console , so the console can be piped to write into a file also, acting unified log.

## Features 

### Upload 👆

<img src="upload.gif">

* The upload is enabled by `/upload/images`. The route is guarded by authentication from the backend. Images are dropped if not met in the specification. Each uploaded file makes independent call to back end for uploading. This disentangles the files and allows for partial success if the server crashes or fails to do the task in midway.

* The description also can be used to add extra hashtags e.g `#somethig` , these are then used for searching images by tag

* Each request moves through process of commiting metadata of file to mysql and then submitting it to imageproc, it responds back only when the upload completely finishes. In this way user is assured of successful file upload and saving in the backend. This process can be disentangled and the user can be immdiately responded back as soon as the file blobs are acquired in the backend.

* The images are kept in two versions in the server on in 240p and other in 720p. the process is handled by `imageproc` and is not part of the primary server. Hence crash in either of them will not hinder the processing of new request. Each data commit is given a 5s timeout which is configurable from the config folder. This means if `imageproc` does not respond with affirmation it will be assumed commit did not happen and the MySQL commit done will be reverted back. This is an implementation nuance, later on, we can also afford to have request buffered so that server failure can be detected and be cached in temp location and uploaded back through `imageproc`, that's why the mysql request is made first. Also if a database is down having file write request is redundant. 

* The level of parallelism for `imageproc` is dependent on the machine it's running on, as the application scale based on the number of CPU if configured accordingly. The `api` application can also create a pool of socket to all the subprocess of imageproc allowing for equal distribution of request. Although the implementation cycles between the sockets every .5s.


* Currently the images are store in the disk itself. But it's not scalable. The best solution would be to have the storage being delegated to a S3 bucket. Not only that , a two step request can allow the frontend appplication to directly upload images to s3 with a s3 provided link. A sepparate Spark workflow can then be even kept for processing the uploaded images. Which will offload the compute heavy task from nodejs.

* Currently upload process loads image file in memory and ofloads them to imageproc. This can be circumvented by usage of the above mentioned s3 storage or if implemented a one time jwt token system for the `imageproc` , allowing for upload of file binary and metadata to be sepparate from each other.   

This process however in my view holds two issues.

1. For multiple files it may lead to overhead of extra request for each file. Can be solved if multiple file metadata is coalasced as one, request.
2. If implemented in such disentangled manner , failure of upload to s3 would have to be sepparately detected so that redudant uploaded data does not keep laying around in mysql db.

### Search 🔍


<img src="search.gif"/>

* User can search through description , tags and date range. These queries are exclusive i.e and-ed together except tags. Tags are or-ed. 

* Queries provided here are run through some regex expression to find matches. From a security perspective this can open up a window for regex-based dos attack. Current implementation does a manual check of 10,000 character limit for query. So that large text query does not breaks the search functionality.

*Solution*: Use a threadpool where tasks can be timedout, although this will be a more time taking solution to build but current there are no good acceptable workerpool implementation. There is one called `workerpool` , but apparently for some reason the communication overheard between main process and workerthreads in it makes using it quite redundant. So if an implementation is created for the same with some pre-caching for avoiding repeated serialization of functions (which I suspect is the bottleneck) Regex can safely be accepted with no artificial limit of 10,000 characters.

* After the required data regarding description, date range and tags are extracted it is passed to the `File` model class.
Which organises all this for query through sequelize. 

#### Index

* Since search query requires to go through all the data it's better to identify rows that should be indexed. 
* Sequelize generates `createdAt` datestamp, on which index is set. 
* `Tags` in Hashtag table is kept as primary as they are unique, hence indexed.
* The field of name and description are kept as full-text index, in mysql. MySQL lacks support for lemmatization and word roots, so a search like "some" for "something" may not yield results. This is not solved in current MySQL implementation. PostgreSQL has a better solution to this. But their usage is more complex than what MySQL offers.  

*Solution* : The problem with MySQL lacks such word preprocessing can be solved from the application end. A sepparate description preprocessor can create comma-separated root word collection which then can be used for Full text index and be queried using boolean queries. (TF-IDF is used by MySQL). This will yield results as we may get from Postgres. 

* Another thing to note is MYSQL does supports stop word removal , so words like 'this' 'is' 'are' may return empty results 



## Image Processing 🧗‍♀️

* The image processing server is implemented using the `ws` package along with `Rxjs` for managing socket connections. Earlier I started with `net` package , as I thought a IPC over fifo files would be more efficient but it would also restrict the image processing to the same system where the api application lays.

* To do away with it , I resorted to using Websocket. The data passed to websocket is in binary format. The data passed are File Id and File Binary Blob. 

* The file id is a fixed unique UUID or 36 bytes , so the file id and the files are concatenated in binary array and passed through socket at once, and are unmarshalled at the other end. For more complex data , Protobuf should be an explorable option. But since only these two data were sufficient I did not explore any other serialization.

* The Image is processed by `Sharp` library as mentioned before and is reasonably fast and easy to use. I have been able to upload simultaneous 16+ images in my system with i7 4770 4th gen , 3.7Ghz 4 core - 8threads / 16GB RAM system

## API Performance 👌

* The `Api` application in itself is not doing much CPU intensive computation except regex parsing. I have tried using worker threads but the cost of serialization + regex + deserialization in itself is greater and doesn't give any benefits.

* To utilise the CPU better , I employed an in-memory cache through `node-cache` package. It uses Js Object internally so it has it's limitation of 1 million keys. Which works well for quick lookup inside the application. The lookups are kept for reducing search queries. 

* The timeout for the keys is also based on how frequently the data is loaded. So a front page result is defacto will be loaded the most so no reason to have it being queried every time from database. For queries that should lay at bottom of results have the lowest timeout time as they rarely will be visited and it's ideal to evict these objects from memory quickly. 

* When using Caching for a single query 

Autocannon benchmark for 100 concurrent with 10000 requests to search service.
The performance is better for lesser concurrency and higher LIBUV_THREADPOOL count

┌─────────┬────────┬────────┬────────┬────────┬───────────┬───────────┬────────────┐
│ Stat    │ 2.5%   │ 50%    │ 97.5%  │ 99%    │ Avg       │ Stdev     │ Max        │
├─────────┼────────┼────────┼────────┼────────┼───────────┼───────────┼────────────┤
│ Latency │ 129 ms │ 169 ms │ 310 ms │ 373 ms │ 197.45 ms │ 168.47 ms │ 3056.28 ms │
└─────────┴────────┴────────┴────────┴────────┴───────────┴───────────┴────────────┘
┌───────────┬─────────┬─────────┬────────┬─────────┬────────┬────────┬─────────┐
│ Stat      │ 1%      │ 2.5%    │ 50%    │ 97.5%   │ Avg    │ Stdev  │ Min     │
├───────────┼─────────┼─────────┼────────┼─────────┼────────┼────────┼─────────┤
│ Req/Sec   │ 46      │ 46      │ 550    │ 602     │ 476.2  │ 161.56 │ 46      │
├───────────┼─────────┼─────────┼────────┼─────────┼────────┼────────┼─────────┤
│ Bytes/Sec │ 55.5 kB │ 55.5 kB │ 901 kB │ 1.28 MB │ 848 kB │ 420 kB │ 55.5 kB │
└───────────┴─────────┴─────────┴────────┴─────────┴────────┴────────┴─────────┘

Req/Bytes counts sampled once per second.

## Resilience 🥦

* The application `api` and `imageproc` are separate. The `api` when started tries to connect to the api automatically. If the service of `imageproc` fails. Even then the `api` quickly tries to recreate the connection.

* `api` also hosts a pool of connection to several connections to the subprocess of `imageproc` so that it can distribute the request among them in a uniform fashion.


