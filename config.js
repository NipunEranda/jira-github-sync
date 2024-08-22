const config = {};

config.jira = {};
config.github = {};

// Jira DB
config.jira.mysqlCredentials = {
    'host': process.env.JIRA_MYSQL_HOSTNAME,
    'user': process.env.JIRA_MYSQL_USERNAME,
    'password': process.env.JIRA_MYSQL_PASSWORD,
    'database': process.env.JIRA_MYSQL_DATABASE,
};

config.jira.JIRA_BASIC_AUTHENTICATION_TOKEN = process.env.JIRA_TOKEN;

config.github.access_token = process.env.GITHUB_TOKEN;
config.github.github_org = process.env.GITHUB_ORG;

module.exports = config;