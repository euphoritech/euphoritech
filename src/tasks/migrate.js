import bunyan from 'bunyan'
import PostgresClient from '../libs/PostgresClient'
import config from '../config'

const log = bunyan.createLogger(config.logger.options)
const postgres_url = config.postgres.connection_string

const postgres = new PostgresClient(postgres_url, {max: 1})

;(async () => {
  try {
    await Promise.all([
      createTeams(postgres),
      createTeamsIndexes(postgres)//,
      // createEventLocationAndTvListingsInEvents(postgres)
    ])

    log.info("Successfully ran DB migrations!")
    process.exit()

  } catch(err) {
    log.error("Error running DB migrations", err)
    process.exit()
  }
})()

async function createTeams(postgres) {
  // await postgres.query(`
  //   CREATE TABLE IF NOT EXISTS teams (
  //     id serial PRIMARY KEY,
  //     api_uid integer,
  //     league_id integer REFERENCES leagues,
  //     current_ranking integer,
  //     location varchar(255),
  //     name varchar(255),
  //     full_name varchar(255),
  //     abbreviation varchar(255),
  //     physical_location varchar(255),
  //     team_color1 varchar(255),
  //     team_color2 varchar(255),
  //     logo_url varchar(255),
  //     logo_local_filename varchar(255),
  //     api_url varchar(255),
  //     resource_url varchar(255),
  //     conference_abbreviation varchar(255),
  //     conference_name varchar(255),
  //     complete_json text,
  //     created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
  //     updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
  //   );
  // `)
}

async function createTeamsIndexes(postgres) {
  // await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_league_id on teams (league_id)`)
  // await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_api_uid on teams (api_uid)`)
  // await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_location on teams (location)`)
  // await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_name on teams (name)`)
}

// async function createEventLocationAndTvListingsInEvents(postgres) {
//   await postgres.addColumnIfNotExists('events', 'event_location', 'varchar(255)')
//   await postgres.addColumnIfNotExists('events', 'tv_listings', 'text')
// }
