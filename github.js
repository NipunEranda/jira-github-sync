const axios = require('axios');
const config = require('./config');

const axiosConfig = {
    headers: {
        'Authorization': 'Bearer ' + config.github.access_token,
        'User-Agent': 'Central Station',
    },
};

// Get Repositories
exports.getRepos = async (repo) => {
    try {
        let repos = [];
        let response = null;
        let count = 1;
        do {
            if (!repo) {
                response = await axios.get(`https://api.github.com/orgs/${config.github.github_org}/repos?type=all&per_page=100&page=${count}`, axiosConfig);
                repos.push(...response.data);
            } else {
                response = await axios.get(`https://api.github.com/repos/${config.github.github_org}/${repo}?type=all&per_page=100&page=${count}`, axiosConfig);
                repos.push(response.data);
                break;
            }
            count++;
        } while (response.data.length != 0);
        return repos;
    } catch (e) {
        console.log(e);
        return [];
    }
}

// Get Project Issues
exports.getProjectIssues = async (repos) => {
    try {
        const projectIssues = {};
        await Promise.all(repos.map(async (repo) => {
            let response = null;
            let count = 1;
            do {
                response = await axios.get(`https://api.github.com/repos/${config.github.github_org}/${repo.name}/issues?per_page=100&page=${count}`, axiosConfig);
                if (response.data.length > 0) {
                    if (response.data.filter(i => !i.pull_request).length > 0) {
                        if (!projectIssues[repo.name])
                            projectIssues[repo.name] = [];
                        projectIssues[repo.name].push(...response.data);
                    }
                }
                count++;
            } while (response.data.length != 0);
        }));
        return projectIssues;
    } catch (e) {
        console.log(e);
        return [];
    }
};

exports.createGithubRepo = async (repoName, repoDescription) => {
    try {
        const response = await axios.post(`https://api.github.com/orgs/${config.github.github_org}/repos`, { "name": repoName, "description": repoDescription, "private": true, "has_issues": true, "has_projects": true }, axiosConfig);
        console.log(`${repoName} repository created`);
    } catch (e) {
        console.log(e);
        return null;
    }
}

exports.importAnIssue = async (repo, title, body, assignee, comments) => {
    try {
        //Issue
        const data = {
            "issue": {
                "title": title,
            }
        };

        //Body
        if (body)
            data["issue"]["body"] = body;
        else
            data["issue"]["body"] = "...";

        //Comments
        if (comments.length > 0) {
            data["comments"] = comments;
        }

        //Assignee
        if (assignee)
            data["issue"]["assignee"] = assignee;

        //Labels [TODO]

        await axios.post(`https://api.github.com/repos/${config.github.github_org}/${repo}/import/issues`,
            data,
            {
                headers: {
                    'Authorization': 'token ' + config.github.access_token,
                    'User-Agent': 'Central Station',
                }
            });
        console.log(`${title} issue created in ${repo} repository`);
        return 0;
    } catch (e) {
        console.log(e.response.data);
        return null;
    }
}

exports.createAnIssue = async (repo, title, body, assignee) => {
    try {
        await axios.post(`https://api.github.com/repos/${config.github.github_org}/${repo}/issues`, { "title": title, "body": body, "assignees": assignee }, axiosConfig);
        console.log(`${title} issue created in ${repo} repository`);
        return 0;
    } catch (e) {
        if (e.response.data.errors) {
            if (e.response.data.errors.filter(e => e.field == 'assignees').length > 0) {
                if (e.response.data.errors.filter(e => e.field == 'assignees')[0].code == 'invalid') {
                    console.log(`Add ${e.response.data.errors.filter(e => e.field == 'assignees')[0].value} as a contributor to the organization or to the repository`);
                }
            }
        }
        if (e.response.data.message) {
            console.log(e.response.data.message);
            const rateResponse = await axios.get(`https://api.github.com/rate_limit`, axiosConfig);
            return (new Date(rateResponse.data.rate.reset * 1000) - new Date());
        }
        return null;
    }
}