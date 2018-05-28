import bunyan from 'bunyan'
import PostgresClient from '../PostgresClient'
import { sleep } from '../Helpers'
import TeamEntities from '../models/TeamEntities'
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
          id bigserial PRIMARY KEY,
          name varchar(255),
          username_email varchar(255) not null,
          password_hash varchar(255),
          first_name varchar(255),
          last_name varchar(255),
          needs_password_reset boolean,
          last_password_reset timestamp(6),
          last_login timestamp(6),
          last_session_refresh timestamp(6),
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
          id bigserial PRIMARY KEY,
          parent_team_id bigint DEFAULT null REFERENCES teams,
          external_id varchar(255) UNIQUE,
          is_global boolean,
          type varchar(255),
          name varchar(255),
          primary_contact_user_id bigint REFERENCES users,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_user_id_idx on teams (primary_contact_user_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_parent_team_id_idx on teams (parent_team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS teams_external_id_idx on teams (external_id)`)
    },

    async function seedGlobalTeam() {
      const { rows } = await postgres.query('select * from teams where is_global is true')
      if (rows.length === 0) {
        const seedUserRecord = (await postgres.query(`select * from users where username_email = '${seedEmailAddress}'`)).rows[0]
        await postgres.query(`INSERT INTO teams (id, external_id, is_global, name, primary_contact_user_id) VALUES (1, 'global', true, 'Global', ${seedUserRecord.id})`)
        await postgres.query(`ALTER SEQUENCE teams_id_seq RESTART WITH 2`)
        await postgres.query(`INSERT INTO teams_users_roles_map (team_id, user_id, role) VALUES (1, ${seedUserRecord.id}, 'superadmin')`)
      }
    },

    async function createTeamsUsersRolesMap() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS teams_users_roles_map (
          id bigserial PRIMARY KEY,
          team_id bigint REFERENCES teams,
          user_id bigint REFERENCES users,
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
          id bigserial PRIMARY KEY,
          user_id bigint REFERENCES users,
          type varchar(255),
          unique_id varchar(255),
          access_token varchar(255),
          refresh_token varchar(255),
          first_name varchar(255),
          last_name varchar(255),
          email varchar(255),
          expires timestamp,
          mod1 varchar(255),
          mod2 varchar(255),
          mod3 varchar(255),
          mod4 varchar(255),
          mod5 varchar(255),
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
          id bigserial PRIMARY KEY,
          team_id bigint REFERENCES teams,
          user_oauth_int_id bigint REFERENCES user_oauth_integrations,
          integration_type varchar(255),
          mod1 varchar(255),
          mod2 varchar(255),
          mod3 varchar(255),
          mod4 varchar(255),
          mod5 varchar(255),
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamIntegrationsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_integrations_team_id_idx on team_integrations (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_integrations_user_oauth_int_id_idx on team_integrations (user_oauth_int_id)`)
    },

    async function createTeamIntegrationsSalesforce() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_integrations_salesforce (
          id bigserial PRIMARY KEY,
          team_id bigint REFERENCES teams,
          object_name varchar(255),
          attribute_info jsonb,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamIntegrationsSalesforceIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_integrations_salesforce_team_id_idx on team_integrations_salesforce (team_id)`)
    },

    async function createExtensions() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS extensions (
          id bigserial PRIMARY KEY,
          filename varchar(255),
          name varchar(255),
          description text,
          method varchar(255),
          params jsonb,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createExtensionsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS extensions_name_idx on extensions (name)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS extensions_filename_idx on extensions (filename)`)
    },

    async function createTeamEvents() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_events (
          id bigserial PRIMARY KEY,
          team_id bigint REFERENCES teams,
          user_id bigint REFERENCES users,
          type varchar(255),
          extension_id bigint REFERENCES extensions,
          params jsonb,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamEventsIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_events_team_id_type_idx on team_events (team_id, type)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_events_team_id_user_id_idx on team_events (team_id, user_id)`)
    },

    async function createTeamEntityTypes() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_entity_types (
          id bigserial PRIMARY KEY,
          team_id bigint REFERENCES teams,
          name varchar(255),
          is_active boolean default true,
          description text,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamEntityTypesIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entity_types_team_id_idx on team_entity_types (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entity_types_team_id_is_active_idx on team_entity_types (team_id, is_active)`)
    },

    async function seedGlobalEntityTypes() {
      // Give it a sec to let the seed global team be created
      await sleep(1000)
      const entities = TeamEntities(postgres)
      const globalTeam = (await postgres.query('select * from teams where is_global is true')).rows[0]
      if (globalTeam) {
        const types = (await postgres.query('select * from team_entity_types where team_id = $1', [ globalTeam.id ])).rows
        if (types.length === 0)
          await entities.insertSeedTypes(globalTeam.id)
      }
    },

    async function createTeamEntities() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_entities (
          id bigserial PRIMARY KEY,
          team_id bigint REFERENCES teams,
          status varchar(255) default 'active',
          source varchar(255),
          name varchar(255),
          description text,
          entity_type_id bigint REFERENCES team_entity_types,
          uid varchar(255),
          external_link varchar(255),
          due_date timestamp(6),
          mod1 varchar(255),
          mod2 varchar(255),
          mod3 varchar(255),
          mod4 varchar(255),
          mod5 varchar(255),
          raw_info jsonb,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamEntitiesIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entities_team_id_idx on team_entities (team_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entities_team_id_status_idx on team_entities (team_id, status)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entities_team_id_source_idx on team_entities (team_id, source)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entities_team_id_entity_type_id_idx on team_entities (team_id, entity_type_id)`)
    },

    async function createTeamEntityLinks() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_entity_links (
          id bigserial PRIMARY KEY,
          entity1_id bigint REFERENCES team_entities,
          entity2_id bigint REFERENCES team_entities,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamEntityLinksIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entity_links_entity1_id_idx on team_entity_links (entity1_id)`)
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_entity_links_entity2_id_idx on team_entity_links (entity2_id)`)
    },

    async function createTeamUserAccessRequest() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_user_access_request (
          id bigserial PRIMARY KEY,
          requesting_user_id bigint REFERENCES users,
          team_id bigint REFERENCES teams,
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

    async function createTeamApiKeys() {
      await postgres.query(`
        CREATE TABLE IF NOT EXISTS team_api_keys (
          id bigserial PRIMARY KEY,
          team_id bigint REFERENCES teams,
          api_key varchar(255),
          status varchar(255),
          name varchar(255),
          description text,
          created_at timestamp(6) without time zone NOT NULL DEFAULT now(),
          updated_at timestamp(6) without time zone NOT NULL DEFAULT now()
        );
      `)
    },

    async function createTeamApiKeysIndexes() {
      await postgres.query(`CREATE INDEX CONCURRENTLY IF NOT EXISTS team_api_keys_team_id_idx on team_api_keys (team_id)`)
    }

    // async function createEventLocationAndTvListingsInEvents() {
    //   await postgres.addColumnIfNotExists('events', 'event_location', 'varchar(255)')
    //   await postgres.addColumnIfNotExists('events', 'tv_listings', 'text')
    // }
  ]
}
