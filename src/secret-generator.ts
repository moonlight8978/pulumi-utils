import { parse } from 'yaml'
import { program } from 'commander'
import fs from 'fs'
import shell from 'shelljs'

interface ProgramOptions {
  file: string
  stack: string
}
program.requiredOption('-f, --file <path>').requiredOption('-s, --stack <name>')

program.parse()

interface SecretNameToValue extends Record<string, string | { secure: string }> {}

const main = async () => {
  const options = program.opts<ProgramOptions>()
  const txt = fs.readFileSync(options.file)
  const secretNameToValue = parse(txt.toString()) as SecretNameToValue

  for (const entry of Object.entries(secretNameToValue)) {
    const [secretName, plainTextOrSecuredValue] = entry

    const parseValue = () => {
      if (typeof plainTextOrSecuredValue === 'string') {
        const plainTextValue = plainTextOrSecuredValue
        return {
          value: plainTextValue,
          isSecret: false,
        }
      } else {
        const plainTextValue = plainTextOrSecuredValue.secure
        return {
          value: plainTextValue,
          isSecret: true,
        }
      }
    }

    const { value, isSecret } = parseValue()
    const args = [
      'pulumi',
      'config',
      '-s',
      options.stack,
      'set',
      '--path',
      `secretNameToValue.${secretName}`,
      `"${value}"`,
      isSecret ? '--secret' : '--plaintext',
    ].filter(Boolean)

    const shellCommand = args.join(' ')

    console.log(shellCommand)
    shell.exec(shellCommand)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
