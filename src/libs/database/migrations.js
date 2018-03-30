import bunyan from 'bunyan'
import PostgresClient from '../../libs/PostgresClient'
import config from '../../config'

const log = bunyan.createLogger(config.logger.options)
const seedEmailAddress  = process.env.SEED_EMAIL_ADDRESS || 'lance@euphoritech.com'

export default async function runMigrations(postgresUrl) {
  try {
    const postgres = new PostgresClient(postgresUrl, { max: 1 })
    await Promise.all(migrations(postgres).map(async migrationFunction => await migrationFunction()))

    log.info("Successfully ran DB migrations!")
    process.exit()

  } catch(err) {
    log.error("Error running DB migrations", err)
    process.exit()
  }
}

export function migrations(postgres) {
  return [
    async function createUuidExtension() {
      await postgres.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      `)
    },

    async function createUsers() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS users (
          id serial PRIMARY KEY,
          name varchar(255),
          username_email varchar(255) not null,
          password_hash varchar(255),
          first_name varchar(255),
          last_name varchar(255),
          needs_password_reset boolean,
          last_password_reset timestamp(6),
          last_login timestamp(6),
          num_logins integer,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createUsersIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS users_username_email_idx on users (username_email)`)
    },

    async function seedUsers() {
      const { rows } = await postgres.query(`select * from users where username_email = '${seedEmailAddress}'`)
      if (rows.length === 0) {
        await postgres.query(`INSERT INTO users (username_email) VALUES ('${seedEmailAddress}')`)
      }
    },

    async function createTeams() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS teams (
          id serial PRIMARY KEY,
          parent_team_id integer DEFAULT null REFERENCES teams,
          external_id varchar(255) UNIQUE,
          is_global boolean,
          type varchar(255),
          name varchar(255),
          primary_contact_user_id integer REFERENCES users,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_user_id_idx on teams (primary_contact_user_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_parent_team_id_idx on teams (parent_team_id)`)
    },

    async function seedGlobalTeam() {
      const { rows } = await postgres.query('select * from teams where is_global is true')
      if (rows.length === 0) {
        const seedUserRecord = (await postgres.query(`select * from users where username_email = '${seedEmailAddress}'`)).rows[0]
        await postgres.query(`INSERT INTO teams (id, external_id, is_global, name, primary_contact_user_id) VALUES (1, 'global', true, 'Global', ${seedUserRecord.id})`)
        await postgres.query(`ALTER SEQUENCE teams_id_seq RESTART WITH 2`)
      }
    },

    async function createTeamsUsersRolesMap() {
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
    },

    async function createTeamsUsersRolesMapIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_users_roles_map_user_id_idx on teams_users_roles_map (user_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_users_roles_map_team_id_idx on teams_users_roles_map (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_users_roles_map_team_id_idx on teams_users_roles_map (role)`)
    },

    async function createUserOauthIntegrations() {
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
    },

    async function createUserOauthIntegrationsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS user_oauth_integrations_user_id_idx on user_oauth_integrations (user_id)`)
    },

    async function createTeamIntegrations() {
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
    },

    async function createTeamIntegrationsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_integrations_team_id_idx on team_integrations (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_integrations_user_oauth_int_id_idx on team_integrations (user_oauth_int_id)`)
    },

    async function createExtensions() {
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
    },

    async function createExtensionsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS extensions_filename_idx on extensions (filename)`)
    },

    async function createTeamEntityLinks() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_entity_links (
          id serial PRIMARY KEY,
          team_id integer REFERENCES teams,
          record1_table varchar(255),
          record1_id integer,
          record2_table varchar(255),
          record2_id integer,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamEntityLinksIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entity_links_team_id_idx on team_entity_links (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entity_links_record1_table_record1_id_idx on team_entity_links (record1_table, record1_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entity_links_record2_table_record2_id_idx on team_entity_links (record2_table, record2_id)`)
    },

    async function createTeamCustomers() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_customers (
          id serial PRIMARY KEY,
          team_id integer REFERENCES teams,
          source varchar(255),
          customer_id varchar(255),
          customer_name varchar(255),
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamCustomersIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_customers_team_id_idx on team_customers (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_customers_team_id_customer_id_idx on team_customers (team_id, customer_id)`)
    },

    async function createTeamCustomerUsers() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_customer_users (
          id serial PRIMARY KEY,
          team_customer_id integer REFERENCES team_customers,
          name varchar(255),
          email varchar(255),
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamCustomerUsersIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_customer_users_team_customer_id_idx on team_customer_users (team_customer_id)`)
    },

    async function createTeamUserAccessRequest() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_user_access_request (
          id serial PRIMARY KEY,
          requesting_user_id integer REFERENCES users,
          team_id integer REFERENCES teams,
          requested_time timestamp(6),
          unique_id uuid NOT NULL DEFAULT uuid_generate_v4(),
          status varchar(255),
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamUserAccessRequestIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_user_access_request_requesting_user_id_idx on team_user_access_request (requesting_user_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_user_access_request_team_id_idx on team_user_access_request (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_user_access_request_unique_id_idx on team_user_access_request (unique_id)`)
    },

    // async function createEventLocationAndTvListingsInEvents() {
    //   await postgres.addColumnIfNotExists('events', 'event_location', 'varchar(255)')
    //   await postgres.addColumnIfNotExists('events', 'tv_listings', 'text')
    // }
  ]
}
