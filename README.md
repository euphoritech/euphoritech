# euphoritech

Easily manage your product lifecycle, enhancements, issues, customer requests
and much more throughout your organization with a single tool and source of truth.

Integrate the tools your organization uses like Salesforce, Zendesk, GitHub,
and others to pull in records that you'd like to manage and prioritize to get
reminders of deadlines and ensure your time is being managed doing the most
valued work based on your organization's highest priorities.

## Requirements

- NodeJS >=8.0.0
- NPM >=5.0.0
- PostgreSQL >=9.6.0
- Redis >=4.0.0

## Install & Setup

### Configuration

Required Environment Variables

- GOOGLE_APP_ID=[In order for your users to authenticate using Google, you'll need an OAuth 2.0 app ID]
- GOOGLE_APP_SECRET=[Google OAuth app secret]
- HOSTNAME=[Fully qualified URL (with protocol) that your app is accessed by - ex.http://localhost:8080]
- CRYPT_SECRET=[Secret that anything encrypted in the DB will use]
- DATABASE_URL=[connection string to your Postgres DB - ex. postgres://localhost:5432/euphoritech]
- LOGGING_LEVEL=[[Bunyan](https://github.com/trentm/node-bunyan) logging level - ex. info]
- PORT=[port your app will listen on - 8000]
- SESSION_SECRET=[Secret for your session cookie encryption]
- SESSION_COOKIE_KEY=[ex. euphoritech]


Optional Environment Variables

- APP_NAME=[The name of the app as recorded in your logs]
- AWS_ACCESS_KEY_ID=[If you're using extensions, this is the AWS key to your repo]
- AWS_SECRET_ACCESS_KEY=[AWS API secret]
- AWS_S3_BUCKET=[AWS S3 bucket where your extensions will live]
- SALESFORCE_APP_ID=[SFDC App ID if you'd like to integrate with SFDC]
- SALESFORCE_APP_SECRET=[SFDC app secret]
- GITHUB_APP_ID=[GitHub App ID if you'd like to integrate with GitHub]
- GITHUB_APP_SECRET=[GitHub App Secret]
- WEB_CONCURRENCY=[Override the number of processes the app will spawn - ex. 1]
- NEWRELIC_KEY=[If you'd like to report the Newrelic, this is the API key]

### Quick Start Install/Run

1. `$ git clone https://github.com/euphoritech/euphoritech`
2. `$ cd euphoritech`
3. `$ npm install`
4. `$ npm run migrate`
4. `$ npm start`

### Install, Run, & Develop

If you'd like to do development on euphoritech, run through the following steps:

1. `$ git clone https://github.com/euphoritech/euphoritech`
2. `$ cd euphoritech`
3. `$ npm install`
4. `$ npm run migrate`
5. `$ npm run dev`

In order to run the front-end app (VueJS) separately using a webpack dev server
and  hot reloader, open another terminal window and do the following:

6. `cd client`
7. `npm install`
8. `npm run dev`

When you've updated any front-end code and would like to build it for the app
to use when deploying, run the following within the `./client` directory:

9. `npm run build`

## Extensions

Extensions are optional pieces of code you can integrate with your euphoritech
instance to be executed whenever an event occurs like a new record being added/updated,
a record being linked to another, etc. Some examples of things you might want
to do when events are fired are write the event data to a database, push
data to an AWS S3 bucket, fire the event data to a webhook URL, etc. You
are limited only by your imagination when writing and using extensions.

[Example](https://github.com/euphoritech/euphoritech-extension-helloworld)

TODO
