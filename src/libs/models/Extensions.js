import Aws from '../Aws'
import ExternalModules from '../ExternalModules'
import DatabaseModel from './DatabaseModel'
import config from '../../config'

const s3 = Aws().S3

export default function Extensions(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'extensions')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'description', 'filename', 'name', 'params'
      ],

      // NOTE: Any extension needs to be approved before it gets into
      // AWS S3 because we're using eval() to parse the file config
      // info which includes the function to execute for the extension
      async execute(id=this.record.id, params=null) {
        const record          = await this.find(id)
        const filename        = record.filename
        const fileContents    = await s3.getFile({ filename })
        const extensionConfig = eval(fileContents.Body.toString('utf8'))

        let MODULES = null
        if (extensionConfig.modules)
          MODULES = await this.installModulesRequired(extensionConfig.modules)

        const result = await extensionConfig.go(params)
        await this.uninstallModules(MODULES)

        return result
      },

      async installModulesRequired(moduleAry) {
        moduleAry = (moduleAry instanceof Array) ? moduleAry : [ moduleAry ]
        const nameModulePairs = await Promise.all(
          moduleAry.map(async name => {
            await ExternalModules.install(name)
            return [ name, ExternalModules.require(name) ]
          })
        )

        return nameModulePairs.reduce((obj, nameModule) => {
          const [ name, module ] = nameModule
          obj[name] = module
          return obj
        }, {})
      },

      async uninstallModules(moduleObj) {
        if (moduleObj) {
          return await Promise.all(
            Object.keys(moduleObj).map(async name => {
              await ExternalModules.uninstall(name)
            })
          )
        }
      }
    }
  )
}
