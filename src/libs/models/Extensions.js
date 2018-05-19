import requireFromString from 'require-from-string'
import Aws from '../Aws'
import DatabaseModel from './DatabaseModel'
import config from '../../config'

const s3 = Aws().S3

export default function Extensions(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'extensions')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'description', 'filename', 'name', 'method', 'params'
      ],

      async execute(id=this.record.id, params=[]) {
        const record        = await this.find(id)
        const fileContents  = await s3.getFile(record.filename)
        const localExports  = requireFromString(fileContents.Body.toString('utf8'))
        if (record.method)
          return await localExports[record.method](...params)

        return localExports
      }
    }
  )
}
