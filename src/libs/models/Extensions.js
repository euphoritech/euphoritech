import requireFromString from 'require-from-string'
import config from '../../config'
import Aws from '../Aws'
import DatabaseModel from './DatabaseModel'

const s3 = Aws().S3

export default function Extensions(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'extensions')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'description', 'filename', 'name'
      ],

      async execute(id=this.record.id, methodToInvoke=null) {
        const record        = await this.findByColumn(id)
        const fileContents  = await s3.getFile(record.filename)
        const localExports  = requireFromString(fileContents.Body.toString('utf8'))
        if (methodToInvoke)
          return await localExports[methodToInvoke]

        return true
      }
    }
  )
}
