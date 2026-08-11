'use strict';

var fs = require('fs');
var path = require('path');

// 安全读取 JSON；文件不存在或内容无效时返回默认值。
function readJsonSafe(filePath, defaults) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    if (error && error.code !== 'ENOENT') {
      console.error('[storage-safe] 读取 JSON 失败：' + filePath, error.message);
    }
    return defaults;
  }
}

// 先写同目录临时文件，再原子替换目标文件。
function writeJsonAtomic(filePath, data) {
  var directory = path.dirname(filePath);
  var temporaryPath = path.join(directory, '.' + path.basename(filePath) + '.tmp');

  try {
    fs.writeFileSync(temporaryPath, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(temporaryPath, filePath);
    return { ok: true };
  } catch (error) {
    try {
      fs.unlinkSync(temporaryPath);
    } catch (cleanupError) {
      if (!cleanupError || cleanupError.code !== 'ENOENT') {
        console.error('[storage-safe] 清理临时文件失败：' + temporaryPath, cleanupError.message);
      }
    }
    return { ok: false, error: error };
  }
}

// 使用 JSON 序列化深拷贝；失败时保留原对象。
function deepClone(obj) {
  try {
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    return obj;
  }
}

module.exports = {
  readJsonSafe: readJsonSafe,
  writeJsonAtomic: writeJsonAtomic,
  deepClone: deepClone
};
