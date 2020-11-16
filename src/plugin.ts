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
    public files: Set<string>

    constructor(options: IOptions) {
      this.options = options
      this.assets = useAssets
      this.files = new Set()

      this.getAssets()
    }

    public apply(compiler: any) {
      compiler.plugin('shouldEmit', () => {
        const { outputAssets = false } = this.options
        return outputAssets
      })

      compiler.plugin('done', () => {
        // 遍历使用的文件
        this.assets.forEach((file: string) => {
          this.assetsMap[file] = true
        })
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
      files.forEach((file) => {
        if (test.test(file)) {
          this.files.add(file)
        }
      })
    }

    public outputAssets() {
      const { output, isDel } = this.options
      if (output) {
        const projectNoUseAssets: string[] = []
        this.files.forEach((file) => {
          if (!this.assetsMap[file]) {
            projectNoUseAssets.push(file)
          }
        })
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
              chalk.yellow(
                `${chalk.red(
                  projectNoUseAssets.length,
                )} files do not use, list is `,
              ),
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
