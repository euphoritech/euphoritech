import assert from 'assert'
import fs from 'fs'
import util from 'util'
import ExternalModules from './ExternalModules.js'

const readFile = util.promisify(fs.readFile)
const deleteFile = util.promisify(fs.unlink)

describe('ExternalModules', function() {
  describe('#execute()', function() {
    it(`should execute code from Jimp module and create new image`, async () => {
      const origImg = './src/tests/image.png'
      const newImg  = './src/tests/image2.png'

      await ExternalModules.execute('jimp', async function(Jimp) {
        const img = await Jimp.read(origImg)
        img.greyscale().write(newImg)
      })

      const buffer = await readFile(newImg)
      await deleteFile(newImg)

      assert.equal(buffer.length > 0, true)
    })
  })
})
