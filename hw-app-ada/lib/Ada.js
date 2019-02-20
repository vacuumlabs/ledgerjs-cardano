"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.utils = exports.getErrorDescription = exports.ErrorCodes = undefined;

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _defineProperty2 = require("babel-runtime/helpers/defineProperty");

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _ErrorMsgs; /********************************************************************************
                 *   Ledger Node JS API
                 *   (c) 2016-2017 Ledger
                 *
                 *  Licensed under the Apache License, Version 2.0 (the "License");
                 *  you may not use this file except in compliance with the License.
                 *  You may obtain a copy of the License at
                 *
                 *      http://www.apache.org/licenses/LICENSE-2.0
                 *
                 *  Unless required by applicable law or agreed to in writing, software
                 *  distributed under the License is distributed on an "AS IS" BASIS,
                 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
                 *  See the License for the specific language governing permissions and
                 *  limitations under the License.
                 ********************************************************************************/


var _hwTransport = require("@ledgerhq/hw-transport");

var _utils = require("./utils");

var _utils2 = _interopRequireDefault(_utils);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CLA = 0xd7;

var INS = {
  GET_VERSION: 0x00,

  GET_EXT_PUBLIC_KEY: 0x10,
  DERIVE_ADDRESS: 0x11,

  ATTEST_UTXO: 0x20,
  SIGN_TX: 0x21,

  RUN_TESTS: 0xf0
};

var ErrorCodes = exports.ErrorCodes = {
  ERR_STILL_IN_CALL: 0x6e04, // internal
  ERR_INVALID_DATA: 0x6e07,
  ERR_INVALID_BIP_PATH: 0x6e08,
  ERR_REJECTED_BY_USER: 0x6e09,
  ERR_REJECTED_BY_POLICY: 0x6e10,

  // Not thrown by ledger-app-cardano itself but other apps
  ERR_CLA_NOT_SUPPORTED: 0x6e00
};

var GH_ERRORS_LINK = "https://github.com/cardano-foundation/ledger-app-cardano/blob/master/src/errors.h";

var ErrorMsgs = (_ErrorMsgs = {}, (0, _defineProperty3.default)(_ErrorMsgs, ErrorCodes.ERR_INVALID_DATA, "Invalid data supplied to Ledger"), (0, _defineProperty3.default)(_ErrorMsgs, ErrorCodes.ERR_INVALID_BIP_PATH, "Invalid derivation path supplied to Ledger"), (0, _defineProperty3.default)(_ErrorMsgs, ErrorCodes.ERR_REJECTED_BY_USER, "Action rejected by user"), (0, _defineProperty3.default)(_ErrorMsgs, ErrorCodes.ERR_REJECTED_BY_POLICY, "Action rejected by Ledger's security policy"), (0, _defineProperty3.default)(_ErrorMsgs, ErrorCodes.ERR_CLA_NOT_SUPPORTED, "Wrong Ledger app"), _ErrorMsgs);

var getErrorDescription = exports.getErrorDescription = function getErrorDescription(statusCode) {
  var statusCodeHex = "0x" + statusCode.toString(16);
  var defaultMsg = "General error " + statusCodeHex + ". Please consult " + GH_ERRORS_LINK;

  return ErrorMsgs[statusCode] || defaultMsg;
};

// It can happen that we try to send a message to the device
// when the device thinks it is still in a middle of previous ADPU stream.
// This happens mostly if host does abort communication for some reason
// leaving ledger mid-call.
// In this case Ledger will respond by ERR_STILL_IN_CALL *and* resetting its state to
// default. We can therefore transparently retry the request.
// Note though that only the *first* request in an multi-APDU exchange should be retried.
var wrapRetryStillInCall = function wrapRetryStillInCall(fn) {
  return function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
      var _args = arguments;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return fn.apply(undefined, _args);

            case 3:
              return _context.abrupt("return", _context.sent);

            case 6:
              _context.prev = 6;
              _context.t0 = _context["catch"](0);

              if (!(_context.t0 && _context.t0.statusCode && _context.t0.statusCode === ErrorCodes.ERR_STILL_IN_CALL)) {
                _context.next = 12;
                break;
              }

              _context.next = 11;
              return fn.apply(undefined, _args);

            case 11:
              return _context.abrupt("return", _context.sent);

            case 12:
              throw _context.t0;

            case 13:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, undefined, [[0, 6]]);
    }));

    return function () {
      return _ref.apply(this, arguments);
    };
  }();
};

var wrapConvertError = function wrapConvertError(fn) {
  return function () {
    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2() {
      var _args2 = arguments;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return fn.apply(undefined, _args2);

            case 3:
              return _context2.abrupt("return", _context2.sent);

            case 6:
              _context2.prev = 6;
              _context2.t0 = _context2["catch"](0);

              if (_context2.t0 && _context2.t0.statusCode) {
                // keep HwTransport.TransportStatusError
                // just override the message
                _context2.t0.message = "Ledger device: " + getErrorDescription(_context2.t0.statusCode);
              }
              throw _context2.t0;

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, undefined, [[0, 6]]);
    }));

    return function () {
      return _ref2.apply(this, arguments);
    };
  }();
};
/**
 * Cardano ADA API
 *
 * @example
 * import Ada from "@ledgerhq/hw-app-ada";
 * const ada = new Ada(transport);
 */

var Ada = function () {
  function Ada(transport) {
    var scrambleKey = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "ADA";
    (0, _classCallCheck3.default)(this, Ada);

    this.transport = transport;
    this.methods = ["getVersion", "getExtendedPublicKey", "signTransaction", "deriveAddress"];
    this.transport.decorateAppAPIMethods(this, this.methods, scrambleKey);
    this.send = wrapConvertError(this.transport.send);
  }

  /**
   * Returns an object containing the app version.
   *
   * @returns {Promise<GetVersionResponse>} Result object containing the application version number.
   *
   * @example
   * const { major, minor, patch, flags } = await ada.getVersion();
   * console.log(`App version ${major}.${minor}.${patch}`);
   *
   */


  (0, _createClass3.default)(Ada, [{
    key: "getVersion",
    value: function () {
      var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
        var _this = this;

        var _send, P1_UNUSED, P2_UNUSED, response, _response, major, minor, patch, flags_value, FLAG_IS_DEBUG, flags;

        return _regenerator2.default.wrap(function _callee3$(_context3) {
          while (1) {
            switch (_context3.prev = _context3.next) {
              case 0:
                _send = function _send(p1, p2, data) {
                  return _this.send(CLA, INS.GET_VERSION, p1, p2, data).then(_utils2.default.stripRetcodeFromResponse);
                };

                P1_UNUSED = 0x00;
                P2_UNUSED = 0x00;
                _context3.next = 5;
                return wrapRetryStillInCall(_send)(P1_UNUSED, P2_UNUSED, _utils2.default.hex_to_buf(""));

              case 5:
                response = _context3.sent;

                _utils.Assert.assert(response.length == 4);
                _response = (0, _slicedToArray3.default)(response, 4), major = _response[0], minor = _response[1], patch = _response[2], flags_value = _response[3];
                FLAG_IS_DEBUG = 1;
                //const FLAG_IS_HEADLESS = 2;

                flags = {
                  isDebug: (flags_value & FLAG_IS_DEBUG) == FLAG_IS_DEBUG
                };
                return _context3.abrupt("return", { major: major, minor: minor, patch: patch, flags: flags });

              case 11:
              case "end":
                return _context3.stop();
            }
          }
        }, _callee3, this);
      }));

      function getVersion() {
        return _ref3.apply(this, arguments);
      }

      return getVersion;
    }()

    /**
     * Runs unit tests on the device (DEVEL app build only)
     *
     * @returns {Promise<void>}
     */

  }, {
    key: "runTests",
    value: function () {
      var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return wrapRetryStillInCall(this.send)(CLA, INS.RUN_TESTS, 0x00, 0x00);

              case 2:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this);
      }));

      function runTests() {
        return _ref4.apply(this, arguments);
      }

      return runTests;
    }()
  }, {
    key: "_attestUtxo",
    value: function () {
      var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5(txDataHex, outputIndex) {
        var _this2 = this;

        var _send, P1_INIT, P1_CONTINUE, P2_UNUSED, CHUNK_SIZE, data, result, txData, i, chunk, _result, _chunk, _result2, sum, sizes, _utils$chunkBy, _utils$chunkBy2, txHash, outputNumber, amount, hmac;

        return _regenerator2.default.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _utils.Precondition.checkIsHexString(txDataHex);
                _utils.Precondition.checkIsUint32(outputIndex);

                _send = function _send(p1, p2, data) {
                  return _this2.send(CLA, INS.ATTEST_UTXO, p1, p2, data).then(_utils2.default.stripRetcodeFromResponse);
                };

                P1_INIT = 0x01;
                P1_CONTINUE = 0x02;
                P2_UNUSED = 0x00;
                CHUNK_SIZE = 255;

                // Initial request
                data = _utils2.default.uint32_to_buf(outputIndex);
                _context5.next = 10;
                return wrapRetryStillInCall(_send)(P1_INIT, P2_UNUSED, data);

              case 10:
                result = _context5.sent;

                _utils.Assert.assert(result.length == 0);
                txData = _utils2.default.hex_to_buf(txDataHex);
                i = 0;

              case 14:
                if (!(i + CHUNK_SIZE < txData.length)) {
                  _context5.next = 23;
                  break;
                }

                chunk = txData.slice(i, i + CHUNK_SIZE);
                _context5.next = 18;
                return _send(P1_CONTINUE, P2_UNUSED, chunk);

              case 18:
                _result = _context5.sent;

                _utils.Assert.assert(_result.length == 0);
                i += CHUNK_SIZE;
                _context5.next = 14;
                break;

              case 23:
                _chunk = txData.slice(i);
                _context5.next = 26;
                return _send(P1_CONTINUE, P2_UNUSED, _chunk);

              case 26:
                _result2 = _context5.sent;

                sum = function sum(arr) {
                  return arr.reduce(function (x, y) {
                    return x + y;
                  }, 0);
                };

                sizes = [32, 4, 8, 16];

                _utils.Assert.assert(_result2.length == sum(sizes));

                _utils$chunkBy = _utils2.default.chunkBy(_result2, sizes), _utils$chunkBy2 = (0, _slicedToArray3.default)(_utils$chunkBy, 4), txHash = _utils$chunkBy2[0], outputNumber = _utils$chunkBy2[1], amount = _utils$chunkBy2[2], hmac = _utils$chunkBy2[3];
                return _context5.abrupt("return", {
                  rawBuffer: _result2,
                  txHashHex: _utils2.default.buf_to_hex(txHash),
                  outputIndex: _utils2.default.buf_to_uint32(outputNumber),
                  amountStr: _utils2.default.buf_to_amount(amount),
                  hmacHex: _utils2.default.buf_to_hex(hmac)
                });

              case 32:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this);
      }));

      function _attestUtxo(_x2, _x3) {
        return _ref5.apply(this, arguments);
      }

      return _attestUtxo;
    }()

    /**
     * @param string Raw transaction data (without witnesses) encoded as hex string
     * @param number Output indes
     *
     */

  }, {
    key: "attestUtxo",
    value: function () {
      var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(txDataHex, outputIndex) {
        return _regenerator2.default.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                return _context6.abrupt("return", this._attestUtxo(txDataHex, outputIndex));

              case 1:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this);
      }));

      function attestUtxo(_x4, _x5) {
        return _ref6.apply(this, arguments);
      }

      return attestUtxo;
    }()

    /**
     * @description Get a public key from the specified BIP 32 path.
     *
     * @param {BIP32Path} indexes The path indexes. Path must begin with `44'/1815'/n'`, and may be up to 10 indexes long.
     * @return {Promise<GetExtendedPublicKeyResponse>} The public key with chaincode for the given path.
     *
     * @example
     * const { publicKey, chainCode } = await ada.getExtendedPublicKey([ HARDENED + 44, HARDENED + 1815, HARDENED + 1 ]);
     * console.log(publicKey);
     *
     */

  }, {
    key: "getExtendedPublicKey",
    value: function () {
      var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(path) {
        var _this3 = this;

        var _send, P1_UNUSED, P2_UNUSED, data, response, _utils$chunkBy3, _utils$chunkBy4, publicKey, chainCode, rest;

        return _regenerator2.default.wrap(function _callee7$(_context7) {
          while (1) {
            switch (_context7.prev = _context7.next) {
              case 0:
                _utils.Precondition.checkIsValidPath(path);

                _send = function _send(p1, p2, data) {
                  return _this3.send(CLA, INS.GET_EXT_PUBLIC_KEY, p1, p2, data).then(_utils2.default.stripRetcodeFromResponse);
                };

                P1_UNUSED = 0x00;
                P2_UNUSED = 0x00;
                data = _utils2.default.path_to_buf(path);
                _context7.next = 7;
                return wrapRetryStillInCall(_send)(P1_UNUSED, P2_UNUSED, data);

              case 7:
                response = _context7.sent;
                _utils$chunkBy3 = _utils2.default.chunkBy(response, [32, 32]), _utils$chunkBy4 = (0, _slicedToArray3.default)(_utils$chunkBy3, 3), publicKey = _utils$chunkBy4[0], chainCode = _utils$chunkBy4[1], rest = _utils$chunkBy4[2];

                _utils.Assert.assert(rest.length == 0);

                return _context7.abrupt("return", {
                  publicKeyHex: publicKey.toString("hex"),
                  chainCodeHex: chainCode.toString("hex")
                });

              case 11:
              case "end":
                return _context7.stop();
            }
          }
        }, _callee7, this);
      }));

      function getExtendedPublicKey(_x6) {
        return _ref7.apply(this, arguments);
      }

      return getExtendedPublicKey;
    }()

    /**
     * @description Gets an address from the specified BIP 32 path.
     *
     * @param {BIP32Path} indexes The path indexes. Path must begin with `44'/1815'/i'/(0 or 1)/j`, and may be up to 10 indexes long.
     * @return {Promise<DeriveAddressResponse>} The address for the given path.
     *
     * @throws 5001 - The path provided does not have the first 3 indexes hardened or 4th index is not 0 or 1
     * @throws 5002 - The path provided is less than 5 indexes
     * @throws 5003 - Some of the indexes is not a number
     *
     * @example
     * const { address } = await ada.deriveAddress([ HARDENED + 44, HARDENED + 1815, HARDENED + 1, 0, 5 ]);
     *
     */

  }, {
    key: "deriveAddress",
    value: function () {
      var _ref8 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee8(path) {
        var _this4 = this;

        var _send, P1_RETURN, P2_UNUSED, data, response;

        return _regenerator2.default.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                _utils.Precondition.checkIsValidPath(path);

                _send = function _send(p1, p2, data) {
                  return _this4.send(CLA, INS.DERIVE_ADDRESS, p1, p2, data).then(_utils2.default.stripRetcodeFromResponse);
                };

                P1_RETURN = 0x01;
                P2_UNUSED = 0x00;
                data = _utils2.default.path_to_buf(path);
                _context8.next = 7;
                return _send(P1_RETURN, P2_UNUSED, data);

              case 7:
                response = _context8.sent;
                return _context8.abrupt("return", {
                  address58: _utils2.default.base58_encode(response)
                });

              case 9:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8, this);
      }));

      function deriveAddress(_x7) {
        return _ref8.apply(this, arguments);
      }

      return deriveAddress;
    }()
  }, {
    key: "showAddress",
    value: function () {
      var _ref9 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee9(path) {
        var _this5 = this;

        var _send, P1_DISPLAY, P2_UNUSED, data, response;

        return _regenerator2.default.wrap(function _callee9$(_context9) {
          while (1) {
            switch (_context9.prev = _context9.next) {
              case 0:
                _utils.Precondition.checkIsValidPath(path);

                _send = function _send(p1, p2, data) {
                  return _this5.send(CLA, INS.DERIVE_ADDRESS, p1, p2, data).then(_utils2.default.stripRetcodeFromResponse);
                };

                P1_DISPLAY = 0x02;
                P2_UNUSED = 0x00;
                data = _utils2.default.path_to_buf(path);
                _context9.next = 7;
                return _send(P1_DISPLAY, P2_UNUSED, data);

              case 7:
                response = _context9.sent;

                _utils.Assert.assert(response.length == 0);

              case 9:
              case "end":
                return _context9.stop();
            }
          }
        }, _callee9, this);
      }));

      function showAddress(_x8) {
        return _ref9.apply(this, arguments);
      }

      return showAddress;
    }()
  }, {
    key: "signTransaction",
    value: function () {
      var _ref10 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee16(inputs, outputs) {
        var _this6 = this;

        var P1_STAGE_INIT, P1_STAGE_INPUTS, P1_STAGE_OUTPUTS, P1_STAGE_CONFIRM, P1_STAGE_WITNESSES, P2_UNUSED, SIGN_TX_INPUT_TYPE_ATTESTED_UTXO, _send, signTx_init, signTx_addInput, signTx_addAddressOutput, signTx_addChangeOutput, signTx_awaitConfirm, signTx_getWitness, attestedInputs, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _ref17, _txDataHex, _outputIndex, attestation, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, output, _ref18, txHashHex, witnesses, _iteratorNormalCompletion4, _didIteratorError4, _iteratorError4, _iterator4, _step4, input, witness;

        return _regenerator2.default.wrap(function _callee16$(_context16) {
          while (1) {
            switch (_context16.prev = _context16.next) {
              case 0:
                //console.log("sign");

                P1_STAGE_INIT = 0x01;
                P1_STAGE_INPUTS = 0x02;
                P1_STAGE_OUTPUTS = 0x03;
                P1_STAGE_CONFIRM = 0x04;
                P1_STAGE_WITNESSES = 0x05;
                P2_UNUSED = 0x00;
                SIGN_TX_INPUT_TYPE_ATTESTED_UTXO = 0x01;

                _send = function _send(p1, p2, data) {
                  return _this6.send(CLA, INS.SIGN_TX, p1, p2, data).then(_utils2.default.stripRetcodeFromResponse);
                };

                signTx_init = function () {
                  var _ref11 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee10(numInputs, numOutputs) {
                    var data, response;
                    return _regenerator2.default.wrap(function _callee10$(_context10) {
                      while (1) {
                        switch (_context10.prev = _context10.next) {
                          case 0:
                            data = Buffer.concat([_utils2.default.uint32_to_buf(numInputs), _utils2.default.uint32_to_buf(numOutputs)]);
                            _context10.next = 3;
                            return wrapRetryStillInCall(_send)(P1_STAGE_INIT, P2_UNUSED, data);

                          case 3:
                            response = _context10.sent;

                            _utils.Assert.assert(response.length == 0);

                          case 5:
                          case "end":
                            return _context10.stop();
                        }
                      }
                    }, _callee10, _this6);
                  }));

                  return function signTx_init(_x11, _x12) {
                    return _ref11.apply(this, arguments);
                  };
                }();

                signTx_addInput = function () {
                  var _ref12 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee11(attestation) {
                    var data, response;
                    return _regenerator2.default.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            data = Buffer.concat([_utils2.default.uint8_to_buf(SIGN_TX_INPUT_TYPE_ATTESTED_UTXO), attestation.rawBuffer]);
                            _context11.next = 3;
                            return _send(P1_STAGE_INPUTS, P2_UNUSED, data);

                          case 3:
                            response = _context11.sent;

                            _utils.Assert.assert(response.length == 0);

                          case 5:
                          case "end":
                            return _context11.stop();
                        }
                      }
                    }, _callee11, _this6);
                  }));

                  return function signTx_addInput(_x13) {
                    return _ref12.apply(this, arguments);
                  };
                }();

                signTx_addAddressOutput = function () {
                  var _ref13 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee12(address58, amountStr) {
                    var data, response;
                    return _regenerator2.default.wrap(function _callee12$(_context12) {
                      while (1) {
                        switch (_context12.prev = _context12.next) {
                          case 0:
                            data = Buffer.concat([_utils2.default.amount_to_buf(amountStr), _utils2.default.uint8_to_buf(0x01), _utils2.default.base58_decode(address58)]);
                            _context12.next = 3;
                            return _send(P1_STAGE_OUTPUTS, P2_UNUSED, data);

                          case 3:
                            response = _context12.sent;

                            _utils.Assert.assert(response.length == 0);

                          case 5:
                          case "end":
                            return _context12.stop();
                        }
                      }
                    }, _callee12, _this6);
                  }));

                  return function signTx_addAddressOutput(_x14, _x15) {
                    return _ref13.apply(this, arguments);
                  };
                }();

                signTx_addChangeOutput = function () {
                  var _ref14 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee13(path, amountStr) {
                    var data, response;
                    return _regenerator2.default.wrap(function _callee13$(_context13) {
                      while (1) {
                        switch (_context13.prev = _context13.next) {
                          case 0:
                            data = Buffer.concat([_utils2.default.amount_to_buf(amountStr), _utils2.default.uint8_to_buf(0x02), _utils2.default.path_to_buf(path)]);
                            _context13.next = 3;
                            return _send(P1_STAGE_OUTPUTS, P2_UNUSED, data);

                          case 3:
                            response = _context13.sent;

                            _utils.Assert.assert(response.length == 0);

                          case 5:
                          case "end":
                            return _context13.stop();
                        }
                      }
                    }, _callee13, _this6);
                  }));

                  return function signTx_addChangeOutput(_x16, _x17) {
                    return _ref14.apply(this, arguments);
                  };
                }();

                signTx_awaitConfirm = function () {
                  var _ref15 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee14() {
                    var response;
                    return _regenerator2.default.wrap(function _callee14$(_context14) {
                      while (1) {
                        switch (_context14.prev = _context14.next) {
                          case 0:
                            _context14.next = 2;
                            return _send(P1_STAGE_CONFIRM, P2_UNUSED, _utils2.default.hex_to_buf(""));

                          case 2:
                            response = _context14.sent;
                            return _context14.abrupt("return", {
                              txHashHex: response.toString("hex")
                            });

                          case 4:
                          case "end":
                            return _context14.stop();
                        }
                      }
                    }, _callee14, _this6);
                  }));

                  return function signTx_awaitConfirm() {
                    return _ref15.apply(this, arguments);
                  };
                }();

                signTx_getWitness = function () {
                  var _ref16 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee15(path) {
                    var data, response;
                    return _regenerator2.default.wrap(function _callee15$(_context15) {
                      while (1) {
                        switch (_context15.prev = _context15.next) {
                          case 0:
                            data = Buffer.concat([_utils2.default.path_to_buf(path)]);
                            _context15.next = 3;
                            return _send(P1_STAGE_WITNESSES, P2_UNUSED, data);

                          case 3:
                            response = _context15.sent;
                            return _context15.abrupt("return", {
                              path: path,
                              witnessSignatureHex: _utils2.default.buf_to_hex(response)
                            });

                          case 5:
                          case "end":
                            return _context15.stop();
                        }
                      }
                    }, _callee15, _this6);
                  }));

                  return function signTx_getWitness(_x18) {
                    return _ref16.apply(this, arguments);
                  };
                }();

                //console.log("attest");


                attestedInputs = [];
                // attest

                _iteratorNormalCompletion = true;
                _didIteratorError = false;
                _iteratorError = undefined;
                _context16.prev = 18;
                _iterator = inputs[Symbol.iterator]();

              case 20:
                if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                  _context16.next = 30;
                  break;
                }

                _ref17 = _step.value;
                _txDataHex = _ref17.txDataHex, _outputIndex = _ref17.outputIndex;
                _context16.next = 25;
                return this._attestUtxo(_txDataHex, _outputIndex);

              case 25:
                attestation = _context16.sent;

                attestedInputs.push(attestation);

              case 27:
                _iteratorNormalCompletion = true;
                _context16.next = 20;
                break;

              case 30:
                _context16.next = 36;
                break;

              case 32:
                _context16.prev = 32;
                _context16.t0 = _context16["catch"](18);
                _didIteratorError = true;
                _iteratorError = _context16.t0;

              case 36:
                _context16.prev = 36;
                _context16.prev = 37;

                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }

              case 39:
                _context16.prev = 39;

                if (!_didIteratorError) {
                  _context16.next = 42;
                  break;
                }

                throw _iteratorError;

              case 42:
                return _context16.finish(39);

              case 43:
                return _context16.finish(36);

              case 44:
                _context16.next = 46;
                return signTx_init(attestedInputs.length, outputs.length);

              case 46:

                // inputs
                //console.log("inputs");
                _iteratorNormalCompletion2 = true;
                _didIteratorError2 = false;
                _iteratorError2 = undefined;
                _context16.prev = 49;
                _iterator2 = attestedInputs[Symbol.iterator]();

              case 51:
                if (_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done) {
                  _context16.next = 58;
                  break;
                }

                attestation = _step2.value;
                _context16.next = 55;
                return signTx_addInput(attestation);

              case 55:
                _iteratorNormalCompletion2 = true;
                _context16.next = 51;
                break;

              case 58:
                _context16.next = 64;
                break;

              case 60:
                _context16.prev = 60;
                _context16.t1 = _context16["catch"](49);
                _didIteratorError2 = true;
                _iteratorError2 = _context16.t1;

              case 64:
                _context16.prev = 64;
                _context16.prev = 65;

                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }

              case 67:
                _context16.prev = 67;

                if (!_didIteratorError2) {
                  _context16.next = 70;
                  break;
                }

                throw _iteratorError2;

              case 70:
                return _context16.finish(67);

              case 71:
                return _context16.finish(64);

              case 72:

                // outputs
                //console.log("outputs");
                _iteratorNormalCompletion3 = true;
                _didIteratorError3 = false;
                _iteratorError3 = undefined;
                _context16.prev = 75;
                _iterator3 = outputs[Symbol.iterator]();

              case 77:
                if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                  _context16.next = 93;
                  break;
                }

                output = _step3.value;

                if (!output.address58) {
                  _context16.next = 84;
                  break;
                }

                _context16.next = 82;
                return signTx_addAddressOutput(output.address58, output.amountStr);

              case 82:
                _context16.next = 90;
                break;

              case 84:
                if (!output.path) {
                  _context16.next = 89;
                  break;
                }

                _context16.next = 87;
                return signTx_addChangeOutput(output.path, output.amountStr);

              case 87:
                _context16.next = 90;
                break;

              case 89:
                throw new Error("TODO");

              case 90:
                _iteratorNormalCompletion3 = true;
                _context16.next = 77;
                break;

              case 93:
                _context16.next = 99;
                break;

              case 95:
                _context16.prev = 95;
                _context16.t2 = _context16["catch"](75);
                _didIteratorError3 = true;
                _iteratorError3 = _context16.t2;

              case 99:
                _context16.prev = 99;
                _context16.prev = 100;

                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }

              case 102:
                _context16.prev = 102;

                if (!_didIteratorError3) {
                  _context16.next = 105;
                  break;
                }

                throw _iteratorError3;

              case 105:
                return _context16.finish(102);

              case 106:
                return _context16.finish(99);

              case 107:
                _context16.next = 109;
                return signTx_awaitConfirm();

              case 109:
                _ref18 = _context16.sent;
                txHashHex = _ref18.txHashHex;


                //console.log("witnesses");
                witnesses = [];
                _iteratorNormalCompletion4 = true;
                _didIteratorError4 = false;
                _iteratorError4 = undefined;
                _context16.prev = 115;
                _iterator4 = inputs[Symbol.iterator]();

              case 117:
                if (_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done) {
                  _context16.next = 126;
                  break;
                }

                input = _step4.value;
                _context16.next = 121;
                return signTx_getWitness(input.path);

              case 121:
                witness = _context16.sent;

                witnesses.push(witness);

              case 123:
                _iteratorNormalCompletion4 = true;
                _context16.next = 117;
                break;

              case 126:
                _context16.next = 132;
                break;

              case 128:
                _context16.prev = 128;
                _context16.t3 = _context16["catch"](115);
                _didIteratorError4 = true;
                _iteratorError4 = _context16.t3;

              case 132:
                _context16.prev = 132;
                _context16.prev = 133;

                if (!_iteratorNormalCompletion4 && _iterator4.return) {
                  _iterator4.return();
                }

              case 135:
                _context16.prev = 135;

                if (!_didIteratorError4) {
                  _context16.next = 138;
                  break;
                }

                throw _iteratorError4;

              case 138:
                return _context16.finish(135);

              case 139:
                return _context16.finish(132);

              case 140:
                return _context16.abrupt("return", {
                  txHashHex: txHashHex,
                  witnesses: witnesses
                });

              case 141:
              case "end":
                return _context16.stop();
            }
          }
        }, _callee16, this, [[18, 32, 36, 44], [37,, 39, 43], [49, 60, 64, 72], [65,, 67, 71], [75, 95, 99, 107], [100,, 102, 106], [115, 128, 132, 140], [133,, 135, 139]]);
      }));

      function signTransaction(_x9, _x10) {
        return _ref10.apply(this, arguments);
      }

      return signTransaction;
    }()
  }]);
  return Ada;
}();

exports.default = Ada;
exports.utils = _utils2.default;
//# sourceMappingURL=Ada.js.map