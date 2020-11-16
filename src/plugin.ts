import * as chalk from 'chalk'
import * as path from 'path'
import { getFileList, delFile } from './utils'

export interface IOptions {
  rootPath: string[]
  test: RegExp
  isDel?: boolean
  output?: true | ((assets: string[]) => void)
  outputAssets?: boolean
}

const createPluginClass = (useAssets: Set<string>) => {
  return class {
    public options: IOptions
    public assets: Set<string>
    public assetsMap: { [key: string]: true } = {}

    constructor(options: IOptions) {
      this.options = options
      this.assets = useAssets

      useAssets.forEach((file: string) => {
        this.assetsMap[file] = true
      })
    }

    public apply(compiler: any) {
      compiler.plugin('shouldEmit', () => {
        const { outputAssets = false } = this.options
        return outputAssets
      })

      compiler.plugin('afterEmit', () => {
        this.outputAssets()
      })
    }

    public getAssets() {
      const { rootPath = [], test } = this.options
      const files: string[] = []
      rootPath.forEach((pathname) => {
        const list = getFileList(path.resolve(pathname))
        files.push(...list)
      })
      return files.filter((file) => test.test(file))
    }

    public outputAssets() {
      const { output, isDel } = this.options
      if (output) {
        const projectAssets = this.getAssets()
        const projectNoUseAssets = projectAssets.filter(
          (file) => !this.assetsMap[file],
        )
        if (isDel) {
          projectNoUseAssets.forEach((filename) => {
            if (delFile(filename)) {
              console.log(chalk.gray(`del file ${filename} success`))
            }
          })
        }
        if (typeof output === 'boolean') {
          if (projectNoUseAssets.length) {
            console.log(
              chalk.red('Project do not use assets list'),
              projectNoUseAssets,
            )
          } else {
            console.log(chalk.green('All assets is used'))
          }
        } else if (typeof output === 'function') {
          output(projectNoUseAssets)
        }
      }
    }
  }
}

export default createPluginClass
