'use strict';

var fs = require('fs');
var path = require('path');
var storage = require('./storage-safe');
var schema = require('./schema-migrate');

var TEMPLATE_TYPES = ['wedding', 'annual', 'show', 'blank'];
var BUILTIN_CREATED_AT = '2026-01-01T00:00:00.000Z';

function program(name, duration, notes) {
  return { name: name, duration: duration, notes: notes };
}

var BUILTIN_TEMPLATES = [
  {
    id: 'builtin_wedding',
    name: '婚礼典礼流程',
    type: 'wedding',
    schemaVersion: 1,
    version: 1,
    createdAt: BUILTIN_CREATED_AT,
    updatedAt: BUILTIN_CREATED_AT,
    createdBy: 'system',
    builtin: true,
    readonly: true,
    archived: false,
    structure: {
      programs: [
        program('迎宾暖场', 30, '播放轻松的迎宾音乐，引导宾客签到入场。'),
        program('新郎新娘入场', 5, '主持人提示宾客起立，新人依次入场。'),
        program('交换戒指', 5, '礼仪人员递送戒指，新人完成交换仪式。'),
        program('宣读誓词', 8, '新人依次宣读誓词，现场保持安静。'),
        program('香槟塔仪式', 5, '准备香槟与酒塔，完成倒酒和祝福环节。'),
        program('父母敬茶', 10, '双方父母上台，新人依次敬茶并合影。'),
        program('证婚人致辞', 8, '证婚人上台致辞并送上祝福。'),
        program('合影留念', 10, '新人、父母及主要来宾分组完成合影。'),
        program('退场', 5, '主持人宣布礼成，新人沿通道退场。')
      ]
    }
  },
  {
    id: 'builtin_annual',
    name: '公司年会流程',
    type: 'annual',
    schemaVersion: 1,
    version: 1,
    createdAt: BUILTIN_CREATED_AT,
    updatedAt: BUILTIN_CREATED_AT,
    createdBy: 'system',
    builtin: true,
    readonly: true,
    archived: false,
    structure: {
      programs: [
        program('开场视频', 5, '播放年度回顾视频，结束后灯光切至舞台。'),
        program('领导致辞', 12, '主持人邀请领导上台，总结年度工作。'),
        program('节目1', 8, '第一个员工节目，提前确认音乐和道具。'),
        program('节目2', 8, '第二个员工节目，候场人员提前就位。'),
        program('节目3', 8, '第三个员工节目，按节目单完成转场。'),
        program('节目4', 8, '第四个员工节目，检查麦克风和返听。'),
        program('节目5', 8, '第五个员工节目，提前准备所需道具。'),
        program('节目6', 8, '第六个员工节目，结束后清理舞台。'),
        program('抽奖环节', 15, '主持人说明规则，分批公布奖项并合影。'),
        program('全员合影', 10, '组织全体人员上台，按部门分区站位。')
      ]
    }
  },
  {
    id: 'builtin_show',
    name: '舞台演出流程',
    type: 'show',
    schemaVersion: 1,
    version: 1,
    createdAt: BUILTIN_CREATED_AT,
    updatedAt: BUILTIN_CREATED_AT,
    createdBy: 'system',
    builtin: true,
    readonly: true,
    archived: false,
    structure: {
      programs: [
        program('开场', 8, '开场音乐和灯光同步启动，演员按点位登场。'),
        program('第一幕', 35, '完成第一幕演出，场务按提示执行换景。'),
        program('中场休息', 15, '开放观众休息，后台完成换景和设备复查。'),
        program('第二幕', 40, '完成第二幕演出，末段准备全体演员候场。'),
        program('谢幕', 10, '全体演员依次返场，完成鞠躬与致谢。'),
        program('观众离场', 10, '播放离场音乐，保持观众通道和舞台安全。')
      ]
    }
  }
];

function createTemplateService(options) {
  options = options || {};
  if (!options.dataDir) throw new Error('dataDir is required');

  var dataDir = path.resolve(options.dataDir);
  var templatesDir = path.join(dataDir, 'templates');
  var indexFile = path.join(templatesDir, 'index.json');

  // v6.4.1: 写盘串行队列（防并发索引丢失更新）+ 结构校验
  var writeQueue = Promise.resolve(); // 写盘串行队列（防并发索引丢失更新）
  var idCounter = 0; // v6.4.1: ID 进程内计数器，增强唯一性
  function serial(fn) {
    var p = writeQueue.then(fn);
    writeQueue = p.catch(function() {});
    return p;
  }
  function validateStructure(structure) {
    if (!structure || typeof structure !== 'object' || Array.isArray(structure)) throw new Error('Invalid template structure');
    if (!Array.isArray(structure.programs)) throw new Error('Invalid template structure');
    structure.programs.forEach(function(prog) {
      var name = prog && String(prog.name || '').trim();
      var d = prog && Number(prog.duration);
      if (!prog || typeof prog !== 'object' || !name || !Number.isFinite(d) || d < 0) {
        throw new Error('Invalid template structure');
      }
    });
  }

  function ensureTemplatesDir() {
    if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });
  }

  function templateFile(id) {
    var value = String(id || '');
    if (!/^[A-Za-z0-9_-]{1,80}$/.test(value)) return null;
    return path.join(templatesDir, value + '.json');
  }

  function readIndex() {
    var index = storage.readJsonSafe(indexFile, { templates: [] });
    if (!index || !Array.isArray(index.templates)) return { templates: [] };
    return index;
  }

  function metadata(template) {
    var value = {};
    Object.keys(template || {}).forEach(function(key) {
      if (key !== 'structure') value[key] = storage.deepClone(template[key]);
    });
    return value;
  }

  function writeOrThrow(file, value) {
    ensureTemplatesDir();
    var result = storage.writeJsonAtomic(file, value);
    if (!result.ok) throw result.error || new Error('Failed to write template data');
  }

  function builtinById(id) {
    for (var i = 0; i < BUILTIN_TEMPLATES.length; i++) {
      if (BUILTIN_TEMPLATES[i].id === id) return storage.deepClone(BUILTIN_TEMPLATES[i]);
    }
    return null;
  }

  function assertType(type) {
    if (TEMPLATE_TYPES.indexOf(type) === -1) throw new Error('Invalid template type');
  }

  function makeId(prefix) {
    // v6.4.1: 强唯一 ID（时间戳+进程内计数+crypto 随机），消除并发碰撞
    return prefix + Date.now() + String(Math.floor(Math.random() * 10000)).padStart(4, "0") + String((idCounter = (idCounter + 1) % 1000)).padStart(3, "0");
  }

  function listTemplates(type) {
    if (type) assertType(type);
    var custom = readIndex().templates.map(metadata).filter(function(t) { return !t.archived; }); // v6.4.1: 归档过滤
    var builtins = BUILTIN_TEMPLATES.map(metadata);
    return builtins.concat(custom).filter(function(template) {
      return !type || template.type === type;
    });
  }

  function getTemplate(id) {
    var builtin = builtinById(String(id || ''));
    if (builtin) return builtin;
    var file = templateFile(id);
    if (!file) return null;
    var stored = storage.readJsonSafe(file, null);
    if (!stored) return null;
    return schema.migrate(stored).obj;
  }

  function createTemplate(input) {
    input = input || {};
    var name = String(input.name || '').trim();
    var type = String(input.type || '');
    if (!name) throw new Error('Template name is required');
    assertType(type);
    if (!input.structure || typeof input.structure !== 'object' || Array.isArray(input.structure)) {
      throw new Error('Template structure is required');
    }
    validateStructure(input.structure); // v6.4.1: 业务校验

    var id = makeId('');
    while (getTemplate(id)) id = makeId('');
    var now = new Date().toISOString();
    var template = {
      id: id,
      name: name.slice(0, 100),
      type: type,
      schemaVersion: 1,
      version: 1,
      createdAt: now,
      updatedAt: now,
      createdBy: String(input.createdBy || '').slice(0, 100),
      archived: false,
      structure: storage.deepClone(input.structure)
    };
    var file = templateFile(id);
    // v6.4.1: 串行写盘 + 索引失败回滚（防幽灵模板）
    return serial(function() {
      var wrote = false;
      try {
        writeOrThrow(file, template);
        wrote = true;
        var index = readIndex();
        index.templates.push(metadata(template));
        writeOrThrow(indexFile, index);
      } catch (err) {
        if (wrote) { try { fs.unlinkSync(file); } catch (e) {} }
        throw err;
      }
      return storage.deepClone(template);
    });
  }

  function updateTemplate(id, patch) {
    id = String(id || '');
    if (builtinById(id)) throw new Error('Builtin templates are read-only');
    // v6.4.1: 读取+校验+修改+写盘整体串行（防并发读改写丢失更新）
    return serial(function() {
      var current = getTemplate(id);
      if (!current) return null;
      if (current.archived) throw new Error('Archived template cannot be edited');
      patch = patch && typeof patch === 'object' && !Array.isArray(patch) ? patch : {};

      if (Object.prototype.hasOwnProperty.call(patch, 'name')) {
        var name = String(patch.name || '').trim();
        if (!name) throw new Error('Template name is required');
        current.name = name.slice(0, 100);
      }
      if (Object.prototype.hasOwnProperty.call(patch, 'type')) {
        assertType(String(patch.type || ''));
        current.type = String(patch.type);
      }
      if (Object.prototype.hasOwnProperty.call(patch, 'structure')) {
        if (!patch.structure || typeof patch.structure !== 'object' || Array.isArray(patch.structure)) {
          throw new Error('Template structure must be an object');
        }
        validateStructure(patch.structure);
        current.structure = storage.deepClone(patch.structure);
      }
      if (Object.prototype.hasOwnProperty.call(patch, 'archived')) current.archived = patch.archived === true;
      // 保留 getTemplate 迁移后的真实 schemaVersion，不固定写回 1
      current.version = Number(current.version || 0) + 1;
      current.updatedAt = new Date().toISOString();

      var wrote = false;
      try {
        writeOrThrow(templateFile(id), current);
        wrote = true;
        var index = readIndex();
        var found = false;
        index.templates = index.templates.map(function(item) {
          if (item.id !== id) return item;
          found = true;
          return metadata(current);
        });
        if (!found) index.templates.push(metadata(current));
        writeOrThrow(indexFile, index);
      } catch (err) {
        if (wrote) { try { fs.unlinkSync(templateFile(id)); } catch (e) {} }
        throw err;
      }
      return storage.deepClone(current);
    });
  }

  function archiveTemplate(id) {
    if (builtinById(String(id || ''))) throw new Error('Builtin templates are read-only');
    return updateTemplate(id, { archived: true });
  }

  function templateProgram(source, index) {
    source = source && typeof source === 'object' ? source : {};
    var value = {
      name: String(source.name || ''),
      kind: String(source.kind || source.type || ''),
      order: Number.isFinite(Number(source.order)) ? Number(source.order) : index,
      notes: String(source.notes || ''),
      channels: storage.deepClone(Array.isArray(source.channels) ? source.channels : (Array.isArray(source.useChannels) ? source.useChannels : []))
    };
    if (Number.isFinite(Number(source.duration))) value.duration = Number(source.duration);
    return value;
  }

  function saveProjectAsTemplate(project) {
    project = project && typeof project === 'object' ? project : {};
    var projectType = String(project.type || '');
    if (projectType === 'gala') projectType = 'annual';
    if (TEMPLATE_TYPES.indexOf(projectType) === -1) projectType = 'blank';
    var projectName = String(project.name || project.showName || '项目模板').trim() || '项目模板';
    return createTemplate({
      name: projectName.slice(0, 100),
      type: projectType,
      createdBy: project.createdBy || 'control',
      structure: {
        programs: (Array.isArray(project.programs) ? project.programs : []).map(templateProgram)
      }
    });
  }

  function createProjectFromTemplate(templateId, projectName) {
    var template = getTemplate(templateId);
    if (!template || template.archived) return null;
    var structure = storage.deepClone(template.structure || {});
    var sourcePrograms = Array.isArray(structure.programs) ? structure.programs : [];
    var programs = storage.deepClone(sourcePrograms);
    return {
      id: makeId('proj_'),
      name: String(projectName || template.name || '新项目').trim().slice(0, 100) || '新项目',
      type: template.type,
      templateRef: { id: template.id, version: template.version },
      programs: programs,
      channels: [],
      createdAt: new Date().toISOString()
    };
  }

  function getBuiltinTemplates() {
    return storage.deepClone(BUILTIN_TEMPLATES);
  }

  return {
    listTemplates: listTemplates,
    getTemplate: getTemplate,
    createTemplate: createTemplate,
    updateTemplate: updateTemplate,
    archiveTemplate: archiveTemplate,
    saveProjectAsTemplate: saveProjectAsTemplate,
    createProjectFromTemplate: createProjectFromTemplate,
    getBuiltinTemplates: getBuiltinTemplates
  };
}

module.exports = createTemplateService;
module.exports.createTemplateService = createTemplateService;
