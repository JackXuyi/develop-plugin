interface ICheckPluginOptions {
  packages: string[]
  callback?: (noUsePackages: string[], usePackages: string[]) => void
}

class Plugin {
  private options: ICheckPluginOptions

  constructor(options: ICheckPluginOptions) {
    this.options = options
  }

  public apply = (compiler: any) => {
    compiler.plugin('emit', (compilation: any, callback: () => void) => {
      // 检索每个（构建输出的）chunk
      const packageArr: Set<string> = new Set()
      compilation.chunks.forEach((chunk: any) => {
        // 检索 chunk 中（内置输入的）的每个模块
        if (chunk._modules) {
          chunk._modules.forEach((module: any) => {
            // 检索模块中包含的每个源文件路径
            if (module.dependencies) {
              module.dependencies.forEach((file: any) => {
                // 检索 module 依赖
                if (file.request) {
                  packageArr.add(file.request)
                }
              })
            }
          })
        }
      })

      this.checkDependencies(packageArr)

      callback()
    })
  }

  private checkDependencies(useFiles: Set<string>) {
    const { packages, callback } = this.options
    if (packages && Array.isArray(packages)) {
      const noUsePackages = []
      const usePackages = []
      const str = Array.from(useFiles).join(',')
      for (const pack of packages) {
        if (str.indexOf(pack) > -1) {
          usePackages.push(pack)
        }
      }
      const map = usePackages.reduce(
        (prev: { [key: string]: boolean }, key: string) => {
          prev[key] = true
          return prev
        },
        {},
      )

      for (const pack in packages) {
        if (!map[pack]) {
          noUsePackages.push(pack)
        }
      }
      if (callback && typeof callback === 'function') {
        callback(noUsePackages, usePackages)
      } else {
        console.log('\n\nCheck packages success, result is ')
        console.log(
          '\nnoUsePackages',
          noUsePackages,
          '\nusePackages',
          usePackages,
        )
        console.log('\nPlease check package by handle again')
      }
    }
  }
}

export default Plugin
