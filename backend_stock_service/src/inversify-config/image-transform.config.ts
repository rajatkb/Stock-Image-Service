import { Container } from 'inversify'
import { ImageTransformServer } from '../services/image-upload/image-tf-server'
import { ImageTransformPipeline } from '../services/image-upload/image-tf-pipeline'

let container = new Container()

container.bind(ImageTransformServer).to(ImageTransformServer)
container.bind(ImageTransformPipeline).to(ImageTransformPipeline)

export { container }