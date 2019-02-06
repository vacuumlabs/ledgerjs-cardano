"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Assert = exports.Precondition = undefined;

var _toConsumableArray2 = require("babel-runtime/helpers/toConsumableArray");

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

exports.uint32_to_buf = uint32_to_buf;
exports.buf_to_uint32 = buf_to_uint32;
exports.uint8_to_buf = uint8_to_buf;
exports.hex_to_buf = hex_to_buf;
exports.buf_to_hex = buf_to_hex;
exports.path_to_buf = path_to_buf;
exports.chunkBy = chunkBy;
exports.stripRetcodeFromResponse = stripRetcodeFromResponse;
exports.buf_to_amount = buf_to_amount;
exports.amount_to_buf = amount_to_buf;
exports.base58_encode = base58_encode;
exports.base58_decode = base58_decode;
exports.str_to_path = str_to_path;

var _baseX = require("base-x");

var _baseX2 = _interopRequireDefault(_baseX);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

var bs58 = (0, _baseX2.default)(BASE58_ALPHABET);

var HARDENED = 0x80000000;

// We use bs10 as an easy way to parse/encode amount strings
var bs10 = (0, _baseX2.default)("0123456789");

// Max supply in lovelace
var MAX_LOVELACE_SUPPLY_STR = ["45", "000", "000", "000", "000000"].join("");

var Precondition = exports.Precondition = {
  // Generic check
  check: function check(cond) {
    if (!cond) throw new Error("Precondition failed");
  },
  // Basic types
  checkIsString: function checkIsString(data) {
    Precondition.check(typeof data === "string");
  },
  checkIsInteger: function checkIsInteger(data) {
    Precondition.check(Number.isInteger(data));
  },
  checkIsArray: function checkIsArray(data) {
    Precondition.check(Array.isArray(data));
  },
  checkIsBuffer: function checkIsBuffer(data) {
    Precondition.check(Buffer.isBuffer(data));
  },

  // Extended checks
  checkIsUint32: function checkIsUint32(data) {
    Precondition.checkIsInteger(data);
    Precondition.check(data >= 0);
    Precondition.check(data <= 4294967295);
  },
  checkIsUint8: function checkIsUint8(data) {
    Precondition.checkIsInteger(data);
    Precondition.check(data >= 0);
    Precondition.check(data <= 255);
  },

  checkIsHexString: function checkIsHexString(data) {
    Precondition.checkIsString(data);
    Precondition.check(data.length % 2 == 0);
    Precondition.check(/^[0-9a-fA-F]*$/.test(data));
  },
  checkIsValidPath: function checkIsValidPath(path) {
    Precondition.checkIsArray(path);
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = path[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var x = _step.value;

        Precondition.checkIsUint32(x);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  },
  checkIsValidAmount: function checkIsValidAmount(amount) {
    Precondition.checkIsString(amount);
    Precondition.check(/^[0-9]*$/.test(amount));
    // Length checks
    Precondition.check(amount.length > 0);
    Precondition.check(amount.length <= MAX_LOVELACE_SUPPLY_STR.length);
    // Leading zeros
    if (amount.length > 1) {
      Precondition.check(amount[0] != "0");
    }
    // less than max supply
    if (amount.length == MAX_LOVELACE_SUPPLY_STR.length) {
      // Note: this is string comparison!
      Precondition.check(amount <= MAX_LOVELACE_SUPPLY_STR);
    }
  },
  checkIsValidBase58: function checkIsValidBase58(data) {
    Precondition.checkIsString(data);
    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = data[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var c = _step2.value;

        Precondition.check(BASE58_ALPHABET.includes(c));
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }
};

var Assert = exports.Assert = {
  assert: function assert(cond) {
    if (!cond) throw new Error("Assertion failed");
  }
};

function uint32_to_buf(value) {
  Precondition.checkIsUint32(value);

  var data = Buffer.alloc(4);
  data.writeUInt32BE(value, 0);
  return data;
}

function buf_to_uint32(data) {
  Precondition.check(data.length == 4);

  return data.readUIntBE(0, 4);
}

function uint8_to_buf(value) {
  Precondition.checkIsUint8(value);

  var data = Buffer.alloc(1);
  data.writeUInt8(value, 0);
  return data;
}

function hex_to_buf(data) {
  Precondition.checkIsHexString(data);
  return Buffer.from(data, "hex");
}

function buf_to_hex(data) {
  return data.toString("hex");
}

// no buf_to_uint8

function path_to_buf(path) {
  Precondition.checkIsValidPath(path);

  var data = Buffer.alloc(1 + 4 * path.length);
  data.writeUInt8(path.length, 0);

  for (var i = 0; i < path.length; i++) {
    data.writeUInt32BE(path[i], 1 + i * 4);
  }
  return data;
}

var sum = function sum(arr) {
  return arr.reduce(function (x, y) {
    return x + y;
  }, 0);
};

function chunkBy(data, chunkLengths) {
  Precondition.checkIsBuffer(data);
  Precondition.checkIsArray(chunkLengths);
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = chunkLengths[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var len = _step3.value;

      Precondition.checkIsInteger(len);
      Precondition.check(len > 0);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  Precondition.check(data.length <= sum(chunkLengths));

  var offset = 0;
  var result = [];

  var restLength = data.length - sum(chunkLengths);

  var _arr = [].concat((0, _toConsumableArray3.default)(chunkLengths), [restLength]);

  for (var _i = 0; _i < _arr.length; _i++) {
    var c = _arr[_i];
    result.push(data.slice(offset, offset + c));

    offset += c;
  }

  return result;
}

function stripRetcodeFromResponse(response) {
  Precondition.checkIsBuffer(response);
  Precondition.check(response.length >= 2);

  var L = response.length - 2;
  var retcode = response.slice(L, L + 2);

  if (retcode.toString("hex") != "9000") throw new Error("Invalid retcode " + retcode.toString("hex"));
  return response.slice(0, L);
}

function buf_to_amount(data) {
  Precondition.checkIsBuffer(data);
  Precondition.check(data.length == 8);

  var encoded = bs10.encode(data);
  // Strip leading zeros
  return encoded.replace(/^0*(.)/, "$1");
}

function amount_to_buf(amount) {
  Precondition.checkIsValidAmount(amount);

  var data = bs10.decode(amount);
  // Amount should fit uin64_t
  Assert.assert(data.length <= 8);

  var padding = Buffer.alloc(8 - data.length);
  return Buffer.concat([padding, data]);
}

function base58_encode(data) {
  Precondition.checkIsBuffer(data);

  return bs58.encode(data);
}

function base58_decode(data) {
  Precondition.checkIsValidBase58(data);

  return bs58.decode(data);
}

function safe_parseInt(str) {
  Precondition.checkIsString(str);
  var i = parseInt(str);
  // Check that we parsed everything
  Precondition.check("" + i == str);
  // Could be invalid
  Precondition.check(!isNaN(i));
  // Could still be float
  Precondition.checkIsInteger(i);
  return i;
}

function parseBIP32Index(str) {
  var base = 0;
  if (str.endsWith("'")) {
    str = str.slice(0, -1);
    base = HARDENED;
  }
  var i = safe_parseInt(str);
  Precondition.check(i >= 0);
  Precondition.check(i < HARDENED);
  return base + i;
}

function str_to_path(data) {
  Precondition.checkIsString(data);
  Precondition.check(data.length > 0);

  return data.split("/").map(parseBIP32Index);
}

exports.default = {
  HARDENED: HARDENED,

  hex_to_buf: hex_to_buf,
  buf_to_hex: buf_to_hex,

  uint32_to_buf: uint32_to_buf,
  buf_to_uint32: buf_to_uint32,

  // no pair for now
  uint8_to_buf: uint8_to_buf,

  // no pair for now
  path_to_buf: path_to_buf,

  amount_to_buf: amount_to_buf,
  buf_to_amount: buf_to_amount,

  base58_encode: base58_encode,
  base58_decode: base58_decode,

  chunkBy: chunkBy,
  stripRetcodeFromResponse: stripRetcodeFromResponse,

  str_to_path: str_to_path
};
//# sourceMappingURL=utils.js.map