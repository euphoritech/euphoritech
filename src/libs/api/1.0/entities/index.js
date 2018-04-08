import TeamEntities from '../../../models/TeamEntities'
import TeamEntityLinks from '../../../models/TeamEntityLinks'

export default {
  async get({ req, res, postgres }) {
    res.json(true)
  }
}
