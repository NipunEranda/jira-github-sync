const github = require('./github');
const jira = require('./jira');
const config = require('./config');
const axios = require('axios');

exports.start = async (custom_jira, custom_github) => {
    try {
        const github_jira = {};
        const jira_users = [
            { 'JIRAUSER12701': 'gwijesinghe@typefi.com' },
            { 'JIRAUSER12801': 'hmaduwanthi@typefi.com' },
            { 'JIRAUSER12903': 'csilva@typefi.com' },
            { 'JIRAUSER12704': 'nkottege@typefi.com' },
            { 'JIRAUSER12705': 'mmuthumala@typefi.com' },
            { 'JIRAUSER12707': 'jthilakarathna@typefi.com' },
            { 'JIRAUSER12800': 'namarasekara@typefi.com' },
            { 'JIRAUSER13002': 'kabeysinghe@typefi.com' },
            { 'JIRAUSER12902': 'shettiarachchi@typefi.com' },
            { 'JIRAUSER12700': 'njayasekara@typefi.com' },
            { 'JIRAUSER13001': 'jwanniarachchi@typefi.com' }
        ];

        const github_users = [
            { 'abates@typefi.com': 'abates-typefi' },
            { 'asanjeewani@typefi.com': 'asanjeewani' },
            { 'awickramarathna@typefi.com': 'AWickramarathna' },
            { 'awimalasooriya@typefi.com': 'awimalasooriya' },
            { 'bhauser@typefi.com': 'benhauser' },
            { 'bvale@typefi.com': 'BenVale' },
            { 'bsiripala@typefi.com': 'BuddhiSiripala' },
            { 'cclauset@typefi.com': 'cclauset' },
            { 'csilva@typefi.com': 'ChamariSilva' },
            { 'chausler@typefi.com': 'cjhausler' },
            { 'cperera@typefi.com': 'cpereraTypefi' },
            { 'cuduwana@typefi.com': 'cuduwana' },
            { 'dgibbs@typefi.com': 'damian-za' },
            { 'damarasekara@typefi.com': 'dinesh-amarasekara' },
            { 'dsamarajeewa@typefi.com': 'dsamarajeewa' },
            { 'gudeshani@typefi.com': 'Gayanthika' },
            { 'gvanderkolk@typefi.com': 'GuyvanderKolk' },
            { 'hmaduwanthi@typefi.com': 'HimashaM' },
            { 'shettiarachchi@typefi.com': 'JayamalHettiarachchi' },
            { 'jwanniarachchi@typefi.com': 'jetWanni' },
            { 'jmitchell@typefi.com': 'JMITCHELLTYPEFI' },
            { 'jthilakarathna@typefi.com': 'jthilakarathna' },
            { 'kmadushika@typefi.com': 'KalpaniMadhushika' },
            { 'kprentice@typefi.com': 'KatePrentice' },
            { 'mmuthumala@typefi.com': 'maheshamuthumala' },
            { 'mzhaloba@typefi.com': 'MaxZhalobaTypefi' },
            { 'mgollentz@typefi.com': 'mgollentz' },
            { 'nkottege@typefi.com': 'Nimeshkottege' },
            { 'namarasekara@typefi.com': 'NipunEAmarasekara' },
            { 'njayasekara@typefi.com': 'njayasekara' },
            { 'nperera@typefi.com': 'nperera-typefi' },
            { 'pkahrel@typefi.com': 'PKahrel' },
            { 'kabeysinghe@typefi.com': 'PrashanAbeysinghe' },
            { 'skamble@typefi.com': 'snkamble' },
            { 'tgonzales@typefi.com': 'tgonzales-typefi' },
            { 'ejohnston@typefi.com': 'typefi-emily' },
            { 'gwijesinghe@typefi.com': 'typefi-gayan' },
            { 'rperera@typefi.com': 'TypefiRPerera' },
            { 'udissanayake@typefi.com': 'uthpali11111' },
            { 'vvladila@typefi.com': 'vamitul' },
            { 'wryals@typefi.com': 'willryals-typefi' }
        ];


        if (custom_jira && custom_github) {

            const jiraIssues = await jira.getJiraProjectIssues(custom_jira);
            const repository = await github.getRepos(custom_github);

            if (jiraIssues.length > 0 && repository.length > 0) {
                github_jira[custom_jira] = {};
                github_jira[custom_jira].repository = repository[0];
                let counter = 1;

                const issues = (await github.getProjectIssues(repository))[repository[0].name];

                // // await jira.getJiraAttachments(jiraIssues[2].id);
                // const jiraIssueFull = await jira.getJiraIssue(jiraIssues[2].id);

                // // Issue attachments
                // jiraIssueFull.fields.attachment.map(async (attachment, a) => {
                //     console.log(attachment);
                //     // const data = await jira.getJiraIssueAttachment(attachment.id);
                //     // console.log(data);
                // })

                await Promise.all(jiraIssues.map(async (issue, i) => {
                    const user = issue.fields.assignee.emailAddress ? github_users.filter(u => Object.keys(u)[0] == issue.fields.assignee.emailAddress)[0][Object.keys(github_users.filter(u => Object.keys(u)[0] == issue.fields.assignee.emailAddress)[0])[0]] : null;
                    const create = issues ? ((issues.filter(i => i.title.split(":")[0].localeCompare(`issue/${issue.key}`, undefined, { sensitivity: 'base' }) == 0).length == 0) ? true : false) : true;
                    if (create) {
                        let description = '', comments = [];
                        if (issue.fields.description) {
                            description = transform(issue.fields.description);
                        }

                        //Comments
                        const issueFull = await jira.getJiraIssue(issue.id);

                        await Promise.allSettled(issueFull.fields.comment.comments.map(async c => {
                            let temp = `From: [${c.author.displayName}](${c.author.emailAddress})\n\n`;
                            temp += transform(c.body);
                            if (temp != "") {
                                // let owner = github_users.filter(u => Object.keys(u)[0] == c.author.emailAddress)[0] ? github_users.filter(u => Object.keys(u)[0] == c.author.emailAddress)[0][Object.keys(github_users.filter(u => Object.keys(u)[0] == c.author.emailAddress)[0])[0]] : null;
                                // let userResponse = await axios.get(`https://api.github.com/users/${owner}`, {
                                //     headers: {
                                //         'Authorization': 'token ' + config.github.access_token,
                                //         'User-Agent': 'Central Station',
                                //     }
                                // });

                                const data = {};
                                data["body"] = temp;
                                data["created_at"] = new Date(c.created).toISOString();
                                comments.push(data);
                            }
                        }));

                        // await github.importAnIssue(custom_github, `issue/${issue.key}: ${issue.fields.summary}`, description, user ? user : null, comments);


                        // For Testing
                        await github.importAnIssue(custom_github, `issue/${issue.key}: ${issue.fields.summary}`, description, null, comments);
                    }
                }));

                // var size = 5; var arrayOfArrays = [];
                // for (var i = 0; i < jiraIssues.length; i += size) {
                //     arrayOfArrays.push(jiraIssues.slice(i, i + size));
                // }

                // for (array of arrayOfArrays) {
                //     let success = false;
                //     do {
                //         if (array.length > 0) {
                //             Promise.all(array.map(async (issue, i) => {
                //                 console.log(`Issue: ${issue.fields.summary}`);
                //                 const user = issue.fields.assignee.emailAddress ? github_users.filter(u => Object.keys(u)[0] == issue.fields.assignee.emailAddress)[0][Object.keys(github_users.filter(u => Object.keys(u)[0] == issue.fields.assignee.emailAddress)[0])[0]] : null;
                //                 const create = issues ? ((issues.filter(i => i.title.split(":")[0] == `issue/${issue.key}`).length == 0) ? true : false) : true;
                //                 console.log(create);
                //                 // if (create) {
                //                 //     let description = '', comments = [];
                //                 //     if (issue.fields.description) {
                //                 //         description = transform(issue.fields.description);
                //                 //     }

                //                 //     //Comments
                //                 //     const issueFull = await jira.getJiraIssue(issue.id);

                //                 //     issueFull.fields.comment.comments.forEach(c => {
                //                 //         comments.push({
                //                 //             "body": transform(c.body)
                //                 //         });
                //                 //     });

                //                 //     // console.log(description);
                //                 //     const w = await github.importAnIssue(custom_github, `issue/${issue.key}: ${issue.fields.summary}`, description, [], comments);
                //                 //     // // const w = await github.createAnIssue(custom_github, issue.fields.summary, description, []);
                //                 //     // //const w = await github.createAnIssue(custom_github, issue.fields.summary, description, user ? [user] : []);
                //                 //     console.log((w / 60000).toFixed(2) + ' minutes');
                //                 //     await sleep((w / 4) + 1000);
                //                 // }
                //             })).then(() => success = true).catch(() => success = false);
                //         }
                //     } while (success);
                // }
            }

        } else {
            // const githubRepositories = await github.getRepos();
            // const jiraProjects = await jira.getJiraProjects();

            // jiraProjects.map(project => {
            //     if (githubRepositories.filter(r => r.name == project.pname)[0]) {
            //         if (!github_jira[project.pname])
            //             github_jira[project.pname] = {};
            //         github_jira[project.pname].repository = githubRepositories.filter(r => r.name == project.pname)[0];
            //         github_jira[project.pname].jira = project;
            //     } else
            //         jira_project_without_repo.push(project);
            // });

            // // if jira_project_without_repo.length is not 0
            // jira_project_without_repo.forEach(async p => {
            //     await github.createGithubRepo(p.pname, p.DESCRIPTION);
            //     await sleep(2);
            // });

            // const issues = await jira.getJiraIssues(github_jira, ['cms', 'central-station']);
        }
        return;
    } catch (e) {
        console.log(e);
    }

};

function getSubstring(str, char1, char2) {
    return str
        .split(char1)
        .slice(1)
        .join('')
        .split(char2)
        .slice(0, -1)
        .join('');
}

function countString(str, letter) {
    let count = 0;

    // looping through the items
    for (let i = 0; i < str.length; i++) {

        // check if the character is at that position
        if (str.charAt(i) == letter) {
            count += 1;
        }
    }
    return count;
}

function transform(input) {
    let counter = null, skip = [], tableStart = null, columns = '', description = '';
    input.split("\n").forEach((line, l) => {
        // if (line.split('!').length != 3) {
        line = line.replace(/!.*.png|\!.*.jpg|\!.*.jpeg|\|[\w=]*,[\w=]*|!/g, "");
        // description += line

        if (line.split("*").length == 2)
            line = line.replace(/\*\\*/g, "-")

        if ((line.split("[").length == 2) && (line.split("]").length == 2) && !line.includes('|')) {
            const subString = getSubstring(line, "[", "]");
            line = line.split("[")[0] + `[${subString}](${subString})` + line.split("]")[1];
        }

        if ((line.split("[").length == 2) && (line.split("]").length == 2) && line.includes('|')) {
            const subString = getSubstring(line, "[", "]");
            line = line.split("[")[0] + `[${subString.split("|")[0]}](${subString.split("|")[1] ? subString.split("|")[1] : subString.split("|")[0]})` + line.split("]")[1];
        }

        if (line.split("")[0] == "|") {
            // console.log(line);
            if (!tableStart)
                tableStart = l;
            if (!(input.split("\n")[l - 1].split("")[0] == "|") && !input.split("\n")[l - 1].includes("|") && input.split("\n")[l + 1].split("")[0] == "|") {
                //Table Header
                line = line.replace(/\n/g, "\r")
            }
            if (input.split("\n")[l + 1]) {
                if (input.split("\n")[l - 1].split("")[0] == "|" && input.split("\n")[l + 1].split("")[0] == "|") {
                    //Table Body
                }
            }
            if (input.split("\n")[l + 1]) {
                if (input.split("\n")[l + 1].split("")[0] != "|" || input.split("\n")[l - 1].includes("|")) {
                    //Last Row
                }
            }

            if (line.split("")[line.split("").length - 1] != "\n" && line.split("")[line.split("").length - 2] != "|") {
                //Line broken row
                counter = 1;
                let text = line.replace("\r", "").replace("\n", "");
                while (true) {
                    if (input.split("\n")[l + counter]) {
                        text += ` ${input.split("\n")[l + counter].replace("\r", "").replace("\n", "")}`;
                        if ((input.split("\n")[l + counter].split("")[input.split("\n")[l + counter].split("").length - 1] == "\r" && input.split("\n")[l + counter].split("")[input.split("\n")[l + counter].split("").length - 2] == "|")) {
                            skip.push(l + counter);
                            break;
                        }
                        skip.push(l + counter);
                        counter++;
                    } else
                        break;
                }
                line = text;
            }
        }else if(line.trim().split("").length == 0){
            tableStart = null;
            columns = '';
        }

        if (!skip.includes(l)) {
            line = line.replace(/# # /g, "- ");
            line = line.replace(/{{/g, "`")
            line = line.replace(/}}/g, "`")
            line = line.replace(/\**\*/g, "**");
            line = line.replace(/\*\* [a-zA-Z0-9]+/g, "  - ").replace(/\*\*\* [a-zA-Z0-9]+/g, "    - ");
            // line = line.replace(//)

            //Handling nested content
            line = line.replace(/### /g, "    - ")
            line = line.replace(/## /g, "  - ")
            line = line.replace(/# /g, "- ");

            //Handle tables
            line = line.replace(/\|\|/g, "|");

            line = line.replace(/~/g, "");

            //Handling code formattings
            line = line.replace(/{code:.*}/g, "```");
            line = line.replace(/{code}/g, "```");

            //Remove No formatting segment
            line = line.replace(/{noformat}/g, "");

            //Text colorings
            line = line.replace(/-{color:[#A-Za-z0-9]+}/g, "$\\color{#FF0000}{\\textsf{").replace(/{color}-/g, "}}$");
            line = line.replace(/\.{color:[#A-Za-z0-9]+}/g, "$\\color{#FF0000}{\\textsf{.").replace(/{color}/g, "}}$").replace();
            line = line.replace(/{color:[#A-Za-z0-9]+}/g, "$\\color{#FF0000}{\\textsf{").replace(/{color}/g, "}}$");

            //Handle headings
            line = line.replace(/<h1>/g, "\\<h1>\\").replace(/<h2>/g, "\\<h2>\\").replace(/<h3>/g, "\\<h3>\\").replace(/<h4>/g, "\\<h4>\\").replace(/<h5>/g, "\\<h5>\\").replace(/<h6>/g, "\\<h6>\\");
            line = line.replace(/h\d\./g, "###");

            // //Custom Handle for underline formattings

            // // Explaination
            // // (\s|^|\**|\~~|\?\?|*)* => Can only be a space | ** | ~~ | ??
            // array = line.match(/(\s|^|\**|\~~|\?\?|\*)*\+[w+\s]+\+(\s|\**|\~~|\?\?|\*|)*/g);
            // if (array) {
            //     array.forEach((value, v) => { array[v] = value.replace(/\+*\+/g, ""); });

            //     array.forEach(a => {
            //         line = line.replace(/\+[w+]+\+/, `<ins>${a}</ins>`);
            //     });
            // }

            //Custom level formatting for **+test+**
            // //let text = "**+balance columns checked+**"
            // let text = "Link from wiki: https://wiki.typefi.com/display/TYPEFI/Preventing+Main+story+frame+is+overset+error+with+missing+images";

            // // text = text.split(/\+*\+/g).filter(t => t !== '');
            // // text = text.replace(/\+[a-zA-Z0-9]+\+/g, "");

            // //array = text.match(/(\s|^)\+[a-zA-Z0-9]+\+(\s|)/g);
            // array = text.match(/(\s|^|\**)\+[a-zA-Z0-9\s]+\+(\s|\**|)/g);

            // /* if(array){
            //   array.forEach((value, v) => { array[v] = value.replace(/\+*\+/g, "").replace(/\**\*\*g, "")
            //   });

            //   array.forEach(a => {
            //     text = text.replace(/\+[a-zA-Z0-9\s]+\+/, `_${a.trim()}_`);
            //   });
            // } */

            // console.log(array);
            // /* console.log(text); */

            //Configure table header
            if (l == tableStart) {
                for (let i = 0; i < countString(line, '|') - 1; i++) {
                    columns += '| --- ';
                }
                columns = columns + "|\n";
            }

            description += `${line}\n${l == tableStart ? columns : ''}`;
        }
        // }
    });

    return description;
}