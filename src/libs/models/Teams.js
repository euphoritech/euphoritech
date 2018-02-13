import config from '../../config'
import DatabaseModel from './DatabaseModel'

export default function Teams(postgres) {
  const factoryToExtend = DatabaseModel(postgres, 'teams')

  return Object.assign(
    factoryToExtend,
    {
      accessibleColumns: [
        'name', 'parent_team_id'
      ],

      async getTeamHierarchy(topMostTeamId=null) {
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

        return buildTeamNestedObject(rows)
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


  // if (rows.length > 0) {
  //   return rows.reduce((row, finalObj) => {
  //     if (finalObj[row.pid]) {
  //       if (row.cid)
  //         finalObj[row.pid].children.push({ name: row.c_name, id: row.cid })
  //       else
  //         finalObj[row.pid]
  //     }
  //   }, {})
  // }

  return databaseResults
}
