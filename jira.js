const mysql = require('mysql2/promise');
const config = require('./config');
const axios = require('axios');

const axiosConfig = {
  headers: {
    'Authorization': 'Basic ' + config.jira.JIRA_BASIC_AUTHENTICATION_TOKEN,
    'Content-Type': 'application/json',
  },
};

exports.getJiraProjectIssues = async (project) => {
  try {
    const url = 'https://jira.typefi.com/rest/api/2/search?jql=project=' + project + ' AND status=open&maxResults=1000';
    const response = await axios.get(url, axiosConfig);
    return response.data.issues;
  } catch (e) {
    console.log(e);
    return null;
  }
}

exports.getJiraIssue = async (id) => {
  try{
    const url = `https://jira.typefi.com/rest/api/2/issue/${id}`;
    const response = await axios.get(url, axiosConfig);
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

exports.getJiraIssueAttachment = async (id) => {
  try{
    const url = `https://jira.typefi.com/rest/api/2/attachment/thumbnail/${id}`;
    const response = await axios.get(url, axiosConfig);
    return response.data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

// exports.getJiraAttachments = async (attachments) => {
//   let connection = null;
//   try {
//     connection = await mysql.createConnection(config.jira.mysqlCredentials);
//     const [files] = await connection.query(`SELECT * FROM jira.fileattachment WHERE issueid = '${attachments.issueId}'`);
//     console.log(files);
//     // await attachments.map(async (attachment, a) => {
//     //   console.log(files);
//     // });
//     return null;
//   } catch (e) {
//     console.log(e);
//     return null;
//   } finally {
//     if (connection) {
//       connection.end();
//     }
//   }
// }

// exports.getJiraProjects = async (project) => {
//     try {
//         if (!project) {
//             const url = 'https://jira.typefi.com/rest/api/2/project';
//             const axiosConfig = {
//                 headers: {
//                     'Authorization': 'Basic ' + config.jira.JIRA_BASIC_AUTHENTICATION_TOKEN,
//                     'Content-Type': 'application/json',
//                 },
//             };
//             const response = await axios.get(url, axiosConfig);
//             console.log(response.data);
//         } else {
//             const url = `https://jira.typefi.com/rest/api/2/project/${project}`;
//             const axiosConfig = {
//                 headers: {
//                     'Authorization': 'Basic ' + config.jira.JIRA_BASIC_AUTHENTICATION_TOKEN,
//                     'Content-Type': 'application/json',
//                 },
//             };
//             const response = await axios.get(url, axiosConfig);
//             console.log(response.data);
//         }
//     } catch (e) {
//         console.log(e);
//         return null;
//     }
// }