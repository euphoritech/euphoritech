import config from '../../config'
import DatabaseModel from './DatabaseModel'
import TeamEntities from './TeamEntities'

export default function Teams(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'teams')
  const entities = TeamEntities(postgres)

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'external_id', 'is_global', 'name', 'parent_team_id', 'type',
        'primary_contact_user_id'
      ],

      async create({ parentTeamId, teamExtId, teamName, userId }) {
        parentTeamId = parentTeamId || 1
        const newTeamRecord = await this.findOrCreateBy({
          parent_team_id: parentTeamId,
          external_id: teamExtId,
          name: teamName,
          primary_contact_user_id: userId
        })
        await entities.insertSeedTypes(newTeamRecord.id)
        return newTeamRecord
      },

      async getTopMostTeamId(teamIdsAry) {
        const hierarchies = await Promise.all(
          teamIdsAry.map(async teamId => {
            return {
              team_id: teamId,
              hierarchy: await this.hierarchyFromBottom(teamId)
            }
          })
        )

        return hierarchies.reduce((highestTeamInfo, teamInfo) => {
          if (!highestTeamInfo)
            return teamInfo

          // TODO: what do we do if two teams have the same hierarchy length???
          // the "highest" team is going to have the least hierarchy
          // since there will be fewer teams above it.
          return (highestTeamInfo.hierarchy.length < teamInfo.hierarchy.length) ? highestTeamInfo : teamInfo
        }, null).team_id
      },

      async isChildInParentsHierarchy(parentTeamId, childTeamId) {
        const childHierarchy = await this.hierarchyFromBottom(childTeamId)
        return childHierarchy.map(r => r.pid).includes(parentTeamId)
      },

      async getEntireHierarchy(topMostTeamId=null) {
        const rows = await this.hierarchyFromTop(topMostTeamId)
        return buildTeamNestedObject(rows)
      },

      async getParentTeams(bottomMostTeamId) {
        const rows = await this.hierarchyFromBottom(bottomMostTeamId)
        return buildTeamNestedObject(rows.reverse())
      },

      async hierarchyFromBottom(bottomMostTeamId) {
        // cid: child org id
        // cname: child org name
        // pid: parent org id
        const { rows } = await postgres.query(`
          WITH RECURSIVE chain(cid, cname, pid) AS (
            select
              o1.id as cid,
              o1.name as cname,
              o1.parent_team_id as pid
            from teams as o1
            where o1.id = $1

              UNION

            select
              o2.id as cid,
              o2.name as cname,
              o2.parent_team_id as pid
            from teams as o2, chain o1
            where o2.id = o1.pid
          )
          select * from chain
        `, [ bottomMostTeamId ])
        return rows
      },

      async hierarchyFromTop(topMostTeamId=null) {
        let addToQuery = ``
        let params = []
        if (topMostTeamId) {
          addToQuery = 'where o1.id = $1 or o1.parent_team_id = $2'
          params = [ topMostTeamId, topMostTeamId ]
        }

        // cid: child org id
        // cname: child org name
        // pid: parent org id
        const { rows } = await postgres.query(`
          WITH RECURSIVE chain(cid, cname, pid) AS (
            select
              o1.id as cid,
              o1.name as cname,
              o1.parent_team_id as pid
            from teams as o1
            ${addToQuery}

              UNION

            select
              o2.id as cid,
              o2.name as cname,
              o2.parent_team_id as pid
            from teams as o2, chain o1
            where o2.parent_team_id = o1.cid
          )
          select * from chain
        `, params)
        return rows
      }
    }
  )
}

export function buildTeamNestedObject(databaseResults) {
  // Example databaseResults (array):
  // +-------+-----------+--------+
  // | cid   | cname     | pid    |
  // |-------+-----------+--------|
  // | 1     | Global    | <null> |
  // | 2     | Company 1 | 1      |
  // | 3     | Company 2 | 1      |
  // | 4     | Dept 2    | 2      |
  // | 5     | SubDept 2 | 4      |
  // +-------+-----------+--------+
  const addChildren = obj => {
    const children = databaseResults.filter(r => r.pid == obj.id)
    if (children.length > 0) {
      obj.children = Object.assign({}, obj.children || {}, children.reduce((acc, c) => {
        acc[c.cid] = addChildren({ id: c.cid, name: c.cname })
        return acc
      }, {}))
    }
    return obj
  }
  return databaseResults.reduce((acc, val) => (acc) ? addChildren(acc) : ({ id: val.cid, name: val.cname }), null)
}
