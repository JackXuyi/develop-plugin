import createPluginClass from './plugin'

const assets: Set<string> = new Set()

function Loader(content: any) {
  // @ts-ignore
  assets.add(this.resourcePath)
  return content
}

Loader.Plugin = createPluginClass(assets)

export default Loader
