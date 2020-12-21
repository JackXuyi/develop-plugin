import createPluginClass from './plugin'
import PackageCheckPlugin from './packageCheck'

const assets: Set<string> = new Set()

function Loader(content: any) {
  // @ts-ignore
  assets.add(this.resourcePath)
  return content
}

Loader.Plugin = createPluginClass(assets)
Loader.PackageCheckPlugin = PackageCheckPlugin

export default Loader

module.exports = Loader
