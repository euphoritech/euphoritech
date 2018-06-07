/**
 * @ExternalModules
 *
 * Allows you to load/install NPM (or other package manager) modules
 * and then invoke some code from that module.
 *
 * Methods:
 *    - execute: Provide an NPM module (or path to GitHub repo) and execute
 *               a function based on the code from that imported module.
 */

// https://github.com/davideicardi/live-plugin-manager
import { PluginManager } from "live-plugin-manager"

const manager = new PluginManager()

export default {
  async execute(moduleOrPath, executionPromiseFunction, moduleName=null) {
    moduleName = moduleName || moduleOrPath

    await this.install(moduleOrPath)
    await executionPromiseFunction(this.require(moduleName))
    await this.uninstall(moduleName)
  },

  async install(moduleOrPath) {
    return await manager.install(moduleOrPath)
  },

  require(moduleName) {
    return manager.require(moduleName)
  },

  async uninstall(moduleName) {
    return await manager.uninstall(moduleName)
  }
}
