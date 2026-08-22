// stage-manager-standalone.js - 舞台流程表独立服务器
// 内嵌 HTML 和 ws 模块，tess 文件从同目录读取

var http = require("http");
var fs = require("fs");
var path = require("path");
var os = require("os");
var dgram = require("dgram");
var crypto = require("crypto");
var childProcess = require("child_process");
var StageCore = require("./stage-core.js");
var __WS_FILES = {"index.js":"'use strict';\n\nconst createWebSocketStream = require('./lib/stream');\nconst extension = require('./lib/extension');\nconst PerMessageDeflate = require('./lib/permessage-deflate');\nconst Receiver = require('./lib/receiver');\nconst Sender = require('./lib/sender');\nconst subprotocol = require('./lib/subprotocol');\nconst WebSocket = require('./lib/websocket');\nconst WebSocketServer = require('./lib/websocket-server');\n\nWebSocket.createWebSocketStream = createWebSocketStream;\nWebSocket.extension = extension;\nWebSocket.PerMessageDeflate = PerMessageDeflate;\nWebSocket.Receiver = Receiver;\nWebSocket.Sender = Sender;\nWebSocket.Server = WebSocketServer;\nWebSocket.subprotocol = subprotocol;\nWebSocket.WebSocket = WebSocket;\nWebSocket.WebSocketServer = WebSocketServer;\n\nmodule.exports = WebSocket;\n","browser.js":"'use strict';\n\nmodule.exports = function () {\n  throw new Error(\n    'ws does not work in the browser. Browser clients must use the native ' +\n      'WebSocket object'\n  );\n};\n","package.json":"{\n  \"name\": \"ws\",\n  \"version\": \"8.21.1\",\n  \"description\": \"Simple to use, blazing fast and thoroughly tested websocket client and server for Node.js\",\n  \"keywords\": [\n    \"HyBi\",\n    \"Push\",\n    \"RFC-6455\",\n    \"WebSocket\",\n    \"WebSockets\",\n    \"real-time\"\n  ],\n  \"homepage\": \"https://github.com/websockets/ws\",\n  \"bugs\": \"https://github.com/websockets/ws/issues\",\n  \"repository\": {\n    \"type\": \"git\",\n    \"url\": \"git+https://github.com/websockets/ws.git\"\n  },\n  \"author\": \"Einar Otto Stangvik <einaros@gmail.com> (http://2x.io)\",\n  \"license\": \"MIT\",\n  \"main\": \"index.js\",\n  \"exports\": {\n    \".\": {\n      \"browser\": \"./browser.js\",\n      \"import\": \"./wrapper.mjs\",\n      \"require\": \"./index.js\"\n    },\n    \"./package.json\": \"./package.json\"\n  },\n  \"browser\": \"browser.js\",\n  \"engines\": {\n    \"node\": \">=10.0.0\"\n  },\n  \"files\": [\n    \"browser.js\",\n    \"index.js\",\n    \"lib/*.js\",\n    \"wrapper.mjs\"\n  ],\n  \"scripts\": {\n    \"test\": \"nyc --reporter=lcov --reporter=text mocha --throw-deprecation test/*.test.js\",\n    \"integration\": \"mocha --throw-deprecation test/*.integration.js\",\n    \"lint\": \"eslint . && prettier --check --ignore-path .gitignore \\\"**/*.{json,md,yaml,yml}\\\"\"\n  },\n  \"peerDependencies\": {\n    \"bufferutil\": \"^4.0.1\",\n    \"utf-8-validate\": \">=5.0.2\"\n  },\n  \"peerDependenciesMeta\": {\n    \"bufferutil\": {\n      \"optional\": true\n    },\n    \"utf-8-validate\": {\n      \"optional\": true\n    }\n  },\n  \"devDependencies\": {\n    \"@eslint/js\": \"^10.0.1\",\n    \"benchmark\": \"^2.1.4\",\n    \"bufferutil\": \"^4.0.1\",\n    \"eslint\": \"^10.0.1\",\n    \"eslint-config-prettier\": \"^10.0.1\",\n    \"eslint-plugin-prettier\": \"^5.0.0\",\n    \"globals\": \"^17.0.0\",\n    \"mocha\": \"^8.4.0\",\n    \"nyc\": \"^15.0.0\",\n    \"prettier\": \"^3.0.0\",\n    \"utf-8-validate\": \"^6.0.0\"\n  },\n  \"allowScripts\": {\n    \"bufferutil\": true,\n    \"utf-8-validate\": true\n  }\n}\n","lib/buffer-util.js":"'use strict';\n\nconst { EMPTY_BUFFER } = require('./constants');\n\nconst FastBuffer = Buffer[Symbol.species];\n\n/**\n * Merges an array of buffers into a new buffer.\n *\n * @param {Buffer[]} list The array of buffers to concat\n * @param {Number} totalLength The total length of buffers in the list\n * @return {Buffer} The resulting buffer\n * @public\n */\nfunction concat(list, totalLength) {\n  if (list.length === 0) return EMPTY_BUFFER;\n  if (list.length === 1) return list[0];\n\n  const target = Buffer.allocUnsafe(totalLength);\n  let offset = 0;\n\n  for (let i = 0; i < list.length; i++) {\n    const buf = list[i];\n    target.set(buf, offset);\n    offset += buf.length;\n  }\n\n  if (offset < totalLength) {\n    return new FastBuffer(target.buffer, target.byteOffset, offset);\n  }\n\n  return target;\n}\n\n/**\n * Masks a buffer using the given mask.\n *\n * @param {Buffer} source The buffer to mask\n * @param {Buffer} mask The mask to use\n * @param {Buffer} output The buffer where to store the result\n * @param {Number} offset The offset at which to start writing\n * @param {Number} length The number of bytes to mask.\n * @public\n */\nfunction _mask(source, mask, output, offset, length) {\n  for (let i = 0; i < length; i++) {\n    output[offset + i] = source[i] ^ mask[i & 3];\n  }\n}\n\n/**\n * Unmasks a buffer using the given mask.\n *\n * @param {Buffer} buffer The buffer to unmask\n * @param {Buffer} mask The mask to use\n * @public\n */\nfunction _unmask(buffer, mask) {\n  for (let i = 0; i < buffer.length; i++) {\n    buffer[i] ^= mask[i & 3];\n  }\n}\n\n/**\n * Converts a buffer to an `ArrayBuffer`.\n *\n * @param {Buffer} buf The buffer to convert\n * @return {ArrayBuffer} Converted buffer\n * @public\n */\nfunction toArrayBuffer(buf) {\n  if (buf.length === buf.buffer.byteLength) {\n    return buf.buffer;\n  }\n\n  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);\n}\n\n/**\n * Converts `data` to a `Buffer`.\n *\n * @param {*} data The data to convert\n * @return {Buffer} The buffer\n * @throws {TypeError}\n * @public\n */\nfunction toBuffer(data) {\n  toBuffer.readOnly = true;\n\n  if (Buffer.isBuffer(data)) return data;\n\n  let buf;\n\n  if (data instanceof ArrayBuffer) {\n    buf = new FastBuffer(data);\n  } else if (ArrayBuffer.isView(data)) {\n    buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);\n  } else {\n    buf = Buffer.from(data);\n    toBuffer.readOnly = false;\n  }\n\n  return buf;\n}\n\nmodule.exports = {\n  concat,\n  mask: _mask,\n  toArrayBuffer,\n  toBuffer,\n  unmask: _unmask\n};\n\n/* istanbul ignore else  */\nif (!process.env.WS_NO_BUFFER_UTIL) {\n  try {\n    const bufferUtil = require('bufferutil');\n\n    module.exports.mask = function (source, mask, output, offset, length) {\n      if (length < 48) _mask(source, mask, output, offset, length);\n      else bufferUtil.mask(source, mask, output, offset, length);\n    };\n\n    module.exports.unmask = function (buffer, mask) {\n      if (buffer.length < 32) _unmask(buffer, mask);\n      else bufferUtil.unmask(buffer, mask);\n    };\n  } catch (e) {\n    // Continue regardless of the error.\n  }\n}\n","lib/constants.js":"'use strict';\n\nconst BINARY_TYPES = ['nodebuffer', 'arraybuffer', 'fragments'];\nconst hasBlob = typeof Blob !== 'undefined';\n\nif (hasBlob) BINARY_TYPES.push('blob');\n\nmodule.exports = {\n  BINARY_TYPES,\n  CLOSE_TIMEOUT: 30000,\n  EMPTY_BUFFER: Buffer.alloc(0),\n  GUID: '258EAFA5-E914-47DA-95CA-C5AB0DC85B11',\n  hasBlob,\n  kForOnEventAttribute: Symbol('kIsForOnEventAttribute'),\n  kListener: Symbol('kListener'),\n  kStatusCode: Symbol('status-code'),\n  kWebSocket: Symbol('websocket'),\n  NOOP: () => {}\n};\n","lib/event-target.js":"'use strict';\n\nconst { kForOnEventAttribute, kListener } = require('./constants');\n\nconst kCode = Symbol('kCode');\nconst kData = Symbol('kData');\nconst kError = Symbol('kError');\nconst kMessage = Symbol('kMessage');\nconst kReason = Symbol('kReason');\nconst kTarget = Symbol('kTarget');\nconst kType = Symbol('kType');\nconst kWasClean = Symbol('kWasClean');\n\n/**\n * Class representing an event.\n */\nclass Event {\n  /**\n   * Create a new `Event`.\n   *\n   * @param {String} type The name of the event\n   * @throws {TypeError} If the `type` argument is not specified\n   */\n  constructor(type) {\n    this[kTarget] = null;\n    this[kType] = type;\n  }\n\n  /**\n   * @type {*}\n   */\n  get target() {\n    return this[kTarget];\n  }\n\n  /**\n   * @type {String}\n   */\n  get type() {\n    return this[kType];\n  }\n}\n\nObject.defineProperty(Event.prototype, 'target', { enumerable: true });\nObject.defineProperty(Event.prototype, 'type', { enumerable: true });\n\n/**\n * Class representing a close event.\n *\n * @extends Event\n */\nclass CloseEvent extends Event {\n  /**\n   * Create a new `CloseEvent`.\n   *\n   * @param {String} type The name of the event\n   * @param {Object} [options] A dictionary object that allows for setting\n   *     attributes via object members of the same name\n   * @param {Number} [options.code=0] The status code explaining why the\n   *     connection was closed\n   * @param {String} [options.reason=''] A human-readable string explaining why\n   *     the connection was closed\n   * @param {Boolean} [options.wasClean=false] Indicates whether or not the\n   *     connection was cleanly closed\n   */\n  constructor(type, options = {}) {\n    super(type);\n\n    this[kCode] = options.code === undefined ? 0 : options.code;\n    this[kReason] = options.reason === undefined ? '' : options.reason;\n    this[kWasClean] = options.wasClean === undefined ? false : options.wasClean;\n  }\n\n  /**\n   * @type {Number}\n   */\n  get code() {\n    return this[kCode];\n  }\n\n  /**\n   * @type {String}\n   */\n  get reason() {\n    return this[kReason];\n  }\n\n  /**\n   * @type {Boolean}\n   */\n  get wasClean() {\n    return this[kWasClean];\n  }\n}\n\nObject.defineProperty(CloseEvent.prototype, 'code', { enumerable: true });\nObject.defineProperty(CloseEvent.prototype, 'reason', { enumerable: true });\nObject.defineProperty(CloseEvent.prototype, 'wasClean', { enumerable: true });\n\n/**\n * Class representing an error event.\n *\n * @extends Event\n */\nclass ErrorEvent extends Event {\n  /**\n   * Create a new `ErrorEvent`.\n   *\n   * @param {String} type The name of the event\n   * @param {Object} [options] A dictionary object that allows for setting\n   *     attributes via object members of the same name\n   * @param {*} [options.error=null] The error that generated this event\n   * @param {String} [options.message=''] The error message\n   */\n  constructor(type, options = {}) {\n    super(type);\n\n    this[kError] = options.error === undefined ? null : options.error;\n    this[kMessage] = options.message === undefined ? '' : options.message;\n  }\n\n  /**\n   * @type {*}\n   */\n  get error() {\n    return this[kError];\n  }\n\n  /**\n   * @type {String}\n   */\n  get message() {\n    return this[kMessage];\n  }\n}\n\nObject.defineProperty(ErrorEvent.prototype, 'error', { enumerable: true });\nObject.defineProperty(ErrorEvent.prototype, 'message', { enumerable: true });\n\n/**\n * Class representing a message event.\n *\n * @extends Event\n */\nclass MessageEvent extends Event {\n  /**\n   * Create a new `MessageEvent`.\n   *\n   * @param {String} type The name of the event\n   * @param {Object} [options] A dictionary object that allows for setting\n   *     attributes via object members of the same name\n   * @param {*} [options.data=null] The message content\n   */\n  constructor(type, options = {}) {\n    super(type);\n\n    this[kData] = options.data === undefined ? null : options.data;\n  }\n\n  /**\n   * @type {*}\n   */\n  get data() {\n    return this[kData];\n  }\n}\n\nObject.defineProperty(MessageEvent.prototype, 'data', { enumerable: true });\n\n/**\n * This provides methods for emulating the `EventTarget` interface. It's not\n * meant to be used directly.\n *\n * @mixin\n */\nconst EventTarget = {\n  /**\n   * Register an event listener.\n   *\n   * @param {String} type A string representing the event type to listen for\n   * @param {(Function|Object)} handler The listener to add\n   * @param {Object} [options] An options object specifies characteristics about\n   *     the event listener\n   * @param {Boolean} [options.once=false] A `Boolean` indicating that the\n   *     listener should be invoked at most once after being added. If `true`,\n   *     the listener would be automatically removed when invoked.\n   * @public\n   */\n  addEventListener(type, handler, options = {}) {\n    for (const listener of this.listeners(type)) {\n      if (\n        !options[kForOnEventAttribute] &&\n        listener[kListener] === handler &&\n        !listener[kForOnEventAttribute]\n      ) {\n        return;\n      }\n    }\n\n    let wrapper;\n\n    if (type === 'message') {\n      wrapper = function onMessage(data, isBinary) {\n        const event = new MessageEvent('message', {\n          data: isBinary ? data : data.toString()\n        });\n\n        event[kTarget] = this;\n        callListener(handler, this, event);\n      };\n    } else if (type === 'close') {\n      wrapper = function onClose(code, message) {\n        const event = new CloseEvent('close', {\n          code,\n          reason: message.toString(),\n          wasClean: this._closeFrameReceived && this._closeFrameSent\n        });\n\n        event[kTarget] = this;\n        callListener(handler, this, event);\n      };\n    } else if (type === 'error') {\n      wrapper = function onError(error) {\n        const event = new ErrorEvent('error', {\n          error,\n          message: error.message\n        });\n\n        event[kTarget] = this;\n        callListener(handler, this, event);\n      };\n    } else if (type === 'open') {\n      wrapper = function onOpen() {\n        const event = new Event('open');\n\n        event[kTarget] = this;\n        callListener(handler, this, event);\n      };\n    } else {\n      return;\n    }\n\n    wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];\n    wrapper[kListener] = handler;\n\n    if (options.once) {\n      this.once(type, wrapper);\n    } else {\n      this.on(type, wrapper);\n    }\n  },\n\n  /**\n   * Remove an event listener.\n   *\n   * @param {String} type A string representing the event type to remove\n   * @param {(Function|Object)} handler The listener to remove\n   * @public\n   */\n  removeEventListener(type, handler) {\n    for (const listener of this.listeners(type)) {\n      if (listener[kListener] === handler && !listener[kForOnEventAttribute]) {\n        this.removeListener(type, listener);\n        break;\n      }\n    }\n  }\n};\n\nmodule.exports = {\n  CloseEvent,\n  ErrorEvent,\n  Event,\n  EventTarget,\n  MessageEvent\n};\n\n/**\n * Call an event listener\n *\n * @param {(Function|Object)} listener The listener to call\n * @param {*} thisArg The value to use as `this`` when calling the listener\n * @param {Event} event The event to pass to the listener\n * @private\n */\nfunction callListener(listener, thisArg, event) {\n  if (typeof listener === 'object' && listener.handleEvent) {\n    listener.handleEvent.call(listener, event);\n  } else {\n    listener.call(thisArg, event);\n  }\n}\n","lib/extension.js":"'use strict';\n\nconst { tokenChars } = require('./validation');\n\n/**\n * Adds an offer to the map of extension offers or a parameter to the map of\n * parameters.\n *\n * @param {Object} dest The map of extension offers or parameters\n * @param {String} name The extension or parameter name\n * @param {(Object|Boolean|String)} elem The extension parameters or the\n *     parameter value\n * @private\n */\nfunction push(dest, name, elem) {\n  if (dest[name] === undefined) dest[name] = [elem];\n  else dest[name].push(elem);\n}\n\n/**\n * Parses the `Sec-WebSocket-Extensions` header into an object.\n *\n * @param {String} header The field value of the header\n * @return {Object} The parsed object\n * @public\n */\nfunction parse(header) {\n  const offers = Object.create(null);\n  let params = Object.create(null);\n  let mustUnescape = false;\n  let isEscaping = false;\n  let inQuotes = false;\n  let extensionName;\n  let paramName;\n  let start = -1;\n  let code = -1;\n  let end = -1;\n  let i = 0;\n\n  for (; i < header.length; i++) {\n    code = header.charCodeAt(i);\n\n    if (extensionName === undefined) {\n      if (end === -1 && tokenChars[code] === 1) {\n        if (start === -1) start = i;\n      } else if (\n        i !== 0 &&\n        (code === 0x20 /* ' ' */ || code === 0x09) /* '\\t' */\n      ) {\n        if (end === -1 && start !== -1) end = i;\n      } else if (code === 0x3b /* ';' */ || code === 0x2c /* ',' */) {\n        if (start === -1) {\n          throw new SyntaxError(`Unexpected character at index ${i}`);\n        }\n\n        if (end === -1) end = i;\n        const name = header.slice(start, end);\n        if (code === 0x2c) {\n          push(offers, name, params);\n          params = Object.create(null);\n        } else {\n          extensionName = name;\n        }\n\n        start = end = -1;\n      } else {\n        throw new SyntaxError(`Unexpected character at index ${i}`);\n      }\n    } else if (paramName === undefined) {\n      if (end === -1 && tokenChars[code] === 1) {\n        if (start === -1) start = i;\n      } else if (code === 0x20 || code === 0x09) {\n        if (end === -1 && start !== -1) end = i;\n      } else if (code === 0x3b || code === 0x2c) {\n        if (start === -1) {\n          throw new SyntaxError(`Unexpected character at index ${i}`);\n        }\n\n        if (end === -1) end = i;\n        push(params, header.slice(start, end), true);\n        if (code === 0x2c) {\n          push(offers, extensionName, params);\n          params = Object.create(null);\n          extensionName = undefined;\n        }\n\n        start = end = -1;\n      } else if (code === 0x3d /* '=' */ && start !== -1 && end === -1) {\n        paramName = header.slice(start, i);\n        start = end = -1;\n      } else {\n        throw new SyntaxError(`Unexpected character at index ${i}`);\n      }\n    } else {\n      //\n      // The value of a quoted-string after unescaping must conform to the\n      // token ABNF, so only token characters are valid.\n      // Ref: https://tools.ietf.org/html/rfc6455#section-9.1\n      //\n      if (isEscaping) {\n        if (tokenChars[code] !== 1) {\n          throw new SyntaxError(`Unexpected character at index ${i}`);\n        }\n        if (start === -1) start = i;\n        else if (!mustUnescape) mustUnescape = true;\n        isEscaping = false;\n      } else if (inQuotes) {\n        if (tokenChars[code] === 1) {\n          if (start === -1) start = i;\n        } else if (code === 0x22 /* '\"' */ && start !== -1) {\n          inQuotes = false;\n          end = i;\n        } else if (code === 0x5c /* '\\' */) {\n          isEscaping = true;\n        } else {\n          throw new SyntaxError(`Unexpected character at index ${i}`);\n        }\n      } else if (code === 0x22 && header.charCodeAt(i - 1) === 0x3d) {\n        inQuotes = true;\n      } else if (end === -1 && tokenChars[code] === 1) {\n        if (start === -1) start = i;\n      } else if (start !== -1 && (code === 0x20 || code === 0x09)) {\n        if (end === -1) end = i;\n      } else if (code === 0x3b || code === 0x2c) {\n        if (start === -1) {\n          throw new SyntaxError(`Unexpected character at index ${i}`);\n        }\n\n        if (end === -1) end = i;\n        let value = header.slice(start, end);\n        if (mustUnescape) {\n          value = value.replace(/\\\\/g, '');\n          mustUnescape = false;\n        }\n        push(params, paramName, value);\n        if (code === 0x2c) {\n          push(offers, extensionName, params);\n          params = Object.create(null);\n          extensionName = undefined;\n        }\n\n        paramName = undefined;\n        start = end = -1;\n      } else {\n        throw new SyntaxError(`Unexpected character at index ${i}`);\n      }\n    }\n  }\n\n  if (start === -1 || inQuotes || code === 0x20 || code === 0x09) {\n    throw new SyntaxError('Unexpected end of input');\n  }\n\n  if (end === -1) end = i;\n  const token = header.slice(start, end);\n  if (extensionName === undefined) {\n    push(offers, token, params);\n  } else {\n    if (paramName === undefined) {\n      push(params, token, true);\n    } else if (mustUnescape) {\n      push(params, paramName, token.replace(/\\\\/g, ''));\n    } else {\n      push(params, paramName, token);\n    }\n    push(offers, extensionName, params);\n  }\n\n  return offers;\n}\n\n/**\n * Builds the `Sec-WebSocket-Extensions` header field value.\n *\n * @param {Object} extensions The map of extensions and parameters to format\n * @return {String} A string representing the given object\n * @public\n */\nfunction format(extensions) {\n  return Object.keys(extensions)\n    .map((extension) => {\n      let configurations = extensions[extension];\n      if (!Array.isArray(configurations)) configurations = [configurations];\n      return configurations\n        .map((params) => {\n          return [extension]\n            .concat(\n              Object.keys(params).map((k) => {\n                let values = params[k];\n                if (!Array.isArray(values)) values = [values];\n                return values\n                  .map((v) => (v === true ? k : `${k}=${v}`))\n                  .join('; ');\n              })\n            )\n            .join('; ');\n        })\n        .join(', ');\n    })\n    .join(', ');\n}\n\nmodule.exports = { format, parse };\n","lib/limiter.js":"'use strict';\n\nconst kDone = Symbol('kDone');\nconst kRun = Symbol('kRun');\n\n/**\n * A very simple job queue with adjustable concurrency. Adapted from\n * https://github.com/STRML/async-limiter\n */\nclass Limiter {\n  /**\n   * Creates a new `Limiter`.\n   *\n   * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed\n   *     to run concurrently\n   */\n  constructor(concurrency) {\n    this[kDone] = () => {\n      this.pending--;\n      this[kRun]();\n    };\n    this.concurrency = concurrency || Infinity;\n    this.jobs = [];\n    this.pending = 0;\n  }\n\n  /**\n   * Adds a job to the queue.\n   *\n   * @param {Function} job The job to run\n   * @public\n   */\n  add(job) {\n    this.jobs.push(job);\n    this[kRun]();\n  }\n\n  /**\n   * Removes a job from the queue and runs it if possible.\n   *\n   * @private\n   */\n  [kRun]() {\n    if (this.pending === this.concurrency) return;\n\n    if (this.jobs.length) {\n      const job = this.jobs.shift();\n\n      this.pending++;\n      job(this[kDone]);\n    }\n  }\n}\n\nmodule.exports = Limiter;\n","lib/permessage-deflate.js":"'use strict';\n\nconst zlib = require('zlib');\n\nconst bufferUtil = require('./buffer-util');\nconst Limiter = require('./limiter');\nconst { kStatusCode } = require('./constants');\n\nconst FastBuffer = Buffer[Symbol.species];\nconst TRAILER = Buffer.from([0x00, 0x00, 0xff, 0xff]);\nconst kPerMessageDeflate = Symbol('permessage-deflate');\nconst kTotalLength = Symbol('total-length');\nconst kCallback = Symbol('callback');\nconst kBuffers = Symbol('buffers');\nconst kError = Symbol('error');\n\n//\n// We limit zlib concurrency, which prevents severe memory fragmentation\n// as documented in https://github.com/nodejs/node/issues/8871#issuecomment-250915913\n// and https://github.com/websockets/ws/issues/1202\n//\n// Intentionally global; it's the global thread pool that's an issue.\n//\nlet zlibLimiter;\n\n/**\n * permessage-deflate implementation.\n */\nclass PerMessageDeflate {\n  /**\n   * Creates a PerMessageDeflate instance.\n   *\n   * @param {Object} [options] Configuration options\n   * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support\n   *     for, or request, a custom client window size\n   * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/\n   *     acknowledge disabling of client context takeover\n   * @param {Number} [options.concurrencyLimit=10] The number of concurrent\n   *     calls to zlib\n   * @param {Boolean} [options.isServer=false] Create the instance in either\n   *     server or client mode\n   * @param {Number} [options.maxPayload=0] The maximum allowed message length\n   * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the\n   *     use of a custom server window size\n   * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept\n   *     disabling of server context takeover\n   * @param {Number} [options.threshold=1024] Size (in bytes) below which\n   *     messages should not be compressed if context takeover is disabled\n   * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on\n   *     deflate\n   * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on\n   *     inflate\n   */\n  constructor(options) {\n    this._options = options || {};\n    this._threshold =\n      this._options.threshold !== undefined ? this._options.threshold : 1024;\n    this._maxPayload = this._options.maxPayload | 0;\n    this._isServer = !!this._options.isServer;\n    this._deflate = null;\n    this._inflate = null;\n\n    this.params = null;\n\n    if (!zlibLimiter) {\n      const concurrency =\n        this._options.concurrencyLimit !== undefined\n          ? this._options.concurrencyLimit\n          : 10;\n      zlibLimiter = new Limiter(concurrency);\n    }\n  }\n\n  /**\n   * @type {String}\n   */\n  static get extensionName() {\n    return 'permessage-deflate';\n  }\n\n  /**\n   * Create an extension negotiation offer.\n   *\n   * @return {Object} Extension parameters\n   * @public\n   */\n  offer() {\n    const params = {};\n\n    if (this._options.serverNoContextTakeover) {\n      params.server_no_context_takeover = true;\n    }\n    if (this._options.clientNoContextTakeover) {\n      params.client_no_context_takeover = true;\n    }\n    if (this._options.serverMaxWindowBits) {\n      params.server_max_window_bits = this._options.serverMaxWindowBits;\n    }\n    if (this._options.clientMaxWindowBits) {\n      params.client_max_window_bits = this._options.clientMaxWindowBits;\n    } else if (this._options.clientMaxWindowBits == null) {\n      params.client_max_window_bits = true;\n    }\n\n    return params;\n  }\n\n  /**\n   * Accept an extension negotiation offer/response.\n   *\n   * @param {Array} configurations The extension negotiation offers/reponse\n   * @return {Object} Accepted configuration\n   * @public\n   */\n  accept(configurations) {\n    configurations = this.normalizeParams(configurations);\n\n    this.params = this._isServer\n      ? this.acceptAsServer(configurations)\n      : this.acceptAsClient(configurations);\n\n    return this.params;\n  }\n\n  /**\n   * Releases all resources used by the extension.\n   *\n   * @public\n   */\n  cleanup() {\n    if (this._inflate) {\n      this._inflate.close();\n      this._inflate = null;\n    }\n\n    if (this._deflate) {\n      const callback = this._deflate[kCallback];\n\n      this._deflate.close();\n      this._deflate = null;\n\n      if (callback) {\n        callback(\n          new Error(\n            'The deflate stream was closed while data was being processed'\n          )\n        );\n      }\n    }\n  }\n\n  /**\n   *  Accept an extension negotiation offer.\n   *\n   * @param {Array} offers The extension negotiation offers\n   * @return {Object} Accepted configuration\n   * @private\n   */\n  acceptAsServer(offers) {\n    const opts = this._options;\n    const accepted = offers.find((params) => {\n      if (\n        (opts.serverNoContextTakeover === false &&\n          params.server_no_context_takeover) ||\n        (params.server_max_window_bits &&\n          (opts.serverMaxWindowBits === false ||\n            (typeof opts.serverMaxWindowBits === 'number' &&\n              opts.serverMaxWindowBits > params.server_max_window_bits))) ||\n        (typeof opts.clientMaxWindowBits === 'number' &&\n          !params.client_max_window_bits)\n      ) {\n        return false;\n      }\n\n      return true;\n    });\n\n    if (!accepted) {\n      throw new Error('None of the extension offers can be accepted');\n    }\n\n    if (opts.serverNoContextTakeover) {\n      accepted.server_no_context_takeover = true;\n    }\n    if (opts.clientNoContextTakeover) {\n      accepted.client_no_context_takeover = true;\n    }\n    if (typeof opts.serverMaxWindowBits === 'number') {\n      accepted.server_max_window_bits = opts.serverMaxWindowBits;\n    }\n    if (typeof opts.clientMaxWindowBits === 'number') {\n      accepted.client_max_window_bits = opts.clientMaxWindowBits;\n    } else if (\n      accepted.client_max_window_bits === true ||\n      opts.clientMaxWindowBits === false\n    ) {\n      delete accepted.client_max_window_bits;\n    }\n\n    return accepted;\n  }\n\n  /**\n   * Accept the extension negotiation response.\n   *\n   * @param {Array} response The extension negotiation response\n   * @return {Object} Accepted configuration\n   * @private\n   */\n  acceptAsClient(response) {\n    const params = response[0];\n\n    if (\n      this._options.clientNoContextTakeover === false &&\n      params.client_no_context_takeover\n    ) {\n      throw new Error('Unexpected parameter \"client_no_context_takeover\"');\n    }\n\n    if (!params.client_max_window_bits) {\n      if (typeof this._options.clientMaxWindowBits === 'number') {\n        params.client_max_window_bits = this._options.clientMaxWindowBits;\n      }\n    } else if (\n      this._options.clientMaxWindowBits === false ||\n      (typeof this._options.clientMaxWindowBits === 'number' &&\n        params.client_max_window_bits > this._options.clientMaxWindowBits)\n    ) {\n      throw new Error(\n        'Unexpected or invalid parameter \"client_max_window_bits\"'\n      );\n    }\n\n    return params;\n  }\n\n  /**\n   * Normalize parameters.\n   *\n   * @param {Array} configurations The extension negotiation offers/reponse\n   * @return {Array} The offers/response with normalized parameters\n   * @private\n   */\n  normalizeParams(configurations) {\n    configurations.forEach((params) => {\n      Object.keys(params).forEach((key) => {\n        let value = params[key];\n\n        if (value.length > 1) {\n          throw new Error(`Parameter \"${key}\" must have only a single value`);\n        }\n\n        value = value[0];\n\n        if (key === 'client_max_window_bits') {\n          if (value !== true) {\n            const num = +value;\n            if (!Number.isInteger(num) || num < 8 || num > 15) {\n              throw new TypeError(\n                `Invalid value for parameter \"${key}\": ${value}`\n              );\n            }\n            value = num;\n          } else if (!this._isServer) {\n            throw new TypeError(\n              `Invalid value for parameter \"${key}\": ${value}`\n            );\n          }\n        } else if (key === 'server_max_window_bits') {\n          const num = +value;\n          if (!Number.isInteger(num) || num < 8 || num > 15) {\n            throw new TypeError(\n              `Invalid value for parameter \"${key}\": ${value}`\n            );\n          }\n          value = num;\n        } else if (\n          key === 'client_no_context_takeover' ||\n          key === 'server_no_context_takeover'\n        ) {\n          if (value !== true) {\n            throw new TypeError(\n              `Invalid value for parameter \"${key}\": ${value}`\n            );\n          }\n        } else {\n          throw new Error(`Unknown parameter \"${key}\"`);\n        }\n\n        params[key] = value;\n      });\n    });\n\n    return configurations;\n  }\n\n  /**\n   * Decompress data. Concurrency limited.\n   *\n   * @param {Buffer} data Compressed data\n   * @param {Boolean} fin Specifies whether or not this is the last fragment\n   * @param {Function} callback Callback\n   * @public\n   */\n  decompress(data, fin, callback) {\n    zlibLimiter.add((done) => {\n      this._decompress(data, fin, (err, result) => {\n        done();\n        callback(err, result);\n      });\n    });\n  }\n\n  /**\n   * Compress data. Concurrency limited.\n   *\n   * @param {(Buffer|String)} data Data to compress\n   * @param {Boolean} fin Specifies whether or not this is the last fragment\n   * @param {Function} callback Callback\n   * @public\n   */\n  compress(data, fin, callback) {\n    zlibLimiter.add((done) => {\n      this._compress(data, fin, (err, result) => {\n        done();\n        callback(err, result);\n      });\n    });\n  }\n\n  /**\n   * Decompress data.\n   *\n   * @param {Buffer} data Compressed data\n   * @param {Boolean} fin Specifies whether or not this is the last fragment\n   * @param {Function} callback Callback\n   * @private\n   */\n  _decompress(data, fin, callback) {\n    const endpoint = this._isServer ? 'client' : 'server';\n\n    if (!this._inflate) {\n      const key = `${endpoint}_max_window_bits`;\n      const windowBits =\n        typeof this.params[key] !== 'number'\n          ? zlib.Z_DEFAULT_WINDOWBITS\n          : this.params[key];\n\n      this._inflate = zlib.createInflateRaw({\n        ...this._options.zlibInflateOptions,\n        windowBits\n      });\n      this._inflate[kPerMessageDeflate] = this;\n      this._inflate[kTotalLength] = 0;\n      this._inflate[kBuffers] = [];\n      this._inflate.on('error', inflateOnError);\n      this._inflate.on('data', inflateOnData);\n    }\n\n    this._inflate[kCallback] = callback;\n\n    this._inflate.write(data);\n    if (fin) this._inflate.write(TRAILER);\n\n    this._inflate.flush(() => {\n      const err = this._inflate[kError];\n\n      if (err) {\n        this._inflate.close();\n        this._inflate = null;\n        callback(err);\n        return;\n      }\n\n      const data = bufferUtil.concat(\n        this._inflate[kBuffers],\n        this._inflate[kTotalLength]\n      );\n\n      if (this._inflate._readableState.endEmitted) {\n        this._inflate.close();\n        this._inflate = null;\n      } else {\n        this._inflate[kTotalLength] = 0;\n        this._inflate[kBuffers] = [];\n\n        if (fin && this.params[`${endpoint}_no_context_takeover`]) {\n          this._inflate.reset();\n        }\n      }\n\n      callback(null, data);\n    });\n  }\n\n  /**\n   * Compress data.\n   *\n   * @param {(Buffer|String)} data Data to compress\n   * @param {Boolean} fin Specifies whether or not this is the last fragment\n   * @param {Function} callback Callback\n   * @private\n   */\n  _compress(data, fin, callback) {\n    const endpoint = this._isServer ? 'server' : 'client';\n\n    if (!this._deflate) {\n      const key = `${endpoint}_max_window_bits`;\n      const windowBits =\n        typeof this.params[key] !== 'number'\n          ? zlib.Z_DEFAULT_WINDOWBITS\n          : this.params[key];\n\n      this._deflate = zlib.createDeflateRaw({\n        ...this._options.zlibDeflateOptions,\n        windowBits\n      });\n\n      this._deflate[kTotalLength] = 0;\n      this._deflate[kBuffers] = [];\n\n      this._deflate.on('data', deflateOnData);\n    }\n\n    this._deflate[kCallback] = callback;\n\n    this._deflate.write(data);\n    this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {\n      if (!this._deflate) {\n        //\n        // The deflate stream was closed while data was being processed.\n        //\n        return;\n      }\n\n      let data = bufferUtil.concat(\n        this._deflate[kBuffers],\n        this._deflate[kTotalLength]\n      );\n\n      if (fin) {\n        data = new FastBuffer(data.buffer, data.byteOffset, data.length - 4);\n      }\n\n      //\n      // Ensure that the callback will not be called again in\n      // `PerMessageDeflate#cleanup()`.\n      //\n      this._deflate[kCallback] = null;\n\n      this._deflate[kTotalLength] = 0;\n      this._deflate[kBuffers] = [];\n\n      if (fin && this.params[`${endpoint}_no_context_takeover`]) {\n        this._deflate.reset();\n      }\n\n      callback(null, data);\n    });\n  }\n}\n\nmodule.exports = PerMessageDeflate;\n\n/**\n * The listener of the `zlib.DeflateRaw` stream `'data'` event.\n *\n * @param {Buffer} chunk A chunk of data\n * @private\n */\nfunction deflateOnData(chunk) {\n  this[kBuffers].push(chunk);\n  this[kTotalLength] += chunk.length;\n}\n\n/**\n * The listener of the `zlib.InflateRaw` stream `'data'` event.\n *\n * @param {Buffer} chunk A chunk of data\n * @private\n */\nfunction inflateOnData(chunk) {\n  this[kTotalLength] += chunk.length;\n\n  if (\n    this[kPerMessageDeflate]._maxPayload < 1 ||\n    this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload\n  ) {\n    this[kBuffers].push(chunk);\n    return;\n  }\n\n  this[kError] = new RangeError('Max payload size exceeded');\n  this[kError].code = 'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH';\n  this[kError][kStatusCode] = 1009;\n  this.removeListener('data', inflateOnData);\n\n  //\n  // The choice to employ `zlib.reset()` over `zlib.close()` is dictated by the\n  // fact that in Node.js versions prior to 13.10.0, the callback for\n  // `zlib.flush()` is not called if `zlib.close()` is used. Utilizing\n  // `zlib.reset()` ensures that either the callback is invoked or an error is\n  // emitted.\n  //\n  this.reset();\n}\n\n/**\n * The listener of the `zlib.InflateRaw` stream `'error'` event.\n *\n * @param {Error} err The emitted error\n * @private\n */\nfunction inflateOnError(err) {\n  //\n  // There is no need to call `Zlib#close()` as the handle is automatically\n  // closed when an error is emitted.\n  //\n  this[kPerMessageDeflate]._inflate = null;\n\n  if (this[kError]) {\n    this[kCallback](this[kError]);\n    return;\n  }\n\n  err[kStatusCode] = 1007;\n  this[kCallback](err);\n}\n","lib/receiver.js":"'use strict';\n\nconst { Writable } = require('stream');\n\nconst PerMessageDeflate = require('./permessage-deflate');\nconst {\n  BINARY_TYPES,\n  EMPTY_BUFFER,\n  kStatusCode,\n  kWebSocket\n} = require('./constants');\nconst { concat, toArrayBuffer, unmask } = require('./buffer-util');\nconst { isValidStatusCode, isValidUTF8 } = require('./validation');\n\nconst FastBuffer = Buffer[Symbol.species];\n\nconst GET_INFO = 0;\nconst GET_PAYLOAD_LENGTH_16 = 1;\nconst GET_PAYLOAD_LENGTH_64 = 2;\nconst GET_MASK = 3;\nconst GET_DATA = 4;\nconst INFLATING = 5;\nconst DEFER_EVENT = 6;\n\n/**\n * HyBi Receiver implementation.\n *\n * @extends Writable\n */\nclass Receiver extends Writable {\n  /**\n   * Creates a Receiver instance.\n   *\n   * @param {Object} [options] Options object\n   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether\n   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted\n   *     multiple times in the same tick\n   * @param {String} [options.binaryType=nodebuffer] The type for binary data\n   * @param {Object} [options.extensions] An object containing the negotiated\n   *     extensions\n   * @param {Boolean} [options.isServer=false] Specifies whether to operate in\n   *     client or server mode\n   * @param {Number} [options.maxBufferedChunks=0] The maximum number of\n   *     buffered data chunks\n   * @param {Number} [options.maxFragments=0] The maximum number of message\n   *     fragments\n   * @param {Number} [options.maxPayload=0] The maximum allowed message length\n   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or\n   *     not to skip UTF-8 validation for text and close messages\n   */\n  constructor(options = {}) {\n    super();\n\n    this._allowSynchronousEvents =\n      options.allowSynchronousEvents !== undefined\n        ? options.allowSynchronousEvents\n        : true;\n    this._binaryType = options.binaryType || BINARY_TYPES[0];\n    this._extensions = options.extensions || {};\n    this._isServer = !!options.isServer;\n    this._maxBufferedChunks = options.maxBufferedChunks | 0;\n    this._maxFragments = options.maxFragments | 0;\n    this._maxPayload = options.maxPayload | 0;\n    this._skipUTF8Validation = !!options.skipUTF8Validation;\n    this[kWebSocket] = undefined;\n\n    this._bufferedBytes = 0;\n    this._buffers = [];\n\n    this._compressed = false;\n    this._payloadLength = 0;\n    this._mask = undefined;\n    this._fragmented = 0;\n    this._masked = false;\n    this._fin = false;\n    this._opcode = 0;\n\n    this._totalPayloadLength = 0;\n    this._messageLength = 0;\n    this._numFragments = 0;\n    this._fragments = [];\n\n    this._errored = false;\n    this._loop = false;\n    this._state = GET_INFO;\n  }\n\n  /**\n   * Implements `Writable.prototype._write()`.\n   *\n   * @param {Buffer} chunk The chunk of data to write\n   * @param {String} encoding The character encoding of `chunk`\n   * @param {Function} cb Callback\n   * @private\n   */\n  _write(chunk, encoding, cb) {\n    if (this._opcode === 0x08 && this._state == GET_INFO) return cb();\n\n    if (\n      this._maxBufferedChunks > 0 &&\n      this._buffers.length >= this._maxBufferedChunks\n    ) {\n      cb(\n        this.createError(\n          RangeError,\n          'Too many buffered chunks',\n          false,\n          1008,\n          'WS_ERR_TOO_MANY_BUFFERED_PARTS'\n        )\n      );\n      return;\n    }\n\n    this._bufferedBytes += chunk.length;\n    this._buffers.push(chunk);\n    this.startLoop(cb);\n  }\n\n  /**\n   * Consumes `n` bytes from the buffered data.\n   *\n   * @param {Number} n The number of bytes to consume\n   * @return {Buffer} The consumed bytes\n   * @private\n   */\n  consume(n) {\n    this._bufferedBytes -= n;\n\n    if (n === this._buffers[0].length) return this._buffers.shift();\n\n    if (n < this._buffers[0].length) {\n      const buf = this._buffers[0];\n      this._buffers[0] = new FastBuffer(\n        buf.buffer,\n        buf.byteOffset + n,\n        buf.length - n\n      );\n\n      return new FastBuffer(buf.buffer, buf.byteOffset, n);\n    }\n\n    const dst = Buffer.allocUnsafe(n);\n\n    do {\n      const buf = this._buffers[0];\n      const offset = dst.length - n;\n\n      if (n >= buf.length) {\n        dst.set(this._buffers.shift(), offset);\n      } else {\n        dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);\n        this._buffers[0] = new FastBuffer(\n          buf.buffer,\n          buf.byteOffset + n,\n          buf.length - n\n        );\n      }\n\n      n -= buf.length;\n    } while (n > 0);\n\n    return dst;\n  }\n\n  /**\n   * Starts the parsing loop.\n   *\n   * @param {Function} cb Callback\n   * @private\n   */\n  startLoop(cb) {\n    this._loop = true;\n\n    do {\n      switch (this._state) {\n        case GET_INFO:\n          this.getInfo(cb);\n          break;\n        case GET_PAYLOAD_LENGTH_16:\n          this.getPayloadLength16(cb);\n          break;\n        case GET_PAYLOAD_LENGTH_64:\n          this.getPayloadLength64(cb);\n          break;\n        case GET_MASK:\n          this.getMask();\n          break;\n        case GET_DATA:\n          this.getData(cb);\n          break;\n        case INFLATING:\n        case DEFER_EVENT:\n          this._loop = false;\n          return;\n      }\n    } while (this._loop);\n\n    if (!this._errored) cb();\n  }\n\n  /**\n   * Reads the first two bytes of a frame.\n   *\n   * @param {Function} cb Callback\n   * @private\n   */\n  getInfo(cb) {\n    if (this._bufferedBytes < 2) {\n      this._loop = false;\n      return;\n    }\n\n    const buf = this.consume(2);\n\n    if ((buf[0] & 0x30) !== 0x00) {\n      const error = this.createError(\n        RangeError,\n        'RSV2 and RSV3 must be clear',\n        true,\n        1002,\n        'WS_ERR_UNEXPECTED_RSV_2_3'\n      );\n\n      cb(error);\n      return;\n    }\n\n    const compressed = (buf[0] & 0x40) === 0x40;\n\n    if (compressed && !this._extensions[PerMessageDeflate.extensionName]) {\n      const error = this.createError(\n        RangeError,\n        'RSV1 must be clear',\n        true,\n        1002,\n        'WS_ERR_UNEXPECTED_RSV_1'\n      );\n\n      cb(error);\n      return;\n    }\n\n    this._fin = (buf[0] & 0x80) === 0x80;\n    this._opcode = buf[0] & 0x0f;\n    this._payloadLength = buf[1] & 0x7f;\n\n    if (this._opcode === 0x00) {\n      if (compressed) {\n        const error = this.createError(\n          RangeError,\n          'RSV1 must be clear',\n          true,\n          1002,\n          'WS_ERR_UNEXPECTED_RSV_1'\n        );\n\n        cb(error);\n        return;\n      }\n\n      if (!this._fragmented) {\n        const error = this.createError(\n          RangeError,\n          'invalid opcode 0',\n          true,\n          1002,\n          'WS_ERR_INVALID_OPCODE'\n        );\n\n        cb(error);\n        return;\n      }\n\n      this._opcode = this._fragmented;\n    } else if (this._opcode === 0x01 || this._opcode === 0x02) {\n      if (this._fragmented) {\n        const error = this.createError(\n          RangeError,\n          `invalid opcode ${this._opcode}`,\n          true,\n          1002,\n          'WS_ERR_INVALID_OPCODE'\n        );\n\n        cb(error);\n        return;\n      }\n\n      this._compressed = compressed;\n    } else if (this._opcode > 0x07 && this._opcode < 0x0b) {\n      if (!this._fin) {\n        const error = this.createError(\n          RangeError,\n          'FIN must be set',\n          true,\n          1002,\n          'WS_ERR_EXPECTED_FIN'\n        );\n\n        cb(error);\n        return;\n      }\n\n      if (compressed) {\n        const error = this.createError(\n          RangeError,\n          'RSV1 must be clear',\n          true,\n          1002,\n          'WS_ERR_UNEXPECTED_RSV_1'\n        );\n\n        cb(error);\n        return;\n      }\n\n      if (\n        this._payloadLength > 0x7d ||\n        (this._opcode === 0x08 && this._payloadLength === 1)\n      ) {\n        const error = this.createError(\n          RangeError,\n          `invalid payload length ${this._payloadLength}`,\n          true,\n          1002,\n          'WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH'\n        );\n\n        cb(error);\n        return;\n      }\n    } else {\n      const error = this.createError(\n        RangeError,\n        `invalid opcode ${this._opcode}`,\n        true,\n        1002,\n        'WS_ERR_INVALID_OPCODE'\n      );\n\n      cb(error);\n      return;\n    }\n\n    if (!this._fin && !this._fragmented) this._fragmented = this._opcode;\n    this._masked = (buf[1] & 0x80) === 0x80;\n\n    if (this._isServer) {\n      if (!this._masked) {\n        const error = this.createError(\n          RangeError,\n          'MASK must be set',\n          true,\n          1002,\n          'WS_ERR_EXPECTED_MASK'\n        );\n\n        cb(error);\n        return;\n      }\n    } else if (this._masked) {\n      const error = this.createError(\n        RangeError,\n        'MASK must be clear',\n        true,\n        1002,\n        'WS_ERR_UNEXPECTED_MASK'\n      );\n\n      cb(error);\n      return;\n    }\n\n    if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;\n    else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;\n    else this.haveLength(cb);\n  }\n\n  /**\n   * Gets extended payload length (7+16).\n   *\n   * @param {Function} cb Callback\n   * @private\n   */\n  getPayloadLength16(cb) {\n    if (this._bufferedBytes < 2) {\n      this._loop = false;\n      return;\n    }\n\n    this._payloadLength = this.consume(2).readUInt16BE(0);\n    this.haveLength(cb);\n  }\n\n  /**\n   * Gets extended payload length (7+64).\n   *\n   * @param {Function} cb Callback\n   * @private\n   */\n  getPayloadLength64(cb) {\n    if (this._bufferedBytes < 8) {\n      this._loop = false;\n      return;\n    }\n\n    const buf = this.consume(8);\n    const num = buf.readUInt32BE(0);\n\n    //\n    // The maximum safe integer in JavaScript is 2^53 - 1. An error is returned\n    // if payload length is greater than this number.\n    //\n    if (num > Math.pow(2, 53 - 32) - 1) {\n      const error = this.createError(\n        RangeError,\n        'Unsupported WebSocket frame: payload length > 2^53 - 1',\n        false,\n        1009,\n        'WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH'\n      );\n\n      cb(error);\n      return;\n    }\n\n    this._payloadLength = num * Math.pow(2, 32) + buf.readUInt32BE(4);\n    this.haveLength(cb);\n  }\n\n  /**\n   * Payload length has been read.\n   *\n   * @param {Function} cb Callback\n   * @private\n   */\n  haveLength(cb) {\n    if (this._payloadLength && this._opcode < 0x08) {\n      this._totalPayloadLength += this._payloadLength;\n      if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {\n        const error = this.createError(\n          RangeError,\n          'Max payload size exceeded',\n          false,\n          1009,\n          'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'\n        );\n\n        cb(error);\n        return;\n      }\n    }\n\n    if (this._masked) this._state = GET_MASK;\n    else this._state = GET_DATA;\n  }\n\n  /**\n   * Reads mask bytes.\n   *\n   * @private\n   */\n  getMask() {\n    if (this._bufferedBytes < 4) {\n      this._loop = false;\n      return;\n    }\n\n    this._mask = this.consume(4);\n    this._state = GET_DATA;\n  }\n\n  /**\n   * Reads data bytes.\n   *\n   * @param {Function} cb Callback\n   * @private\n   */\n  getData(cb) {\n    let data = EMPTY_BUFFER;\n\n    if (this._payloadLength) {\n      if (this._bufferedBytes < this._payloadLength) {\n        this._loop = false;\n        return;\n      }\n\n      data = this.consume(this._payloadLength);\n\n      if (\n        this._masked &&\n        (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0\n      ) {\n        unmask(data, this._mask);\n      }\n    }\n\n    if (this._opcode > 0x07) {\n      this.controlMessage(data, cb);\n      return;\n    }\n\n    if (this._maxFragments > 0 && ++this._numFragments > this._maxFragments) {\n      const error = this.createError(\n        RangeError,\n        'Too many message fragments',\n        false,\n        1008,\n        'WS_ERR_TOO_MANY_BUFFERED_PARTS'\n      );\n\n      cb(error);\n      return;\n    }\n\n    if (this._compressed) {\n      this._state = INFLATING;\n      this.decompress(data, cb);\n      return;\n    }\n\n    if (data.length) {\n      //\n      // This message is not compressed so its length is the sum of the payload\n      // length of all fragments.\n      //\n      this._messageLength = this._totalPayloadLength;\n      this._fragments.push(data);\n    }\n\n    this.dataMessage(cb);\n  }\n\n  /**\n   * Decompresses data.\n   *\n   * @param {Buffer} data Compressed data\n   * @param {Function} cb Callback\n   * @private\n   */\n  decompress(data, cb) {\n    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];\n\n    perMessageDeflate.decompress(data, this._fin, (err, buf) => {\n      if (err) return cb(err);\n\n      if (buf.length) {\n        this._messageLength += buf.length;\n        if (this._messageLength > this._maxPayload && this._maxPayload > 0) {\n          const error = this.createError(\n            RangeError,\n            'Max payload size exceeded',\n            false,\n            1009,\n            'WS_ERR_UNSUPPORTED_MESSAGE_LENGTH'\n          );\n\n          cb(error);\n          return;\n        }\n\n        this._fragments.push(buf);\n      }\n\n      this.dataMessage(cb);\n      if (this._state === GET_INFO) this.startLoop(cb);\n    });\n  }\n\n  /**\n   * Handles a data message.\n   *\n   * @param {Function} cb Callback\n   * @private\n   */\n  dataMessage(cb) {\n    if (!this._fin) {\n      this._state = GET_INFO;\n      return;\n    }\n\n    const messageLength = this._messageLength;\n    const fragments = this._fragments;\n\n    this._totalPayloadLength = 0;\n    this._messageLength = 0;\n    this._fragmented = 0;\n    this._numFragments = 0;\n    this._fragments = [];\n\n    if (this._opcode === 2) {\n      let data;\n\n      if (this._binaryType === 'nodebuffer') {\n        data = concat(fragments, messageLength);\n      } else if (this._binaryType === 'arraybuffer') {\n        data = toArrayBuffer(concat(fragments, messageLength));\n      } else if (this._binaryType === 'blob') {\n        data = new Blob(fragments);\n      } else {\n        data = fragments;\n      }\n\n      if (this._allowSynchronousEvents) {\n        this.emit('message', data, true);\n        this._state = GET_INFO;\n      } else {\n        this._state = DEFER_EVENT;\n        setImmediate(() => {\n          this.emit('message', data, true);\n          this._state = GET_INFO;\n          this.startLoop(cb);\n        });\n      }\n    } else {\n      const buf = concat(fragments, messageLength);\n\n      if (!this._skipUTF8Validation && !isValidUTF8(buf)) {\n        const error = this.createError(\n          Error,\n          'invalid UTF-8 sequence',\n          true,\n          1007,\n          'WS_ERR_INVALID_UTF8'\n        );\n\n        cb(error);\n        return;\n      }\n\n      if (this._state === INFLATING || this._allowSynchronousEvents) {\n        this.emit('message', buf, false);\n        this._state = GET_INFO;\n      } else {\n        this._state = DEFER_EVENT;\n        setImmediate(() => {\n          this.emit('message', buf, false);\n          this._state = GET_INFO;\n          this.startLoop(cb);\n        });\n      }\n    }\n  }\n\n  /**\n   * Handles a control message.\n   *\n   * @param {Buffer} data Data to handle\n   * @return {(Error|RangeError|undefined)} A possible error\n   * @private\n   */\n  controlMessage(data, cb) {\n    if (this._opcode === 0x08) {\n      if (data.length === 0) {\n        this._loop = false;\n        this.emit('conclude', 1005, EMPTY_BUFFER);\n        this.end();\n      } else {\n        const code = data.readUInt16BE(0);\n\n        if (!isValidStatusCode(code)) {\n          const error = this.createError(\n            RangeError,\n            `invalid status code ${code}`,\n            true,\n            1002,\n            'WS_ERR_INVALID_CLOSE_CODE'\n          );\n\n          cb(error);\n          return;\n        }\n\n        const buf = new FastBuffer(\n          data.buffer,\n          data.byteOffset + 2,\n          data.length - 2\n        );\n\n        if (!this._skipUTF8Validation && !isValidUTF8(buf)) {\n          const error = this.createError(\n            Error,\n            'invalid UTF-8 sequence',\n            true,\n            1007,\n            'WS_ERR_INVALID_UTF8'\n          );\n\n          cb(error);\n          return;\n        }\n\n        this._loop = false;\n        this.emit('conclude', code, buf);\n        this.end();\n      }\n\n      this._state = GET_INFO;\n      return;\n    }\n\n    if (this._allowSynchronousEvents) {\n      this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);\n      this._state = GET_INFO;\n    } else {\n      this._state = DEFER_EVENT;\n      setImmediate(() => {\n        this.emit(this._opcode === 0x09 ? 'ping' : 'pong', data);\n        this._state = GET_INFO;\n        this.startLoop(cb);\n      });\n    }\n  }\n\n  /**\n   * Builds an error object.\n   *\n   * @param {function(new:Error|RangeError)} ErrorCtor The error constructor\n   * @param {String} message The error message\n   * @param {Boolean} prefix Specifies whether or not to add a default prefix to\n   *     `message`\n   * @param {Number} statusCode The status code\n   * @param {String} errorCode The exposed error code\n   * @return {(Error|RangeError)} The error\n   * @private\n   */\n  createError(ErrorCtor, message, prefix, statusCode, errorCode) {\n    this._loop = false;\n    this._errored = true;\n\n    const err = new ErrorCtor(\n      prefix ? `Invalid WebSocket frame: ${message}` : message\n    );\n\n    Error.captureStackTrace(err, this.createError);\n    err.code = errorCode;\n    err[kStatusCode] = statusCode;\n    return err;\n  }\n}\n\nmodule.exports = Receiver;\n","lib/sender.js":"/* eslint no-unused-vars: [\"error\", { \"varsIgnorePattern\": \"^Duplex\" }] */\n\n'use strict';\n\nconst { Duplex } = require('stream');\nconst { randomFillSync } = require('crypto');\nconst {\n  types: { isUint8Array }\n} = require('util');\n\nconst PerMessageDeflate = require('./permessage-deflate');\nconst { EMPTY_BUFFER, kWebSocket, NOOP } = require('./constants');\nconst { isBlob, isValidStatusCode } = require('./validation');\nconst { mask: applyMask, toBuffer } = require('./buffer-util');\n\nconst kByteLength = Symbol('kByteLength');\nconst maskBuffer = Buffer.alloc(4);\nconst RANDOM_POOL_SIZE = 8 * 1024;\nlet randomPool;\nlet randomPoolPointer = RANDOM_POOL_SIZE;\n\nconst DEFAULT = 0;\nconst DEFLATING = 1;\nconst GET_BLOB_DATA = 2;\n\n/**\n * HyBi Sender implementation.\n */\nclass Sender {\n  /**\n   * Creates a Sender instance.\n   *\n   * @param {Duplex} socket The connection socket\n   * @param {Object} [extensions] An object containing the negotiated extensions\n   * @param {Function} [generateMask] The function used to generate the masking\n   *     key\n   */\n  constructor(socket, extensions, generateMask) {\n    this._extensions = extensions || {};\n\n    if (generateMask) {\n      this._generateMask = generateMask;\n      this._maskBuffer = Buffer.alloc(4);\n    }\n\n    this._socket = socket;\n\n    this._firstFragment = true;\n    this._compress = false;\n\n    this._bufferedBytes = 0;\n    this._queue = [];\n    this._state = DEFAULT;\n    this.onerror = NOOP;\n    this[kWebSocket] = undefined;\n  }\n\n  /**\n   * Frames a piece of data according to the HyBi WebSocket protocol.\n   *\n   * @param {(Buffer|String)} data The data to frame\n   * @param {Object} options Options object\n   * @param {Boolean} [options.fin=false] Specifies whether or not to set the\n   *     FIN bit\n   * @param {Function} [options.generateMask] The function used to generate the\n   *     masking key\n   * @param {Boolean} [options.mask=false] Specifies whether or not to mask\n   *     `data`\n   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking\n   *     key\n   * @param {Number} options.opcode The opcode\n   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be\n   *     modified\n   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the\n   *     RSV1 bit\n   * @return {(Buffer|String)[]} The framed data\n   * @public\n   */\n  static frame(data, options) {\n    let mask;\n    let merge = false;\n    let offset = 2;\n    let skipMasking = false;\n\n    if (options.mask) {\n      mask = options.maskBuffer || maskBuffer;\n\n      if (options.generateMask) {\n        options.generateMask(mask);\n      } else {\n        if (randomPoolPointer === RANDOM_POOL_SIZE) {\n          /* istanbul ignore else  */\n          if (randomPool === undefined) {\n            //\n            // This is lazily initialized because server-sent frames must not\n            // be masked so it may never be used.\n            //\n            randomPool = Buffer.alloc(RANDOM_POOL_SIZE);\n          }\n\n          randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);\n          randomPoolPointer = 0;\n        }\n\n        mask[0] = randomPool[randomPoolPointer++];\n        mask[1] = randomPool[randomPoolPointer++];\n        mask[2] = randomPool[randomPoolPointer++];\n        mask[3] = randomPool[randomPoolPointer++];\n      }\n\n      skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;\n      offset = 6;\n    }\n\n    let dataLength;\n\n    if (typeof data === 'string') {\n      if (\n        (!options.mask || skipMasking) &&\n        options[kByteLength] !== undefined\n      ) {\n        dataLength = options[kByteLength];\n      } else {\n        data = Buffer.from(data);\n        dataLength = data.length;\n      }\n    } else {\n      dataLength = data.length;\n      merge = options.mask && options.readOnly && !skipMasking;\n    }\n\n    let payloadLength = dataLength;\n\n    if (dataLength >= 65536) {\n      offset += 8;\n      payloadLength = 127;\n    } else if (dataLength > 125) {\n      offset += 2;\n      payloadLength = 126;\n    }\n\n    const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);\n\n    target[0] = options.fin ? options.opcode | 0x80 : options.opcode;\n    if (options.rsv1) target[0] |= 0x40;\n\n    target[1] = payloadLength;\n\n    if (payloadLength === 126) {\n      target.writeUInt16BE(dataLength, 2);\n    } else if (payloadLength === 127) {\n      target[2] = target[3] = 0;\n      target.writeUIntBE(dataLength, 4, 6);\n    }\n\n    if (!options.mask) return [target, data];\n\n    target[1] |= 0x80;\n    target[offset - 4] = mask[0];\n    target[offset - 3] = mask[1];\n    target[offset - 2] = mask[2];\n    target[offset - 1] = mask[3];\n\n    if (skipMasking) return [target, data];\n\n    if (merge) {\n      applyMask(data, mask, target, offset, dataLength);\n      return [target];\n    }\n\n    applyMask(data, mask, data, 0, dataLength);\n    return [target, data];\n  }\n\n  /**\n   * Sends a close message to the other peer.\n   *\n   * @param {Number} [code] The status code component of the body\n   * @param {(String|Buffer)} [data] The message component of the body\n   * @param {Boolean} [mask=false] Specifies whether or not to mask the message\n   * @param {Function} [cb] Callback\n   * @public\n   */\n  close(code, data, mask, cb) {\n    let buf;\n\n    if (code === undefined) {\n      buf = EMPTY_BUFFER;\n    } else if (typeof code !== 'number' || !isValidStatusCode(code)) {\n      throw new TypeError('First argument must be a valid error code number');\n    } else if (data === undefined || !data.length) {\n      buf = Buffer.allocUnsafe(2);\n      buf.writeUInt16BE(code, 0);\n    } else {\n      const length = Buffer.byteLength(data);\n\n      if (length > 123) {\n        throw new RangeError('The message must not be greater than 123 bytes');\n      }\n\n      buf = Buffer.allocUnsafe(2 + length);\n      buf.writeUInt16BE(code, 0);\n\n      if (typeof data === 'string') {\n        buf.write(data, 2);\n      } else if (isUint8Array(data)) {\n        buf.set(data, 2);\n      } else {\n        throw new TypeError('Second argument must be a string or a Uint8Array');\n      }\n    }\n\n    const options = {\n      [kByteLength]: buf.length,\n      fin: true,\n      generateMask: this._generateMask,\n      mask,\n      maskBuffer: this._maskBuffer,\n      opcode: 0x08,\n      readOnly: false,\n      rsv1: false\n    };\n\n    if (this._state !== DEFAULT) {\n      this.enqueue([this.dispatch, buf, false, options, cb]);\n    } else {\n      this.sendFrame(Sender.frame(buf, options), cb);\n    }\n  }\n\n  /**\n   * Sends a ping message to the other peer.\n   *\n   * @param {*} data The message to send\n   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`\n   * @param {Function} [cb] Callback\n   * @public\n   */\n  ping(data, mask, cb) {\n    let byteLength;\n    let readOnly;\n\n    if (typeof data === 'string') {\n      byteLength = Buffer.byteLength(data);\n      readOnly = false;\n    } else if (isBlob(data)) {\n      byteLength = data.size;\n      readOnly = false;\n    } else {\n      data = toBuffer(data);\n      byteLength = data.length;\n      readOnly = toBuffer.readOnly;\n    }\n\n    if (byteLength > 125) {\n      throw new RangeError('The data size must not be greater than 125 bytes');\n    }\n\n    const options = {\n      [kByteLength]: byteLength,\n      fin: true,\n      generateMask: this._generateMask,\n      mask,\n      maskBuffer: this._maskBuffer,\n      opcode: 0x09,\n      readOnly,\n      rsv1: false\n    };\n\n    if (isBlob(data)) {\n      if (this._state !== DEFAULT) {\n        this.enqueue([this.getBlobData, data, false, options, cb]);\n      } else {\n        this.getBlobData(data, false, options, cb);\n      }\n    } else if (this._state !== DEFAULT) {\n      this.enqueue([this.dispatch, data, false, options, cb]);\n    } else {\n      this.sendFrame(Sender.frame(data, options), cb);\n    }\n  }\n\n  /**\n   * Sends a pong message to the other peer.\n   *\n   * @param {*} data The message to send\n   * @param {Boolean} [mask=false] Specifies whether or not to mask `data`\n   * @param {Function} [cb] Callback\n   * @public\n   */\n  pong(data, mask, cb) {\n    let byteLength;\n    let readOnly;\n\n    if (typeof data === 'string') {\n      byteLength = Buffer.byteLength(data);\n      readOnly = false;\n    } else if (isBlob(data)) {\n      byteLength = data.size;\n      readOnly = false;\n    } else {\n      data = toBuffer(data);\n      byteLength = data.length;\n      readOnly = toBuffer.readOnly;\n    }\n\n    if (byteLength > 125) {\n      throw new RangeError('The data size must not be greater than 125 bytes');\n    }\n\n    const options = {\n      [kByteLength]: byteLength,\n      fin: true,\n      generateMask: this._generateMask,\n      mask,\n      maskBuffer: this._maskBuffer,\n      opcode: 0x0a,\n      readOnly,\n      rsv1: false\n    };\n\n    if (isBlob(data)) {\n      if (this._state !== DEFAULT) {\n        this.enqueue([this.getBlobData, data, false, options, cb]);\n      } else {\n        this.getBlobData(data, false, options, cb);\n      }\n    } else if (this._state !== DEFAULT) {\n      this.enqueue([this.dispatch, data, false, options, cb]);\n    } else {\n      this.sendFrame(Sender.frame(data, options), cb);\n    }\n  }\n\n  /**\n   * Sends a data message to the other peer.\n   *\n   * @param {*} data The message to send\n   * @param {Object} options Options object\n   * @param {Boolean} [options.binary=false] Specifies whether `data` is binary\n   *     or text\n   * @param {Boolean} [options.compress=false] Specifies whether or not to\n   *     compress `data`\n   * @param {Boolean} [options.fin=false] Specifies whether the fragment is the\n   *     last one\n   * @param {Boolean} [options.mask=false] Specifies whether or not to mask\n   *     `data`\n   * @param {Function} [cb] Callback\n   * @public\n   */\n  send(data, options, cb) {\n    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];\n    let opcode = options.binary ? 2 : 1;\n    let rsv1 = options.compress;\n\n    let byteLength;\n    let readOnly;\n\n    if (typeof data === 'string') {\n      byteLength = Buffer.byteLength(data);\n      readOnly = false;\n    } else if (isBlob(data)) {\n      byteLength = data.size;\n      readOnly = false;\n    } else {\n      data = toBuffer(data);\n      byteLength = data.length;\n      readOnly = toBuffer.readOnly;\n    }\n\n    if (this._firstFragment) {\n      this._firstFragment = false;\n      if (\n        rsv1 &&\n        perMessageDeflate &&\n        perMessageDeflate.params[\n          perMessageDeflate._isServer\n            ? 'server_no_context_takeover'\n            : 'client_no_context_takeover'\n        ]\n      ) {\n        rsv1 = byteLength >= perMessageDeflate._threshold;\n      }\n      this._compress = rsv1;\n    } else {\n      rsv1 = false;\n      opcode = 0;\n    }\n\n    if (options.fin) this._firstFragment = true;\n\n    const opts = {\n      [kByteLength]: byteLength,\n      fin: options.fin,\n      generateMask: this._generateMask,\n      mask: options.mask,\n      maskBuffer: this._maskBuffer,\n      opcode,\n      readOnly,\n      rsv1\n    };\n\n    if (isBlob(data)) {\n      if (this._state !== DEFAULT) {\n        this.enqueue([this.getBlobData, data, this._compress, opts, cb]);\n      } else {\n        this.getBlobData(data, this._compress, opts, cb);\n      }\n    } else if (this._state !== DEFAULT) {\n      this.enqueue([this.dispatch, data, this._compress, opts, cb]);\n    } else {\n      this.dispatch(data, this._compress, opts, cb);\n    }\n  }\n\n  /**\n   * Gets the contents of a blob as binary data.\n   *\n   * @param {Blob} blob The blob\n   * @param {Boolean} [compress=false] Specifies whether or not to compress\n   *     the data\n   * @param {Object} options Options object\n   * @param {Boolean} [options.fin=false] Specifies whether or not to set the\n   *     FIN bit\n   * @param {Function} [options.generateMask] The function used to generate the\n   *     masking key\n   * @param {Boolean} [options.mask=false] Specifies whether or not to mask\n   *     `data`\n   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking\n   *     key\n   * @param {Number} options.opcode The opcode\n   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be\n   *     modified\n   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the\n   *     RSV1 bit\n   * @param {Function} [cb] Callback\n   * @private\n   */\n  getBlobData(blob, compress, options, cb) {\n    this._bufferedBytes += options[kByteLength];\n    this._state = GET_BLOB_DATA;\n\n    blob\n      .arrayBuffer()\n      .then((arrayBuffer) => {\n        if (this._socket.destroyed) {\n          const err = new Error(\n            'The socket was closed while the blob was being read'\n          );\n\n          //\n          // `callCallbacks` is called in the next tick to ensure that errors\n          // that might be thrown in the callbacks behave like errors thrown\n          // outside the promise chain.\n          //\n          process.nextTick(callCallbacks, this, err, cb);\n          return;\n        }\n\n        this._bufferedBytes -= options[kByteLength];\n        const data = toBuffer(arrayBuffer);\n\n        if (!compress) {\n          this._state = DEFAULT;\n          this.sendFrame(Sender.frame(data, options), cb);\n          this.dequeue();\n        } else {\n          this.dispatch(data, compress, options, cb);\n        }\n      })\n      .catch((err) => {\n        //\n        // `onError` is called in the next tick for the same reason that\n        // `callCallbacks` above is.\n        //\n        process.nextTick(onError, this, err, cb);\n      });\n  }\n\n  /**\n   * Dispatches a message.\n   *\n   * @param {(Buffer|String)} data The message to send\n   * @param {Boolean} [compress=false] Specifies whether or not to compress\n   *     `data`\n   * @param {Object} options Options object\n   * @param {Boolean} [options.fin=false] Specifies whether or not to set the\n   *     FIN bit\n   * @param {Function} [options.generateMask] The function used to generate the\n   *     masking key\n   * @param {Boolean} [options.mask=false] Specifies whether or not to mask\n   *     `data`\n   * @param {Buffer} [options.maskBuffer] The buffer used to store the masking\n   *     key\n   * @param {Number} options.opcode The opcode\n   * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be\n   *     modified\n   * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the\n   *     RSV1 bit\n   * @param {Function} [cb] Callback\n   * @private\n   */\n  dispatch(data, compress, options, cb) {\n    if (!compress) {\n      this.sendFrame(Sender.frame(data, options), cb);\n      return;\n    }\n\n    const perMessageDeflate = this._extensions[PerMessageDeflate.extensionName];\n\n    this._bufferedBytes += options[kByteLength];\n    this._state = DEFLATING;\n    perMessageDeflate.compress(data, options.fin, (_, buf) => {\n      if (this._socket.destroyed) {\n        const err = new Error(\n          'The socket was closed while data was being compressed'\n        );\n\n        callCallbacks(this, err, cb);\n        return;\n      }\n\n      this._bufferedBytes -= options[kByteLength];\n      this._state = DEFAULT;\n      options.readOnly = false;\n      this.sendFrame(Sender.frame(buf, options), cb);\n      this.dequeue();\n    });\n  }\n\n  /**\n   * Executes queued send operations.\n   *\n   * @private\n   */\n  dequeue() {\n    while (this._state === DEFAULT && this._queue.length) {\n      const params = this._queue.shift();\n\n      this._bufferedBytes -= params[3][kByteLength];\n      Reflect.apply(params[0], this, params.slice(1));\n    }\n  }\n\n  /**\n   * Enqueues a send operation.\n   *\n   * @param {Array} params Send operation parameters.\n   * @private\n   */\n  enqueue(params) {\n    this._bufferedBytes += params[3][kByteLength];\n    this._queue.push(params);\n  }\n\n  /**\n   * Sends a frame.\n   *\n   * @param {(Buffer | String)[]} list The frame to send\n   * @param {Function} [cb] Callback\n   * @private\n   */\n  sendFrame(list, cb) {\n    if (list.length === 2) {\n      this._socket.cork();\n      this._socket.write(list[0]);\n      this._socket.write(list[1], cb);\n      this._socket.uncork();\n    } else {\n      this._socket.write(list[0], cb);\n    }\n  }\n}\n\nmodule.exports = Sender;\n\n/**\n * Calls queued callbacks with an error.\n *\n * @param {Sender} sender The `Sender` instance\n * @param {Error} err The error to call the callbacks with\n * @param {Function} [cb] The first callback\n * @private\n */\nfunction callCallbacks(sender, err, cb) {\n  if (typeof cb === 'function') cb(err);\n\n  for (let i = 0; i < sender._queue.length; i++) {\n    const params = sender._queue[i];\n    const callback = params[params.length - 1];\n\n    if (typeof callback === 'function') callback(err);\n  }\n}\n\n/**\n * Handles a `Sender` error.\n *\n * @param {Sender} sender The `Sender` instance\n * @param {Error} err The error\n * @param {Function} [cb] The first pending callback\n * @private\n */\nfunction onError(sender, err, cb) {\n  callCallbacks(sender, err, cb);\n  sender.onerror(err);\n}\n","lib/stream.js":"/* eslint no-unused-vars: [\"error\", { \"varsIgnorePattern\": \"^WebSocket$\" }] */\n'use strict';\n\nconst WebSocket = require('./websocket');\nconst { Duplex } = require('stream');\n\n/**\n * Emits the `'close'` event on a stream.\n *\n * @param {Duplex} stream The stream.\n * @private\n */\nfunction emitClose(stream) {\n  stream.emit('close');\n}\n\n/**\n * The listener of the `'end'` event.\n *\n * @private\n */\nfunction duplexOnEnd() {\n  if (!this.destroyed && this._writableState.finished) {\n    this.destroy();\n  }\n}\n\n/**\n * The listener of the `'error'` event.\n *\n * @param {Error} err The error\n * @private\n */\nfunction duplexOnError(err) {\n  this.removeListener('error', duplexOnError);\n  this.destroy();\n  if (this.listenerCount('error') === 0) {\n    // Do not suppress the throwing behavior.\n    this.emit('error', err);\n  }\n}\n\n/**\n * Wraps a `WebSocket` in a duplex stream.\n *\n * @param {WebSocket} ws The `WebSocket` to wrap\n * @param {Object} [options] The options for the `Duplex` constructor\n * @return {Duplex} The duplex stream\n * @public\n */\nfunction createWebSocketStream(ws, options) {\n  let terminateOnDestroy = true;\n\n  const duplex = new Duplex({\n    ...options,\n    autoDestroy: false,\n    emitClose: false,\n    objectMode: false,\n    writableObjectMode: false\n  });\n\n  ws.on('message', function message(msg, isBinary) {\n    const data =\n      !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;\n\n    if (!duplex.push(data)) ws.pause();\n  });\n\n  ws.once('error', function error(err) {\n    if (duplex.destroyed) return;\n\n    // Prevent `ws.terminate()` from being called by `duplex._destroy()`.\n    //\n    // - If the `'error'` event is emitted before the `'open'` event, then\n    //   `ws.terminate()` is a noop as no socket is assigned.\n    // - Otherwise, the error is re-emitted by the listener of the `'error'`\n    //   event of the `Receiver` object. The listener already closes the\n    //   connection by calling `ws.close()`. This allows a close frame to be\n    //   sent to the other peer. If `ws.terminate()` is called right after this,\n    //   then the close frame might not be sent.\n    terminateOnDestroy = false;\n    duplex.destroy(err);\n  });\n\n  ws.once('close', function close() {\n    if (duplex.destroyed) return;\n\n    duplex.push(null);\n  });\n\n  duplex._destroy = function (err, callback) {\n    if (ws.readyState === ws.CLOSED) {\n      callback(err);\n      process.nextTick(emitClose, duplex);\n      return;\n    }\n\n    let called = false;\n\n    ws.once('error', function error(err) {\n      called = true;\n      callback(err);\n    });\n\n    ws.once('close', function close() {\n      if (!called) callback(err);\n      process.nextTick(emitClose, duplex);\n    });\n\n    if (terminateOnDestroy) ws.terminate();\n  };\n\n  duplex._final = function (callback) {\n    if (ws.readyState === ws.CONNECTING) {\n      ws.once('open', function open() {\n        duplex._final(callback);\n      });\n      return;\n    }\n\n    // If the value of the `_socket` property is `null` it means that `ws` is a\n    // client websocket and the handshake failed. In fact, when this happens, a\n    // socket is never assigned to the websocket. Wait for the `'error'` event\n    // that will be emitted by the websocket.\n    if (ws._socket === null) return;\n\n    if (ws._socket._writableState.finished) {\n      callback();\n      if (duplex._readableState.endEmitted) duplex.destroy();\n    } else {\n      ws._socket.once('finish', function finish() {\n        // `duplex` is not destroyed here because the `'end'` event will be\n        // emitted on `duplex` after this `'finish'` event. The EOF signaling\n        // `null` chunk is, in fact, pushed when the websocket emits `'close'`.\n        callback();\n      });\n      ws.close();\n    }\n  };\n\n  duplex._read = function () {\n    if (ws.isPaused) ws.resume();\n  };\n\n  duplex._write = function (chunk, encoding, callback) {\n    if (ws.readyState === ws.CONNECTING) {\n      ws.once('open', function open() {\n        duplex._write(chunk, encoding, callback);\n      });\n      return;\n    }\n\n    ws.send(chunk, callback);\n  };\n\n  duplex.on('end', duplexOnEnd);\n  duplex.on('error', duplexOnError);\n  return duplex;\n}\n\nmodule.exports = createWebSocketStream;\n","lib/subprotocol.js":"'use strict';\n\nconst { tokenChars } = require('./validation');\n\n/**\n * Parses the `Sec-WebSocket-Protocol` header into a set of subprotocol names.\n *\n * @param {String} header The field value of the header\n * @return {Set} The subprotocol names\n * @public\n */\nfunction parse(header) {\n  const protocols = new Set();\n  let start = -1;\n  let end = -1;\n  let i = 0;\n\n  for (i; i < header.length; i++) {\n    const code = header.charCodeAt(i);\n\n    if (end === -1 && tokenChars[code] === 1) {\n      if (start === -1) start = i;\n    } else if (\n      i !== 0 &&\n      (code === 0x20 /* ' ' */ || code === 0x09) /* '\\t' */\n    ) {\n      if (end === -1 && start !== -1) end = i;\n    } else if (code === 0x2c /* ',' */) {\n      if (start === -1) {\n        throw new SyntaxError(`Unexpected character at index ${i}`);\n      }\n\n      if (end === -1) end = i;\n\n      const protocol = header.slice(start, end);\n\n      if (protocols.has(protocol)) {\n        throw new SyntaxError(`The \"${protocol}\" subprotocol is duplicated`);\n      }\n\n      protocols.add(protocol);\n      start = end = -1;\n    } else {\n      throw new SyntaxError(`Unexpected character at index ${i}`);\n    }\n  }\n\n  if (start === -1 || end !== -1) {\n    throw new SyntaxError('Unexpected end of input');\n  }\n\n  const protocol = header.slice(start, i);\n\n  if (protocols.has(protocol)) {\n    throw new SyntaxError(`The \"${protocol}\" subprotocol is duplicated`);\n  }\n\n  protocols.add(protocol);\n  return protocols;\n}\n\nmodule.exports = { parse };\n","lib/validation.js":"'use strict';\n\nconst { isUtf8 } = require('buffer');\n\nconst { hasBlob } = require('./constants');\n\n//\n// Allowed token characters:\n//\n// '!', '#', '$', '%', '&', ''', '*', '+', '-',\n// '.', 0-9, A-Z, '^', '_', '`', a-z, '|', '~'\n//\n// tokenChars[32] === 0 // ' '\n// tokenChars[33] === 1 // '!'\n// tokenChars[34] === 0 // '\"'\n// ...\n//\n// prettier-ignore\nconst tokenChars = [\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 0 - 15\n  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, // 16 - 31\n  0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, // 32 - 47\n  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, // 48 - 63\n  0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 64 - 79\n  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, // 80 - 95\n  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, // 96 - 111\n  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0 // 112 - 127\n];\n\n/**\n * Checks if a status code is allowed in a close frame.\n *\n * @param {Number} code The status code\n * @return {Boolean} `true` if the status code is valid, else `false`\n * @public\n */\nfunction isValidStatusCode(code) {\n  return (\n    (code >= 1000 &&\n      code <= 1014 &&\n      code !== 1004 &&\n      code !== 1005 &&\n      code !== 1006) ||\n    (code >= 3000 && code <= 4999)\n  );\n}\n\n/**\n * Checks if a given buffer contains only correct UTF-8.\n * Ported from https://www.cl.cam.ac.uk/%7Emgk25/ucs/utf8_check.c by\n * Markus Kuhn.\n *\n * @param {Buffer} buf The buffer to check\n * @return {Boolean} `true` if `buf` contains only correct UTF-8, else `false`\n * @public\n */\nfunction _isValidUTF8(buf) {\n  const len = buf.length;\n  let i = 0;\n\n  while (i < len) {\n    if ((buf[i] & 0x80) === 0) {\n      // 0xxxxxxx\n      i++;\n    } else if ((buf[i] & 0xe0) === 0xc0) {\n      // 110xxxxx 10xxxxxx\n      if (\n        i + 1 === len ||\n        (buf[i + 1] & 0xc0) !== 0x80 ||\n        (buf[i] & 0xfe) === 0xc0 // Overlong\n      ) {\n        return false;\n      }\n\n      i += 2;\n    } else if ((buf[i] & 0xf0) === 0xe0) {\n      // 1110xxxx 10xxxxxx 10xxxxxx\n      if (\n        i + 2 >= len ||\n        (buf[i + 1] & 0xc0) !== 0x80 ||\n        (buf[i + 2] & 0xc0) !== 0x80 ||\n        (buf[i] === 0xe0 && (buf[i + 1] & 0xe0) === 0x80) || // Overlong\n        (buf[i] === 0xed && (buf[i + 1] & 0xe0) === 0xa0) // Surrogate (U+D800 - U+DFFF)\n      ) {\n        return false;\n      }\n\n      i += 3;\n    } else if ((buf[i] & 0xf8) === 0xf0) {\n      // 11110xxx 10xxxxxx 10xxxxxx 10xxxxxx\n      if (\n        i + 3 >= len ||\n        (buf[i + 1] & 0xc0) !== 0x80 ||\n        (buf[i + 2] & 0xc0) !== 0x80 ||\n        (buf[i + 3] & 0xc0) !== 0x80 ||\n        (buf[i] === 0xf0 && (buf[i + 1] & 0xf0) === 0x80) || // Overlong\n        (buf[i] === 0xf4 && buf[i + 1] > 0x8f) ||\n        buf[i] > 0xf4 // > U+10FFFF\n      ) {\n        return false;\n      }\n\n      i += 4;\n    } else {\n      return false;\n    }\n  }\n\n  return true;\n}\n\n/**\n * Determines whether a value is a `Blob`.\n *\n * @param {*} value The value to be tested\n * @return {Boolean} `true` if `value` is a `Blob`, else `false`\n * @private\n */\nfunction isBlob(value) {\n  return (\n    hasBlob &&\n    typeof value === 'object' &&\n    typeof value.arrayBuffer === 'function' &&\n    typeof value.type === 'string' &&\n    typeof value.stream === 'function' &&\n    (value[Symbol.toStringTag] === 'Blob' ||\n      value[Symbol.toStringTag] === 'File')\n  );\n}\n\nmodule.exports = {\n  isBlob,\n  isValidStatusCode,\n  isValidUTF8: _isValidUTF8,\n  tokenChars\n};\n\nif (isUtf8) {\n  module.exports.isValidUTF8 = function (buf) {\n    return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);\n  };\n} /* istanbul ignore else  */ else if (!process.env.WS_NO_UTF_8_VALIDATE) {\n  try {\n    const isValidUTF8 = require('utf-8-validate');\n\n    module.exports.isValidUTF8 = function (buf) {\n      return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);\n    };\n  } catch (e) {\n    // Continue regardless of the error.\n  }\n}\n","lib/websocket-server.js":"/* eslint no-unused-vars: [\"error\", { \"varsIgnorePattern\": \"^Duplex$\", \"caughtErrors\": \"none\" }] */\n\n'use strict';\n\nconst EventEmitter = require('events');\nconst http = require('http');\nconst { Duplex } = require('stream');\nconst { createHash } = require('crypto');\n\nconst extension = require('./extension');\nconst PerMessageDeflate = require('./permessage-deflate');\nconst subprotocol = require('./subprotocol');\nconst WebSocket = require('./websocket');\nconst { CLOSE_TIMEOUT, GUID, kWebSocket } = require('./constants');\n\nconst keyRegex = /^[+/0-9A-Za-z]{22}==$/;\n\nconst RUNNING = 0;\nconst CLOSING = 1;\nconst CLOSED = 2;\n\n/**\n * Class representing a WebSocket server.\n *\n * @extends EventEmitter\n */\nclass WebSocketServer extends EventEmitter {\n  /**\n   * Create a `WebSocketServer` instance.\n   *\n   * @param {Object} options Configuration options\n   * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether\n   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted\n   *     multiple times in the same tick\n   * @param {Boolean} [options.autoPong=true] Specifies whether or not to\n   *     automatically send a pong in response to a ping\n   * @param {Number} [options.backlog=511] The maximum length of the queue of\n   *     pending connections\n   * @param {Boolean} [options.clientTracking=true] Specifies whether or not to\n   *     track clients\n   * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to\n   *     wait for the closing handshake to finish after `websocket.close()` is\n   *     called\n   * @param {Function} [options.handleProtocols] A hook to handle protocols\n   * @param {String} [options.host] The hostname where to bind the server\n   * @param {Number} [options.maxBufferedChunks=262144] The maximum number of\n   *     buffered data chunks\n   * @param {Number} [options.maxFragments=16384] The maximum number of message\n   *     fragments\n   * @param {Number} [options.maxPayload=104857600] The maximum allowed message\n   *     size\n   * @param {Boolean} [options.noServer=false] Enable no server mode\n   * @param {String} [options.path] Accept only connections matching this path\n   * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable\n   *     permessage-deflate\n   * @param {Number} [options.port] The port where to bind the server\n   * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S\n   *     server to use\n   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or\n   *     not to skip UTF-8 validation for text and close messages\n   * @param {Function} [options.verifyClient] A hook to reject connections\n   * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`\n   *     class to use. It must be the `WebSocket` class or class that extends it\n   * @param {Function} [callback] A listener for the `listening` event\n   */\n  constructor(options, callback) {\n    super();\n\n    options = {\n      allowSynchronousEvents: true,\n      autoPong: true,\n      maxBufferedChunks: 256 * 1024,\n      maxFragments: 16 * 1024,\n      maxPayload: 100 * 1024 * 1024,\n      skipUTF8Validation: false,\n      perMessageDeflate: false,\n      handleProtocols: null,\n      clientTracking: true,\n      closeTimeout: CLOSE_TIMEOUT,\n      verifyClient: null,\n      noServer: false,\n      backlog: null, // use default (511 as implemented in net.js)\n      server: null,\n      host: null,\n      path: null,\n      port: null,\n      WebSocket,\n      ...options\n    };\n\n    if (\n      (options.port == null && !options.server && !options.noServer) ||\n      (options.port != null && (options.server || options.noServer)) ||\n      (options.server && options.noServer)\n    ) {\n      throw new TypeError(\n        'One and only one of the \"port\", \"server\", or \"noServer\" options ' +\n          'must be specified'\n      );\n    }\n\n    if (options.port != null) {\n      this._server = http.createServer((req, res) => {\n        const body = http.STATUS_CODES[426];\n\n        res.writeHead(426, {\n          'Content-Length': body.length,\n          'Content-Type': 'text/plain'\n        });\n        res.end(body);\n      });\n      this._server.listen(\n        options.port,\n        options.host,\n        options.backlog,\n        callback\n      );\n    } else if (options.server) {\n      this._server = options.server;\n    }\n\n    if (this._server) {\n      const emitConnection = this.emit.bind(this, 'connection');\n\n      this._removeListeners = addListeners(this._server, {\n        listening: this.emit.bind(this, 'listening'),\n        error: this.emit.bind(this, 'error'),\n        upgrade: (req, socket, head) => {\n          this.handleUpgrade(req, socket, head, emitConnection);\n        }\n      });\n    }\n\n    if (options.perMessageDeflate === true) options.perMessageDeflate = {};\n    if (options.clientTracking) {\n      this.clients = new Set();\n      this._shouldEmitClose = false;\n    }\n\n    this.options = options;\n    this._state = RUNNING;\n  }\n\n  /**\n   * Returns the bound address, the address family name, and port of the server\n   * as reported by the operating system if listening on an IP socket.\n   * If the server is listening on a pipe or UNIX domain socket, the name is\n   * returned as a string.\n   *\n   * @return {(Object|String|null)} The address of the server\n   * @public\n   */\n  address() {\n    if (this.options.noServer) {\n      throw new Error('The server is operating in \"noServer\" mode');\n    }\n\n    if (!this._server) return null;\n    return this._server.address();\n  }\n\n  /**\n   * Stop the server from accepting new connections and emit the `'close'` event\n   * when all existing connections are closed.\n   *\n   * @param {Function} [cb] A one-time listener for the `'close'` event\n   * @public\n   */\n  close(cb) {\n    if (this._state === CLOSED) {\n      if (cb) {\n        this.once('close', () => {\n          cb(new Error('The server is not running'));\n        });\n      }\n\n      process.nextTick(emitClose, this);\n      return;\n    }\n\n    if (cb) this.once('close', cb);\n\n    if (this._state === CLOSING) return;\n    this._state = CLOSING;\n\n    if (this.options.noServer || this.options.server) {\n      if (this._server) {\n        this._removeListeners();\n        this._removeListeners = this._server = null;\n      }\n\n      if (this.clients) {\n        if (!this.clients.size) {\n          process.nextTick(emitClose, this);\n        } else {\n          this._shouldEmitClose = true;\n        }\n      } else {\n        process.nextTick(emitClose, this);\n      }\n    } else {\n      const server = this._server;\n\n      this._removeListeners();\n      this._removeListeners = this._server = null;\n\n      //\n      // The HTTP/S server was created internally. Close it, and rely on its\n      // `'close'` event.\n      //\n      server.close(() => {\n        emitClose(this);\n      });\n    }\n  }\n\n  /**\n   * See if a given request should be handled by this server instance.\n   *\n   * @param {http.IncomingMessage} req Request object to inspect\n   * @return {Boolean} `true` if the request is valid, else `false`\n   * @public\n   */\n  shouldHandle(req) {\n    if (this.options.path) {\n      const index = req.url.indexOf('?');\n      const pathname = index !== -1 ? req.url.slice(0, index) : req.url;\n\n      if (pathname !== this.options.path) return false;\n    }\n\n    return true;\n  }\n\n  /**\n   * Handle a HTTP Upgrade request.\n   *\n   * @param {http.IncomingMessage} req The request object\n   * @param {Duplex} socket The network socket between the server and client\n   * @param {Buffer} head The first packet of the upgraded stream\n   * @param {Function} cb Callback\n   * @public\n   */\n  handleUpgrade(req, socket, head, cb) {\n    socket.on('error', socketOnError);\n\n    const key = req.headers['sec-websocket-key'];\n    const upgrade = req.headers.upgrade;\n    const version = +req.headers['sec-websocket-version'];\n\n    if (req.method !== 'GET') {\n      const message = 'Invalid HTTP method';\n      abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);\n      return;\n    }\n\n    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {\n      const message = 'Invalid Upgrade header';\n      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);\n      return;\n    }\n\n    if (key === undefined || !keyRegex.test(key)) {\n      const message = 'Missing or invalid Sec-WebSocket-Key header';\n      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);\n      return;\n    }\n\n    if (version !== 13 && version !== 8) {\n      const message = 'Missing or invalid Sec-WebSocket-Version header';\n      abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {\n        'Sec-WebSocket-Version': '13, 8'\n      });\n      return;\n    }\n\n    if (!this.shouldHandle(req)) {\n      abortHandshake(socket, 400);\n      return;\n    }\n\n    const secWebSocketProtocol = req.headers['sec-websocket-protocol'];\n    let protocols = new Set();\n\n    if (secWebSocketProtocol !== undefined) {\n      try {\n        protocols = subprotocol.parse(secWebSocketProtocol);\n      } catch (err) {\n        const message = 'Invalid Sec-WebSocket-Protocol header';\n        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);\n        return;\n      }\n    }\n\n    const secWebSocketExtensions = req.headers['sec-websocket-extensions'];\n    const extensions = {};\n\n    if (\n      this.options.perMessageDeflate &&\n      secWebSocketExtensions !== undefined\n    ) {\n      const perMessageDeflate = new PerMessageDeflate({\n        ...this.options.perMessageDeflate,\n        isServer: true,\n        maxPayload: this.options.maxPayload\n      });\n\n      try {\n        const offers = extension.parse(secWebSocketExtensions);\n\n        if (offers[PerMessageDeflate.extensionName]) {\n          perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);\n          extensions[PerMessageDeflate.extensionName] = perMessageDeflate;\n        }\n      } catch (err) {\n        const message =\n          'Invalid or unacceptable Sec-WebSocket-Extensions header';\n        abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);\n        return;\n      }\n    }\n\n    //\n    // Optionally call external client verification handler.\n    //\n    if (this.options.verifyClient) {\n      const info = {\n        origin:\n          req.headers[`${version === 8 ? 'sec-websocket-origin' : 'origin'}`],\n        secure: !!(req.socket.authorized || req.socket.encrypted),\n        req\n      };\n\n      if (this.options.verifyClient.length === 2) {\n        this.options.verifyClient(info, (verified, code, message, headers) => {\n          if (!verified) {\n            return abortHandshake(socket, code || 401, message, headers);\n          }\n\n          this.completeUpgrade(\n            extensions,\n            key,\n            protocols,\n            req,\n            socket,\n            head,\n            cb\n          );\n        });\n        return;\n      }\n\n      if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);\n    }\n\n    this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);\n  }\n\n  /**\n   * Upgrade the connection to WebSocket.\n   *\n   * @param {Object} extensions The accepted extensions\n   * @param {String} key The value of the `Sec-WebSocket-Key` header\n   * @param {Set} protocols The subprotocols\n   * @param {http.IncomingMessage} req The request object\n   * @param {Duplex} socket The network socket between the server and client\n   * @param {Buffer} head The first packet of the upgraded stream\n   * @param {Function} cb Callback\n   * @throws {Error} If called more than once with the same socket\n   * @private\n   */\n  completeUpgrade(extensions, key, protocols, req, socket, head, cb) {\n    //\n    // Destroy the socket if the client has already sent a FIN packet.\n    //\n    if (!socket.readable || !socket.writable) return socket.destroy();\n\n    if (socket[kWebSocket]) {\n      throw new Error(\n        'server.handleUpgrade() was called more than once with the same ' +\n          'socket, possibly due to a misconfiguration'\n      );\n    }\n\n    if (this._state > RUNNING) return abortHandshake(socket, 503);\n\n    const digest = createHash('sha1')\n      .update(key + GUID)\n      .digest('base64');\n\n    const headers = [\n      'HTTP/1.1 101 Switching Protocols',\n      'Upgrade: websocket',\n      'Connection: Upgrade',\n      `Sec-WebSocket-Accept: ${digest}`\n    ];\n\n    const ws = new this.options.WebSocket(null, undefined, this.options);\n\n    if (protocols.size) {\n      //\n      // Optionally call external protocol selection handler.\n      //\n      const protocol = this.options.handleProtocols\n        ? this.options.handleProtocols(protocols, req)\n        : protocols.values().next().value;\n\n      if (protocol) {\n        headers.push(`Sec-WebSocket-Protocol: ${protocol}`);\n        ws._protocol = protocol;\n      }\n    }\n\n    if (extensions[PerMessageDeflate.extensionName]) {\n      const params = extensions[PerMessageDeflate.extensionName].params;\n      const value = extension.format({\n        [PerMessageDeflate.extensionName]: [params]\n      });\n      headers.push(`Sec-WebSocket-Extensions: ${value}`);\n      ws._extensions = extensions;\n    }\n\n    //\n    // Allow external modification/inspection of handshake headers.\n    //\n    this.emit('headers', headers, req);\n\n    socket.write(headers.concat('\\r\\n').join('\\r\\n'));\n    socket.removeListener('error', socketOnError);\n\n    ws.setSocket(socket, head, {\n      allowSynchronousEvents: this.options.allowSynchronousEvents,\n      maxBufferedChunks: this.options.maxBufferedChunks,\n      maxFragments: this.options.maxFragments,\n      maxPayload: this.options.maxPayload,\n      skipUTF8Validation: this.options.skipUTF8Validation\n    });\n\n    if (this.clients) {\n      this.clients.add(ws);\n      ws.on('close', () => {\n        this.clients.delete(ws);\n\n        if (this._shouldEmitClose && !this.clients.size) {\n          process.nextTick(emitClose, this);\n        }\n      });\n    }\n\n    cb(ws, req);\n  }\n}\n\nmodule.exports = WebSocketServer;\n\n/**\n * Add event listeners on an `EventEmitter` using a map of <event, listener>\n * pairs.\n *\n * @param {EventEmitter} server The event emitter\n * @param {Object.<String, Function>} map The listeners to add\n * @return {Function} A function that will remove the added listeners when\n *     called\n * @private\n */\nfunction addListeners(server, map) {\n  for (const event of Object.keys(map)) server.on(event, map[event]);\n\n  return function removeListeners() {\n    for (const event of Object.keys(map)) {\n      server.removeListener(event, map[event]);\n    }\n  };\n}\n\n/**\n * Emit a `'close'` event on an `EventEmitter`.\n *\n * @param {EventEmitter} server The event emitter\n * @private\n */\nfunction emitClose(server) {\n  server._state = CLOSED;\n  server.emit('close');\n}\n\n/**\n * Handle socket errors.\n *\n * @private\n */\nfunction socketOnError() {\n  this.destroy();\n}\n\n/**\n * Close the connection when preconditions are not fulfilled.\n *\n * @param {Duplex} socket The socket of the upgrade request\n * @param {Number} code The HTTP response status code\n * @param {String} [message] The HTTP response body\n * @param {Object} [headers] Additional HTTP response headers\n * @private\n */\nfunction abortHandshake(socket, code, message, headers) {\n  //\n  // The socket is writable unless the user destroyed or ended it before calling\n  // `server.handleUpgrade()` or in the `verifyClient` function, which is a user\n  // error. Handling this does not make much sense as the worst that can happen\n  // is that some of the data written by the user might be discarded due to the\n  // call to `socket.end()` below, which triggers an `'error'` event that in\n  // turn causes the socket to be destroyed.\n  //\n  message = message || http.STATUS_CODES[code];\n  headers = {\n    Connection: 'close',\n    'Content-Type': 'text/html',\n    'Content-Length': Buffer.byteLength(message),\n    ...headers\n  };\n\n  socket.once('finish', socket.destroy);\n\n  socket.end(\n    `HTTP/1.1 ${code} ${http.STATUS_CODES[code]}\\r\\n` +\n      Object.keys(headers)\n        .map((h) => `${h}: ${headers[h]}`)\n        .join('\\r\\n') +\n      '\\r\\n\\r\\n' +\n      message\n  );\n}\n\n/**\n * Emit a `'wsClientError'` event on a `WebSocketServer` if there is at least\n * one listener for it, otherwise call `abortHandshake()`.\n *\n * @param {WebSocketServer} server The WebSocket server\n * @param {http.IncomingMessage} req The request object\n * @param {Duplex} socket The socket of the upgrade request\n * @param {Number} code The HTTP response status code\n * @param {String} message The HTTP response body\n * @param {Object} [headers] The HTTP response headers\n * @private\n */\nfunction abortHandshakeOrEmitwsClientError(\n  server,\n  req,\n  socket,\n  code,\n  message,\n  headers\n) {\n  if (server.listenerCount('wsClientError')) {\n    const err = new Error(message);\n    Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);\n\n    server.emit('wsClientError', err, socket, req);\n  } else {\n    abortHandshake(socket, code, message, headers);\n  }\n}\n","lib/websocket.js":"/* eslint no-unused-vars: [\"error\", { \"varsIgnorePattern\": \"^Duplex|Readable$\", \"caughtErrors\": \"none\" }] */\n\n'use strict';\n\nconst EventEmitter = require('events');\nconst https = require('https');\nconst http = require('http');\nconst net = require('net');\nconst tls = require('tls');\nconst { randomBytes, createHash } = require('crypto');\nconst { Duplex, Readable } = require('stream');\nconst { URL } = require('url');\n\nconst PerMessageDeflate = require('./permessage-deflate');\nconst Receiver = require('./receiver');\nconst Sender = require('./sender');\nconst { isBlob } = require('./validation');\n\nconst {\n  BINARY_TYPES,\n  CLOSE_TIMEOUT,\n  EMPTY_BUFFER,\n  GUID,\n  kForOnEventAttribute,\n  kListener,\n  kStatusCode,\n  kWebSocket,\n  NOOP\n} = require('./constants');\nconst {\n  EventTarget: { addEventListener, removeEventListener }\n} = require('./event-target');\nconst { format, parse } = require('./extension');\nconst { toBuffer } = require('./buffer-util');\n\nconst kAborted = Symbol('kAborted');\nconst protocolVersions = [8, 13];\nconst readyStates = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];\nconst subprotocolRegex = /^[!#$%&'*+\\-.0-9A-Z^_`|a-z~]+$/;\n\n/**\n * Class representing a WebSocket.\n *\n * @extends EventEmitter\n */\nclass WebSocket extends EventEmitter {\n  /**\n   * Create a new `WebSocket`.\n   *\n   * @param {(String|URL)} address The URL to which to connect\n   * @param {(String|String[])} [protocols] The subprotocols\n   * @param {Object} [options] Connection options\n   */\n  constructor(address, protocols, options) {\n    super();\n\n    this._binaryType = BINARY_TYPES[0];\n    this._closeCode = 1006;\n    this._closeFrameReceived = false;\n    this._closeFrameSent = false;\n    this._closeMessage = EMPTY_BUFFER;\n    this._closeTimer = null;\n    this._errorEmitted = false;\n    this._extensions = {};\n    this._paused = false;\n    this._protocol = '';\n    this._readyState = WebSocket.CONNECTING;\n    this._receiver = null;\n    this._sender = null;\n    this._socket = null;\n\n    if (address !== null) {\n      this._bufferedAmount = 0;\n      this._isServer = false;\n      this._redirects = 0;\n\n      if (protocols === undefined) {\n        protocols = [];\n      } else if (!Array.isArray(protocols)) {\n        if (typeof protocols === 'object' && protocols !== null) {\n          options = protocols;\n          protocols = [];\n        } else {\n          protocols = [protocols];\n        }\n      }\n\n      initAsClient(this, address, protocols, options);\n    } else {\n      this._autoPong = options.autoPong;\n      this._closeTimeout = options.closeTimeout;\n      this._isServer = true;\n    }\n  }\n\n  /**\n   * For historical reasons, the custom \"nodebuffer\" type is used by the default\n   * instead of \"blob\".\n   *\n   * @type {String}\n   */\n  get binaryType() {\n    return this._binaryType;\n  }\n\n  set binaryType(type) {\n    if (!BINARY_TYPES.includes(type)) return;\n\n    this._binaryType = type;\n\n    //\n    // Allow to change `binaryType` on the fly.\n    //\n    if (this._receiver) this._receiver._binaryType = type;\n  }\n\n  /**\n   * @type {Number}\n   */\n  get bufferedAmount() {\n    if (!this._socket) return this._bufferedAmount;\n\n    return this._socket._writableState.length + this._sender._bufferedBytes;\n  }\n\n  /**\n   * @type {String}\n   */\n  get extensions() {\n    return Object.keys(this._extensions).join();\n  }\n\n  /**\n   * @type {Boolean}\n   */\n  get isPaused() {\n    return this._paused;\n  }\n\n  /**\n   * @type {Function}\n   */\n  /* istanbul ignore next */\n  get onclose() {\n    return null;\n  }\n\n  /**\n   * @type {Function}\n   */\n  /* istanbul ignore next */\n  get onerror() {\n    return null;\n  }\n\n  /**\n   * @type {Function}\n   */\n  /* istanbul ignore next */\n  get onopen() {\n    return null;\n  }\n\n  /**\n   * @type {Function}\n   */\n  /* istanbul ignore next */\n  get onmessage() {\n    return null;\n  }\n\n  /**\n   * @type {String}\n   */\n  get protocol() {\n    return this._protocol;\n  }\n\n  /**\n   * @type {Number}\n   */\n  get readyState() {\n    return this._readyState;\n  }\n\n  /**\n   * @type {String}\n   */\n  get url() {\n    return this._url;\n  }\n\n  /**\n   * Set up the socket and the internal resources.\n   *\n   * @param {Duplex} socket The network socket between the server and client\n   * @param {Buffer} head The first packet of the upgraded stream\n   * @param {Object} options Options object\n   * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether\n   *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted\n   *     multiple times in the same tick\n   * @param {Function} [options.generateMask] The function used to generate the\n   *     masking key\n   * @param {Number} [options.maxBufferedChunks=0] The maximum number of\n   *     buffered data chunks\n   * @param {Number} [options.maxFragments=0] The maximum number of message\n   *     fragments\n   * @param {Number} [options.maxPayload=0] The maximum allowed message size\n   * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or\n   *     not to skip UTF-8 validation for text and close messages\n   * @private\n   */\n  setSocket(socket, head, options) {\n    const receiver = new Receiver({\n      allowSynchronousEvents: options.allowSynchronousEvents,\n      binaryType: this.binaryType,\n      extensions: this._extensions,\n      isServer: this._isServer,\n      maxBufferedChunks: options.maxBufferedChunks,\n      maxFragments: options.maxFragments,\n      maxPayload: options.maxPayload,\n      skipUTF8Validation: options.skipUTF8Validation\n    });\n\n    const sender = new Sender(socket, this._extensions, options.generateMask);\n\n    this._receiver = receiver;\n    this._sender = sender;\n    this._socket = socket;\n\n    receiver[kWebSocket] = this;\n    sender[kWebSocket] = this;\n    socket[kWebSocket] = this;\n\n    receiver.on('conclude', receiverOnConclude);\n    receiver.on('drain', receiverOnDrain);\n    receiver.on('error', receiverOnError);\n    receiver.on('message', receiverOnMessage);\n    receiver.on('ping', receiverOnPing);\n    receiver.on('pong', receiverOnPong);\n\n    sender.onerror = senderOnError;\n\n    //\n    // These methods may not be available if `socket` is just a `Duplex`.\n    //\n    if (socket.setTimeout) socket.setTimeout(0);\n    if (socket.setNoDelay) socket.setNoDelay();\n\n    if (head.length > 0) socket.unshift(head);\n\n    socket.on('close', socketOnClose);\n    socket.on('data', socketOnData);\n    socket.on('end', socketOnEnd);\n    socket.on('error', socketOnError);\n\n    this._readyState = WebSocket.OPEN;\n    this.emit('open');\n  }\n\n  /**\n   * Emit the `'close'` event.\n   *\n   * @private\n   */\n  emitClose() {\n    if (!this._socket) {\n      this._readyState = WebSocket.CLOSED;\n      this.emit('close', this._closeCode, this._closeMessage);\n      return;\n    }\n\n    if (this._extensions[PerMessageDeflate.extensionName]) {\n      this._extensions[PerMessageDeflate.extensionName].cleanup();\n    }\n\n    this._receiver.removeAllListeners();\n    this._readyState = WebSocket.CLOSED;\n    this.emit('close', this._closeCode, this._closeMessage);\n  }\n\n  /**\n   * Start a closing handshake.\n   *\n   *          +----------+   +-----------+   +----------+\n   *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -\n   *    |     +----------+   +-----------+   +----------+     |\n   *          +----------+   +-----------+         |\n   * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING\n   *          +----------+   +-----------+   |\n   *    |           |                        |   +---+        |\n   *                +------------------------+-->|fin| - - - -\n   *    |         +---+                      |   +---+\n   *     - - - - -|fin|<---------------------+\n   *              +---+\n   *\n   * @param {Number} [code] Status code explaining why the connection is closing\n   * @param {(String|Buffer)} [data] The reason why the connection is\n   *     closing\n   * @public\n   */\n  close(code, data) {\n    if (this.readyState === WebSocket.CLOSED) return;\n    if (this.readyState === WebSocket.CONNECTING) {\n      const msg = 'WebSocket was closed before the connection was established';\n      abortHandshake(this, this._req, msg);\n      return;\n    }\n\n    if (this.readyState === WebSocket.CLOSING) {\n      if (\n        this._closeFrameSent &&\n        (this._closeFrameReceived || this._receiver._writableState.errorEmitted)\n      ) {\n        this._socket.end();\n      }\n\n      return;\n    }\n\n    this._readyState = WebSocket.CLOSING;\n    this._sender.close(code, data, !this._isServer, (err) => {\n      //\n      // This error is handled by the `'error'` listener on the socket. We only\n      // want to know if the close frame has been sent here.\n      //\n      if (err) return;\n\n      this._closeFrameSent = true;\n\n      if (\n        this._closeFrameReceived ||\n        this._receiver._writableState.errorEmitted\n      ) {\n        this._socket.end();\n      }\n    });\n\n    setCloseTimer(this);\n  }\n\n  /**\n   * Pause the socket.\n   *\n   * @public\n   */\n  pause() {\n    if (\n      this.readyState === WebSocket.CONNECTING ||\n      this.readyState === WebSocket.CLOSED\n    ) {\n      return;\n    }\n\n    this._paused = true;\n    this._socket.pause();\n  }\n\n  /**\n   * Send a ping.\n   *\n   * @param {*} [data] The data to send\n   * @param {Boolean} [mask] Indicates whether or not to mask `data`\n   * @param {Function} [cb] Callback which is executed when the ping is sent\n   * @public\n   */\n  ping(data, mask, cb) {\n    if (this.readyState === WebSocket.CONNECTING) {\n      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');\n    }\n\n    if (typeof data === 'function') {\n      cb = data;\n      data = mask = undefined;\n    } else if (typeof mask === 'function') {\n      cb = mask;\n      mask = undefined;\n    }\n\n    if (typeof data === 'number') data = data.toString();\n\n    if (this.readyState !== WebSocket.OPEN) {\n      sendAfterClose(this, data, cb);\n      return;\n    }\n\n    if (mask === undefined) mask = !this._isServer;\n    this._sender.ping(data || EMPTY_BUFFER, mask, cb);\n  }\n\n  /**\n   * Send a pong.\n   *\n   * @param {*} [data] The data to send\n   * @param {Boolean} [mask] Indicates whether or not to mask `data`\n   * @param {Function} [cb] Callback which is executed when the pong is sent\n   * @public\n   */\n  pong(data, mask, cb) {\n    if (this.readyState === WebSocket.CONNECTING) {\n      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');\n    }\n\n    if (typeof data === 'function') {\n      cb = data;\n      data = mask = undefined;\n    } else if (typeof mask === 'function') {\n      cb = mask;\n      mask = undefined;\n    }\n\n    if (typeof data === 'number') data = data.toString();\n\n    if (this.readyState !== WebSocket.OPEN) {\n      sendAfterClose(this, data, cb);\n      return;\n    }\n\n    if (mask === undefined) mask = !this._isServer;\n    this._sender.pong(data || EMPTY_BUFFER, mask, cb);\n  }\n\n  /**\n   * Resume the socket.\n   *\n   * @public\n   */\n  resume() {\n    if (\n      this.readyState === WebSocket.CONNECTING ||\n      this.readyState === WebSocket.CLOSED\n    ) {\n      return;\n    }\n\n    this._paused = false;\n    if (!this._receiver._writableState.needDrain) this._socket.resume();\n  }\n\n  /**\n   * Send a data message.\n   *\n   * @param {*} data The message to send\n   * @param {Object} [options] Options object\n   * @param {Boolean} [options.binary] Specifies whether `data` is binary or\n   *     text\n   * @param {Boolean} [options.compress] Specifies whether or not to compress\n   *     `data`\n   * @param {Boolean} [options.fin=true] Specifies whether the fragment is the\n   *     last one\n   * @param {Boolean} [options.mask] Specifies whether or not to mask `data`\n   * @param {Function} [cb] Callback which is executed when data is written out\n   * @public\n   */\n  send(data, options, cb) {\n    if (this.readyState === WebSocket.CONNECTING) {\n      throw new Error('WebSocket is not open: readyState 0 (CONNECTING)');\n    }\n\n    if (typeof options === 'function') {\n      cb = options;\n      options = {};\n    }\n\n    if (typeof data === 'number') data = data.toString();\n\n    if (this.readyState !== WebSocket.OPEN) {\n      sendAfterClose(this, data, cb);\n      return;\n    }\n\n    const opts = {\n      binary: typeof data !== 'string',\n      mask: !this._isServer,\n      compress: true,\n      fin: true,\n      ...options\n    };\n\n    if (!this._extensions[PerMessageDeflate.extensionName]) {\n      opts.compress = false;\n    }\n\n    this._sender.send(data || EMPTY_BUFFER, opts, cb);\n  }\n\n  /**\n   * Forcibly close the connection.\n   *\n   * @public\n   */\n  terminate() {\n    if (this.readyState === WebSocket.CLOSED) return;\n    if (this.readyState === WebSocket.CONNECTING) {\n      const msg = 'WebSocket was closed before the connection was established';\n      abortHandshake(this, this._req, msg);\n      return;\n    }\n\n    if (this._socket) {\n      this._readyState = WebSocket.CLOSING;\n      this._socket.destroy();\n    }\n  }\n}\n\n/**\n * @constant {Number} CONNECTING\n * @memberof WebSocket\n */\nObject.defineProperty(WebSocket, 'CONNECTING', {\n  enumerable: true,\n  value: readyStates.indexOf('CONNECTING')\n});\n\n/**\n * @constant {Number} CONNECTING\n * @memberof WebSocket.prototype\n */\nObject.defineProperty(WebSocket.prototype, 'CONNECTING', {\n  enumerable: true,\n  value: readyStates.indexOf('CONNECTING')\n});\n\n/**\n * @constant {Number} OPEN\n * @memberof WebSocket\n */\nObject.defineProperty(WebSocket, 'OPEN', {\n  enumerable: true,\n  value: readyStates.indexOf('OPEN')\n});\n\n/**\n * @constant {Number} OPEN\n * @memberof WebSocket.prototype\n */\nObject.defineProperty(WebSocket.prototype, 'OPEN', {\n  enumerable: true,\n  value: readyStates.indexOf('OPEN')\n});\n\n/**\n * @constant {Number} CLOSING\n * @memberof WebSocket\n */\nObject.defineProperty(WebSocket, 'CLOSING', {\n  enumerable: true,\n  value: readyStates.indexOf('CLOSING')\n});\n\n/**\n * @constant {Number} CLOSING\n * @memberof WebSocket.prototype\n */\nObject.defineProperty(WebSocket.prototype, 'CLOSING', {\n  enumerable: true,\n  value: readyStates.indexOf('CLOSING')\n});\n\n/**\n * @constant {Number} CLOSED\n * @memberof WebSocket\n */\nObject.defineProperty(WebSocket, 'CLOSED', {\n  enumerable: true,\n  value: readyStates.indexOf('CLOSED')\n});\n\n/**\n * @constant {Number} CLOSED\n * @memberof WebSocket.prototype\n */\nObject.defineProperty(WebSocket.prototype, 'CLOSED', {\n  enumerable: true,\n  value: readyStates.indexOf('CLOSED')\n});\n\n[\n  'binaryType',\n  'bufferedAmount',\n  'extensions',\n  'isPaused',\n  'protocol',\n  'readyState',\n  'url'\n].forEach((property) => {\n  Object.defineProperty(WebSocket.prototype, property, { enumerable: true });\n});\n\n//\n// Add the `onopen`, `onerror`, `onclose`, and `onmessage` attributes.\n// See https://html.spec.whatwg.org/multipage/comms.html#the-websocket-interface\n//\n['open', 'error', 'close', 'message'].forEach((method) => {\n  Object.defineProperty(WebSocket.prototype, `on${method}`, {\n    enumerable: true,\n    get() {\n      for (const listener of this.listeners(method)) {\n        if (listener[kForOnEventAttribute]) return listener[kListener];\n      }\n\n      return null;\n    },\n    set(handler) {\n      for (const listener of this.listeners(method)) {\n        if (listener[kForOnEventAttribute]) {\n          this.removeListener(method, listener);\n          break;\n        }\n      }\n\n      if (typeof handler !== 'function') return;\n\n      this.addEventListener(method, handler, {\n        [kForOnEventAttribute]: true\n      });\n    }\n  });\n});\n\nWebSocket.prototype.addEventListener = addEventListener;\nWebSocket.prototype.removeEventListener = removeEventListener;\n\nmodule.exports = WebSocket;\n\n/**\n * Initialize a WebSocket client.\n *\n * @param {WebSocket} websocket The client to initialize\n * @param {(String|URL)} address The URL to which to connect\n * @param {Array} protocols The subprotocols\n * @param {Object} [options] Connection options\n * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether any\n *     of the `'message'`, `'ping'`, and `'pong'` events can be emitted multiple\n *     times in the same tick\n * @param {Boolean} [options.autoPong=true] Specifies whether or not to\n *     automatically send a pong in response to a ping\n * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to wait\n *     for the closing handshake to finish after `websocket.close()` is called\n * @param {Function} [options.finishRequest] A function which can be used to\n *     customize the headers of each http request before it is sent\n * @param {Boolean} [options.followRedirects=false] Whether or not to follow\n *     redirects\n * @param {Function} [options.generateMask] The function used to generate the\n *     masking key\n * @param {Number} [options.handshakeTimeout] Timeout in milliseconds for the\n *     handshake request\n * @param {Number} [options.maxBufferedChunks=262144] The maximum number of\n *     buffered data chunks\n * @param {Number} [options.maxFragments=16384] The maximum number of message\n *     fragments\n * @param {Number} [options.maxPayload=104857600] The maximum allowed message\n *     size\n * @param {Number} [options.maxRedirects=10] The maximum number of redirects\n *     allowed\n * @param {String} [options.origin] Value of the `Origin` or\n *     `Sec-WebSocket-Origin` header\n * @param {(Boolean|Object)} [options.perMessageDeflate=true] Enable/disable\n *     permessage-deflate\n * @param {Number} [options.protocolVersion=13] Value of the\n *     `Sec-WebSocket-Version` header\n * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or\n *     not to skip UTF-8 validation for text and close messages\n * @private\n */\nfunction initAsClient(websocket, address, protocols, options) {\n  const opts = {\n    allowSynchronousEvents: true,\n    autoPong: true,\n    closeTimeout: CLOSE_TIMEOUT,\n    protocolVersion: protocolVersions[1],\n    maxBufferedChunks: 256 * 1024,\n    maxFragments: 16 * 1024,\n    maxPayload: 100 * 1024 * 1024,\n    skipUTF8Validation: false,\n    perMessageDeflate: true,\n    followRedirects: false,\n    maxRedirects: 10,\n    ...options,\n    socketPath: undefined,\n    hostname: undefined,\n    protocol: undefined,\n    timeout: undefined,\n    method: 'GET',\n    host: undefined,\n    path: undefined,\n    port: undefined\n  };\n\n  websocket._autoPong = opts.autoPong;\n  websocket._closeTimeout = opts.closeTimeout;\n\n  if (!protocolVersions.includes(opts.protocolVersion)) {\n    throw new RangeError(\n      `Unsupported protocol version: ${opts.protocolVersion} ` +\n        `(supported versions: ${protocolVersions.join(', ')})`\n    );\n  }\n\n  let parsedUrl;\n\n  if (address instanceof URL) {\n    parsedUrl = address;\n  } else {\n    try {\n      parsedUrl = new URL(address);\n    } catch {\n      throw new SyntaxError(`Invalid URL: ${address}`);\n    }\n  }\n\n  if (parsedUrl.protocol === 'http:') {\n    parsedUrl.protocol = 'ws:';\n  } else if (parsedUrl.protocol === 'https:') {\n    parsedUrl.protocol = 'wss:';\n  }\n\n  websocket._url = parsedUrl.href;\n\n  const isSecure = parsedUrl.protocol === 'wss:';\n  const isIpcUrl = parsedUrl.protocol === 'ws+unix:';\n  let invalidUrlMessage;\n\n  if (parsedUrl.protocol !== 'ws:' && !isSecure && !isIpcUrl) {\n    invalidUrlMessage =\n      'The URL\\'s protocol must be one of \"ws:\", \"wss:\", ' +\n      '\"http:\", \"https:\", or \"ws+unix:\"';\n  } else if (isIpcUrl && !parsedUrl.pathname) {\n    invalidUrlMessage = \"The URL's pathname is empty\";\n  } else if (parsedUrl.hash) {\n    invalidUrlMessage = 'The URL contains a fragment identifier';\n  }\n\n  if (invalidUrlMessage) {\n    const err = new SyntaxError(invalidUrlMessage);\n\n    if (websocket._redirects === 0) {\n      throw err;\n    } else {\n      emitErrorAndClose(websocket, err);\n      return;\n    }\n  }\n\n  const defaultPort = isSecure ? 443 : 80;\n  const key = randomBytes(16).toString('base64');\n  const request = isSecure ? https.request : http.request;\n  const protocolSet = new Set();\n  let perMessageDeflate;\n\n  opts.createConnection =\n    opts.createConnection || (isSecure ? tlsConnect : netConnect);\n  opts.defaultPort = opts.defaultPort || defaultPort;\n  opts.port = parsedUrl.port || defaultPort;\n  opts.host = parsedUrl.hostname.startsWith('[')\n    ? parsedUrl.hostname.slice(1, -1)\n    : parsedUrl.hostname;\n  opts.headers = {\n    ...opts.headers,\n    'Sec-WebSocket-Version': opts.protocolVersion,\n    'Sec-WebSocket-Key': key,\n    Connection: 'Upgrade',\n    Upgrade: 'websocket'\n  };\n  opts.path = parsedUrl.pathname + parsedUrl.search;\n  opts.timeout = opts.handshakeTimeout;\n\n  if (opts.perMessageDeflate) {\n    perMessageDeflate = new PerMessageDeflate({\n      ...opts.perMessageDeflate,\n      isServer: false,\n      maxPayload: opts.maxPayload\n    });\n    opts.headers['Sec-WebSocket-Extensions'] = format({\n      [PerMessageDeflate.extensionName]: perMessageDeflate.offer()\n    });\n  }\n  if (protocols.length) {\n    for (const protocol of protocols) {\n      if (\n        typeof protocol !== 'string' ||\n        !subprotocolRegex.test(protocol) ||\n        protocolSet.has(protocol)\n      ) {\n        throw new SyntaxError(\n          'An invalid or duplicated subprotocol was specified'\n        );\n      }\n\n      protocolSet.add(protocol);\n    }\n\n    opts.headers['Sec-WebSocket-Protocol'] = protocols.join(',');\n  }\n  if (opts.origin) {\n    if (opts.protocolVersion < 13) {\n      opts.headers['Sec-WebSocket-Origin'] = opts.origin;\n    } else {\n      opts.headers.Origin = opts.origin;\n    }\n  }\n  if (parsedUrl.username || parsedUrl.password) {\n    opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;\n  }\n\n  if (isIpcUrl) {\n    const parts = opts.path.split(':');\n\n    opts.socketPath = parts[0];\n    opts.path = parts[1];\n  }\n\n  let req;\n\n  if (opts.followRedirects) {\n    if (websocket._redirects === 0) {\n      websocket._originalIpc = isIpcUrl;\n      websocket._originalSecure = isSecure;\n      websocket._originalHostOrSocketPath = isIpcUrl\n        ? opts.socketPath\n        : parsedUrl.host;\n\n      const headers = options && options.headers;\n\n      //\n      // Shallow copy the user provided options so that headers can be changed\n      // without mutating the original object.\n      //\n      options = { ...options, headers: {} };\n\n      if (headers) {\n        for (const [key, value] of Object.entries(headers)) {\n          options.headers[key.toLowerCase()] = value;\n        }\n      }\n    } else if (websocket.listenerCount('redirect') === 0) {\n      const isSameHost = isIpcUrl\n        ? websocket._originalIpc\n          ? opts.socketPath === websocket._originalHostOrSocketPath\n          : false\n        : websocket._originalIpc\n          ? false\n          : parsedUrl.host === websocket._originalHostOrSocketPath;\n\n      if (!isSameHost || (websocket._originalSecure && !isSecure)) {\n        //\n        // Match curl 7.77.0 behavior and drop the following headers. These\n        // headers are also dropped when following a redirect to a subdomain.\n        //\n        delete opts.headers.authorization;\n        delete opts.headers.cookie;\n\n        if (!isSameHost) delete opts.headers.host;\n\n        opts.auth = undefined;\n      }\n    }\n\n    //\n    // Match curl 7.77.0 behavior and make the first `Authorization` header win.\n    // If the `Authorization` header is set, then there is nothing to do as it\n    // will take precedence.\n    //\n    if (opts.auth && !options.headers.authorization) {\n      options.headers.authorization =\n        'Basic ' + Buffer.from(opts.auth).toString('base64');\n    }\n\n    req = websocket._req = request(opts);\n\n    if (websocket._redirects) {\n      //\n      // Unlike what is done for the `'upgrade'` event, no early exit is\n      // triggered here if the user calls `websocket.close()` or\n      // `websocket.terminate()` from a listener of the `'redirect'` event. This\n      // is because the user can also call `request.destroy()` with an error\n      // before calling `websocket.close()` or `websocket.terminate()` and this\n      // would result in an error being emitted on the `request` object with no\n      // `'error'` event listeners attached.\n      //\n      websocket.emit('redirect', websocket.url, req);\n    }\n  } else {\n    req = websocket._req = request(opts);\n  }\n\n  if (opts.timeout) {\n    req.on('timeout', () => {\n      abortHandshake(websocket, req, 'Opening handshake has timed out');\n    });\n  }\n\n  req.on('error', (err) => {\n    if (req === null || req[kAborted]) return;\n\n    req = websocket._req = null;\n    emitErrorAndClose(websocket, err);\n  });\n\n  req.on('response', (res) => {\n    const location = res.headers.location;\n    const statusCode = res.statusCode;\n\n    if (\n      location &&\n      opts.followRedirects &&\n      statusCode >= 300 &&\n      statusCode < 400\n    ) {\n      if (++websocket._redirects > opts.maxRedirects) {\n        abortHandshake(websocket, req, 'Maximum redirects exceeded');\n        return;\n      }\n\n      req.abort();\n\n      let addr;\n\n      try {\n        addr = new URL(location, address);\n      } catch (e) {\n        const err = new SyntaxError(`Invalid URL: ${location}`);\n        emitErrorAndClose(websocket, err);\n        return;\n      }\n\n      initAsClient(websocket, addr, protocols, options);\n    } else if (!websocket.emit('unexpected-response', req, res)) {\n      abortHandshake(\n        websocket,\n        req,\n        `Unexpected server response: ${res.statusCode}`\n      );\n    }\n  });\n\n  req.on('upgrade', (res, socket, head) => {\n    websocket.emit('upgrade', res);\n\n    //\n    // The user may have closed the connection from a listener of the\n    // `'upgrade'` event.\n    //\n    if (websocket.readyState !== WebSocket.CONNECTING) return;\n\n    req = websocket._req = null;\n\n    const upgrade = res.headers.upgrade;\n\n    if (upgrade === undefined || upgrade.toLowerCase() !== 'websocket') {\n      abortHandshake(websocket, socket, 'Invalid Upgrade header');\n      return;\n    }\n\n    const digest = createHash('sha1')\n      .update(key + GUID)\n      .digest('base64');\n\n    if (res.headers['sec-websocket-accept'] !== digest) {\n      abortHandshake(websocket, socket, 'Invalid Sec-WebSocket-Accept header');\n      return;\n    }\n\n    const serverProt = res.headers['sec-websocket-protocol'];\n    let protError;\n\n    if (serverProt !== undefined) {\n      if (!protocolSet.size) {\n        protError = 'Server sent a subprotocol but none was requested';\n      } else if (!protocolSet.has(serverProt)) {\n        protError = 'Server sent an invalid subprotocol';\n      }\n    } else if (protocolSet.size) {\n      protError = 'Server sent no subprotocol';\n    }\n\n    if (protError) {\n      abortHandshake(websocket, socket, protError);\n      return;\n    }\n\n    if (serverProt) websocket._protocol = serverProt;\n\n    const secWebSocketExtensions = res.headers['sec-websocket-extensions'];\n\n    if (secWebSocketExtensions !== undefined) {\n      if (!perMessageDeflate) {\n        const message =\n          'Server sent a Sec-WebSocket-Extensions header but no extension ' +\n          'was requested';\n        abortHandshake(websocket, socket, message);\n        return;\n      }\n\n      let extensions;\n\n      try {\n        extensions = parse(secWebSocketExtensions);\n      } catch (err) {\n        const message = 'Invalid Sec-WebSocket-Extensions header';\n        abortHandshake(websocket, socket, message);\n        return;\n      }\n\n      const extensionNames = Object.keys(extensions);\n\n      if (\n        extensionNames.length !== 1 ||\n        extensionNames[0] !== PerMessageDeflate.extensionName\n      ) {\n        const message = 'Server indicated an extension that was not requested';\n        abortHandshake(websocket, socket, message);\n        return;\n      }\n\n      try {\n        perMessageDeflate.accept(extensions[PerMessageDeflate.extensionName]);\n      } catch (err) {\n        const message = 'Invalid Sec-WebSocket-Extensions header';\n        abortHandshake(websocket, socket, message);\n        return;\n      }\n\n      websocket._extensions[PerMessageDeflate.extensionName] =\n        perMessageDeflate;\n    }\n\n    websocket.setSocket(socket, head, {\n      allowSynchronousEvents: opts.allowSynchronousEvents,\n      generateMask: opts.generateMask,\n      maxBufferedChunks: opts.maxBufferedChunks,\n      maxFragments: opts.maxFragments,\n      maxPayload: opts.maxPayload,\n      skipUTF8Validation: opts.skipUTF8Validation\n    });\n  });\n\n  if (opts.finishRequest) {\n    opts.finishRequest(req, websocket);\n  } else {\n    req.end();\n  }\n}\n\n/**\n * Emit the `'error'` and `'close'` events.\n *\n * @param {WebSocket} websocket The WebSocket instance\n * @param {Error} The error to emit\n * @private\n */\nfunction emitErrorAndClose(websocket, err) {\n  websocket._readyState = WebSocket.CLOSING;\n  //\n  // The following assignment is practically useless and is done only for\n  // consistency.\n  //\n  websocket._errorEmitted = true;\n  websocket.emit('error', err);\n  websocket.emitClose();\n}\n\n/**\n * Create a `net.Socket` and initiate a connection.\n *\n * @param {Object} options Connection options\n * @return {net.Socket} The newly created socket used to start the connection\n * @private\n */\nfunction netConnect(options) {\n  options.path = options.socketPath;\n  return net.connect(options);\n}\n\n/**\n * Create a `tls.TLSSocket` and initiate a connection.\n *\n * @param {Object} options Connection options\n * @return {tls.TLSSocket} The newly created socket used to start the connection\n * @private\n */\nfunction tlsConnect(options) {\n  options.path = undefined;\n\n  if (!options.servername && options.servername !== '') {\n    options.servername = net.isIP(options.host) ? '' : options.host;\n  }\n\n  return tls.connect(options);\n}\n\n/**\n * Abort the handshake and emit an error.\n *\n * @param {WebSocket} websocket The WebSocket instance\n * @param {(http.ClientRequest|net.Socket|tls.Socket)} stream The request to\n *     abort or the socket to destroy\n * @param {String} message The error message\n * @private\n */\nfunction abortHandshake(websocket, stream, message) {\n  websocket._readyState = WebSocket.CLOSING;\n\n  const err = new Error(message);\n  Error.captureStackTrace(err, abortHandshake);\n\n  if (stream.setHeader) {\n    stream[kAborted] = true;\n    stream.abort();\n\n    if (stream.socket && !stream.socket.destroyed) {\n      //\n      // On Node.js >= 14.3.0 `request.abort()` does not destroy the socket if\n      // called after the request completed. See\n      // https://github.com/websockets/ws/issues/1869.\n      //\n      stream.socket.destroy();\n    }\n\n    process.nextTick(emitErrorAndClose, websocket, err);\n  } else {\n    stream.destroy(err);\n    stream.once('error', websocket.emit.bind(websocket, 'error'));\n    stream.once('close', websocket.emitClose.bind(websocket));\n  }\n}\n\n/**\n * Handle cases where the `ping()`, `pong()`, or `send()` methods are called\n * when the `readyState` attribute is `CLOSING` or `CLOSED`.\n *\n * @param {WebSocket} websocket The WebSocket instance\n * @param {*} [data] The data to send\n * @param {Function} [cb] Callback\n * @private\n */\nfunction sendAfterClose(websocket, data, cb) {\n  if (data) {\n    const length = isBlob(data) ? data.size : toBuffer(data).length;\n\n    //\n    // The `_bufferedAmount` property is used only when the peer is a client and\n    // the opening handshake fails. Under these circumstances, in fact, the\n    // `setSocket()` method is not called, so the `_socket` and `_sender`\n    // properties are set to `null`.\n    //\n    if (websocket._socket) websocket._sender._bufferedBytes += length;\n    else websocket._bufferedAmount += length;\n  }\n\n  if (cb) {\n    const err = new Error(\n      `WebSocket is not open: readyState ${websocket.readyState} ` +\n        `(${readyStates[websocket.readyState]})`\n    );\n    process.nextTick(cb, err);\n  }\n}\n\n/**\n * The listener of the `Receiver` `'conclude'` event.\n *\n * @param {Number} code The status code\n * @param {Buffer} reason The reason for closing\n * @private\n */\nfunction receiverOnConclude(code, reason) {\n  const websocket = this[kWebSocket];\n\n  websocket._closeFrameReceived = true;\n  websocket._closeMessage = reason;\n  websocket._closeCode = code;\n\n  if (websocket._socket[kWebSocket] === undefined) return;\n\n  websocket._socket.removeListener('data', socketOnData);\n  process.nextTick(resume, websocket._socket);\n\n  if (code === 1005) websocket.close();\n  else websocket.close(code, reason);\n}\n\n/**\n * The listener of the `Receiver` `'drain'` event.\n *\n * @private\n */\nfunction receiverOnDrain() {\n  const websocket = this[kWebSocket];\n\n  if (!websocket.isPaused) websocket._socket.resume();\n}\n\n/**\n * The listener of the `Receiver` `'error'` event.\n *\n * @param {(RangeError|Error)} err The emitted error\n * @private\n */\nfunction receiverOnError(err) {\n  const websocket = this[kWebSocket];\n\n  if (websocket._socket[kWebSocket] !== undefined) {\n    websocket._socket.removeListener('data', socketOnData);\n\n    //\n    // On Node.js < 14.0.0 the `'error'` event is emitted synchronously. See\n    // https://github.com/websockets/ws/issues/1940.\n    //\n    process.nextTick(resume, websocket._socket);\n\n    websocket.close(err[kStatusCode]);\n  }\n\n  if (!websocket._errorEmitted) {\n    websocket._errorEmitted = true;\n    websocket.emit('error', err);\n  }\n}\n\n/**\n * The listener of the `Receiver` `'finish'` event.\n *\n * @private\n */\nfunction receiverOnFinish() {\n  this[kWebSocket].emitClose();\n}\n\n/**\n * The listener of the `Receiver` `'message'` event.\n *\n * @param {Buffer|ArrayBuffer|Buffer[])} data The message\n * @param {Boolean} isBinary Specifies whether the message is binary or not\n * @private\n */\nfunction receiverOnMessage(data, isBinary) {\n  this[kWebSocket].emit('message', data, isBinary);\n}\n\n/**\n * The listener of the `Receiver` `'ping'` event.\n *\n * @param {Buffer} data The data included in the ping frame\n * @private\n */\nfunction receiverOnPing(data) {\n  const websocket = this[kWebSocket];\n\n  if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);\n  websocket.emit('ping', data);\n}\n\n/**\n * The listener of the `Receiver` `'pong'` event.\n *\n * @param {Buffer} data The data included in the pong frame\n * @private\n */\nfunction receiverOnPong(data) {\n  this[kWebSocket].emit('pong', data);\n}\n\n/**\n * Resume a readable stream\n *\n * @param {Readable} stream The readable stream\n * @private\n */\nfunction resume(stream) {\n  stream.resume();\n}\n\n/**\n * The `Sender` error event handler.\n *\n * @param {Error} The error\n * @private\n */\nfunction senderOnError(err) {\n  const websocket = this[kWebSocket];\n\n  if (websocket.readyState === WebSocket.CLOSED) return;\n  if (websocket.readyState === WebSocket.OPEN) {\n    websocket._readyState = WebSocket.CLOSING;\n    setCloseTimer(websocket);\n  }\n\n  //\n  // `socket.end()` is used instead of `socket.destroy()` to allow the other\n  // peer to finish sending queued data. There is no need to set a timer here\n  // because `CLOSING` means that it is already set or not needed.\n  //\n  this._socket.end();\n\n  if (!websocket._errorEmitted) {\n    websocket._errorEmitted = true;\n    websocket.emit('error', err);\n  }\n}\n\n/**\n * Set a timer to destroy the underlying raw socket of a WebSocket.\n *\n * @param {WebSocket} websocket The WebSocket instance\n * @private\n */\nfunction setCloseTimer(websocket) {\n  websocket._closeTimer = setTimeout(\n    websocket._socket.destroy.bind(websocket._socket),\n    websocket._closeTimeout\n  );\n}\n\n/**\n * The listener of the socket `'close'` event.\n *\n * @private\n */\nfunction socketOnClose() {\n  const websocket = this[kWebSocket];\n\n  this.removeListener('close', socketOnClose);\n  this.removeListener('data', socketOnData);\n  this.removeListener('end', socketOnEnd);\n\n  websocket._readyState = WebSocket.CLOSING;\n\n  //\n  // The close frame might not have been received or the `'end'` event emitted,\n  // for example, if the socket was destroyed due to an error. Ensure that the\n  // `receiver` stream is closed after writing any remaining buffered data to\n  // it. If the readable side of the socket is in flowing mode then there is no\n  // buffered data as everything has been already written. If instead, the\n  // socket is paused, any possible buffered data will be read as a single\n  // chunk.\n  //\n  if (\n    !this._readableState.endEmitted &&\n    !websocket._closeFrameReceived &&\n    !websocket._receiver._writableState.errorEmitted &&\n    this._readableState.length !== 0\n  ) {\n    const chunk = this.read(this._readableState.length);\n\n    websocket._receiver.write(chunk);\n  }\n\n  websocket._receiver.end();\n\n  this[kWebSocket] = undefined;\n\n  clearTimeout(websocket._closeTimer);\n\n  if (\n    websocket._receiver._writableState.finished ||\n    websocket._receiver._writableState.errorEmitted\n  ) {\n    websocket.emitClose();\n  } else {\n    websocket._receiver.on('error', receiverOnFinish);\n    websocket._receiver.on('finish', receiverOnFinish);\n  }\n}\n\n/**\n * The listener of the socket `'data'` event.\n *\n * @param {Buffer} chunk A chunk of data\n * @private\n */\nfunction socketOnData(chunk) {\n  if (!this[kWebSocket]._receiver.write(chunk)) {\n    this.pause();\n  }\n}\n\n/**\n * The listener of the socket `'end'` event.\n *\n * @private\n */\nfunction socketOnEnd() {\n  const websocket = this[kWebSocket];\n\n  websocket._readyState = WebSocket.CLOSING;\n  websocket._receiver.end();\n  this.end();\n}\n\n/**\n * The listener of the socket `'error'` event.\n *\n * @private\n */\nfunction socketOnError() {\n  const websocket = this[kWebSocket];\n\n  this.removeListener('error', socketOnError);\n  this.on('error', NOOP);\n\n  if (websocket) {\n    websocket._readyState = WebSocket.CLOSING;\n    this.destroy();\n  }\n}\n"};

var HTML_CONTENT = fs.readFileSync(path.join(__dirname, "app-source.html"), "utf-8");
// v6.9.x-FIX-L3: 渲染时注入入口端口（提示屏断线「返回入口」导航用）
function renderAppHtml() { return HTML_CONTENT.split("__WUTAI_ENTRY_PORT__").join(String(_config.entryPort || 0)); }
var CLIENT_PORTAL_HTML = require("./lib/client-portal-html").buildClientPortalHtml;
var ENTRY_PORTAL_HTML_FN = require("./lib/entry-portal-html");
var CONTROL_LOGIN_HTML = require("./lib/control-login-html")();
var SessionAuth = require("./lib/session-auth");
var sessionStore = SessionAuth.createSessionStore({ ttlMs: 43200000, maxSessions: 1000 });
var permissionsVersion = 1;

(function() {
  var wsDir = path.join(__dirname, "node_modules", "ws");
  var wsLibDir = path.join(wsDir, "lib");
  try {
    if (!fs.existsSync(wsDir)) fs.mkdirSync(wsDir, { recursive: true });
    if (!fs.existsSync(wsLibDir)) fs.mkdirSync(wsLibDir, { recursive: true });
    Object.keys(__WS_FILES).forEach(function(relPath) {
      var fullPath = path.join(wsDir, relPath);
      var fullDir = path.dirname(fullPath);
      if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });
      if (!fs.existsSync(fullPath)) fs.writeFileSync(fullPath, __WS_FILES[relPath], "utf-8");
    });
  } catch(e) { console.error("写入 ws 模块失败:", e.message); }
})();

var { MIME, sendTo, sendError, createBroadcasters } = require("./lib/server-shared");

var { WebSocketServer, WebSocket } = require("ws");

var CONFIG_FILE = path.join(__dirname, "config.json");
var MAX_HTTP_BODY = 8192;
var MAX_WS_PAYLOAD = 1024 * 1024;
var VALID_ROLES = ["control", "director", "assistant", "backstage", "console"];
var PASSWORD_ROLES = ["control", "director", "assistant", "backstage", "console", "screen"];
var CONFIGURABLE_ROLES = ["director", "assistant", "backstage", "console"];
var PERMISSION_KEYS = ["nav", "editNotes", "editMusic", "editChannels", "addDel"];
var DEFAULT_ROLE_PERMISSIONS = {
  director: { nav: true, editNotes: true, editMusic: true, editChannels: true, addDel: true },
  assistant: { nav: false, editNotes: true, editMusic: true, editChannels: true, addDel: false },
  backstage: { nav: false, editNotes: true, editMusic: false, editChannels: false, addDel: false },
  console: { nav: false, editNotes: true, editMusic: true, editChannels: true, addDel: false }
};

function randomToken() { return crypto.randomBytes(24).toString("hex"); }
function parsePort(value, fallback) {
  var n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 65535 ? n : fallback;
}
function isToken(value) { return typeof value === "string" && /^[a-f0-9]{32,128}$/i.test(value); }
function isPasswordHash(value) { return typeof value === "string" && /^pbkdf2-sha256\$[a-f0-9]{32}\$[a-f0-9]{64}$/i.test(value); }
function makePasswordHash(password) {
  var salt = crypto.randomBytes(16).toString("hex");
  var hash = crypto.pbkdf2Sync(String(password), salt, 100000, 32, "sha256").toString("hex");
  return "pbkdf2-sha256$" + salt + "$" + hash;
}
function verifyPasswordHash(password, stored) {
  if (!isPasswordHash(stored) || typeof password !== "string" || password.length < 1) return false;
  var parts = stored.split("$");
  var expected = Buffer.from(parts[2], "hex");
  var actual = crypto.pbkdf2Sync(password, parts[1], 100000, 32, "sha256");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
function normalizeRolePermissions(raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  var result = {};
  CONFIGURABLE_ROLES.forEach(function(role) {
    result[role] = {};
    PERMISSION_KEYS.forEach(function(key) {
      var defaultPerm = DEFAULT_ROLE_PERMISSIONS[role] || {};
      result[role][key] = raw[role] && typeof raw[role][key] === "boolean" ? raw[role][key] : (defaultPerm[key] !== undefined ? defaultPerm[key] : false);
    });
  });
  return result;
}
// ── 品牌主题（v6.5.1 方案C）：config 全局默认 + state.theme 项目级覆盖 ──
function normalizeThemeConfig(raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  return {
    logo: String(raw.logo || "").slice(0, 3000),
    primaryColor: /^#[0-9a-fA-F]{6}$/.test(String(raw.primaryColor || "")) ? String(raw.primaryColor) : "#0a84ff",
    screenBg: /^#[0-9a-fA-F]{6}$/.test(String(raw.screenBg || "")) ? String(raw.screenBg) : "#000000",
    fontSizeScale: Math.max(0.7, Math.min(1.5, parseFloat(raw.fontSizeScale) || 1.0))
  };
}
function getEffectiveTheme(state) {
  return Object.assign({}, _config.themeConfig, (state && state.theme && typeof state.theme === "object") ? normalizeThemeConfig(state.theme) : {});
}
function permissionsForRole(role) {
  if (role === "control") return { nav: true, editNotes: true, editMusic: true, editChannels: true, addDel: true };
  if (role === "screen") return { nav: false, editNotes: false, editMusic: false, editChannels: false };
  return Object.assign({}, (_config.rolePermissions && _config.rolePermissions[role]) || DEFAULT_ROLE_PERMISSIONS[role] || {});
}
function hasPermission(role, key) { return role === "control" || !!(permissionsForRole(role)[key]); }
function loadJsonFile(file) {
  try { if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, "utf-8")); } catch (e) { console.error("读取 " + path.basename(file) + " 失败: " + e.message); }
  return null;
}
function atomicWriteJson(file, value) {
  var temp = file + ".tmp-" + process.pid;
  var fd = fs.openSync(temp, "w");
  try {
    fs.writeFileSync(fd, JSON.stringify(value, null, 2), "utf-8");
    fs.fsyncSync(fd);
  } finally { fs.closeSync(fd); }
  try { if (fs.existsSync(file)) fs.copyFileSync(file, file + ".bak"); } catch (e) {}
  try { fs.renameSync(temp, file); }
  catch (e) {
    try { if (fs.existsSync(file)) fs.unlinkSync(file); fs.renameSync(temp, file); }
    catch (e2) { try { fs.unlinkSync(temp); } catch (ignore) {} throw e2; }
  }
}
function normalizeConfig(raw) {
  raw = raw && typeof raw === "object" ? raw : {};
  var cfg = {
    entryPort: parsePort(raw.entryPort, 3000),
    port: parsePort(raw.port, 3001),
    clientPort: parsePort(raw.clientPort, raw.displayPort || 3002),
    screenPort: parsePort(raw.screenPort, 3003),
    rolePorts: raw.rolePorts && typeof raw.rolePorts === "object" ? raw.rolePorts : {},
    roleTokens: raw.roleTokens && typeof raw.roleTokens === "object" ? raw.roleTokens : {},
    unlockCode: typeof raw.unlockCode === "string" ? raw.unlockCode : "",
    displayToken: isToken(raw.displayToken) ? raw.displayToken : randomToken(),
    passwordHashes: raw.passwordHashes && typeof raw.passwordHashes === "object" ? raw.passwordHashes : {},
    rolePermissions: normalizeRolePermissions(raw.rolePermissions),
    themeConfig: normalizeThemeConfig(raw.themeConfig)
  };
  VALID_ROLES.forEach(function(role) {
    if (!isToken(cfg.roleTokens[role])) cfg.roleTokens[role] = role === "control" && isToken(raw.controlToken) ? raw.controlToken : randomToken();
  });
  PASSWORD_ROLES.forEach(function(role) {
    if (!isPasswordHash(cfg.passwordHashes[role])) delete cfg.passwordHashes[role];
  });
  // Ensure all core ports are different
  var ports = [cfg.entryPort, cfg.port, cfg.clientPort, cfg.screenPort];
  if (ports.indexOf(cfg.port) !== ports.lastIndexOf(cfg.port)) cfg.port = cfg.entryPort === 3001 ? 3002 : 3001;
  if (cfg.clientPort === cfg.entryPort || cfg.clientPort === cfg.port) cfg.clientPort = cfg.port === 65535 ? 65534 : cfg.port + 1;
  if (cfg.screenPort === cfg.entryPort || cfg.screenPort === cfg.port || cfg.screenPort === cfg.clientPort) cfg.screenPort = cfg.clientPort === 65535 ? 65534 : cfg.clientPort + 1;
  return cfg;
}
function saveConfig(cfg) {
  try { atomicWriteJson(CONFIG_FILE, cfg); }
  catch (e) { console.error("保存 config.json 失败: " + e.message); throw e; }
}

var _config = normalizeConfig(loadJsonFile(CONFIG_FILE));

// v6.9.x-FIX-L4: 解锁服务端校验（防 localStorage 前端门闩绕过——懂行的直接改 localStorage 也过不了服务端）
var UNLOCK_STATE_FILE = path.join(__dirname, "unlock-state.json");
var unlockToken = "";
try { unlockToken = String(JSON.parse(fs.readFileSync(UNLOCK_STATE_FILE, "utf8")).token || ""); } catch (e) {}
function saveUnlockToken(t) { unlockToken = t; try { fs.writeFileSync(UNLOCK_STATE_FILE, JSON.stringify({ token: t }), "utf8"); } catch (e) {} }
function isUnlockEnabled() {
  var u = String((_config && _config.unlockCode) || "");
  return !!(u && u !== "generate-local-token" && u !== "change-me");
}
function requestUnlocked(req) {
  if (!isUnlockEnabled()) return true;  // 未启用解锁 = 不拦截（维持现状，自用无碍）
  if (!unlockToken) return false;
  var cookieMap = SessionAuth.parseCookieHeader(req.headers.cookie || "");
  return (cookieMap["wutai_unlocked"] || "") === unlockToken;
}
saveConfig(_config);
var PORT_ENV_OVERRIDE = process.env.PORT !== undefined && process.env.PORT !== "";
var CLIENT_PORT_ENV_OVERRIDE = process.env.CLIENT_PORT !== undefined && process.env.CLIENT_PORT !== "";
var ENTRY_PORT_ENV_OVERRIDE = process.env.ENTRY_PORT !== undefined && process.env.ENTRY_PORT !== "";
var SCREEN_PORT_ENV_OVERRIDE = process.env.SCREEN_PORT !== undefined && process.env.SCREEN_PORT !== "";
var ENTRY_PORT = parsePort(process.env.ENTRY_PORT, _config.entryPort);
var PORT = parsePort(process.env.PORT, _config.port);
var CLIENT_PORT = parsePort(process.env.CLIENT_PORT, _config.clientPort);
var SCREEN_PORT = parsePort(process.env.SCREEN_PORT, _config.screenPort);
// v6.3.1: 各角色独立端口（导演/助理/幕后/控台）。0=禁用（回退用 clientPort）
var ROLE_PORTS = {
  director: parsePort(process.env.DIRECTOR_PORT, _config.rolePorts && _config.rolePorts.director || 18092),
  assistant: parsePort(process.env.ASSISTANT_PORT, _config.rolePorts && _config.rolePorts.assistant || 18093),
  backstage: parsePort(process.env.BACKSTAGE_PORT, _config.rolePorts && _config.rolePorts.backstage || 18094),
  console: parsePort(process.env.CONSOLE_PORT, _config.rolePorts && _config.rolePorts.console || 18095)
};
// v6.6.0: 方案B 独立操作客户端 —— 字幕控制端 / 提示屏控制端（独立端口 + ctrlMode 专注界面）
var SCREEN_CTRL_PORT = parsePort(process.env.SCREEN_CTRL_PORT, _config.rolePorts && _config.rolePorts.screenCtrl || 18099);
ROLE_PORTS.screenCtrl = SCREEN_CTRL_PORT;
var _allPorts = [ENTRY_PORT, PORT, CLIENT_PORT, SCREEN_PORT];
if (new Set(_allPorts).size !== 4) { console.error("端口冲突：入口页(" + ENTRY_PORT + ")、控制端(" + PORT + ")、客户端(" + CLIENT_PORT + ")、提示屏(" + SCREEN_PORT + ") 必须互不相同"); process.exit(1); }

var VIRTUAL_PREFIXES = ["172.16.","172.17.","172.18.","172.19.","172.20.","172.21.","172.22.","172.23.","172.24.","172.25.","172.26.","172.27.","172.28.","172.29.","172.30.","172.31.","10.147.","10.94.","169.254.","100.64.","100.65.","100.66.","100.67.","100.68.","100.69.","192.0.0.","198.18.","198.19."];
var VIRTUAL_NAME_HINTS = ["vmware","vmnet","vbox","docker","wsl","hyper-v","vethernet","tailscale","zerotier","tap","tun","utun","bridge","virbr"];
function isVirtualInterface(name) { var lower = (name || "").toLowerCase(); return VIRTUAL_NAME_HINTS.some(function(h) { return lower.indexOf(h) !== -1; }); }
function isVirtualIP(addr) { return VIRTUAL_PREFIXES.some(function(p) { return addr.indexOf(p) === 0; }); }
function getLocalIPs() {
  var interfaces = os.networkInterfaces();
  var real = []; var virtual = [];
  for (var name in interfaces) {
    if (isVirtualInterface(name)) continue;
    interfaces[name].forEach(function(iface) {
      if (iface.family === "IPv4" && !iface.internal) {
        if (isVirtualIP(iface.address)) { virtual.push(iface.address); } else { real.push(iface.address); }
      }
    });
  }
  return real.length > 0 ? real : virtual;
}
var localIPs = getLocalIPs();
var primaryIP = localIPs.length > 0 ? localIPs[0] : "localhost";

var DATA_FILE = path.join(__dirname, "show.json");
// ================== 项目中心（v6.3 多场次管理） ==================
// 架构：show.json 始终是「当前活动项目」的快照（现有代码零改动），
// projects/index.json 是项目索引，projects/{id}.json 是各项目独立存档。
// 启动时若 projects/index.json 不存在，自动把 show.json 迁移为默认项目。
var PROJECTS_DIR = path.join(__dirname, "projects");
var PROJECTS_INDEX = path.join(PROJECTS_DIR, "index.json");
var currentProjectId = "default";
var currentProjectMeta = null;
function projectFilePath(id) { return path.join(PROJECTS_DIR, safeProjectId(id) + ".json"); }
function safeProjectId(id) { return String(id || "default").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "default"; }
function loadProjectsIndex() {
  try {
    var idx = loadJsonFile(PROJECTS_INDEX);
    if (idx && Array.isArray(idx.projects)) return idx;
  } catch (e) {}
  return { projects: [] };
}
function saveProjectsIndex(idx) {
  try { if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true }); atomicWriteJson(PROJECTS_INDEX, idx); } catch (e) { console.error("保存项目索引失败:", e.message); }
}
function ensureProjectsInit() {
  try {
    if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    var idx = loadProjectsIndex();
    if (idx.projects.length) {
      // 找到最近打开的项目作为当前项目
      var sorted = idx.projects.slice().sort(function(a, b) { return (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0); });
      currentProjectId = safeProjectId(sorted[0].id);
      currentProjectMeta = sorted[0];
      var pf = projectFilePath(currentProjectId);
      var saved = loadJsonFile(pf);
      if (saved) state = mergeState(Object.assign({}, defaultState, saved));
      return;
    }
    // 首次启动：迁移 show.json 为默认项目
    var legacy = loadJsonFile(DATA_FILE) || loadJsonFile(DATA_FILE + ".bak");
    var pid = "default";
    var meta = {
      id: pid,
      name: legacy && legacy.showName ? String(legacy.showName).slice(0, 100) : "默认项目",
      client: "", date: "", type: "wedding",
      status: "draft",
      createdAt: Date.now(), updatedAt: Date.now(), lastOpenedAt: Date.now(),
      programCount: legacy && legacy.programs ? legacy.programs.length : 0
    };
    idx.projects.push(meta);
    saveProjectsIndex(idx);
    currentProjectId = pid;
    currentProjectMeta = meta;
    saveStateOrThrow(); // 同时把当前 state 写入默认项目文件
  } catch (e) { console.error("项目初始化失败:", e.message); }
}
function touchProjectMeta() {
  var idx = loadProjectsIndex();
  var m = null;
  for (var i = 0; i < idx.projects.length; i++) if (idx.projects[i].id === currentProjectId) { m = idx.projects[i]; break; }
  if (!m) {
    m = { id: currentProjectId, name: state.showName || "未命名项目", client: "", date: "", type: "wedding", status: "draft", createdAt: Date.now(), updatedAt: Date.now(), lastOpenedAt: Date.now(), programCount: state.programs.length };
    idx.projects.push(m);
  }
  m.name = (state.showName || m.name || "未命名项目").slice(0, 100);
  m.updatedAt = Date.now(); m.lastOpenedAt = Date.now();
  m.programCount = state.programs.length;
  if (state.mode === "performance") m.status = "active";
  saveProjectsIndex(idx);
  currentProjectMeta = m;
}
function saveCurrentProjectFile() {
  try {
    if (!fs.existsSync(PROJECTS_DIR)) fs.mkdirSync(PROJECTS_DIR, { recursive: true });
    atomicWriteJson(projectFilePath(currentProjectId), state);
    touchProjectMeta();
  } catch (e) { console.error("保存项目文件失败:", e.message); }
}
function switchProject(newId) {
  newId = safeProjectId(newId);
  if (newId === currentProjectId) return true;
  var idx = loadProjectsIndex();
  var found = null;
  for (var i = 0; i < idx.projects.length; i++) if (idx.projects[i].id === newId) { found = idx.projects[i]; break; }
  if (!found) return false;
  // 先保存当前项目（会更新索引中的 updatedAt/lastOpenedAt）
  saveCurrentProjectFile();
  // 重新读取索引，避免 touchProjectMeta 写入的更新被旧 idx 覆盖
  idx = loadProjectsIndex();
  found = null;
  for (var i = 0; i < idx.projects.length; i++) if (idx.projects[i].id === newId) { found = idx.projects[i]; break; }
  if (!found) return false;
  var pf = projectFilePath(newId);
  var saved = loadJsonFile(pf);
  if (saved) state = mergeState(Object.assign({}, defaultState, saved));
  else state = mergeState(Object.assign({}, defaultState, { showName: found.name || "新项目" }));
  currentProjectId = newId;
  currentProjectMeta = found;
  found.lastOpenedAt = Date.now();
  saveProjectsIndex(idx);
  saveStateOrThrow(); // 同步 show.json 快照
  resetAutomaticCueRun();
  return true;
}
function publicProjectList() {
  var idx = loadProjectsIndex();
  var list = idx.projects.slice().sort(function(a, b) { return (b.lastOpenedAt || 0) - (a.lastOpenedAt || 0); }).map(function(p) {
    return { id: p.id, name: p.name, client: p.client || "", date: p.date || "", type: p.type || "wedding", status: p.status || "draft", createdAt: p.createdAt, updatedAt: p.updatedAt, lastOpenedAt: p.lastOpenedAt, programCount: p.programCount || 0 };
  });
  return { projects: list, currentProjectId: currentProjectId, currentProject: currentProjectMeta ? { id: currentProjectMeta.id, name: currentProjectMeta.name, type: currentProjectMeta.type || "wedding" } : null };
}
function createProject(opts) {
  opts = opts || {};
  var idx = loadProjectsIndex();
  var pid = "proj_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 5);
  var name = String(opts.name || "新项目").trim().slice(0, 100) || "新项目";
  var meta = {
    id: pid, name: name,
    client: String(opts.client || "").trim().slice(0, 100),
    date: String(opts.date || "").trim().slice(0, 50),
    type: ["wedding", "gala", "show", "conference"].indexOf(opts.type) >= 0 ? opts.type : "wedding",
    status: "draft", createdAt: Date.now(), updatedAt: Date.now(), lastOpenedAt: Date.now(), programCount: 0
  };
  idx.projects.push(meta);
  saveProjectsIndex(idx);
  // 新建项目初始 state：清空节目，用默认模板
  var fresh = mergeState(Object.assign({}, defaultState, { showName: name, mode: "setup", programs: [] }));
  atomicWriteJson(projectFilePath(pid), fresh);
  switchProject(pid);
  saveStateOrThrow();
  return meta;
}
function copyProject(srcId, newName) {
  var idx = loadProjectsIndex();
  var src = null;
  for (var i = 0; i < idx.projects.length; i++) if (idx.projects[i].id === safeProjectId(srcId)) { src = idx.projects[i]; break; }
  if (!src) return null;
  // 只读目标项目自身文件；缺失/损坏时用 defaultState 兜底，不读 DATA_FILE（避免复制无关数据）
  var srcFile = loadJsonFile(projectFilePath(src.id)) || mergeState(Object.assign({}, defaultState, { showName: src.name || "新项目" }));
  var pid = "proj_" + Date.now().toString(36) + "_" + Math.random().toString(36).substr(2, 5);
  var meta = {
    id: pid, name: String(newName || (src.name + " 副本")).trim().slice(0, 100),
    client: src.client || "", date: src.date || "", type: src.type || "wedding",
    status: "draft", createdAt: Date.now(), updatedAt: Date.now(), lastOpenedAt: Date.now(),
    programCount: srcFile && srcFile.programs ? srcFile.programs.length : 0
  };
  idx.projects.push(meta);
  saveProjectsIndex(idx);
  srcFile = Object.assign({}, srcFile, { showName: meta.name, mode: "setup", programs: (srcFile.programs || []).slice() });
  atomicWriteJson(projectFilePath(pid), srcFile);
  return meta;
}
function archiveProject(pid, archived) {
  var idx = loadProjectsIndex();
  var m = null;
  for (var i = 0; i < idx.projects.length; i++) if (idx.projects[i].id === safeProjectId(pid)) { m = idx.projects[i]; break; }
  if (!m) return false;
  if (archived) {
    if (m.status !== "archived") { m.prevStatus = m.status || "draft"; m.status = "archived"; }
  } else {
    m.status = m.prevStatus || "draft";
    delete m.prevStatus;
  }
  saveProjectsIndex(idx);
  return true;
}
// 项目状态：completed=已完成 / active=取消完成恢复进行中（归档项目不可改）
function setProjectStatus(pid, status) {
  var idx = loadProjectsIndex();
  var m = null;
  for (var i = 0; i < idx.projects.length; i++) if (idx.projects[i].id === safeProjectId(pid)) { m = idx.projects[i]; break; }
  if (!m || m.status === "archived") return false;
  if (status === "completed") m.status = "completed";
  else if (status === "active") m.status = "active";
  else return false;
  saveProjectsIndex(idx);
  return true;
}
function renameProject(pid, newName) {
  var idx = loadProjectsIndex();
  var m = null;
  for (var i = 0; i < idx.projects.length; i++) if (idx.projects[i].id === safeProjectId(pid)) { m = idx.projects[i]; break; }
  if (!m) return false;
  m.name = String(newName || m.name).trim().slice(0, 100) || m.name;
  if (pid === currentProjectId && state) { state.showName = m.name; saveCurrentProjectFile(); }
  else atomicWriteJson(projectFilePath(m.id), Object.assign(loadJsonFile(projectFilePath(m.id)) || {}, { showName: m.name }));
  saveProjectsIndex(idx);
  return true;
}
function deleteProject(pid) {
  pid = safeProjectId(pid);
  if (pid === "default") return false; // 默认项目不可删
  if (pid === currentProjectId) return false; // 当前打开的项目不可删（先切走再删）
  var idx = loadProjectsIndex();
  idx.projects = idx.projects.filter(function(p) { return p.id !== pid; });
  saveProjectsIndex(idx);
  try { fs.unlinkSync(projectFilePath(pid)); } catch (e) {}
  return true;
}
// 在 commitState 保存时同步写项目文件（saveStateOrThrow 被 commitState 调用，这里 hook saveState）
var _origSaveStateOrThrow = null;
var defaultState = {
  showName: "舞台流程表", mode: "setup", currentProgramIndex: 0, version: 5,
  globalChannels: { mics: [], lines: [] }, programs: [],
  screenSettings: { fontSize: 72, showStatus: true, showChannels: true, showMusic: true, showNotes: true, showNext: true, showProgress: true, displayMode: "live" },
  masterLock: { mode: "strict" },  // v7.3.0: 主控锁模式 strict/loose（holder 为运行时内存态不落盘，持锁者掉线自动释放）
  timeline: { tracks: [], cues: [] },
  timingSettings: { enabled: false, phase: "rehearsal", autoCue: false, preferRehearsal: true },
  runtimeTimer: { programIndex: 0, startedAt: 0, pausedAt: 0, pausedTotalMs: 0, running: false },
};
function loadState() {
  var saved = loadJsonFile(DATA_FILE) || loadJsonFile(DATA_FILE + ".bak");
  if (saved) return mergeState(Object.assign({}, defaultState, saved));
  return mergeState(Object.assign({}, defaultState));
}
function mergeMusicField(p) { var cue = (p.musicCue || "").trim(); var node = (p.musicNode || "").trim(); if (!node) return cue; return cue ? "\u3010\u8282\u70b9\u3011" + node + "\n" + cue : node; }
function ensureChannel(ch) { return { id: ch.id || ("ch_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6)), name: ch.name || "", type: ch.type || "", notes: ch.notes || "", customType: ch.customType || "" }; }
// ===== P2-2 runbook 流程编排 =====
// 节目级编排：进入节目时按 delaySec（相对进入时刻的绝对秒数）排队执行动作序列 + 可选到点自动 GO
// gpt-5.5 复查采纳：delaySec=绝对秒数（排序后单 timer 调度）/ programRunId 统一管理双 timer /
// activateProgram 唯一切节目入口 / set_current 同 index 不重启 / 熔断链计数规则 / clear 边界确定
var EMPTY_RUNBOOK = { onEnter: [], autoAdvance: false, autoAdvanceSec: 0 };
var RUNBOOK_ACTIONS = ["screen_mode", "clear"]; // lite 精简版：无字幕/无Tally基础设施，仅编排存在动作
var RUNBOOK_SCREEN_MODES = ["live", "standby", "blackout", "freeze", "test"];
var MAX_RUNBOOK_ACTIONS = 50;
var MAX_RUNBOOK_DELAY = 300;
var AUTOADVANCE_MIN_SEC = 5;
var AUTOADVANCE_MAX_SEC = 3600;
var AUTOADVANCE_CHAIN_MAX = 5; // 连发链 ≤5，超过熔断暂停告警
var runbookTimer = null; // 全局唯一 runbook 执行 timer
var autoAdvanceTimer = null; // 全局唯一 autoAdvance timer
var activeProgramRunId = 0; // 节目生命周期 id：切节目递增，双 timer 回调校验
var runbookRun = null; // 当前 run 状态 {runId, programIndex, queue, nextIdx, firedCount, startedAt}
var autoAdvanceChainCount = 0; // 熔断链计数：仅 autoAdvance 触发的连续切换递增
var autoAdvanceBreakerFired = false;
// 规范化 runbook（纯函数返回新对象；白名单过滤 + 参数 clamp；老数据无 runbook 自动补空对象 = 零迁移）
// 静态校验即规范化：非法动作/参数在 mergeState 阶段丢弃，不进执行队列
function normalizeRunbook(rb) {
  var src = rb && typeof rb === "object" ? rb : {};
  var onEnter = Array.isArray(src.onEnter) ? src.onEnter.slice(0, MAX_RUNBOOK_ACTIONS) : [];
  var actions = [];
  onEnter.forEach(function(a) {
    if (!a || typeof a !== "object") return;
    var action = String(a.action || "");
    if (RUNBOOK_ACTIONS.indexOf(action) < 0) return;
    var item = { action: action, delaySec: isFinite(parseInt(a.delaySec, 10)) ? Math.max(0, Math.min(MAX_RUNBOOK_DELAY, parseInt(a.delaySec, 10))) : 0 };
    if (action === "screen_mode") {
      item.mode = RUNBOOK_SCREEN_MODES.indexOf(a.mode) >= 0 ? a.mode : "live";
    }
    actions.push(item);
  });
  var autoAdvanceSec = isFinite(parseInt(src.autoAdvanceSec, 10)) ? parseInt(src.autoAdvanceSec, 10) : 0;
  if (autoAdvanceSec !== 0) autoAdvanceSec = Math.max(AUTOADVANCE_MIN_SEC, Math.min(AUTOADVANCE_MAX_SEC, autoAdvanceSec));
  return { onEnter: actions, autoAdvance: src.autoAdvance === true, autoAdvanceSec: autoAdvanceSec };
}
// R8: 状态广播（控制端 banner 用）
function broadcastRunbookState() {
  var nextAction = null;
  if (runbookRun && runbookRun.queue[runbookRun.nextIdx]) nextAction = runbookRun.queue[runbookRun.nextIdx].action;
  broadcast({ type: "runbook_state_changed", programIndex: state.currentProgramIndex, active: !!runbookRun, runId: runbookRun ? runbookRun.runId : null, nextAction: nextAction, autoAdvanceSec: (state.programs[state.currentProgramIndex] || {}).runbook && (state.programs[state.currentProgramIndex]).runbook.autoAdvanceSec || 0, firedCount: runbookRun ? runbookRun.firedCount : 0, chainCount: autoAdvanceChainCount, breaker: autoAdvanceBreakerFired });
}
// R5: 取消当前 runbook run（切节目 / 手动接管）
function cancelRunbookRun(reason) {
  if (runbookTimer) { clearTimeout(runbookTimer); runbookTimer = null; }
  if (runbookRun) {
    logAction("system", "runbook: cancel run " + runbookRun.runId + " reason=" + reason);
    runbookRun = null;
    broadcastRunbookState();
  }
}
// R6: 取消待执行 autoAdvance（手动关键操作优先）
function cancelAutoAdvance(reason) {
  if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
  if (reason) logAction("system", "runbook: autoAdvance cancel reason=" + reason);
}
function resetAutoAdvanceChain() { autoAdvanceChainCount = 0; autoAdvanceBreakerFired = false; }
// R3: runbook 执行器——按 delaySec（绝对秒数）升序排序，单 timer 调度下一条到期动作
function runRunbook(program) {
  cancelRunbookRun("new_run");
  var rb = program && program.runbook;
  if (!rb || !Array.isArray(rb.onEnter) || !rb.onEnter.length) return;
  var runId = activeProgramRunId + "_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
  var queue = rb.onEnter.slice().sort(function(a, b) { return a.delaySec - b.delaySec; });
  runbookRun = { runId: runId, programIndex: state.currentProgramIndex, queue: queue, nextIdx: 0, firedCount: 0, startedAt: Date.now() };
  logAction("system", "runbook: start run " + runId + " program=" + state.currentProgramIndex + " actions=" + queue.length);
  broadcastRunbookState();
  scheduleRunbookNext(runId);
}
function scheduleRunbookNext(runId) {
  if (runbookTimer) { clearTimeout(runbookTimer); runbookTimer = null; }
  if (!runbookRun || runbookRun.runId !== runId) return;
  var qi = runbookRun.nextIdx;
  if (qi >= runbookRun.queue.length) {
    var doneRunId = runbookRun.runId;
    runbookRun = null;
    logAction("system", "runbook: done run " + doneRunId);
    broadcastRunbookState();
    return;
  }
  var item = runbookRun.queue[qi];
  var elapsedMs = Date.now() - runbookRun.startedAt;
  var waitMs = Math.max(0, item.delaySec * 1000 - elapsedMs);
  runbookTimer = setTimeout(function() {
    runbookTimer = null;
    // 执行前双重校验：runId 一致（防旧 run 残留）+ 节目未切走
    if (!runbookRun || runbookRun.runId !== runId) return;
    if (runbookRun.programIndex !== state.currentProgramIndex) { runbookRun = null; return; }
    executeRunbookAction(item, runId);
    if (runbookRun && runbookRun.runId === runId) {
      runbookRun.nextIdx++;
      scheduleRunbookNext(runId);
    }
  }, waitMs);
}
// 执行单条动作（复用既有 WS 逻辑；写状态前校验 runId；单条失败记 failed 继续后续）
function executeRunbookAction(item, runId) {
  if (!runbookRun || runbookRun.runId !== runId) return;
  if (runbookRun.programIndex !== state.currentProgramIndex) { runbookRun = null; return; }
  try {
    if (item.action === "screen_mode") {
      state.screenSettings.displayMode = item.mode;
    } else if (item.action === "clear") {
      // clear 边界：lite 无字幕屏/无Tally，仅同步清 P2-1 outputsOverlay 字幕叠加层
      outputsOverlay.subtitle = { text: '', visible: false };
    }
    commitState();
    if (runbookRun && runbookRun.runId === runId) runbookRun.firedCount++;
    logAction("system", "runbook: " + item.action + " run=" + runId + " status=executed");
    broadcast({ type: "runbook_executed", programIndex: state.currentProgramIndex, runId: runId, action: item.action, status: "executed", at: Date.now() });
    broadcastRunbookState();
  } catch (e) {
    console.error("[runbook]", e.message);
    logAction("system", "runbook: " + item.action + " run=" + runId + " status=failed");
    broadcast({ type: "runbook_executed", programIndex: state.currentProgramIndex, runId: runId, action: item.action, status: "failed", reason: String(e.message || "").slice(0, 100), at: Date.now() });
  }
}
// R4/R6: 进入节目统一入口（唯一切节目函数，三入口共用）
function activateProgram(newIndex, opts) {
  opts = opts || {};
  var idx = Math.max(0, Math.min(newIndex, Math.max(0, state.programs.length - 1)));
  if (opts.completeCurrent && state.currentProgramIndex >= 0 && state.currentProgramIndex < state.programs.length) {
    state.programs[state.currentProgramIndex].status = "completed";
  }
  var idxChanged = idx !== state.currentProgramIndex;
  state.currentProgramIndex = idx;
  if (state.programs[idx] && state.programs[idx].status !== "completed") state.programs[idx].status = "active";
  resetTimerForCurrent(shouldStartTimer(opts.timerReason || "program_switch"));
  // 节目生命周期统一管理：递增 programRunId → 旧 runbook/autoAdvance 全部失效
  activeProgramRunId++;
  cancelRunbookRun("program_switch");
  cancelAutoAdvance("program_switch");
  if (opts.source !== "auto") resetAutoAdvanceChain(); // 人工导航清零熔断链
  commitState();
  // set_current 同 index 不重启（gpt 复查采纳）
  if (idxChanged) {
    maybeRunRunbook(state.programs[idx]);
    maybeStartAutoAdvance(state.programs[idx]);
  }
}
function maybeRunRunbook(program) { runRunbook(program); }
// R6: autoAdvance——唯一 timer + programRunId 校验 + 熔断（仅 autoAdvance 触发链递增；到非 autoAdvance 节目清零）
function maybeStartAutoAdvance(program) {
  cancelAutoAdvance("new_program");
  if (autoAdvanceBreakerFired) return; // 熔断后不再自动排，人工导航恢复
  var rb = program && program.runbook;
  if (!rb || !rb.autoAdvance || !(rb.autoAdvanceSec > 0)) { resetAutoAdvanceChain(); return; }
  if (state.programs.length < 2) { resetAutoAdvanceChain(); return; }
  var runId = activeProgramRunId;
  var sec = rb.autoAdvanceSec;
  autoAdvanceTimer = setTimeout(function() {
    autoAdvanceTimer = null;
    if (runId !== activeProgramRunId) return; // 节目已切走
    autoAdvanceChainCount++;
    if (autoAdvanceChainCount > AUTOADVANCE_CHAIN_MAX) {
      autoAdvanceBreakerFired = true;
      logAction("system", "runbook: autoAdvance breaker fired chain=" + autoAdvanceChainCount);
      broadcast({ type: "runbook_state_changed", programIndex: state.currentProgramIndex, active: false, runId: null, nextAction: null, autoAdvanceSec: 0, firedCount: 0, chainCount: autoAdvanceChainCount, breaker: true, alert: "autoAdvance 连续推进超限已暂停，请手动接管" });
      return;
    }
    logAction("system", "runbook: autoAdvance fire chain=" + autoAdvanceChainCount);
    ensureHistorySnapshot("system", "autoAdvance");
    activateProgram(state.currentProgramIndex + 1, { completeCurrent: true, timerReason: "go", source: "auto" });
  }, sec * 1000);
}
function mergeState(s) {
  var oldVersion = s.version || 1;
  var merged = {
    showName: s.showName || "舞台流程表", mode: s.mode || "setup",
    currentProgramIndex: s.currentProgramIndex || 0, version: 5,
    globalChannels: s.globalChannels || { mics: [], lines: [] },
    programs: (s.programs || []).map(function(p) {
      var status = p.status; if (!status) { status = p.completed ? "completed" : "pending"; }
      var duration = p.duration || 0; if (oldVersion < 3 && duration >= 60) { duration = Math.round(duration / 60); }
      return { name: p.name || "", duration: duration, rehearsalDurationMs: Math.max(0, Math.min(86400000, parseInt(p.rehearsalDurationMs) || 0)), notes: p.notes || "", musicCue: mergeMusicField(p), status: status, useChannels: p.useChannels || (p.mics ? p.mics.filter(function(m){return m.active;}).map(function(m){return m.name;}) : []), runbook: normalizeRunbook(p.runbook),
      };
    })
  };
  var screen = s.screenSettings || {};
  merged.screenSettings = {
    fontSize: Math.max(40, Math.min(120, parseInt(screen.fontSize) || 72)),
    showStatus: screen.showStatus !== false,
    showChannels: screen.showChannels !== false,
    showMusic: screen.showMusic !== false,
    showNotes: screen.showNotes !== false,
    showNext: screen.showNext !== false,
    showProgress: screen.showProgress !== false,
    displayMode: ["live", "standby", "blackout", "freeze", "test"].indexOf(screen.displayMode) >= 0 ? screen.displayMode : "live"
  };
  var defaultTracks = [
    { id: "audio", name: "音频", type: "audio", enabled: true },
    { id: "video", name: "视频", type: "video", enabled: true },
  ];
  var timeline = s.timeline || {};
  merged.timeline = {
    tracks: (Array.isArray(timeline.tracks) && timeline.tracks.length ? timeline.tracks : defaultTracks).slice(0, 20).map(function(t) {
      return { id: String(t.id || "").slice(0, 40), name: String(t.name || t.id || "轨道").slice(0, 40), type: String(t.type || t.id || "custom").slice(0, 20), enabled: t.enabled !== false };
    }),
    cues: (Array.isArray(timeline.cues) ? timeline.cues : []).slice(0, 2000).map(function(c) {
      var cType = ['cue','task','reminder'].indexOf(c.type) >= 0 ? c.type : 'cue';
      var cRole = Array.isArray(c.role) ? c.role.filter(function(r){ return typeof r === 'string' && r.trim(); }).map(function(r){ return r.trim().slice(0,40); }) : [];
      var cStatus = cType === 'task' ? (['pending','ready','done','skipped'].indexOf(c.status) >= 0 ? c.status : 'pending') : '';
      return { id: String(c.id || ("cue_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6))).slice(0, 80), programIndex: Math.max(0, parseInt(c.programIndex) || 0), trackId: String(c.trackId || "audio").slice(0, 40), offsetMs: Math.max(0, Math.min(86400000, parseInt(c.offsetMs) || 0)), durationMs: Math.max(0, Math.min(86400000, parseInt(c.durationMs) || 0)), label: String(c.label || "").slice(0, 300), payload: c.payload && typeof c.payload === "object" ? c.payload : {}, type: cType, role: cRole, color: String(c.color || '').slice(0,20), prewarnMs: Math.max(0, parseInt(c.prewarnMs)||0), requireAck: c.requireAck === true, status: cStatus, triggerOffsetMs: isFinite(Number(c.triggerOffsetMs)) ? Math.max(-86400000, Math.min(86400000, Math.round(Number(c.triggerOffsetMs)))) : 0 };
    })
  };
  // v6.7.0-D4: rolePlans 规范化（岗位/人员/指派，缺省补内置岗位）
  var rpIn = s.rolePlans || {};
  var defaultRoles = [
    { id: "assistant1", name: "助理1", color: "#0a84ff", builtin: true },
    { id: "assistant2", name: "助理2", color: "#30d158", builtin: true },
    { id: "light", name: "灯光", color: "#ffd60a", builtin: true },
    { id: "audio", name: "音控", color: "#ff9500", builtin: true },
    { id: "dj", name: "DJ", color: "#bf5af2", builtin: true },
    { id: "camera", name: "摄影", color: "#ff453a", builtin: true }
  ];
  var inRoles = Array.isArray(rpIn.roles) ? rpIn.roles : defaultRoles;
  merged.rolePlans = {
    roles: inRoles.slice(0, 50).map(function(r) {
      return { id: String(r.id || ("role_" + Math.random().toString(36).substr(2, 5))).slice(0, 40), name: String(r.name || r.id || "岗位").slice(0, 40), color: String(r.color || "#888888").slice(0, 20), builtin: r.builtin === true, enabled: r.enabled !== false };
    }),
    persons: (Array.isArray(rpIn.persons) ? rpIn.persons : []).slice(0, 100).map(function(ps) {
      return { id: String(ps.id || ("p_" + Math.random().toString(36).substr(2, 5))).slice(0, 40), name: String(ps.name || "").slice(0, 40), enabled: ps.enabled !== false };
    }),
    assignments: (Array.isArray(rpIn.assignments) ? rpIn.assignments : []).slice(0, 500).map(function(a) {
      return { programId: String(a.programId || "").slice(0, 60), roleId: String(a.roleId || "").slice(0, 40), personId: String(a.personId || "").slice(0, 40) };
    })
  };
  merged.timingSettings = StageCore.normalizeTimingSettings(s.timingSettings);
  merged.runtimeTimer = StageCore.normalizeRuntimeTimer(s.runtimeTimer, merged.currentProgramIndex);
  if (!merged.globalChannels.mics) merged.globalChannels.mics = [];
  if (!merged.globalChannels.lines) merged.globalChannels.lines = [];
  merged.globalChannels.mics = merged.globalChannels.mics.map(ensureChannel);
  merged.globalChannels.lines = merged.globalChannels.lines.map(ensureChannel);

  // 通道类型持久化（同步到前端 channelTypes）
  var defaultChannelTypes = {
    mics:[{v:'wireless_headset',t:'头戴无线麦'},{v:'wireless_hand',t:'无线手持麦'},{v:'podium',t:'讲台麦'},{v:'wired',t:'有线话筒'},{v:'host',t:'主持人话筒'},{v:'guest',t:'嘉宾话筒'},{v:'custom',t:'自定义'}],
    lines:[{v:'stereo_line',t:'立体声线路'},{v:'mono_line',t:'单声道线路'},{v:'drum',t:'电子鼓'},{v:'keyboard',t:'键盘'},{v:'guitar',t:'吉他'},{v:'custom',t:'自定义'}]
  };
  var incomingTypes = s.channelTypes && typeof s.channelTypes === 'object' ? s.channelTypes : {};
  merged.channelTypes = {};
  ['mics','lines'].forEach(function(ctype) {
    var list = Array.isArray(incomingTypes[ctype]) ? incomingTypes[ctype] : defaultChannelTypes[ctype];
    var seen = {};
    merged.channelTypes[ctype] = list.filter(function(t) {
      if (!t || typeof t.v !== 'string' || typeof t.t !== 'string') return false;
      t = { v:t.v.trim().slice(0,80), t:t.t.trim().slice(0,80) };
      if (!t.v || !t.t || seen[t.v]) return false;
      seen[t.v] = true; return true;
    }).map(function(t){ return { v:t.v.trim().slice(0,80), t:t.t.trim().slice(0,80) }; });
    if (!seen.custom) merged.channelTypes[ctype].push({v:'custom',t:'自定义'});
  });
  return merged;
}
function saveStateOrThrow() { atomicWriteJson(DATA_FILE, state); try { if (PROJECTS_DIR) saveCurrentProjectFile(); } catch (e) {} }
function saveState() { try { saveStateOrThrow(); } catch (e) { console.error("保存 show.json 失败:", e.message); } }
var state = loadState();
try { ensureProjectsInit(); } catch (e) { console.error("项目初始化异常:", e.message); }
var automaticCueKey = "";
var automaticCueTriggered = {};

function timerRunKey() {
  var timer = state.runtimeTimer || {};
  return [timer.programIndex, timer.startedAt, state.timingSettings.phase].join(":");
}
function resetAutomaticCueRun() {
  automaticCueKey = timerRunKey();
  automaticCueTriggered = {};
}
function resetTimerForCurrent(shouldStart) {
  state.runtimeTimer = StageCore.resetTimerForProgram(state.currentProgramIndex);
  if (shouldStart && state.timingSettings.enabled && state.programs[state.currentProgramIndex]) {
    state.runtimeTimer = StageCore.applyTimerAction(Date.now(), state.runtimeTimer, "start", state.currentProgramIndex);
  }
  resetAutomaticCueRun();
}
function shouldStartTimer(trigger) {
  return StageCore.shouldAutoStartTimer(state.mode, state.timingSettings, trigger);
}
function markCueTriggered(cue) {
  if (automaticCueKey !== timerRunKey()) resetAutomaticCueRun();
  if (cue && Number(cue.programIndex) === Number(state.currentProgramIndex)) automaticCueTriggered[String(cue.id)] = true;
}
function maybeTriggerAutomaticCues() {
  if (!state.timingSettings.enabled || !state.timingSettings.autoCue || !state.runtimeTimer.running) return;
  var key = timerRunKey();
  if (automaticCueKey !== key) resetAutomaticCueRun();
  var program = state.programs[state.currentProgramIndex];
  if (!program) return;
  var timerInput = Object.assign({}, state.timingSettings, state.runtimeTimer);
  var elapsedMs = StageCore.computeTimer(Date.now(), timerInput, program).elapsedMs;
  var due = StageCore.collectDueCues(state.timeline, state.currentProgramIndex, elapsedMs, automaticCueTriggered);
  due.forEach(function(cue) {
    automaticCueTriggered[String(cue.id)] = true;
    logAction("timer", "auto_cue: " + (cue.label || cue.id));
    broadcast({ type: "cue_triggered", cue: cue, source: "timer", at: new Date().toISOString() });
    syncCueOverlay(cue);
  });
}
// 启动时立即持久化迁移后的规范状态，避免磁盘继续保留旧版本字段。
saveState();
var undoHistory = [];
var redoHistory = [];
var operationLog = [];
function cloneState(value) { return JSON.parse(JSON.stringify(value)); }
function logAction(role, action) {
  operationLog.unshift({ time: new Date().toISOString(), role: role || "system", action: String(action || "").slice(0, 200) });
  if (operationLog.length > 500) operationLog.length = 500;
}
function pushHistory(role, action) {
  undoHistory.push(cloneState(state));
  if (undoHistory.length > 50) undoHistory.shift();
  redoHistory = [];
  logAction(role, action);
}
function ensureHistorySnapshot(role, action) {
  var current = JSON.stringify(state);
  var last = undoHistory.length ? JSON.stringify(undoHistory[undoHistory.length - 1]) : null;
  if (last === current) return false;
  pushHistory(role, action);
  return true;
}
if (state.programs.length > 0 && state.currentProgramIndex > state.programs.length - 1) state.currentProgramIndex = Math.max(0, state.programs.length - 1);

var FIELD_PERMISSION = { name: "addDel", duration: "addDel", rehearsalDurationMs: "addDel", notes: "editNotes", musicCue: "editMusic", useChannels: "editChannels", runbook: "addDel" };
function canEditField(role, field) { return !!FIELD_PERMISSION[field] && hasPermission(role, FIELD_PERMISSION[field]); }

var entryServer = http.createServer(function(req, res) { serveRequest(req, res, "entry"); });
var controlServer = http.createServer(function(req, res) { serveRequest(req, res, "control"); });
var clientServer = http.createServer(function(req, res) { serveRequest(req, res, "client"); });
var screenServer = http.createServer(function(req, res) { serveRequest(req, res, "screen"); });
// v6.3.1: 各角色独立端口 server（serverType="client-<role>" 走固定角色认证）
var ROLE_SERVERS = {};
Object.keys(ROLE_PORTS).forEach(function(role) {
  if (!ROLE_PORTS[role]) return;
  ROLE_SERVERS[role] = http.createServer(function(req, res) { serveRequest(req, res, "client-" + role); });
});
var controlWss = new WebSocketServer({ noServer: true, maxPayload: MAX_WS_PAYLOAD });
var clientWss = new WebSocketServer({ noServer: true, maxPayload: MAX_WS_PAYLOAD });
var screenWss = new WebSocketServer({ noServer: true, maxPayload: MAX_WS_PAYLOAD });
var allWebSocketServers = [controlWss, clientWss, screenWss];
var serverInstanceId = crypto.randomUUID();
var eventSequence = 0;
var actionDeduper = StageCore.createActionDeduper(300000, 1000);
// 关键舞台命令的幂等缓存：最多保留最近 50 个，10 分钟后自动过期。
var lastCommandIds = new Map(); // key -> { ts, status: 'pending'|'done', token }
var COMMAND_ID_TTL = 10 * 60 * 1000;
var COMMAND_ID_LIMIT = 50;
var COMMAND_ID_PENDING_TTL = 60 * 1000; // v6.4.1: pending 短租约（60s 自动释放，防命令卡死阻塞重试）
function commandIdKey(type, commandId) { return String(type || "") + ":" + String(commandId || ""); }
function isCommandProtected(msg) {
  // 当前协议中“停止/清空流程”沿用 reset_all
  return !!msg && (msg.type === "advance" || msg.type === "reset_all");
}
// v6.4.1: 检查并占用幂等（跨角色共享 key；执行中返回处理中；reservation token 防过期请求误操作）
function checkCommandId(ws, role, msg) {
  if (!isCommandProtected(msg) || typeof msg.commandId !== "string" || msg.commandId.length < 1 || msg.commandId.length > 128) return false;
  // 权限校验先于查缓存，避免未授权请求占用 commandId。
  if (msg.type === "advance" && !hasPermission(role, "nav")) return false;
  if (msg.type === "reset_all" && role !== "control") return false;
  var now = Date.now();
  lastCommandIds.forEach(function(entry, key) {
    if (entry.status === "pending" && now - entry.ts >= COMMAND_ID_PENDING_TTL) lastCommandIds.delete(key); // pending 租约超时释放
    else if (entry.status === "done" && now - entry.ts >= COMMAND_ID_TTL) lastCommandIds.delete(key);
  });
  var key = commandIdKey(msg.type, msg.commandId);
  var existing = lastCommandIds.get(key);
  if (existing) {
    sendTo(ws, { ok: false, duplicate: true, status: existing.status });
    return true;
  }
  // 立即占用（pending + token）；成功 markCommandDone 转 done；失败 releaseCommandId 释放
  var token = String(Math.random().toString(36).slice(2, 10)) + String(Date.now() % 100000);
  msg.__idemToken = token;
  lastCommandIds.set(key, { ts: now, status: "pending", token: token });
  // v6.4.1: 容量淘汰只删 done/过期，绝不删活跃 pending；pending 满则返回系统繁忙
  var pendingCount = 0;
  lastCommandIds.forEach(function(entry) { if (entry.status === "pending") pendingCount++; });
  while (lastCommandIds.size > COMMAND_ID_LIMIT) {
    var oldestKey = lastCommandIds.keys().next().value;
    var oldestEntry = lastCommandIds.get(oldestKey);
    if (oldestEntry.status === "pending" && now - oldestEntry.ts < COMMAND_ID_PENDING_TTL) {
      if (pendingCount >= 50) {
        sendTo(ws, { ok: false, busy: true });
        lastCommandIds.delete(key);
        return true;
      }
      break; // 有活跃 pending 不淘汰，超出容量靠租约超时释放
    }
    lastCommandIds.delete(oldestKey);
  }
  return false;
}
// v6.4.1: 命令成功执行后记录（pending → done，严格 token 校验防误标新占用）
function markCommandDone(msg) {
  if (!isCommandProtected(msg) || typeof msg.commandId !== "string" || msg.commandId.length < 1 || msg.commandId.length > 128) return;
  var key = commandIdKey(msg.type, msg.commandId);
  var entry = lastCommandIds.get(key);
  if (!entry) { lastCommandIds.set(key, { ts: Date.now(), status: "done", token: msg.__idemToken }); return; }
  if (!entry.token || !msg.__idemToken || entry.token !== msg.__idemToken) return; // v6.4.1: 严格 token 校验
  entry.status = "done";
}
// v6.4.1: 命令执行失败释放占用（严格 token 校验，仅释放自己占用的 pending）
function releaseCommandId(msg) {
  if (!isCommandProtected(msg) || typeof msg.commandId !== "string" || msg.commandId.length < 1 || msg.commandId.length > 128) return;
  var key = commandIdKey(msg.type, msg.commandId);
  var entry = lastCommandIds.get(key);
  if (entry && entry.status === "pending" && entry.token && msg.__idemToken && entry.token === msg.__idemToken) lastCommandIds.delete(key);
}

function tokenEquals(actual, supplied) {
  if (typeof supplied !== "string" || actual.length !== supplied.length) return false;
  return crypto.timingSafeEqual(Buffer.from(actual), Buffer.from(supplied));
}
function findRoleForToken(token) {
  for (var i = 0; i < VALID_ROLES.length; i++) {
    var role = VALID_ROLES[i];
    if (tokenEquals(_config.roleTokens[role], token)) return role;
  }
  return null;
}
function parseRequestUrl(req) { try { return new URL(req.url || "/", "http://localhost"); } catch (e) { return null; } }
function isPasswordRole(role) {
  return VALID_ROLES.indexOf(role) !== -1 || role === "screen";
}
function tokenForRole(role) {
  return role === "screen" ? _config.displayToken : _config.roleTokens[role];
}
function passwordEnabled(role) { return isPasswordHash(_config.passwordHashes[role]); }
function verifyRolePassword(role, password) { return passwordEnabled(role) && verifyPasswordHash(password, _config.passwordHashes[role]); }
function passwordStatus() {
  var out = {};
  PASSWORD_ROLES.forEach(function(role) { out[role] = passwordEnabled(role); });
  return out;
}
function sessionCookieName(serverType) {
  if (serverType === "control") return "stage_control_session";
  if (serverType === "screen") return "stage_screen_session";
  // v6.3.1: client-director/client-assistant 等角色端口共享客户端 cookie
  if (serverType === "client" || serverType.indexOf("client-") === 0) return "stage_client_session";
  return "stage_client_session";
}
function getSessionId(req, serverType) {
  return SessionAuth.parseCookieHeader(req.headers.cookie || "")[sessionCookieName(serverType)] || "";
}
function getRequestRole(req, serverType) { return sessionStore.getRole(getSessionId(req, serverType)); }
function sessionCookie(serverType, sessionId, clear) {
  return sessionCookieName(serverType) + "=" + encodeURIComponent(sessionId || "") + "; HttpOnly; SameSite=Lax; Path=/; " + (clear ? "Max-Age=0" : "Max-Age=43200");
}
function isAllowedOrigin(req) {
  var origin = req.headers.origin;
  if (!origin) return true;
  try { return new URL(origin).host === String(req.headers.host || ""); }
  catch (e) { return false; }
}
function rejectUpgrade(socket) {
  try { socket.write("HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n"); } catch (e) {}
  socket.destroy();
}
// v7.2.1-P1: 屏幕在线计数（lite 无字幕端：screen=提示屏 / screenCtrl=提示屏控制端）
var screenClientStats = { screen: 0, screenCtrl: 0 };
function attachUpgrade(httpServer, socketServer, serverType) {
  httpServer.on("upgrade", function(req, socket, head) {
    if (!isAllowedOrigin(req)) return rejectUpgrade(socket);
    var role = getRequestRole(req, serverType);
    if (!role) return rejectUpgrade(socket);
    if (serverType === "control" && role !== "control") return rejectUpgrade(socket);
    if (serverType === "client" && role === "control") return rejectUpgrade(socket);
    if (serverType === "screen" && role !== "screen") return rejectUpgrade(socket);
    // v6.3.1: client-<role> 端口只允许对应角色
    // v6.6.0: 提示屏控制端端口接受 control 角色（登录为 control，凭 ctrlMode 进专注界面）
    var rolePortMatch = /^client-([a-zA-Z]+)$/.exec(serverType);
    if (rolePortMatch) {
      var rpRole = rolePortMatch[1];
      if (rpRole === "screenCtrl") { if (role !== "control") return rejectUpgrade(socket); }
      else if (role !== rpRole) return rejectUpgrade(socket);
    }
    socketServer.handleUpgrade(req, socket, head, function(ws) {
      ws.stageRole = role;
      ws.stageServerType = serverType;
      ws.unlocked = requestUnlocked(req);  // v6.9.x-FIX-L4: 解锁状态（防前端门闩绕过）
      // v7.2.1-P1: 屏幕在线计数（WS 生命周期注册/注销）
      if (serverType === "screen") screenClientStats.screen++;
      else if (serverType === "client-screenCtrl") screenClientStats.screenCtrl++;
      ws.on("close", function() {
        if (serverType === "screen") screenClientStats.screen = Math.max(0, screenClientStats.screen - 1);
        else if (serverType === "client-screenCtrl") screenClientStats.screenCtrl = Math.max(0, screenClientStats.screenCtrl - 1);
      });
      socketServer.emit("connection", ws, req);
    });
  });
}
attachUpgrade(controlServer, controlWss, "control");
attachUpgrade(clientServer, clientWss, "client");
attachUpgrade(screenServer, screenWss, "screen");
// v6.3.1: 角色独立端口 WS 也走客户端 socket server（共享同一 clientWss）
Object.keys(ROLE_SERVERS).forEach(function(role) {
  attachUpgrade(ROLE_SERVERS[role], clientWss, "client-" + role);
});

function connectionCount() {
  var count = 0;
  allWebSocketServers.forEach(function(socketServer) { count += socketServer.clients.size; });
  return count;
}
function sendToRole(role, obj) {
  var data = JSON.stringify(obj);
  allWebSocketServers.forEach(function(socketServer) {
    socketServer.clients.forEach(function(c) {
      if (c.readyState === WebSocket.OPEN && c.stageRole === role) c.send(data);
    });
  });
}
function fullStatePayload() {
  return { type: "full_state", state: state, clientCount: connectionCount(), cueTriggeredIds: cueTriggeredIds(), seq: eventSequence, serverInstanceId: serverInstanceId, permissionsVersion: permissionsVersion, masterLock: masterLockPublic(), outputs: buildOutputs(state) };
}
function sendResume(ws, msg) {
  var lastSeq = Number(msg.lastSeq);
  var events = broadcasters.getEventBuffer();
  var earliestSeq = events.length ? events[0].seq : eventSequence + 1;
  if (msg.serverInstanceId !== serverInstanceId || !Number.isInteger(lastSeq) || lastSeq < 0 || lastSeq > eventSequence || lastSeq < earliestSeq - 1) {
    sendTo(ws, fullStatePayload());
    return;
  }
  sendTo(ws, { type: "resume_events", events: events.filter(function(event) { return event.seq > lastSeq; }), seq: eventSequence, serverInstanceId: serverInstanceId });
}
function setupSocketServer(socketServer) {
  socketServer.on("connection", function(ws) {
    sendTo(ws, fullStatePayload());
    sendTo(ws, { type: "permissions_update", permissions: permissionsForRole(ws.stageRole), permissionsVersion: permissionsVersion });
    broadcastClientCount();
    ws.on("message", function(raw) {
      var msg;
      try { msg = JSON.parse(raw.toString()); } catch (e) { return sendError(ws, "invalid", "message"); }
      if (!msg || typeof msg !== "object") return sendError(ws, "invalid", "message");
      if (ws.stageRole === "screen" && msg.type !== "get_state" && msg.type !== "resume") return sendError(ws, "forbidden", msg.type || "message");
      handleMessage(ws, msg);
    });
    ws.on("close", function() {
      broadcastClientCount();
      cleanupPendingModeRequests(ws);
      // v7.3.0: 主控锁持锁者掉线/断网自动释放（不锁死现场）
      if (masterLockHolder && masterLockHolder.ws === ws) releaseMasterLock();
    });
  });
}
setupSocketServer(controlWss);
setupSocketServer(clientWss);
setupSocketServer(screenWss);

// ---------- Mode switch approval system ----------
var pendingModeRequests = {};  // requestId -> approval record
var MODE_REQUEST_TIMEOUT = 60000;  // 60 seconds
var APPROVAL_NOTICE_MS = 10000;
var approvalAudit = [];
function addApprovalAudit(entry) { approvalAudit.unshift(cloneState(entry)); if (approvalAudit.length > 200) approvalAudit.length = 200; }

function cleanupPendingModeRequests(ws) {
  var toDelete = [];
  Object.keys(pendingModeRequests).forEach(function(id) {
    if (pendingModeRequests[id].ws === ws) {
      toDelete.push(id);
    }
  });
  toDelete.forEach(function(id) { delete pendingModeRequests[id]; });
}

function checkModeRequestTimeouts() {
  var now = Date.now();
  Object.keys(pendingModeRequests).forEach(function(id) {
    var req = pendingModeRequests[id];
    if (req.status === "pending" && now - req.createdAt > MODE_REQUEST_TIMEOUT) {
      req.status = "expired"; req.resolvedAt = now; req.reason = "timeout"; addApprovalAudit({ requestId: id, status: req.status, role: "system", time: now, audit: true });
      sendTo(req.ws, { type: "mode_switch_result", requestId: id, approved: false, reason: "timeout", status: req.status });
      delete pendingModeRequests[id];
    }
  });
}
setInterval(checkModeRequestTimeouts, 10000);


// ---------- 主控锁（v7.3.0：多控制端协同，strict 默认） ----------
// 锁是服务端权威：holder 为运行时内存态（不落盘），持锁者掉线自动释放；mode 随 state 落盘
var masterLockHolder = null;
function masterLockMode() {
  return (state.masterLock && state.masterLock.mode === "loose") ? "loose" : "strict";
}

// ===== P2-1 统一输出面（output surfaces）状态模型：buildOutputs 派生快照 =====
// 纯函数派生：screen/subtitle/overlay 三块统一快照，不写 state、不落盘。
// outputsOverlay 为内存态叠加层（runbook/控制端 overlay_update 写入 + cue 触发同步）
var outputsOverlay = { subtitle: { text: '', visible: false }, media: { type: '', url: '', active: false } };
function buildOutputs(s) {
  var prog = (s.programs || [])[s.currentProgramIndex];
  var next = (s.programs || [])[s.currentProgramIndex + 1];
  var doneCount = 0;
  (s.programs || []).forEach(function(p) { if (p && p.status === 'completed') doneCount++; });
  var sc = s.screenSettings || {};
  var ov = outputsOverlay || { subtitle: { text: '', visible: false }, media: { type: '', url: '', active: false } };
  return {
    screen: {
      displayMode: sc.displayMode || 'live',
      fontSize: sc.fontSize || 72,
      showStatus: sc.showStatus !== false, showChannels: sc.showChannels !== false,
      showMusic: sc.showMusic !== false, showNotes: sc.showNotes !== false,
      showNext: sc.showNext !== false, showProgress: sc.showProgress !== false,
      programName: prog ? String(prog.name || '') : '',
      status: prog ? String(prog.status || 'pending') : 'pending',
      channels: prog && Array.isArray(prog.useChannels) ? prog.useChannels.slice() : [],
      music: prog ? String(prog.musicCue || '') : '',
      notes: prog ? String(prog.notes || '') : '',
      nextName: next ? String(next.name || '') : '',
      progress: { done: doneCount, total: (s.programs || []).length }
    },
    overlay: ov
  };
}
function broadcastOutputs() {
  broadcast({ type: 'outputs_changed', outputs: buildOutputs(state) });
}
// cue 叠加层同步（O5）：服务端在 cue_triggered 时同步叠加层 + 定时清空
var overlayTimers = {};
function syncCueOverlay(cue) {
  if (!cue) return;
  var trackId = String(cue.trackId || '');
  if (trackId !== 'subtitle') return;
  var content = String(cue.label || '').trim();
  outputsOverlay.subtitle = { text: content, visible: !!content };
  if (overlayTimers[String(cue.id)]) { clearTimeout(overlayTimers[String(cue.id)]); delete overlayTimers[String(cue.id)]; }
  var durationMs = Math.max(0, Number(cue.durationMs) || 0);
  if (durationMs > 0) {
    overlayTimers[String(cue.id)] = setTimeout(function() {
      outputsOverlay.subtitle = { text: '', visible: false };
      broadcastOutputs();
      delete overlayTimers[String(cue.id)];
    }, durationMs);
  }
  broadcastOutputs();
}
function masterLockPublic() {
  var h = masterLockHolder;
  return { mode: masterLockMode(), holder: h ? { role: h.role, serverType: h.serverType, label: h.label, acquiredAt: h.acquiredAt } : null };
}
function masterLockLabel(ws) {
  var st = ws && ws.stageServerType;
  if (st === "client-subtitleCtrl") return "字幕控制端";
  if (st === "client-screenCtrl") return "提示屏控制端";
  return "主控制端";
}
function broadcastMasterLock() {
  broadcast({ type: "master_lock_changed", lock: masterLockPublic() });
}
function requireMasterLock(ws) {
  if (ws.stageRole !== "control") return true;  // 锁只约束 control 角色多控制端（主/字幕/提示屏控制端），导演/助理等执行端不受限
  if (masterLockMode() === "loose") return true;
  if (masterLockHolder && masterLockHolder.ws === ws) return true;
  sendTo(ws, { type: "master_lock_error", code: "LOCK_REQUIRED", message: masterLockHolder ? ("主控锁已被「" + masterLockHolder.label + "」持有，需先获取主控锁") : "当前为 strict 模式，关键操作需先获取主控锁" });
  return false;
}
function acquireMasterLock(ws, role, force) {
  if (masterLockHolder && masterLockHolder.ws !== ws && !force) {
    sendTo(ws, { type: "master_lock_error", code: "LOCK_HELD", message: "主控锁已被「" + masterLockHolder.label + "」持有（获取失败，可点接管强制获取）" });
    return false;
  }
  var isNew = !(masterLockHolder && masterLockHolder.ws === ws);
  masterLockHolder = { ws: ws, role: role, serverType: ws.stageServerType || "", label: masterLockLabel(ws), acquiredAt: Date.now() };
  if (isNew) broadcastMasterLock();
  return true;
}
function releaseMasterLock() {
  if (!masterLockHolder) return;
  masterLockHolder = null;
  broadcastMasterLock();
}

function handleMessage(ws, msg) {
  var role = ws.stageRole;
  var highRiskTypes = ["advance", "prev", "next", "set_current", "cue_trigger", "mode_switch_response"];
  var hasHighRiskPermission = role === "control" || (highRiskTypes.indexOf(msg.type) !== -1 && msg.type !== "mode_switch_response" && hasPermission(role, "nav"));
  if (highRiskTypes.indexOf(msg.type) !== -1 && hasHighRiskPermission && typeof msg.actionId === "string" && msg.actionId.length > 0 && msg.actionId.length <= 128) {
    var actionRecord = actionDeduper.run(role + ":" + msg.actionId, Date.now(), function() { return { accepted: true }; });
    if (actionRecord.duplicate) {
      sendTo(ws, { type: "action_result", actionId: msg.actionId, duplicate: true, result: actionRecord.result });
      return;
    }
  }
  if (checkCommandId(ws, role, msg)) return;
  var mutationTypes = ["update_state","reorder_programs","update_channels","program_add","program_delete_many","reset_cue_state","set_current","advance","prev","next","reset_all","reset_one","update_program_field","import_programs","timer_control"];
  var allowedMutation = role === "control" || (msg.type === "program_add" || msg.type === "program_delete_many") && hasPermission(role, "addDel") || (msg.type === "set_current" || msg.type === "advance" || msg.type === "prev" || msg.type === "next") && hasPermission(role, "nav") || msg.type === "update_program_field" && canEditField(role, msg.field) || msg.type === "reorder_programs" && hasPermission(role, "addDel") || msg.type === "update_channels" && hasPermission(role, "editChannels");
  if (mutationTypes.indexOf(msg.type) !== -1 && allowedMutation) pushHistory(role, msg.type);
  // v6.9.x-FIX-L4: 项目中心为完整功能——未解锁(无合法 cookie)拒绝，防 localStorage 前端门闩绕过
  if (/^project_/.test(msg.type) && !ws.unlocked) return sendError(ws, "forbidden", "unlock_required");
  switch (msg.type) {
    case "get_state": sendTo(ws, fullStatePayload()); break;
    case "master_lock_acquire":
      if (role !== "control") return sendError(ws, "forbidden", "master_lock_acquire");
      acquireMasterLock(ws, role, msg.force === true);
      sendTo(ws, { type: "master_lock_status", lock: masterLockPublic(), isHolder: masterLockHolder && masterLockHolder.ws === ws });
      break;
    case "master_lock_release":
      if (masterLockHolder && masterLockHolder.ws === ws) releaseMasterLock();
      sendTo(ws, { type: "master_lock_status", lock: masterLockPublic(), isHolder: false });
      break;
    case "master_lock_status":
      sendTo(ws, { type: "master_lock_status", lock: masterLockPublic(), isHolder: masterLockHolder && masterLockHolder.ws === ws });
      break;
    case "master_lock_setmode":
      if (role !== "control") return sendError(ws, "forbidden", "master_lock_setmode");
      if (msg.mode === "strict" || msg.mode === "loose") {
        state.masterLock = state.masterLock || {};
        state.masterLock.mode = msg.mode;
        commitState();
        broadcastMasterLock();
      } else sendError(ws, "invalid", "master_lock_setmode");
      break;

    case "resume": sendResume(ws, msg); break;
    case "program_add":
      if (!hasPermission(role, "addDel")) return sendError(ws, "forbidden", "program_add");
      if (!msg.program || typeof msg.program !== "object" || state.programs.length >= 2000) return sendError(ws, "invalid", "program_add");
      var addProgram = msg.program;
      state.programs.push({ name:String(addProgram.name || "").trim().slice(0,10000), duration:Math.max(0,Number(addProgram.duration)||0), rehearsalDurationMs:Math.max(0,Math.min(86400000,parseInt(addProgram.rehearsalDurationMs)||0)), notes:String(addProgram.notes||"").slice(0,10000), musicCue:String(addProgram.musicCue||"").slice(0,10000), status:"pending", useChannels:Array.isArray(addProgram.useChannels)?addProgram.useChannels.slice(0,200):[] });
      if (!state.programs[state.programs.length-1].name) { state.programs.pop(); return sendError(ws,"invalid","program_add"); }
      commitState(); break;
    case "program_delete_many":
      if (!hasPermission(role, "addDel")) return sendError(ws, "forbidden", "program_delete_many");
      if (!Array.isArray(msg.indices) || msg.indices.length < 1 || msg.indices.length > 2000) return sendError(ws, "invalid", "program_delete_many");
      var deleteIndices = msg.indices.map(Number).filter(function(i){ return Number.isInteger(i) && i >= 0 && i < state.programs.length; }).sort(function(a,b){ return b-a; });
      deleteIndices = deleteIndices.filter(function(i,p,a){ return p === 0 || i !== a[p-1]; });
      if (!deleteIndices.length) return sendError(ws, "invalid", "program_delete_many");
      deleteIndices.forEach(function(i){ state.programs.splice(i,1); if (i < state.currentProgramIndex) state.currentProgramIndex--; });
      state.currentProgramIndex = Math.max(0, Math.min(state.currentProgramIndex, Math.max(0,state.programs.length-1)));
      resetTimerForCurrent(shouldStartTimer("program_switch"));
      commitState(); break;
    case "reset_cue_state":
      if (role !== "control") return sendError(ws, "forbidden", "reset_cue_state");
      resetAutomaticCueRun();
      broadcast({ type:"cue_state_reset" });
      broadcastFullState(); break;
    case "update_state":
      if (role !== "control") return sendError(ws, "forbidden", "update_state");
      // v7.3.0: 主控锁——提示屏设置为关键操作，strict 下需持锁
      if (msg.data && msg.data.screenSettings && !requireMasterLock(ws)) return;
      if (msg.data && typeof msg.data === "object") {
        var previousMode = state.mode;
        var previousIndex = state.currentProgramIndex;
        var previousTiming = state.timingSettings;
        state = mergeState(Object.assign({}, state, msg.data));
        if (state.programs.length > 0 && state.currentProgramIndex > state.programs.length - 1) state.currentProgramIndex = Math.max(0, state.programs.length - 1);
        var timingChanged = previousTiming.enabled !== state.timingSettings.enabled || previousTiming.phase !== state.timingSettings.phase;
        var modeChanged = previousMode !== state.mode;
        if (previousIndex !== state.currentProgramIndex) resetTimerForCurrent(shouldStartTimer("program_switch"));
        else if (timingChanged || modeChanged) resetTimerForCurrent(false);
        commitState();
      } break;
    case "set_current":
      if (!hasPermission(role, "nav")) return sendError(ws, "forbidden", "set_current");
      // v7.3.0: 主控锁——切节目为关键操作
      if (!requireMasterLock(ws)) return;
      if (typeof msg.index === "number" && msg.index >= 0 && msg.index <= state.programs.length - 1) {
        // P2-2: 统一走 activateProgram（同 index 不重启 runbook/autoAdvance）
        activateProgram(msg.index, { timerReason: "program_switch", source: "manual" });
      } break;
    case "advance":
      if (!hasPermission(role, "nav")) return sendError(ws, "forbidden", "advance");
      // v7.3.0: 主控锁——GO 为关键操作，strict 下需持锁
      if (!requireMasterLock(ws)) return;
      try { doAdvance(); markCommandDone(msg); }
      catch (advanceError) { releaseCommandId(msg); throw advanceError; }
      break;
    case "prev":
      if (!hasPermission(role, "nav")) return sendError(ws, "forbidden", "prev");
      // v7.3.0: 主控锁——上一节目为关键操作
      if (!requireMasterLock(ws)) return;
      doNav(-1); break;
    case "next":
      if (!hasPermission(role, "nav")) return sendError(ws, "forbidden", "next");
      // v7.3.0: 主控锁——下一节目为关键操作
      if (!requireMasterLock(ws)) return;
      doNav(1); break;
    case "reset_all":
      if (role !== "control") return sendError(ws, "forbidden", "reset_all");
      try {
        ensureHistorySnapshot(role, "reset_all");
        // P2-2: 归零也取消当前 runbook/autoAdvance（index 变化）
        activeProgramRunId++; cancelRunbookRun("reset_all"); cancelAutoAdvance("reset_all"); resetAutoAdvanceChain();
        state.programs.forEach(function(p) { p.status = "pending"; });
        state.currentProgramIndex = 0;
        if (state.programs[0]) state.programs[0].status = "active";
        resetTimerForCurrent(false);
        commitState(); markCommandDone(msg);
      } catch (resetError) { releaseCommandId(msg); throw resetError; }
      break;
    case "reset_one":
      if (role !== "control") return sendError(ws, "forbidden", "reset_one");
      if (typeof msg.idx === "number" && state.programs[msg.idx]) { state.programs[msg.idx].status = "pending"; commitState(); } break;
    case "update_program_field":
      if (!canEditField(role, msg.field)) return sendError(ws, "forbidden", "update_program_field");
      if (typeof msg.idx === "number" && state.programs[msg.idx]) {
        // P2-2: runbook 字段经 normalizeRunbook 规范化再写入（静态校验即规范化）
        if (msg.field === "runbook") { state.programs[msg.idx].runbook = normalizeRunbook(msg.value); }
        else { state.programs[msg.idx][msg.field] = msg.value; }
        commitState();
      } break;
    case "import_programs":
      if (role !== "control") return sendError(ws, "forbidden", "import_programs");
      if (!Array.isArray(msg.programs) || msg.programs.length > 2000) return sendError(ws, "invalid", "import_programs");
      var newProgs = msg.programs.map(function(p) { return { name: String(p.name || "").slice(0, 10000), duration: p.duration || 0, rehearsalDurationMs: Math.max(0, Math.min(86400000, parseInt(p.rehearsalDurationMs) || 0)), notes: String(p.notes || "").slice(0, 10000), musicCue: String(p.musicCue || "").slice(0, 10000), status: p.status || "pending", useChannels: Array.isArray(p.useChannels) ? p.useChannels.slice(0, 200) : [] }; });
      if (msg.mode === "replace") { activeProgramRunId++; cancelRunbookRun("replace_programs"); cancelAutoAdvance("replace_programs"); resetAutoAdvanceChain(); state.programs = newProgs; state.currentProgramIndex = 0; resetTimerForCurrent(false); } else { state.programs = state.programs.concat(newProgs); }
      commitState(); break;
    case "overlay_update":
      // P2-1 统一输出面：叠加层更新（仅 control；runbook/控制端手动操作叠加层）
      if (role !== "control") return sendError(ws, "forbidden", "overlay_update");
      try {
        if (msg.overlay && typeof msg.overlay === "object") {
          var ovSub = msg.overlay.subtitle;
          if (ovSub && typeof ovSub === "object") {
            var ovText = String(ovSub.text || '').slice(0, 2000);
            outputsOverlay.subtitle = { text: ovText, visible: !!ovText && ovSub.visible !== false };
          }
          var ovMedia = msg.overlay.media;
          if (ovMedia && typeof ovMedia === "object") {
            outputsOverlay.media = { type: String(ovMedia.type || '').slice(0, 20), url: String(ovMedia.url || '').slice(0, 2000), active: !!ovMedia.active };
          }
          broadcastOutputs();
        }
      } catch (overlayErr) { throw overlayErr; }
      break;
    case "reorder_programs":
      if (!hasPermission(role, "addDel")) return sendError(ws, "forbidden", "reorder_programs");
      if (!Array.isArray(msg.programs)) return sendError(ws, "invalid", "reorder_programs");
      // v6.4.2: 控制端发送完整顺序数组 → 直接按序替换（不再 name 匹配——同名节目会错乱，实测拖拽乱序根因）
      if (msg.programs.length === state.programs.length && msg.programs.every(function(p){ return p && typeof p === "object" && typeof p.name === "string"; })) {
        state.programs = msg.programs.map(function(p){ return Object.assign({}, p); });
        if (state.currentProgramIndex >= state.programs.length) state.currentProgramIndex = Math.max(0, state.programs.length - 1);
        commitState();
      }
      break;
    case "update_channels":
      if (!hasPermission(role, "editChannels")) return sendError(ws, "forbidden", "update_channels");
      if (msg.data && msg.data.globalChannels) {
        if (Array.isArray(msg.data.globalChannels.mics)) state.globalChannels.mics = msg.data.globalChannels.mics.map(ensureChannel);
        if (Array.isArray(msg.data.globalChannels.lines)) state.globalChannels.lines = msg.data.globalChannels.lines.map(ensureChannel);
        if (msg.data.programs && Array.isArray(msg.data.programs)) {
          // Update program-level useChannels if provided
          msg.data.programs.forEach(function(upd, i) {
            if (typeof i === "number" && state.programs[i] && upd && Array.isArray(upd.useChannels)) {
              state.programs[i].useChannels = upd.useChannels.slice(0, 200);
            }
          });
        }
        commitState();
      }
      break;
    case "theme_update":
      if (role !== "control") return sendError(ws, "forbidden", "theme_update");
      state.theme = normalizeThemeConfig(msg.theme || {});
      broadcast({ type: "theme_changed", theme: cloneState(getEffectiveTheme(state)) });
      commitState();
      break;
    case "undo":
      if (role !== "control") return sendError(ws, "forbidden", "undo");
      if (!undoHistory.length) return sendError(ws, "empty", "undo");
      redoHistory.push(cloneState(state));
      state = mergeState(undoHistory.pop());
      resetAutomaticCueRun();
      logAction(role, "undo"); commitState(); break;
    case "redo":
      if (role !== "control") return sendError(ws, "forbidden", "redo");
      if (!redoHistory.length) return sendError(ws, "empty", "redo");
      undoHistory.push(cloneState(state));
      state = mergeState(redoHistory.pop());
      resetAutomaticCueRun();
      logAction(role, "redo"); commitState(); break;
    case "get_operation_log":
      if (role !== "control") return sendError(ws, "forbidden", "get_operation_log");
      sendTo(ws, { type: "operation_log", entries: operationLog }); break;
    case "cue_trigger":
      if (!hasPermission(role, "nav")) return sendError(ws, "forbidden", "cue_trigger");
      var cue = state.timeline.cues.filter(function(c) { return c.id === msg.cueId; })[0];
      if (!cue) return sendError(ws, "invalid", "cue_trigger");
      markCueTriggered(cue);
      logAction(role, "cue_trigger: " + (cue.label || cue.id));
      broadcast({ type: "cue_triggered", cue: cue, at: new Date().toISOString() });
      syncCueOverlay(cue); break;
    case "task_ack":
      if (!hasPermission(role, "nav")) return sendError(ws, "forbidden", "task_ack");
      var task = state.timeline.cues.filter(function(c) { return c.id === msg.cueId; })[0];
      if (!task) return sendError(ws, "invalid", "cue_not_found");
      if (task.type !== "task") return sendError(ws, "invalid", "not_a_task");
      var nextStatus = ["pending", "ready", "done", "skipped"].indexOf(msg.status) >= 0 ? msg.status : null;
      if (!nextStatus) return sendError(ws, "invalid", "task_ack");
      var curStatus = task.status || "pending";
      var allowedMap = { pending: ["ready", "done", "skipped"], ready: ["done", "skipped"] };
      if (!allowedMap[curStatus] || allowedMap[curStatus].indexOf(nextStatus) < 0) return sendError(ws, "invalid", "task_ack_transition");
      task.status = nextStatus;
      task.ackBy = String(msg.personId || "").slice(0, 40);
      task.ackAt = Date.now();
      commitState();
      broadcast({ type: "task_acked", cueId: msg.cueId, status: nextStatus, ackBy: task.ackBy });
      logAction(role, "task_ack: " + (task.label || task.id) + " -> " + nextStatus); break;
    case "timer_control":
      if (role !== "control") return sendError(ws, "forbidden", "timer_control");
      if (!state.timingSettings.enabled) return sendError(ws, "disabled", "timer_control");
      if (["start", "pause", "reset", "finish_rehearsal"].indexOf(msg.action) < 0) return sendError(ws, "invalid", "timer_control");
      if (msg.action === "finish_rehearsal") {
        var finishProgramIndex = Number(msg.programIndex);
        var elapsedMs = Number(msg.elapsedMs);
        if (state.timingSettings.phase !== "rehearsal" || !Number.isInteger(finishProgramIndex) || finishProgramIndex !== state.currentProgramIndex || !state.programs[finishProgramIndex]) {
          return sendError(ws, "invalid", "finish_rehearsal");
        }
        if (!Number.isFinite(elapsedMs) || elapsedMs < 0 || elapsedMs > 86400000) {
          return sendError(ws, "invalid", "finish_rehearsal");
        }
        elapsedMs = Math.round(elapsedMs);
        var finishNow = Date.now();
        var previousDuration = state.programs[finishProgramIndex].rehearsalDurationMs;
        var previousRuntimeTimer = Object.assign({}, state.runtimeTimer);
        var fixedTimer = elapsedMs > 0 ? {
          programIndex: finishProgramIndex,
          startedAt: finishNow - elapsedMs,
          pausedAt: 0,
          pausedTotalMs: 0,
          running: true
        } : StageCore.resetTimerForProgram(finishProgramIndex);
        var finished = StageCore.finishRehearsal(finishNow, fixedTimer, finishProgramIndex, state.programs[finishProgramIndex]);
        state.programs[finishProgramIndex].rehearsalDurationMs = elapsedMs;
        state.runtimeTimer = finished.runtimeTimer;
        try {
          saveStateOrThrow();
        } catch (e) {
          state.programs[finishProgramIndex].rehearsalDurationMs = previousDuration;
          state.runtimeTimer = previousRuntimeTimer;
          console.error("保存彩排实测时长失败:", e.message);
          sendTo(ws, { type: "error", code: "persistence_failed", operation: "finish_rehearsal" });
          break;
        }
        sendTo(ws, { type: "timer_rehearsal_saved", programIndex: finishProgramIndex, rehearsalDurationMs: elapsedMs, elapsedMs: elapsedMs });
        broadcastFullState();
      } else {
        state.runtimeTimer = StageCore.applyTimerAction(Date.now(), state.runtimeTimer, msg.action, state.currentProgramIndex);
        if (msg.action === "reset") resetAutomaticCueRun();
        commitState();
      }
      break;
      break;
    case "mode_switch_request":
      if (role !== "director") return sendError(ws, "forbidden", "mode_switch_request");
      if (msg.targetMode !== "performance" && msg.targetMode !== "setup") return sendError(ws, "invalid", "mode_switch_request");
      // Check if director already has a pending request
      var hasPending = Object.keys(pendingModeRequests).some(function(id) {
        return pendingModeRequests[id].ws === ws;
      });
      if (hasPending) return sendError(ws, "conflict", "mode_switch_request");
      var requestId = "req_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6);
      var createdAt = Date.now();
      pendingModeRequests[requestId] = { ws: ws, requestId: requestId, fromRole: role, targetMode: msg.targetMode, createdAt: createdAt, noticeAt: createdAt + APPROVAL_NOTICE_MS, status: "pending", reason: String(msg.reason || "").slice(0, 500), note: "" };
      addApprovalAudit({ requestId: requestId, status: "pending", role: role, time: createdAt, audit: true });
      // Check if any control is online
      var controlOnline = false;
      allWebSocketServers.forEach(function(s) {
        s.clients.forEach(function(c) { if (c.readyState === WebSocket.OPEN && c.stageRole === "control") controlOnline = true; });
      });
      if (!controlOnline) {
        sendTo(ws, { type: "mode_switch_result", requestId: requestId, approved: false, reason: "no_control" });
        delete pendingModeRequests[requestId];
        return;
      }
      sendTo(ws, { type: "mode_switch_pending", requestId: requestId, status: "pending", noticeAt: createdAt + APPROVAL_NOTICE_MS });
      sendToRole("control", { type: "mode_switch_request", requestId: requestId, fromRole: role, targetMode: msg.targetMode, reason: msg.reason || "", timestamp: Date.now() });
      break;
    case "mode_switch_response":
      if (role !== "control") return sendError(ws, "forbidden", "mode_switch_response");
      var pendingReq = pendingModeRequests[msg.requestId];
      if (!pendingReq) { sendTo(ws, { type: "mode_switch_result", requestId: msg.requestId, approved: false, reason: "not_found" }); return; }
      if (pendingReq.status !== "pending") return sendError(ws, "conflict", "mode_switch_response");
      var responseTime = Date.now();
      var approvalDetails = { note: String(msg.note || "").slice(0, 500), reason: String(msg.reason || "").slice(0, 500) };
      var approvalStatus = msg.approved ? "approved" : "rejected";
      var resolvedReq = StageCore.transitionApproval(pendingReq, approvalStatus, responseTime, approvalDetails);
      pendingReq.status = resolvedReq.status; pendingReq.resolvedAt = resolvedReq.resolvedAt; pendingReq.note = resolvedReq.note || ""; pendingReq.reason = resolvedReq.reason || "";
      addApprovalAudit({ requestId: msg.requestId, status: pendingReq.status, role: role, time: responseTime, reason: pendingReq.reason, note: pendingReq.note, audit: true });
      if (msg.approved) {
        // Execute mode change
        var previousMode = state.mode;
        state.mode = pendingReq.targetMode;
        resetTimerForCurrent(false);
        commitState();
        sendTo(pendingReq.ws, { type: "mode_switch_result", requestId: msg.requestId, approved: true, status: pendingReq.status, note: pendingReq.note });
      } else {
        sendTo(pendingReq.ws, { type: "mode_switch_result", requestId: msg.requestId, approved: false, status: pendingReq.status, reason: pendingReq.reason || "rejected", note: pendingReq.note });
      }
      // Clear request and notify other control connections
      delete pendingModeRequests[msg.requestId];
      sendToRole("control", { type: "mode_switch_request_cleared", requestId: msg.requestId });
      break;
    case "project_list":
      if (role !== "control") return sendError(ws, "forbidden", "project_list");
      sendTo(ws, { type: "project_list_result", ...publicProjectList() });
      break;
    case "project_create":
      if (role !== "control") return sendError(ws, "forbidden", "project_create");
      var newProj = createProject(msg.project || {});
      if (!newProj) return sendError(ws, "invalid", "project_create");
      logAction(role, "project_create: " + newProj.name);
      commitState();
      sendTo(ws, { type: "project_created", project: newProj, ...publicProjectList() });
      broadcast({ type: "project_switched", projectId: currentProjectId, ...publicProjectList() });
      break;
    case "project_open":
      if (role !== "control") return sendError(ws, "forbidden", "project_open");
      if (state.mode === "performance") return sendError(ws, "must_exit_performance", "project_open");
      var openedOk = switchProject(String(msg.projectId || ""));
      if (!openedOk) return sendError(ws, "not_found", "project_open");
      logAction(role, "project_open: " + msg.projectId);
      commitState();
      sendTo(ws, { type: "project_opened", projectId: currentProjectId, ...publicProjectList() });
      broadcast({ type: "project_switched", projectId: currentProjectId, ...publicProjectList() });
      break;
    case "project_copy":
      if (role !== "control") return sendError(ws, "forbidden", "project_copy");
      var copied = copyProject(String(msg.projectId || ""), msg.name);
      if (!copied) return sendError(ws, "not_found", "project_copy");
      logAction(role, "project_copy: " + copied.name);
      sendTo(ws, { type: "project_copied", project: copied, ...publicProjectList() });
      broadcast({ type: "project_list_changed", ...publicProjectList() });
      break;
    case "project_archive":
      if (role !== "control") return sendError(ws, "forbidden", "project_archive");
      if (!archiveProject(String(msg.projectId || ""), msg.archived !== false)) return sendError(ws, "not_found", "project_archive");
      logAction(role, "project_archive: " + msg.projectId + "=" + (msg.archived !== false));
      sendTo(ws, { type: "project_archived", projectId: String(msg.projectId || ""), archived: msg.archived !== false, ...publicProjectList() });
      broadcast({ type: "project_list_changed", ...publicProjectList() });
      break;
    case "project_rename":
      if (role !== "control") return sendError(ws, "forbidden", "project_rename");
      if (!renameProject(String(msg.projectId || ""), msg.name)) return sendError(ws, "not_found", "project_rename");
      logAction(role, "project_rename: " + msg.projectId);
      if (String(msg.projectId || "") === currentProjectId) commitState();
      sendTo(ws, { type: "project_renamed", projectId: String(msg.projectId || ""), name: String(msg.name || ""), ...publicProjectList() });
      broadcast({ type: "project_list_changed", ...publicProjectList() });
      break;
    case "project_delete":
      if (role !== "control") return sendError(ws, "forbidden", "project_delete");
      if (!deleteProject(String(msg.projectId || ""))) return sendError(ws, "invalid", "project_delete");
      logAction(role, "project_delete: " + msg.projectId);
      sendTo(ws, { type: "project_deleted", projectId: String(msg.projectId || ""), ...publicProjectList() });
      broadcast({ type: "project_list_changed", ...publicProjectList() });
      break;
    case "project_set_status":
      if (role !== "control") return sendError(ws, "forbidden", "project_set_status");
      if (!setProjectStatus(String(msg.projectId || ""), String(msg.status || ""))) return sendError(ws, "invalid", "project_set_status");
      logAction(role, "project_set_status: " + msg.projectId + "=" + msg.status);
      sendTo(ws, { type: "project_status_changed", projectId: String(msg.projectId || ""), status: String(msg.status || ""), ...publicProjectList() });
      broadcast({ type: "project_list_changed", ...publicProjectList() });
      break;
    case "project_export":
      if (role !== "control") return sendError(ws, "forbidden", "project_export");
      var exportId = safeProjectId(String(msg.projectId || ""));
      var exportFile = loadJsonFile(projectFilePath(exportId));
      if (!exportFile) return sendError(ws, "not_found", "project_export");
      var exportMeta = null;
      var exportIdx = loadProjectsIndex();
      for (var ei = 0; ei < exportIdx.projects.length; ei++) if (exportIdx.projects[ei].id === exportId) { exportMeta = exportIdx.projects[ei]; break; }
      var exportPack = {
        schema: "stage-manager-project", version: 1, exportedAt: new Date().toISOString(),
        projectId: exportId,
        meta: exportMeta ? { id: exportMeta.id, name: exportMeta.name, client: exportMeta.client || "", date: exportMeta.date || "", type: exportMeta.type || "wedding", programCount: exportMeta.programCount || 0 } : null,
        state: cloneState(exportFile)
      };
      sendTo(ws, { type: "project_export_result", projectId: exportId, pack: exportPack });
      break;
  }
}

function doAdvance() {
  // WebSocket handleMessage 已在此操作前 pushHistory；直达入口则由此补齐。
  ensureHistorySnapshot("system", "advance");
  activateProgram(state.currentProgramIndex + 1, { completeCurrent: true, timerReason: "go", source: "manual" });
}
function doNav(dir) {
  var idx = state.currentProgramIndex;
  var newIdx = idx + dir; if (newIdx < 0) newIdx = 0; if (newIdx > state.programs.length - 1) newIdx = Math.max(0, state.programs.length - 1);
  activateProgram(newIdx, { timerReason: "program_switch", source: "manual" });
}
// sendTo / sendError / MIME 来自 lib/server-shared.js
function cueTriggeredIds() { return Object.keys(automaticCueTriggered).filter(function(id){ return automaticCueTriggered[id]; }); }
// broadcast / broadcastFullState / broadcastClientCount 通过工厂注入多服务器拓扑与 cueTriggeredIds
var broadcasters = createBroadcasters({
  getServers: function() { return allWebSocketServers; },
  getState: function() { return state; },
  getClientCount: function() { return connectionCount(); },
  getExtraFields: function() { return { cueTriggeredIds: cueTriggeredIds(), outputs: buildOutputs(state) }; },
  getEventMeta: function(obj) {
    if (obj.type === "client_count") return null;
    return { seq: ++eventSequence, serverInstanceId: serverInstanceId };
  }
});
var broadcast = broadcasters.broadcast;
var broadcastFullState = broadcasters.broadcastFullState;
var broadcastClientCount = broadcasters.broadcastClientCount;
function commitState() { saveState(); broadcastFullState(); }
function broadcastPermissionsUpdate() {
  allWebSocketServers.forEach(function(server) {
    server.clients.forEach(function(ws) {
      if (ws.readyState === 1 && ws.stageRole) {
        sendTo(ws, { type: 'permissions_update', permissions: permissionsForRole(ws.stageRole), permissionsVersion: permissionsVersion });
      }
    });
  });
}
setInterval(maybeTriggerAutomaticCues, 100);


// MIME 类型表来自 lib/server-shared.js
function setSecurityHeaders(res) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
}
function sendJson(res, status, value) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(value));
}
function normalizeHostHeader(value) {
  var host = (value || "").trim();
  if (!host) return "";
  if (host.charAt(0) === "[") {
    var end = host.indexOf("]");
    return end > 0 ? host.slice(1, end) : "";
  }
  var idx = host.indexOf(":");
  return idx === -1 ? host : host.slice(0, idx);
}
function isLoopbackHost(host) {
  host = (host || "").toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host === "::1" || host.indexOf("127.") === 0;
}
function formatUrlHost(host) {
  host = host || "localhost";
  return host.indexOf(":") !== -1 && host.charAt(0) !== "[" ? "[" + host + "]" : host;
}
function preferredLinkHost(req) {
  var requestHost = normalizeHostHeader(req && req.headers ? req.headers.host : "");
  if (requestHost && !isLoopbackHost(requestHost)) return requestHost;
  return primaryIP || requestHost || "localhost";
}
function makeAccessUrl(ip, port, role) {
  return "http://" + formatUrlHost(ip) + ":" + port + "/?role=" + encodeURIComponent(role);
}
// v6.5.1: 反代前缀拼接（Caddy handle_path 设置 X-Forwarded-Prefix），https 反代场景 303 跳转带前缀
function prefixPath(req, p) {
  var prefix = String((req && req.headers && req.headers["x-forwarded-prefix"]) || "").replace(/\/+$/, "");
  return prefix ? prefix + p : p;
}
function roleAccessPort(role) {
  // v6.3.1: 各角色独立端口（启用时），否则回退 clientPort
  if (role !== "control" && ROLE_PORTS[role]) return ROLE_PORTS[role];
  return role === "control" ? actualPort : actualClientPort;
}
function buildAccessLinks(ip) {
  var links = {};
  VALID_ROLES.forEach(function(role) { links[role] = makeAccessUrl(ip, roleAccessPort(role), role); });
  links.screen = makeAccessUrl(ip, actualScreenPort, "screen");
  // v6.6.0: 提示屏控制端（独立端口，凭 control 登录 + ctrlMode 专注界面）
  if (ROLE_PORTS.screenCtrl) links.screenCtrl = makeAccessUrl(ip, ROLE_PORTS.screenCtrl, "control") + "&ctrlMode=screen";
  return links;
}
function makePasswordUrlTemplate(ip, port, role) {
  return "http://" + formatUrlHost(ip) + ":" + port + "/?role=" + encodeURIComponent(role);
}
function buildPasswordLinkTemplates(ip) {
  var links = {};
  VALID_ROLES.forEach(function(role) { links[role] = makePasswordUrlTemplate(ip, roleAccessPort(role), role); });
  links.screen = makeAccessUrl(ip, actualScreenPort, "screen");
  // v6.6.0: 提示屏控制端链接模板（port 直连场景）
  if (ROLE_PORTS.screenCtrl) links.screenCtrl = makePasswordUrlTemplate(ip, ROLE_PORTS.screenCtrl, "control") + "&ctrlMode=screen";
  return links;
}
function makeBaseUrl(req) {
  return "http://" + formatUrlHost(preferredLinkHost(req)) + ":" + actualPort;
}
function isLoopbackRequest(req) {
  var addr = (req.socket && req.socket.remoteAddress) || "";
  return addr === "127.0.0.1" || addr === "::1" || addr.indexOf("::ffff:127.") === 0;
}
function sendUnauthorized(res, isScreen) {
  res.writeHead(401, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
  res.end("<!doctype html><meta charset=utf-8><title>需要访问链接</title><body style='font-family:sans-serif;padding:32px'><h2>链接无效或已失效</h2><p>请在控制端打开二维码，重新复制" + (isScreen ? "提示屏" : "对应角色") + "链接。</p></body>");
}
function sendDownload(res, fileName, contentType, body) {
  res.writeHead(200, {
    "Content-Type": contentType,
    "Content-Disposition": "attachment; filename=\"" + fileName + "\"",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  res.end(body);
}
function serveDownloadFile(res, fileName, contentType, diskPath) {
  fs.readFile(diskPath, function(err, data) {
    if (err) {
      sendJson(res, 404, { ok: false, error: "download_not_found", file: fileName });
      return;
    }
    sendDownload(res, fileName, contentType, data);
  });
}
function serveMediaFile(req, res, diskPath) {
  fs.stat(diskPath, function(err, stat) {
    if (err || !stat.isFile()) { res.writeHead(404, { "Content-Type":"text/plain; charset=utf-8" }); res.end("404 Not Found"); return; }
    var size = stat.size;
    var type = MIME[path.extname(diskPath).toLowerCase()] || "application/octet-stream";
    var range = String(req.headers.range || "").match(/^bytes=(\d*)-(\d*)$/);
    var start = 0;
    var end = Math.max(0, size - 1);
    var status = 200;
    if (range) {
      start = range[1] ? parseInt(range[1], 10) : 0;
      end = range[2] ? parseInt(range[2], 10) : end;
      if (!isFinite(start) || !isFinite(end) || start < 0 || start > end || start >= size) {
        res.writeHead(416, { "Content-Range":"bytes */" + size }); res.end(); return;
      }
      end = Math.min(end, size - 1);
      status = 206;
    }
    var headers = { "Content-Type":type, "Content-Length":Math.max(0, end - start + 1), "Accept-Ranges":"bytes", "Cache-Control":"no-store" };
    if (status === 206) headers["Content-Range"] = "bytes " + start + "-" + end + "/" + size;
    res.writeHead(status, headers);
    if (req.method === "HEAD") { res.end(); return; }
    var stream = fs.createReadStream(diskPath, { start:start, end:end });
    stream.on("error", function(){ if (!res.headersSent) res.writeHead(500); res.end(); });
    stream.pipe(res);
  });
}
function buildWindowsInstaller(baseUrl) {
  return [
    "@echo off",
    "setlocal EnableExtensions",
    "chcp 65001 >nul 2>&1",
    "title Stage Manager - Windows",
    "set \"BASE_URL=" + baseUrl + "\"",
    "set \"SCRIPT_DIR=%~dp0\"",
    "set \"APP_DIR=%SCRIPT_DIR%stage-manager\"",
    "set \"CORE_ZIP=%TEMP%\\stage-manager-core-%RANDOM%.zip\"",
    "set \"NODE_ZIP=%TEMP%\\stage-manager-node-%RANDOM%.zip\"",
    "set \"NODE_DIR=%APP_DIR%\\.runtime\\node-v20.18.1-win-x64\"",
    "set \"NODE_EXE=\"",
    "if not exist \"%APP_DIR%\" mkdir \"%APP_DIR%\"",
    "echo [1/3] Downloading Stage Manager core...",
    "powershell -NoProfile -ExecutionPolicy Bypass -Command \"[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri '%BASE_URL%/download/stage-manager-core.zip' -OutFile '%CORE_ZIP%'\"",
    "if errorlevel 1 goto :DOWNLOAD_FAIL",
    "powershell -NoProfile -ExecutionPolicy Bypass -Command \"Expand-Archive -LiteralPath '%CORE_ZIP%' -DestinationPath '%APP_DIR%' -Force\"",
    "if errorlevel 1 goto :DOWNLOAD_FAIL",
    "del \"%CORE_ZIP%\" >nul 2>&1",
    "where node >nul 2>&1",
    "if %errorlevel%==0 set \"NODE_EXE=node\"",
    "if not defined NODE_EXE if exist \"%NODE_DIR%\\node.exe\" set \"NODE_EXE=%NODE_DIR%\\node.exe\"",
    "if not defined NODE_EXE (",
    "  echo [2/3] Downloading local Node.js runtime...",
    "  if not exist \"%APP_DIR%\\.runtime\" mkdir \"%APP_DIR%\\.runtime\"",
    "  powershell -NoProfile -ExecutionPolicy Bypass -Command \"[Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -UseBasicParsing -Uri 'https://nodejs.org/dist/v20.18.1/node-v20.18.1-win-x64.zip' -OutFile '%NODE_ZIP%'\"",
    "  if errorlevel 1 goto :NODE_FAIL",
    "  powershell -NoProfile -ExecutionPolicy Bypass -Command \"Expand-Archive -LiteralPath '%NODE_ZIP%' -DestinationPath '%APP_DIR%\\.runtime' -Force\"",
    "  if errorlevel 1 goto :NODE_FAIL",
    "  del \"%NODE_ZIP%\" >nul 2>&1",
    "  set \"NODE_EXE=%NODE_DIR%\\node.exe\"",
    ")",
    "echo [3/3] Starting server...",
    "cd /d \"%APP_DIR%\"",
    "set \"AUTO_OPEN=1\"",
    "\"%NODE_EXE%\" \"%APP_DIR%\\server-standalone.js\"",
    "pause",
    "exit /b 0",
    ":DOWNLOAD_FAIL",
    "echo Failed to download or unpack Stage Manager core from %BASE_URL%.",
    "pause",
    "exit /b 1",
    ":NODE_FAIL",
    "echo Failed to prepare Node.js. Install Node.js manually from https://nodejs.org/ and run this file again.",
    "pause",
    "exit /b 1",
    ""
  ].join("\r\n");
}
function buildUnixInstaller(baseUrl, label, archCase) {
  return [
    "#!/usr/bin/env bash",
    "set -e",
    "BASE_URL=\"" + baseUrl + "\"",
    "SCRIPT_DIR=\"$(cd \"$(dirname \"$0\")\" && pwd)\"",
    "APP_DIR=\"$SCRIPT_DIR/stage-manager\"",
    "RUNTIME_DIR=\"$APP_DIR/.runtime\"",
    "NODE_BIN=\"\"",
    "mkdir -p \"$APP_DIR\" \"$RUNTIME_DIR\"",
    "TMP_DIR=\"$(mktemp -d 2>/dev/null || mktemp -d -t stage-manager)\"",
    "cleanup() { rm -rf \"$TMP_DIR\"; }",
    "trap cleanup EXIT",
    "download_file() {",
    "  if command -v curl >/dev/null 2>&1; then curl -fL \"$1\" -o \"$2\";",
    "  elif command -v wget >/dev/null 2>&1; then wget -O \"$2\" \"$1\";",
    "  else echo \"curl or wget is required.\"; exit 1; fi",
    "}",
    "echo \"[1/3] Downloading Stage Manager core...\"",
    "download_file \"$BASE_URL/download/stage-manager-core.tar.gz\" \"$TMP_DIR/core.tar.gz\"",
    "tar -xzf \"$TMP_DIR/core.tar.gz\" -C \"$APP_DIR\"",
    "if command -v node >/dev/null 2>&1 && node -e 'var m=Number(process.versions.node.split(\".\")[0]); process.exit(m>=16?0:1)' >/dev/null 2>&1; then",
    "  NODE_BIN=\"$(command -v node)\"",
    "fi",
    archCase,
    "echo \"[3/3] Starting " + label + "...\"",
    "cd \"$APP_DIR\"",
    "AUTO_OPEN=1 \"$NODE_BIN\" \"$APP_DIR/server-standalone.js\"",
    ""
  ].join("\n");
}
function buildDarwinRuntimeCase(requiredArch, runtimeName, runtimeUrl) {
  return [
    "if [ -z \"$NODE_BIN\" ]; then",
    "  if [ \"$(uname -s)\" != \"Darwin\" ] || [ \"$(uname -m)\" != \"" + requiredArch + "\" ]; then",
    "    echo \"This launcher is for macOS " + requiredArch + ".\"",
    "    exit 1",
    "  fi",
    "  NODE_HOME=\"$RUNTIME_DIR/" + runtimeName + "\"",
    "  NODE_BIN=\"$NODE_HOME/bin/node\"",
    "  if [ ! -x \"$NODE_BIN\" ]; then",
    "    echo \"[2/3] Downloading local Node.js runtime...\"",
    "    download_file \"" + runtimeUrl + "\" \"$TMP_DIR/node.tar.gz\"",
    "    tar -xzf \"$TMP_DIR/node.tar.gz\" -C \"$RUNTIME_DIR\"",
    "    chmod +x \"$NODE_BIN\"",
    "  fi",
    "fi"
  ].join("\n");
}
function buildLinuxRuntimeCase() {
  return [
    "if [ -z \"$NODE_BIN\" ]; then",
    "  ARCH=\"$(uname -m)\"",
    "  case \"$ARCH\" in",
    "    x86_64|amd64) NODE_NAME=\"node-v20.18.1-linux-x64\" ;;",
    "    aarch64|arm64) NODE_NAME=\"node-v20.18.1-linux-arm64\" ;;",
    "    armv7l|armv7*) NODE_NAME=\"node-v20.18.1-linux-armv7l\" ;;",
    "    *) echo \"Unsupported Linux architecture: $ARCH\"; exit 1 ;;",
    "  esac",
    "  NODE_HOME=\"$RUNTIME_DIR/$NODE_NAME\"",
    "  NODE_BIN=\"$NODE_HOME/bin/node\"",
    "  if [ ! -x \"$NODE_BIN\" ]; then",
    "    echo \"[2/3] Downloading local Node.js runtime...\"",
    "    download_file \"https://nodejs.org/dist/v20.18.1/$NODE_NAME.tar.xz\" \"$TMP_DIR/node.tar.xz\"",
    "    tar -xJf \"$TMP_DIR/node.tar.xz\" -C \"$RUNTIME_DIR\"",
    "    chmod +x \"$NODE_BIN\"",
    "  fi",
    "fi"
  ].join("\n");
}
function buildTermuxRuntimeCase() {
  return [
    "if [ -z \"$NODE_BIN\" ]; then",
    "  if command -v pkg >/dev/null 2>&1; then",
    "    echo \"[2/3] Installing Node.js with Termux pkg...\"",
    "    pkg install -y nodejs-lts",
    "    NODE_BIN=\"$(command -v node)\"",
    "  else",
    "    echo \"Termux pkg was not found. Install Node.js manually and run this file again.\"",
    "    exit 1",
    "  fi",
    "fi"
  ].join("\n");
}
function serveDownload(req, res, urlPath) {
  var baseUrl = makeBaseUrl(req);
  var downloadsDir = path.join(__dirname, "downloads");
  if (urlPath === "/download/stage-manager-core.zip") {
    serveDownloadFile(res, "stage-manager-core.zip", "application/zip", path.join(downloadsDir, "stage-manager-core.zip"));
    return true;
  }
  if (urlPath === "/download/stage-manager-core.tar.gz") {
    serveDownloadFile(res, "stage-manager-core.tar.gz", "application/gzip", path.join(downloadsDir, "stage-manager-core.tar.gz"));
    return true;
  }
  if (urlPath === "/download/stage-manager-win.bat") {
    sendDownload(res, "stage-manager-win.bat", "application/x-bat; charset=utf-8", buildWindowsInstaller(baseUrl));
    return true;
  }
  if (urlPath === "/download/stage-manager-macos-intel.command") {
    var intelCase = buildDarwinRuntimeCase("x86_64", "node-v16.20.2-darwin-x64", "https://nodejs.org/dist/v16.20.2/node-v16.20.2-darwin-x64.tar.gz");
    sendDownload(res, "stage-manager-macos-intel.command", "text/x-shellscript; charset=utf-8", buildUnixInstaller(baseUrl, "Stage Manager", intelCase));
    return true;
  }
  if (urlPath === "/download/stage-manager-macos-arm64.command") {
    var armCase = buildDarwinRuntimeCase("arm64", "node-v20.18.1-darwin-arm64", "https://nodejs.org/dist/v20.18.1/node-v20.18.1-darwin-arm64.tar.gz");
    sendDownload(res, "stage-manager-macos-arm64.command", "text/x-shellscript; charset=utf-8", buildUnixInstaller(baseUrl, "Stage Manager", armCase));
    return true;
  }
  if (urlPath === "/download/stage-manager-rpi.sh") {
    sendDownload(res, "stage-manager-rpi.sh", "text/x-shellscript; charset=utf-8", buildUnixInstaller(baseUrl, "Stage Manager", buildLinuxRuntimeCase()));
    return true;
  }
  if (urlPath === "/download/stage-manager-android.sh") {
    sendDownload(res, "stage-manager-android.sh", "text/x-shellscript; charset=utf-8", buildUnixInstaller(baseUrl, "Stage Manager", buildTermuxRuntimeCase()));
    return true;
  }
  sendJson(res, 404, { ok: false, error: "download_not_found" });
  return true;
}
// OCR 资源（tess/）内存缓存：首次读取后缓存 {headers,data}，后续请求直接从内存返回，避免热路径重复磁盘 I/O
var tessFileCache = {};
// 第三方库（vendor/）内存缓存：同 tessFileCache 模式，避免热路径重复磁盘 I/O
var vendorFileCache = {};
function serveRequest(req, res, serverType) {
  var isClientPortal = serverType === "client" || serverType === "screen" || serverType.indexOf("client-") === 0;
  var isControlServer = serverType === "control";
  var isEntryServer = serverType === "entry";
  var isScreenServer = serverType === "screen";
  var isRolePortServer = serverType.indexOf("client-") === 0;
  setSecurityHeaders(res);
  var parsedUrl = parseRequestUrl(req);
  var urlPath;
  try { urlPath = decodeURIComponent(parsedUrl ? parsedUrl.pathname : "/"); }
  catch (e) { res.writeHead(400); res.end("Bad Request"); return; }
  var templateRouteMatch = /^\/api\/templates\/([A-Za-z0-9_-]+)$/.exec(urlPath);
  var projectTemplateRouteMatch = /^\/api\/projects\/([A-Za-z0-9_-]+)\/save-as-template$/.exec(urlPath);
  var isTemplateRoute = urlPath === "/api/templates" || urlPath === "/api/projects/from-template" || templateRouteMatch || projectTemplateRouteMatch;
  if (isTemplateRoute) {
    if (!isControlServer || getRequestRole(req, serverType) !== "control") { sendJson(res, 401, { ok: false, error: "unauthorized" }); return; }
    if (!requestUnlocked(req)) { sendJson(res, 403, { ok: false, error: "unlock_required" }); return; }  // v6.9.x-FIX-L4: 模板库=完整功能，需解锁
    var templateService = require("./lib/template-service")({ dataDir: __dirname });
    var readTemplateBody = function(callback) {
      var rawBody = "";
      var bodyTooLarge = false;
      req.on("data", function(chunk) {
        if (bodyTooLarge) return;
        rawBody += chunk;
        if (Buffer.byteLength(rawBody, "utf-8") > MAX_HTTP_BODY) { bodyTooLarge = true; sendJson(res, 413, { ok: false, error: "too_large" }); }
      });
      req.on("end", function() {
        if (bodyTooLarge) return;
        try { callback(null, JSON.parse(rawBody || "{}")); }
        catch (error) { callback(error); }
      });
    };
    if (urlPath === "/api/templates" && req.method === "GET") {
      try { sendJson(res, 200, { templates: templateService.listTemplates(parsedUrl ? parsedUrl.searchParams.get("type") || "" : "") }); }
      catch (error) { sendJson(res, 400, { ok: false, error: error.message }); }
      return;
    }
    if (urlPath === "/api/templates" && req.method === "POST") {
      readTemplateBody(function(error, body) {
        if (error) { sendJson(res, 400, { ok: false, error: "invalid_request" }); return; }
        try {
          templateService.createTemplate({ name: body.name, type: body.type, structure: body.structure, createdBy: "control" }).then(function(createdTemplate) {
            sendJson(res, 200, { ok: true, template: createdTemplate });
          }).catch(function(createError) { sendJson(res, 400, { ok: false, error: createError.message }); });
        } catch (createError) { sendJson(res, 400, { ok: false, error: createError.message }); }
      });
      return;
    }
    if (templateRouteMatch && req.method === "GET") {
      var requestedTemplate = templateService.getTemplate(templateRouteMatch[1]);
      if (!requestedTemplate) { sendJson(res, 404, { ok: false, error: "not_found" }); return; }
      sendJson(res, 200, { ok: true, template: requestedTemplate });
      return;
    }
    if (templateRouteMatch && req.method === "PUT") {
      readTemplateBody(function(error, body) {
        if (error) { sendJson(res, 400, { ok: false, error: "invalid_request" }); return; }
        try {
          templateService.updateTemplate(templateRouteMatch[1], body).then(function(updatedTemplate) {
            if (!updatedTemplate) { sendJson(res, 404, { ok: false, error: "not_found" }); return; }
            sendJson(res, 200, { ok: true, template: updatedTemplate });
          }).catch(function(updateError) {
            sendJson(res, updateError.message === "Builtin templates are read-only" || updateError.message === "Archived template cannot be edited" ? 403 : 400, { ok: false, error: updateError.message });
          });
        } catch (updateError) {
          sendJson(res, updateError.message === "Builtin templates are read-only" || updateError.message === "Archived template cannot be edited" ? 403 : 400, { ok: false, error: updateError.message });
        }
      });
      return;
    }
    if (templateRouteMatch && req.method === "DELETE") {
      try {
        templateService.archiveTemplate(templateRouteMatch[1]).then(function(archivedTemplate) {
          if (!archivedTemplate) { sendJson(res, 404, { ok: false, error: "not_found" }); return; }
          sendJson(res, 200, { ok: true });
        }).catch(function(archiveError) {
          sendJson(res, archiveError.message === "Builtin templates are read-only" ? 403 : 400, { ok: false, error: archiveError.message });
        });
      } catch (archiveError) {
        sendJson(res, archiveError.message === "Builtin templates are read-only" ? 403 : 400, { ok: false, error: archiveError.message });
      }
      return;
    }
    if (urlPath === "/api/projects/from-template" && req.method === "POST") {
      readTemplateBody(function(error, body) {
        if (error) { sendJson(res, 400, { ok: false, error: "invalid_request" }); return; }
        try {
          var projectFromTemplate = templateService.createProjectFromTemplate(body.templateId, body.projectName);
          if (!projectFromTemplate) { sendJson(res, 404, { ok: false, error: "not_found" }); return; }
          sendJson(res, 200, { ok: true, project: projectFromTemplate });
        } catch (projectError) { sendJson(res, 400, { ok: false, error: projectError.message }); }
      });
      return;
    }
    if (projectTemplateRouteMatch && req.method === "POST") {
      var sourceProjectId = safeProjectId(projectTemplateRouteMatch[1]);
      var sourceProject = require("./lib/storage-safe").readJsonSafe(projectFilePath(sourceProjectId), null);
      if (!sourceProject) { sendJson(res, 404, { ok: false, error: "not_found" }); return; }
      var sourceProjectIndex = loadProjectsIndex();
      var sourceProjectMeta = null;
      for (var templateProjectIndex = 0; templateProjectIndex < sourceProjectIndex.projects.length; templateProjectIndex++) {
        if (sourceProjectIndex.projects[templateProjectIndex].id === sourceProjectId) { sourceProjectMeta = sourceProjectIndex.projects[templateProjectIndex]; break; }
      }
      try {
        templateService.saveProjectAsTemplate(Object.assign({}, sourceProject, {
          id: sourceProjectId,
          name: sourceProjectMeta && sourceProjectMeta.name ? sourceProjectMeta.name : sourceProject.showName,
          type: sourceProjectMeta && sourceProjectMeta.type ? sourceProjectMeta.type : sourceProject.type
        })).then(function(savedTemplate) {
          sendJson(res, 200, { ok: true, template: savedTemplate });
        }).catch(function(saveTemplateError) { sendJson(res, 400, { ok: false, error: saveTemplateError.message }); });
      } catch (saveTemplateError) { sendJson(res, 400, { ok: false, error: saveTemplateError.message }); }
      return;
    }
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }
  if (urlPath === "/api/auth/login" && req.method === "POST") {
    var loginBody = "";
    var loginTooLarge = false;
    req.on("data", function(chunk) {
      if (loginTooLarge) return;
      loginBody += chunk;
      if (Buffer.byteLength(loginBody, "utf-8") > 8192) { loginTooLarge = true; sendJson(res, 413, { ok: false, error: "too_large" }); }
    });
    req.on("end", function() {
      if (loginTooLarge) return;
      var credentials = {};
      try {
        if (String(req.headers["content-type"] || "").indexOf("application/json") === 0) credentials = JSON.parse(loginBody || "{}");
        else { var form = new URLSearchParams(loginBody); credentials = { role: form.get("role") || "", password: form.get("password") || "", ctrlMode: form.get("ctrlMode") || "" }; }
      } catch (e) { sendJson(res, 400, { ok: false, error: "invalid_request" }); return; }
      var loginRole = String(credentials.role || "");
      var validForServer = (serverType === "control" && loginRole === "control") || (serverType === "client" && VALID_ROLES.indexOf(loginRole) >= 0 && loginRole !== "control") || (serverType === "screen" && loginRole === "screen");
      // v6.3.1: 角色独立端口（serverType 形如 "client-director"），只接受对应角色
      // v6.6.0: 提示屏控制端端口接受 control 角色登录（控制端登录凭据），前端凭 ctrlMode 进入专注界面
      var rolePortMatch = /^client-([a-zA-Z]+)$/.exec(serverType);
      if (rolePortMatch) {
        var rpRole = rolePortMatch[1];
        if (rpRole === "screenCtrl") validForServer = (loginRole === "control");
        else validForServer = (loginRole === rpRole);
      }
      if (!validForServer || (passwordEnabled(loginRole) && !verifyRolePassword(loginRole, String(credentials.password || "")))) { sendJson(res, 401, { ok: false, error: "invalid_credentials" }); return; }
      var sessionId = sessionStore.create(loginRole);
      var location = prefixPath(req, "/?role=" + encodeURIComponent(loginRole));
      if (serverType === "client-screenCtrl") location = prefixPath(req, "/?role=control&ctrlMode=screen");
      // v6.6.0: 从入口页表单提交 ctrlMode 参数时（https 反代场景），登录后带 ctrlMode 跳转
      if (serverType !== "client-screenCtrl" && credentials.ctrlMode) {
        location = prefixPath(req, "/?role=" + encodeURIComponent(loginRole) + "&ctrlMode=" + encodeURIComponent(credentials.ctrlMode));
      }
      res.writeHead(303, { "Location": location, "Set-Cookie": sessionCookie(serverType, sessionId, false), "Cache-Control": "no-store" });
      res.end();
    });
    return;
  }
  if (urlPath === "/api/auth/logout" && req.method === "POST") {
    sessionStore.revoke(getSessionId(req, serverType));
    res.writeHead(204, { "Set-Cookie": sessionCookie(serverType, "", true), "Cache-Control": "no-store" });
    res.end();
    return;
  }
  // v6.7.0 精简版: 验证码解锁完整功能 API（验证码在 config.json unlockCode 配置）
  if (urlPath === "/api/unlock" && req.method === "POST") {
    var unlockBody = "";
    req.on("data", function(chunk) {
      if (Buffer.byteLength(unlockBody, "utf-8") > 4096) return;
      unlockBody += chunk;
    });
    req.on("end", function() {
      var unlockData = {};
      try { unlockData = JSON.parse(unlockBody || "{}"); } catch (e) { sendJson(res, 400, { ok: false, error: "invalid_request" }); return; }
      var unlockCode = String(unlockData.code || "");
      var expected = String((_config && _config.unlockCode) || "");
      if (!expected || expected === "generate-local-token" || expected === "change-me") {
        sendJson(res, 403, { ok: false, error: "unlock_disabled" });
        return;
      }
      if (unlockCode === expected) {
        // v6.9.x-FIX-L4: 解锁成功——生成服务端 token + HttpOnly cookie（30天），前端 localStorage 门闩升级为服务端校验
        if (!unlockToken) saveUnlockToken(crypto.randomBytes(16).toString("hex"));
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Set-Cookie": "wutai_unlocked=" + unlockToken + "; Path=/; HttpOnly; Max-Age=2592000"
        });
        res.end(JSON.stringify({ ok: true, unlocked: true }));
      } else {
        sendJson(res, 401, { ok: false, error: "invalid_code" });
      }
    });
    return;
  }
  // Entry server: only serve entry portal HTML and static assets
  if (isEntryServer) {
    if (urlPath === "/" || urlPath === "/index.html") {
      var ports = { entryPort: actualEntryPort, port: actualPort, clientPort: actualClientPort, screenPort: actualScreenPort, directorPort: ROLE_PORTS.director || 0, assistantPort: ROLE_PORTS.assistant || 0, backstagePort: ROLE_PORTS.backstage || 0, consolePort: ROLE_PORTS.console || 0, screenCtrlPort: ROLE_PORTS.screenCtrl || 0 };
      var html = ENTRY_PORTAL_HTML_FN(_config, passwordStatus(), ports);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(html);
      return;
    }
    if (urlPath === "/icon.svg") {
      res.writeHead(200, { "Content-Type": "image/svg+xml" });
      res.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#1a1a2e"/><text x="256" y="340" font-size="280" text-anchor="middle" fill="#e94560" font-family="sans-serif">舞</text></svg>');
      return;
    }
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("404 Not Found");
    return;
  }
  if (urlPath === "/stage-core.js") {
    fs.readFile(path.join(__dirname, "stage-core.js"), function(err, data) {
      if (err) { res.writeHead(404); res.end("404 Not Found"); return; }
      res.writeHead(200, { "Content-Type":MIME[".js"], "Content-Length":data.length, "Cache-Control":"no-store" });
      res.end(data);
    });
    return;
  }
  if (urlPath.indexOf("/media/") === 0) {
    var mediaAuthorized = !!getRequestRole(req, serverType);
    if (!mediaAuthorized) { sendJson(res, 401, { ok:false, error:"unauthorized" }); return; }
    var mediaRelative = StageCore.normalizeMediaPath(urlPath);
    if (!mediaRelative) { res.writeHead(403); res.end("Forbidden"); return; }
    var mediaRoot = path.resolve(__dirname, "media");
    var mediaPath = path.resolve(mediaRoot, mediaRelative);
    if (mediaPath.indexOf(mediaRoot + path.sep) !== 0) { res.writeHead(403); res.end("Forbidden"); return; }
    serveMediaFile(req, res, mediaPath);
    return;
  }
  if (urlPath.indexOf("/download/") === 0) {
    serveDownload(req, res, urlPath);
    return;
  }
  if (urlPath === "/api/server-info") {
    var linkHost = preferredLinkHost(req);
    var info = {
      ip: linkHost,
      primaryIP: primaryIP,
      entryPort: actualEntryPort,
      port: actualPort,
      clientPort: actualClientPort,
      screenPort: actualScreenPort,
      configuredEntryPort: _config.entryPort,
      configuredPort: _config.port,
      configuredClientPort: _config.clientPort,
      configuredScreenPort: _config.screenPort,
      ips: localIPs,
      portOverride: PORT_ENV_OVERRIDE,
      clientPortOverride: CLIENT_PORT_ENV_OVERRIDE,
      entryPortOverride: ENTRY_PORT_ENV_OVERRIDE,
      screenPortOverride: SCREEN_PORT_ENV_OVERRIDE,
      downloadBaseUrl: makeBaseUrl(req),
      // v7.2.1-P1: 屏幕在线计数（lite 无字幕端：screen=提示屏 / screenCtrl=提示屏控制端）
      screenClients: {
        screen: screenClientStats.screen,
        screenCtrl: screenClientStats.screenCtrl
      }
    };
    var requestRole = getRequestRole(req, serverType);
    if (requestRole) info.permissions = permissionsForRole(requestRole);
    // v7.6.0-P4: 提示屏/字幕控制端(独立端口)也返回 links，解决"无法读取提示屏链接"
    var isCtrlLikeServer = isControlServer || serverType === "client-subtitleCtrl" || serverType === "client-screenCtrl";
    if (isCtrlLikeServer && requestRole === "control") {
      info.links = buildAccessLinks(linkHost);
      info.passwordStatus = passwordStatus();
      info.passwordLinkTemplates = buildPasswordLinkTemplates(linkHost);
      info.rolePermissions = _config.rolePermissions;
    }
    sendJson(res, 200, info);
    return;
  }
  if (urlPath === "/api/passwords") {
    if (!isControlServer || getRequestRole(req, serverType) !== "control") { sendJson(res, 401, { ok: false, error: "unauthorized" }); return; }
    if (req.method === "GET") {
      sendJson(res, 200, { ok: true, enabled: passwordStatus(), templates: buildPasswordLinkTemplates(preferredLinkHost(req)) });
      return;
    }
    if (req.method === "POST") {
      if ((req.headers["content-type"] || "").split(";")[0].trim().toLowerCase() !== "application/json") { sendJson(res, 415, { ok: false, error: "content_type" }); return; }
      var passwordBody = "";
      var passwordBodyTooLarge = false;
      req.on("data", function(chunk) {
        if (passwordBodyTooLarge) return;
        passwordBody += chunk;
        if (Buffer.byteLength(passwordBody, "utf-8") > MAX_HTTP_BODY) { passwordBodyTooLarge = true; sendJson(res, 413, { ok: false, error: "too_large" }); }
      });
      req.on("end", function() {
        if (passwordBodyTooLarge) return;
        try {
          var body = JSON.parse(passwordBody);
          var passwords = body.passwords && typeof body.passwords === "object" ? body.passwords : {};
          var clear = body.clear && typeof body.clear === "object" ? body.clear : {};
          PASSWORD_ROLES.forEach(function(role) {
            if (clear[role] === true) {
              delete _config.passwordHashes[role];
              sessionStore.revokeRole(role);
              return;
            }
            if (Object.prototype.hasOwnProperty.call(passwords, role)) {
              var nextPassword = String(passwords[role] || "");
              if (nextPassword.length > 0) {
                if (nextPassword.length < 4 || nextPassword.length > 64) throw new Error(role + " 密码长度需为 4-64 个字符");
                _config.passwordHashes[role] = makePasswordHash(nextPassword);
                sessionStore.revokeRole(role);
              }
            }
          });
          saveConfig(_config);
          sendJson(res, 200, { ok: true, enabled: passwordStatus(), templates: buildPasswordLinkTemplates(preferredLinkHost(req)) });
        } catch(e) {
          sendJson(res, 400, { ok: false, error: e.message });
        }
      });
      return;
    }
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }
  if (urlPath === "/api/config") {
    if (!isControlServer || getRequestRole(req, serverType) !== "control") { sendJson(res, 401, { ok: false, error: "unauthorized" }); return; }
    if (req.method === "GET") {
      sendJson(res, 200, { entryPort: _config.entryPort, port: _config.port, clientPort: _config.clientPort, screenPort: _config.screenPort, rolePermissions: _config.rolePermissions, actualEntryPort: actualEntryPort, actualPort: actualPort, actualClientPort: actualClientPort, actualScreenPort: actualScreenPort, portOverride: PORT_ENV_OVERRIDE, clientPortOverride: CLIENT_PORT_ENV_OVERRIDE, entryPortOverride: ENTRY_PORT_ENV_OVERRIDE, screenPortOverride: SCREEN_PORT_ENV_OVERRIDE });
      return;
    }
    if (req.method === "POST") {
      if ((req.headers["content-type"] || "").split(";")[0].trim().toLowerCase() !== "application/json") { sendJson(res, 415, { ok: false, error: "content_type" }); return; }
      var body = "";
      var bodyTooLarge = false;
      req.on("data", function(chunk) {
        if (bodyTooLarge) return;
        body += chunk;
        if (Buffer.byteLength(body, "utf-8") > MAX_HTTP_BODY) { bodyTooLarge = true; sendJson(res, 413, { ok: false, error: "too_large" }); }
      });
      req.on("end", function() {
        if (bodyTooLarge) return;
        try {
          var cfg = JSON.parse(body);
          var nextEntryPort = parsePort(cfg.entryPort, _config.entryPort);
          var nextPort = parsePort(cfg.port, _config.port);
          var nextClientPort = parsePort(cfg.clientPort, _config.clientPort);
          var nextScreenPort = parsePort(cfg.screenPort, _config.screenPort);
          if (!nextPort || !nextClientPort || !nextEntryPort || !nextScreenPort) throw new Error("端口必须是 1-65535 的整数");
          var nextPorts = [nextEntryPort, nextPort, nextClientPort, nextScreenPort];
          if (new Set(nextPorts).size !== 4) throw new Error("入口页、控制端、客户端、提示屏端口必须互不相同");
          if (!ENTRY_PORT_ENV_OVERRIDE) _config.entryPort = nextEntryPort;
          if (!PORT_ENV_OVERRIDE) _config.port = nextPort;
          if (!CLIENT_PORT_ENV_OVERRIDE) _config.clientPort = nextClientPort;
          if (!SCREEN_PORT_ENV_OVERRIDE) _config.screenPort = nextScreenPort;
          _config.rolePermissions = normalizeRolePermissions(cfg.rolePermissions);
          permissionsVersion++;
          saveConfig(_config);
          broadcastPermissionsUpdate();
          sendJson(res, 200, { ok: true, entryPort: _config.entryPort, port: _config.port, clientPort: _config.clientPort, screenPort: _config.screenPort, rolePermissions: _config.rolePermissions, actualEntryPort: actualEntryPort, actualPort: actualPort, actualClientPort: actualClientPort, actualScreenPort: actualScreenPort, needsRestart: nextEntryPort !== actualEntryPort || nextPort !== actualPort || nextClientPort !== actualClientPort || nextScreenPort !== actualScreenPort, portOverride: PORT_ENV_OVERRIDE, clientPortOverride: CLIENT_PORT_ENV_OVERRIDE, entryPortOverride: ENTRY_PORT_ENV_OVERRIDE, screenPortOverride: SCREEN_PORT_ENV_OVERRIDE });
        } catch(e) {
          sendJson(res, 400, { ok: false, error: e.message });
        }
      });
      return;
    }
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }
  if (urlPath === "/" || urlPath === "/index.html") {
    var requestedRole = parsedUrl ? parsedUrl.searchParams.get("role") : "";
    var sessionRole = getRequestRole(req, serverType);

    if (isControlServer) {
      if (sessionRole === "control") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        res.end(renderAppHtml()); return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(CONTROL_LOGIN_HTML); return;
    }

    if (isScreenServer) {
      if (sessionRole !== "screen") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" }); res.end(CLIENT_PORTAL_HTML(passwordStatus())); return; }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(renderAppHtml()); return;
    }


    // v6.3.1: 角色独立端口（client-director 等）——只接受本端口固定角色
    // v6.6.0: 提示屏控制端端口接受 control 会话并渲染完整界面（ctrlMode 由 URL 参数驱动前端专注视图）
    if (isRolePortServer) {
      var fixedRole = serverType.replace("client-", "");
      var isCtrlPort = (fixedRole === "screenCtrl");
      if (isCtrlPort && sessionRole === "control") {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        res.end(renderAppHtml()); return;
      }
      if (sessionRole === fixedRole) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        res.end(renderAppHtml()); return;
      }
      if (!requestedRole) requestedRole = fixedRole;
      if (requestedRole === fixedRole) {
        // 自动建该角色 session（无密码时）或跳登录
        if (isPasswordRole(fixedRole, false) && !passwordEnabled(fixedRole)) {
          var roleFreeSession = sessionStore.create(fixedRole);
          res.writeHead(303, { "Location": prefixPath(req, "/?role=" + encodeURIComponent(fixedRole)), "Set-Cookie": sessionCookie(serverType, roleFreeSession, false), "Cache-Control": "no-store" }); res.end(); return;
        }
      }
      // v6.6.0: 控制端端口未登录时渲染 control 登录页（登录凭据为 control）
      if (isCtrlPort) {
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
        res.end(CONTROL_LOGIN_HTML); return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(CLIENT_PORTAL_HTML(passwordStatus())); return;
    }

    if (sessionRole && sessionRole !== "control" && (!requestedRole || requestedRole === sessionRole)) {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
      res.end(renderAppHtml()); return;
    }
    if (requestedRole && requestedRole !== "control" && isPasswordRole(requestedRole, false) && !passwordEnabled(requestedRole)) {
      var freeSession = sessionStore.create(requestedRole);
      res.writeHead(303, { "Location": prefixPath(req, "/?role=" + encodeURIComponent(requestedRole)), "Set-Cookie": sessionCookie(serverType, freeSession, false), "Cache-Control": "no-store" }); res.end(); return;
    }
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" });
    res.end(CLIENT_PORTAL_HTML(passwordStatus())); return;
  }
  if (urlPath === "/manifest.json") {
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ name: "舞台流程表", short_name: "舞台流程", display: "standalone", background_color: "#000", theme_color: "#000", start_url: "/?role=control", scope: "/", icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }] }));
    return;
  }
  if (urlPath === "/sw.js") {
    res.writeHead(200, { "Content-Type": "application/javascript; charset=utf-8" });
    res.end("var CACHE=\'stage-manager-v607\';self.addEventListener(\'install\',function(e){self.skipWaiting();});self.addEventListener(\'activate\',function(e){e.waitUntil(caches.keys().then(function(keys){return Promise.all(keys.filter(function(k){return k!==CACHE;}).map(function(k){return caches.delete(k);}));}).then(function(){return self.clients.claim();}));});self.addEventListener(\'fetch\',function(e){if(e.request.method!==\'GET\')return;if(e.request.url.indexOf(\'/tess/\')!==-1){e.respondWith(fetch(e.request));return;}e.respondWith(caches.open(CACHE).then(function(c){return c.match(e.request).then(function(f){var p=fetch(e.request).then(function(r){if(r.ok)c.put(e.request,r.clone());return r;}).catch(function(){return f;});return p;});}));});");
    return;
  }
  if (urlPath === "/icon.svg") {
    res.writeHead(200, { "Content-Type": "image/svg+xml" });
    res.end('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="96" fill="#000"/><text x="256" y="340" font-size="280" text-anchor="middle" fill="#fff" font-family="sans-serif">舞</text></svg>');
    return;
  }
  if (urlPath.indexOf("/tess/") === 0) {
    var tessFile = urlPath.replace("/tess/", "");
    if (tessFile.indexOf("..") !== -1 || tessFile.indexOf("/") !== -1) { res.writeHead(403); res.end("Forbidden"); return; }
    var tessCached = tessFileCache[tessFile];
    if (tessCached) { res.writeHead(200, tessCached.headers); res.end(tessCached.data); return; }
    var tessPath = path.join(__dirname, "tess", tessFile);
    fs.readFile(tessPath, function(err, data) {
      if (err) { console.error("[tess] 文件未找到: " + tessFile); res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found"); return; }
      var tessExt = path.extname(tessFile).toLowerCase();
      var tessMime = MIME[tessExt] || "application/octet-stream";
      var tessHeaders = { "Content-Type": tessMime, "Content-Length": data.length, "Cache-Control": "no-cache" };
      if (tessExt === ".gz") tessHeaders["Content-Encoding"] = "gzip";
      tessFileCache[tessFile] = { headers: tessHeaders, data: data };
      res.writeHead(200, tessHeaders);
      res.end(data);
    });
    return;
  }
  if (urlPath === "/api/ocr-status") {
    var tessDir = path.join(__dirname, "tess");
    var ocrFiles = ["pdf.min.js","pdf.worker.min.js","tesseract.min.js","worker.min.js","tesseract-core-lstm.wasm.js","tesseract-core-simd-lstm.wasm.js","tesseract-core-simd.wasm.js","tesseract-core.wasm.js","chi_sim.traineddata.gz","eng.traineddata.gz"];
    var ocrResult = {};
    ocrFiles.forEach(function(f) {
      try { ocrResult[f] = { exists: true, size: fs.statSync(path.join(tessDir, f)).size }; }
      catch(e) { ocrResult[f] = { exists: false, size: 0 }; }
    });
    sendJson(res, 200, { ok: true, files: ocrResult });
    return;
  }
  if (urlPath.indexOf("/vendor/") === 0) {
    var vendorFile = urlPath.replace("/vendor/", "");
    if (!/^[A-Za-z0-9._-]+$/.test(vendorFile)) { res.writeHead(403); res.end("Forbidden"); return; }
    var vendorCached = vendorFileCache[vendorFile];
    if (vendorCached) { res.writeHead(200, vendorCached.headers); res.end(vendorCached.data); return; }
    var vendorPath = path.join(__dirname, "vendor", vendorFile);
    fs.readFile(vendorPath, function(err, data) {
      if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); res.end("404 Not Found"); return; }
      var vendorHeaders = { "Content-Type": MIME[path.extname(vendorFile).toLowerCase()] || "application/octet-stream", "Content-Length": data.length, "Cache-Control": "public, max-age=31536000, immutable" };
      vendorFileCache[vendorFile] = { headers: vendorHeaders, data: data };
      res.writeHead(200, vendorHeaders);
      res.end(data);
    });
    return;
  }
  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("404 Not Found");
}

var actualEntryPort = ENTRY_PORT;
var actualPort = PORT;
var actualClientPort = CLIENT_PORT;
var actualScreenPort = SCREEN_PORT;
var entryListening = false;
var mainListening = false;
var clientListening = false;
var screenListening = false;
var didOpenBrowser = false;

function openBrowser(url) {
  if (process.env.AUTO_OPEN !== "1" || didOpenBrowser) return;
  didOpenBrowser = true;
  var command; var args;
  if (process.platform === "darwin") { command = "open"; args = [url]; }
  else if (process.platform === "win32") { command = "cmd"; args = ["/c", "start", "", url]; }
  else { command = "xdg-open"; args = [url]; }
  try { childProcess.spawn(command, args, { detached: true, stdio: "ignore" }).unref(); }
  catch (e) { console.error("自动打开浏览器失败: " + e.message); }
}
function printReady() {
  if (!entryListening || !mainListening || !clientListening || !screenListening) return;
  // v6.3.1: 等待所有角色端口就绪
  var roleNames = Object.keys(ROLE_SERVERS);
  for (var ri = 0; ri < roleNames.length; ri++) { if (!roleListening[roleNames[ri]]) return; }
  var localEntryUrl = "http://localhost:" + actualEntryPort + "/";
  var localControlUrl = makeAccessUrl("localhost", actualPort, "control");
  console.log("═══════════════════════════════════════════════════");
  console.log("  舞台流程表 服务器已启动 (v6.3.1)");
  console.log("═══════════════════════════════════════════════════");
  console.log("");
  console.log("  入口页:   " + localEntryUrl);
  console.log("  控制端:   " + localControlUrl + " (需密码登录)");
  console.log("  客户端:   " + "http://localhost:" + actualClientPort + "/");
  Object.keys(ROLE_PORTS).forEach(function(role) {
    if (!ROLE_PORTS[role]) return;
    var roleLabel = ({director:"导演端",assistant:"助理端",backstage:"幕后端",console:"控台端",screenCtrl:"提示屏控制端"})[role] || role;
    console.log("  " + roleLabel + ":   " + makeAccessUrl("localhost", ROLE_PORTS[role], role === "screenCtrl" ? "control" : role) + (role === "screenCtrl" ? "&ctrlMode=screen" : ""));
  });
  console.log("  提示屏:   " + "http://localhost:" + actualScreenPort + "/");
  if (localIPs.length > 0) console.log("  局域网:   http://" + primaryIP + ":" + actualEntryPort + "/ (入口页)");
  console.log("");
  console.log("  按 Ctrl+C 停止服务器");
  console.log("═══════════════════════════════════════════════════");
  openBrowser(localEntryUrl);
}

entryServer.on("error", function(e) {
  console.error("入口页端口 " + ENTRY_PORT + " 启动失败: " + e.message);
  process.exit(1);
});
entryServer.on("listening", function() {
  actualEntryPort = entryServer.address().port;
  entryListening = true;
  printReady();
});
controlServer.on("error", function(e) {
  console.error("控制端端口 " + PORT + " 启动失败: " + e.message);
  process.exit(1);
});
controlServer.on("listening", function() {
  actualPort = controlServer.address().port;
  mainListening = true;
  printReady();
});
clientServer.on("error", function(e) {
  console.error("客户端端口 " + CLIENT_PORT + " 启动失败: " + e.message);
  process.exit(1);
});
clientServer.on("listening", function() {
  actualClientPort = clientServer.address().port;
  clientListening = true;
  printReady();
});
screenServer.on("error", function(e) {
  console.error("提示屏端口 " + SCREEN_PORT + " 启动失败: " + e.message);
  process.exit(1);
});
screenServer.on("listening", function() {
  actualScreenPort = screenServer.address().port;
  screenListening = true;
  printReady();
});
entryServer.listen(ENTRY_PORT, "0.0.0.0");
controlServer.listen(PORT, "0.0.0.0");
clientServer.listen(CLIENT_PORT, "0.0.0.0");
screenServer.listen(SCREEN_PORT, "0.0.0.0");
// v6.3.1: 角色独立端口监听
var roleListening = {};
Object.keys(ROLE_SERVERS).forEach(function(role) {
  roleListening[role] = false;
  ROLE_SERVERS[role].on("error", function(e) {
    console.error("角色端口 " + role + "(" + ROLE_PORTS[role] + ") 启动失败: " + e.message + "，该角色回退使用客户端端口 " + CLIENT_PORT);
    ROLE_PORTS[role] = 0;
    roleListening[role] = true;
    printReady();
  });
  ROLE_SERVERS[role].on("listening", function() {
    ROLE_PORTS[role] = ROLE_SERVERS[role].address().port;
    roleListening[role] = true;
    printReady();
  });
  ROLE_SERVERS[role].listen(ROLE_PORTS[role], "0.0.0.0");
});
