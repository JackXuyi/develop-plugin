import * as fs from 'fs'
import * as path from 'path'

/**
 * 是否是文件夹
 * @param pathname 文件或文件夹路径
 */
function isDir(pathname: string) {
  try {
    const state = fs.statSync(pathname)
    if (state.isFile()) {
      // 是文件
      return false
    } else if (state.isDirectory()) {
      return true
    }
  } catch (e) {
    return false
  }
  return false
}

/**
 * 删除文件
 * @param pathname 文件路径
 */
export function delFile(pathname: string) {
  try {
    fs.unlinkSync(pathname)
    return true
  } catch (e) {
    console.error(`del file ${pathname} error: `, e)
    return false
  }
}

/**
 * 获取当前路径下的所有文件
 * @param filePath 文件或文件夹路径
 */
export function getFileList(filePath: string) {
  if (!isDir(filePath)) {
    return [filePath]
  }

  const result: string[] = []
  // 根据文件路径读取文件，返回文件列表
  try {
    const files = fs.readdirSync(filePath)
    files.forEach((filename) => {
      //获取当前文件的绝对路径
      const dir = path.join(filePath, filename)
      if (isDir(dir)) {
        const temp = getFileList(dir)
        result.push(...temp)
      } else {
        result.push(dir)
      }
    })
  } catch (e) {
    console.error('fileDisplay error', e)
  }
  return result
}
