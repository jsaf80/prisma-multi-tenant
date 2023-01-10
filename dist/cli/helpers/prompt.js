import inquirer from 'inquirer';
import chalk from 'chalk';
const confirm = async (message) => {
    const { confirm } = await inquirer.prompt([
        {
            name: 'confirm',
            type: 'confirm',
            message,
            default: false,
        },
    ]);
    return confirm;
};
const askQuestion = async (question) => {
    if (question.value) {
        if (!question.choices || (question.choices && question.choices.includes(question.value))) {
            console.log(`  ${chalk.bold(`${question.message}`)} ${chalk.blueBright(`${question.value}`)}`);
            return question.value;
        }
    }
    return (await inquirer.prompt([question]))[question.name];
};
const askQuestions = async (questions) => {
    const answers = {};
    for await (const question of questions) {
        answers[question.name] = await askQuestion(question);
    }
    if (questions.filter((q) => !q.value).length > 0) {
        console.log();
        if (!(await confirm('Are you sure of your inputs?'))) {
            process.exit(0);
        }
    }
    return answers;
};
const managementConf = async (args) => {
    return askQuestions([
        {
            name: 'provider',
            message: 'Management database provider:',
            type: 'input',
            value: args.options.provider,
        },
        {
            name: 'url',
            message: 'Management database url:',
            type: 'input',
            value: args.options.url,
        },
    ]);
};
const tenantConf = async (args) => {
    return askQuestions([
        {
            name: 'name',
            message: 'Name of the tenant:',
            type: 'input',
            value: args.options.name,
        },
        {
            name: 'url',
            message: 'Database url:',
            type: 'input',
            value: args.options.url,
        },
    ]);
};
export default { confirm, managementConf, tenantConf };
