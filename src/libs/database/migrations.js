import bunyan from 'bunyan'
import PostgresClient from '../../libs/PostgresClient'
import config from '../../config'

const log = bunyan.createLogger(config.logger.options)

export default async function runMigrations(postgresUrl) {
  try {
    const postgres = new PostgresClient(postgresUrl, { max: 1 })
    await Promise.all([
      createTeams(postgres),
      createTeamsIndexes(postgres),
      seedGlobalTeam(postgres),
      createUsers(postgres),
      createUsersIndexes(postgres),
      createTeamsUsersRolesMap(postgres),
      createTeamsUsersRolesMapIndexes(postgres),
      createUserOauthIntegrations(postgres),
      createUserOauthIntegrationsIndexes(postgres),
      createTeamIntegrations(postgres),
      createTeamIntegrationsIndexes(postgres),
      createExtensions(postgres),
      createExtensionsIndexes(postgres)
    ])

    log.info("Successfully ran DB migrations!")
    process.exit()

  } catch(err) {
    log.error("Error running DB migrations", err)
    process.exit()
  }
}

async function createTeams(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS teams (
      id serial PRIMARY KEY,
      parent_team_id integer DEFAULT null REFERENCES teams,
      is_global boolean,
      type varchar(255),
      name varchar(255),
      primary_contact_email varchar(255),
      primary_contact_name varchar(255),
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
    );
  `)
}

async function createTeamsIndexes(postgres) {
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_parent_team_id_idx on teams (parent_team_id)`)
}

async function seedGlobalTeam(postgres) {
  const { rows } = await postgres.query('select * from teams where is_global is true')
  if (rows.length === 0)
    await postgres.query(`INSERT INTO teams (is_global, name) VALUES (true, 'Global')`)
}

async function createUsers(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS users (
      id serial PRIMARY KEY,
      name varchar(255),
      username_email varchar(255) not null,
      password_hash varchar(255),
      password_iv varchar(255),
      needs_password_reset boolean,
      last_password_reset timestamp(6),
      first_name varchar(255),
      last_name varchar(255),
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
    );
  `)
}

async function createUsersIndexes(postgres) {
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS users_username_email_idx on users (username_email)`)
}

async function createTeamsUsersRolesMap(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS teams_users_roles_map (
      id serial PRIMARY KEY,
      team_id integer REFERENCES teams,
      user_id integer REFERENCES users,
      role varchar(255),
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
    );
  `)
}

async function createTeamsUsersRolesMapIndexes(postgres) {
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_users_roles_map_user_id_idx on teams_users_roles_map (user_id)`)
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_users_roles_map_team_id_idx on teams_users_roles_map (team_id)`)
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_users_roles_map_team_id_idx on teams_users_roles_map (role)`)
}

async function createUserOauthIntegrations(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS user_oauth_integrations (
      id serial PRIMARY KEY,
      user_id integer REFERENCES users,
      type varchar(255),
      unique_id varchar(255),
      access_token varchar(255),
      refresh_token varchar(255),
      first_name varchar(255),
      last_name varchar(255),
      email varchar(255),
      expires timestamp,
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
    );
  `)
}

async function createUserOauthIntegrationsIndexes(postgres) {
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS user_oauth_integrations_user_id_idx on user_oauth_integrations (user_id)`)
}

async function createTeamIntegrations(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS team_integrations (
      id serial PRIMARY KEY,
      team_id integer REFERENCES teams,
      user_oauth_int_id integer REFERENCES user_oauth_integrations,
      integration_type varchar(255),
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
    );
  `)
}

async function createTeamIntegrationsIndexes(postgres) {
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_integrations_team_id_idx on team_integrations (team_id)`)
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_integrations_user_oauth_int_id_idx on team_integrations (user_oauth_int_id)`)
}

async function createExtensions(postgres) {
  await postgres.query(`
    CREATE TABLE IF NOT EXISTS extensions (
      id serial PRIMARY KEY,
      name varchar(255),
      filename varchar(255),
      description text,
      created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
      updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
    );
  `)
}

async function createExtensionsIndexes(postgres) {
  await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS extensions_filename_idx on extensions (filename)`)
}

// async function createEventLocationAndTvListingsInEvents(postgres) {
//   await postgres.addColumnIfNotExists('events', 'event_location', 'varchar(255)')
//   await postgres.addColumnIfNotExists('events', 'tv_listings', 'text')
// }
