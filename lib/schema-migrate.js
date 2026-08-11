'use strict';

// 补齐对象顶层缺失字段，已有字段保持不变。
function ensureSchema(obj, defaults) {
  var target = obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
  var source = defaults && typeof defaults === 'object' && !Array.isArray(defaults) ? defaults : {};

  Object.keys(source).forEach(function(key) {
    if (typeof target[key] === 'undefined') target[key] = source[key];
  });
  return target;
}

var MIGRATIONS = [
  {
    from: 0,
    to: 1,
    up: function(obj) {
      obj.schemaVersion = 1;
      return obj;
    }
  }
];

// 从当前 schemaVersion 起依次执行可用迁移。
function migrate(obj) {
  var target = obj && typeof obj === 'object' && !Array.isArray(obj) ? obj : {};
  var version = Number(target.schemaVersion);
  var migrated = false;

  if (!Number.isInteger(version) || version < 0) version = 0;

  MIGRATIONS.forEach(function(migration) {
    if (version !== migration.from) return;
    target = migration.up(target) || target;
    target.schemaVersion = migration.to;
    version = migration.to;
    migrated = true;
  });

  return { obj: target, migrated: migrated };
}

// 创建标准节目对象，传入字段覆盖对应默认值。
function withDefaultProgram(partial) {
  var override = partial && typeof partial === 'object' && !Array.isArray(partial) ? partial : {};
  var defaults = {
    id: '',
    name: '',
    duration: 0,
    status: 'pending',
    tallyConfig: {
      enabled: false,
      roles: ['assistant'],
      leadSec: 0,
      trigger: 'on_active'
    }
  };

  var result = Object.assign({}, defaults, override);
  var tallyOverride = override.tallyConfig;
  result.tallyConfig = Object.assign({}, defaults.tallyConfig,
    tallyOverride && typeof tallyOverride === 'object' && !Array.isArray(tallyOverride) ? tallyOverride : {});
  return result;
}

module.exports = {
  ensureSchema: ensureSchema,
  MIGRATIONS: MIGRATIONS,
  migrate: migrate,
  withDefaultProgram: withDefaultProgram
};
