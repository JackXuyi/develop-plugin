import * as chalk from 'chalk'
import * as path from 'path'
import { getFileList, delFile } from './utils'

export interface IOptions {
  rootPath: string[]
  test: RegExp
  isDel?: boolean
  output?: true | ((assets: string[]) => void)
}

const createPluginClass = (useAssets: Set<string>) => {
  return class {
    public options: IOptions

    constructor(options: IOptions) {
      this.options = options
    }

    public apply(compiler: any) {
      compiler.plugin('done', () => {
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
        const useAssetsMap: { [key: string]: true } = {}
        useAssets.forEach((key) => (useAssetsMap[key] = true), {})
        const projectNoUseAssets = projectAssets.filter(
          (file) => !useAssetsMap[file],
        )
        if (isDel) {
          projectNoUseAssets.forEach((filename) => {
            if (delFile(filename)) {
              console.log(chalk.gray(`del file ${filename} success`))
            }
          })
        }
        if (typeof output === 'boolean') {
          console.log(
            chalk.red('Project do not use images list'),
            projectNoUseAssets,
          )
        } else if (typeof output === 'function') {
          output(projectNoUseAssets)
        }
      }
    }
  }
}

export default createPluginClass
