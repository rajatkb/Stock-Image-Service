import { Container } from 'inversify'
import { MulterMiddleWare } from '../controllers/middleware/multer'
import { Database } from '../database/database'
import { MYSQLDatabase } from '../database/mysql'
import { FileOpsModel } from '../models/file'
import { SearchService } from '../services/search-service'
import { QueryBuilder } from '../services/query-builder'
import { UploadService } from '../services/upload-service'
import { ImageUploadClient } from '../services/image-upload/image-client'
import { ImageHashTags } from '../services/image-hashtags'
import { SearchCacheMiddleware } from '../controllers/middleware/cache'
import { CacheService } from '../services/cache-service'
import { AuthMiddleWare } from '../controllers/middleware/auth'



let container = new Container()

container.bind(CacheService).to(CacheService).inSingletonScope()

container.bind(MulterMiddleWare).to(MulterMiddleWare).inSingletonScope()
container.bind(SearchCacheMiddleware).to(SearchCacheMiddleware).inSingletonScope()
container.bind(AuthMiddleWare).to(AuthMiddleWare).inRequestScope()

container.bind(Database).to(MYSQLDatabase).inRequestScope()
container.bind(FileOpsModel).to(FileOpsModel).inSingletonScope()
container.bind(SearchService).to(SearchService).inSingletonScope()
container.bind(QueryBuilder).to(QueryBuilder).inSingletonScope()
container.bind(UploadService).to(UploadService).inSingletonScope()
container.bind(ImageUploadClient).to(ImageUploadClient).inSingletonScope()
container.bind(ImageHashTags).to(ImageHashTags).inSingletonScope()


export { container }