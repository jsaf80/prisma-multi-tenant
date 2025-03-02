import inquirer, { Question } from 'inquirer'
import chalk from 'chalk'
import { Datasource } from '../../index.js'
import { CommandArguments } from '../types.js'

const confirm = async (message: string): Promise<boolean> => {
  const { confirm } = await inquirer.prompt([
    {
      name: 'confirm',
      type: 'confirm',
      message,
      default: false,
    },
  ])
  return confirm
}

const askQuestion = async (
  question: Question & { name: string; choices?: string[]; value: string }
) => {
  if (question.value) {
    if (!question.choices || (question.choices && question.choices.includes(question.value))) {
      console.log(`  ${chalk.bold(`${question.message}`)} ${chalk.blueBright(`${question.value}`)}`)
      return question.value
    }
  }

  return (await inquirer.prompt([question]))[question.name]
}

const askQuestions = async (
  questions: (Question & { name: string; choices?: string[]; value: string })[]
) => {
  const answers: { [name: string]: string } = {}

  for await (const question of questions) {
    answers[question.name] = await askQuestion(question)
  }

  // If we needed manual prompting, ask for confirmation
  if (questions.filter((q) => !q.value).length > 0) {
    console.log()

    if (!(await confirm('Are you sure of your inputs?'))) {
      process.exit(0)
    }
  }

  return answers as unknown as Datasource
}

const managementConf = async (
  args: CommandArguments
): Promise<{ provider?: string; url: string }> => {
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
  ])
}

const tenantConf = async (args: CommandArguments): Promise<{ name: string; url: string }> => {
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
  ])
}

export default { confirm, managementConf, tenantConf }
