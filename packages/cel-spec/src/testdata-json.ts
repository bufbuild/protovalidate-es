// Copyright 2024-2025 Buf Technologies, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Generated from github.com/google/cel-spec v0.18.0 by scripts/fetch-testdata.js
import type { JsonObject } from "@bufbuild/protobuf";

export const testdataJson: JsonObject[] = [
  {
    "name": "basic",
    "description": "Basic conformance tests that all implementations should pass.",
    "section": [
      {
        "name": "self_eval_zeroish",
        "description": "Simple self-evaluating forms to zero-ish values.",
        "test": [
          {
            "name": "self_eval_int_zero",
            "expr": "0",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "self_eval_uint_zero",
            "expr": "0u",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "self_eval_uint_alias_zero",
            "expr": "0U",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "self_eval_float_zero",
            "expr": "0.0",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "self_eval_float_zerowithexp",
            "expr": "0e+0",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "self_eval_string_empty",
            "expr": "''",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "self_eval_string_empty_quotes",
            "expr": "\"\"",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "self_eval_string_raw_prefix",
            "expr": "r\"\"",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "self_eval_bytes_empty",
            "expr": "b\"\"",
            "value": {
              "bytesValue": ""
            }
          },
          {
            "name": "self_eval_bool_false",
            "expr": "false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "self_eval_null",
            "expr": "null",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "self_eval_empty_list",
            "expr": "[]",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "self_eval_empty_map",
            "expr": "{}",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "self_eval_string_raw_prefix_triple_double",
            "expr": "r\"\"\"\"\"\"",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "self_eval_string_raw_prefix_triple_single",
            "expr": "r''''''",
            "value": {
              "stringValue": ""
            }
          }
        ]
      },
      {
        "name": "self_eval_nonzeroish",
        "description": "Simple self-evaluating forms to non-zero-ish values.",
        "test": [
          {
            "name": "self_eval_int_nonzero",
            "expr": "42",
            "value": {
              "int64Value": "42"
            }
          },
          {
            "name": "self_eval_uint_nonzero",
            "expr": "123456789u",
            "value": {
              "uint64Value": "123456789"
            }
          },
          {
            "name": "self_eval_uint_alias_nonzero",
            "expr": "123456789U",
            "value": {
              "uint64Value": "123456789"
            }
          },
          {
            "name": "self_eval_int_negative_min",
            "expr": "-9223372036854775808",
            "value": {
              "int64Value": "-9223372036854775808"
            }
          },
          {
            "name": "self_eval_float_negative_exp",
            "expr": "-2.3e+1",
            "value": {
              "doubleValue": -23
            }
          },
          {
            "name": "self_eval_string_excl",
            "expr": "\"!\"",
            "value": {
              "stringValue": "!"
            }
          },
          {
            "name": "self_eval_string_escape",
            "expr": "'\\''",
            "value": {
              "stringValue": "'"
            }
          },
          {
            "name": "self_eval_bytes_escape",
            "expr": "b'ÿ'",
            "value": {
              "bytesValue": "w78="
            }
          },
          {
            "name": "self_eval_bytes_invalid_utf8",
            "expr": "b'\\000\\xff'",
            "value": {
              "bytesValue": "AP8="
            }
          },
          {
            "name": "self_eval_list_singleitem",
            "expr": "[-1]",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "-1"
                  }
                ]
              }
            }
          },
          {
            "name": "self_eval_map_singleitem",
            "expr": "{\"k\":\"v\"}",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "k"
                    },
                    "value": {
                      "stringValue": "v"
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "self_eval_bool_true",
            "expr": "true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "self_eval_int_hex",
            "expr": "0x55555555",
            "value": {
              "int64Value": "1431655765"
            }
          },
          {
            "name": "self_eval_int_hex_negative",
            "expr": "-0x55555555",
            "value": {
              "int64Value": "-1431655765"
            }
          },
          {
            "name": "self_eval_uint_hex",
            "expr": "0x55555555u",
            "value": {
              "uint64Value": "1431655765"
            }
          },
          {
            "name": "self_eval_uint_alias_hex",
            "expr": "0x55555555U",
            "value": {
              "uint64Value": "1431655765"
            }
          },
          {
            "name": "self_eval_unicode_escape_four",
            "expr": "\"\\u270c\"",
            "value": {
              "stringValue": "✌"
            }
          },
          {
            "name": "self_eval_unicode_escape_eight",
            "expr": "\"\\U0001f431\"",
            "value": {
              "stringValue": "🐱"
            }
          },
          {
            "name": "self_eval_ascii_escape_seq",
            "expr": "\"\\a\\b\\f\\n\\r\\t\\v\\\"\\'\\\\\"",
            "value": {
              "stringValue": "\u0007\b\f\n\r\t\u000b\"'\\"
            }
          }
        ]
      },
      {
        "name": "variables",
        "description": "Variable lookups.",
        "test": [
          {
            "name": "self_eval_bound_lookup",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "INT64"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "int64Value": "123"
                }
              }
            },
            "value": {
              "int64Value": "123"
            }
          },
          {
            "name": "self_eval_unbound_lookup",
            "description": "An unbound variable should be marked as an error during execution. See google/cel-go#154",
            "expr": "x",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "undeclared reference to 'x' (in container '')"
                }
              ]
            }
          },
          {
            "name": "unbound_is_runtime_error",
            "description": "Make sure we can short-circuit around an unbound variable.",
            "expr": "x || true",
            "disableCheck": true,
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "functions",
        "description": "Basic mechanisms for function calls.",
        "test": [
          {
            "name": "binop",
            "expr": "1 + 1",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "unbound",
            "expr": "f_unknown(17)",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "unbound function"
                }
              ]
            }
          },
          {
            "name": "unbound_is_runtime_error",
            "expr": "f_unknown(17) || true",
            "disableCheck": true,
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "reserved_const",
        "description": "Named constants should never be shadowed by identifiers.",
        "test": [
          {
            "name": "false",
            "expr": "false",
            "typeEnv": [
              {
                "name": "false",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              }
            ],
            "bindings": {
              "false": {
                "value": {
                  "boolValue": true
                }
              }
            },
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "true",
            "expr": "true",
            "typeEnv": [
              {
                "name": "true",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              }
            ],
            "bindings": {
              "true": {
                "value": {
                  "boolValue": false
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "null",
            "expr": "null",
            "typeEnv": [
              {
                "name": "null",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              }
            ],
            "bindings": {
              "null": {
                "value": {
                  "boolValue": true
                }
              }
            },
            "value": {
              "nullValue": null
            }
          }
        ]
      }
    ]
  },
  {
    "name": "bindings_ext",
    "description": "Tests for the bindings extension library.",
    "section": [
      {
        "name": "bind",
        "test": [
          {
            "name": "boolean_literal",
            "expr": "cel.bind(t, true, t)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "string_concat",
            "expr": "cel.bind(msg, \"hello\", msg + msg + msg)",
            "value": {
              "stringValue": "hellohellohello"
            }
          },
          {
            "name": "bind_nested",
            "expr": "cel.bind(t1, true, cel.bind(t2, true, t1 && t2))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "macro_exists",
            "expr": "cel.bind(valid_elems, [1, 2, 3], [3, 4, 5].exists(e, e in valid_elems))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "macro_not_exists",
            "expr": "cel.bind(valid_elems, [1, 2, 3], ![4, 5].exists(e, e in valid_elems))",
            "value": {
              "boolValue": true
            }
          }
        ]
      }
    ]
  },
  {
    "name": "block_ext",
    "description": "Tests for cel.block.",
    "section": [
      {
        "name": "basic",
        "test": [
          {
            "name": "int_add",
            "expr": "cel.block([1, cel.index(0) + 1, cel.index(1) + 1, cel.index(2) + 1], cel.index(3))",
            "value": {
              "int64Value": "4"
            }
          },
          {
            "name": "size_1",
            "expr": "cel.block([[1, 2], size(cel.index(0)), cel.index(1) + cel.index(1), cel.index(2) + 1], cel.index(3))",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "size_2",
            "expr": "cel.block([[1, 2], size(cel.index(0)), 2 + cel.index(1), cel.index(2) + cel.index(1), cel.index(3) + 1], cel.index(4))",
            "value": {
              "int64Value": "7"
            }
          },
          {
            "name": "size_3",
            "expr": "cel.block([[0], size(cel.index(0)), [1, 2], size(cel.index(2)), cel.index(1) + cel.index(1), cel.index(4) + cel.index(3), cel.index(5) + cel.index(3)], cel.index(6))",
            "value": {
              "int64Value": "6"
            }
          },
          {
            "name": "size_4",
            "expr": "cel.block([[0], size(cel.index(0)), [1, 2], size(cel.index(2)), [1, 2, 3], size(cel.index(4)), 5 + cel.index(1), cel.index(6) + cel.index(1), cel.index(7) + cel.index(3), cel.index(8) + cel.index(3), cel.index(9) + cel.index(5), cel.index(10) + cel.index(5)], cel.index(11))",
            "value": {
              "int64Value": "17"
            }
          },
          {
            "name": "timestamp",
            "expr": "cel.block([timestamp(1000000000), int(cel.index(0)), timestamp(cel.index(1)), cel.index(2).getFullYear(), timestamp(50), int(cel.index(4)), timestamp(cel.index(5)), timestamp(200), int(cel.index(7)), timestamp(cel.index(8)), cel.index(9).getFullYear(), timestamp(75), int(cel.index(11)), timestamp(cel.index(12)), cel.index(13).getFullYear(), cel.index(3) + cel.index(14), cel.index(6).getFullYear(), cel.index(15) + cel.index(16), cel.index(17) + cel.index(3), cel.index(6).getSeconds(), cel.index(18) + cel.index(19), cel.index(20) + cel.index(10), cel.index(21) + cel.index(10), cel.index(13).getMinutes(), cel.index(22) + cel.index(23), cel.index(24) + cel.index(3)], cel.index(25))",
            "value": {
              "int64Value": "13934"
            }
          },
          {
            "name": "map_index",
            "expr": "cel.block([{\"a\": 2}, cel.index(0)[\"a\"], cel.index(1) * cel.index(1), cel.index(1) + cel.index(2)], cel.index(3))",
            "value": {
              "int64Value": "6"
            }
          },
          {
            "name": "nested_map_construction",
            "expr": "cel.block([{\"b\": 1}, {\"e\": cel.index(0)}], {\"a\": cel.index(0), \"c\": cel.index(0), \"d\": cel.index(1), \"e\": cel.index(1)})",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "a"
                    },
                    "value": {
                      "mapValue": {
                        "entries": [
                          {
                            "key": {
                              "stringValue": "b"
                            },
                            "value": {
                              "int64Value": "1"
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    "key": {
                      "stringValue": "c"
                    },
                    "value": {
                      "mapValue": {
                        "entries": [
                          {
                            "key": {
                              "stringValue": "b"
                            },
                            "value": {
                              "int64Value": "1"
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    "key": {
                      "stringValue": "d"
                    },
                    "value": {
                      "mapValue": {
                        "entries": [
                          {
                            "key": {
                              "stringValue": "e"
                            },
                            "value": {
                              "mapValue": {
                                "entries": [
                                  {
                                    "key": {
                                      "stringValue": "b"
                                    },
                                    "value": {
                                      "int64Value": "1"
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        ]
                      }
                    }
                  },
                  {
                    "key": {
                      "stringValue": "e"
                    },
                    "value": {
                      "mapValue": {
                        "entries": [
                          {
                            "key": {
                              "stringValue": "e"
                            },
                            "value": {
                              "mapValue": {
                                "entries": [
                                  {
                                    "key": {
                                      "stringValue": "b"
                                    },
                                    "value": {
                                      "int64Value": "1"
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "nested_list_construction",
            "expr": "cel.block([[1, 2, 3, 4], [1, 2], [cel.index(1), cel.index(0)]], [1, cel.index(0), 2, cel.index(0), 5, cel.index(0), 7, cel.index(2), cel.index(1)])",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "1"
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "1"
                        },
                        {
                          "int64Value": "2"
                        },
                        {
                          "int64Value": "3"
                        },
                        {
                          "int64Value": "4"
                        }
                      ]
                    }
                  },
                  {
                    "int64Value": "2"
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "1"
                        },
                        {
                          "int64Value": "2"
                        },
                        {
                          "int64Value": "3"
                        },
                        {
                          "int64Value": "4"
                        }
                      ]
                    }
                  },
                  {
                    "int64Value": "5"
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "1"
                        },
                        {
                          "int64Value": "2"
                        },
                        {
                          "int64Value": "3"
                        },
                        {
                          "int64Value": "4"
                        }
                      ]
                    }
                  },
                  {
                    "int64Value": "7"
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "listValue": {
                            "values": [
                              {
                                "int64Value": "1"
                              },
                              {
                                "int64Value": "2"
                              }
                            ]
                          }
                        },
                        {
                          "listValue": {
                            "values": [
                              {
                                "int64Value": "1"
                              },
                              {
                                "int64Value": "2"
                              },
                              {
                                "int64Value": "3"
                              },
                              {
                                "int64Value": "4"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "1"
                        },
                        {
                          "int64Value": "2"
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "select",
            "expr": "cel.block([msg.single_int64, cel.index(0) + cel.index(0)], cel.index(1))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "6"
            }
          },
          {
            "name": "select_nested_1",
            "expr": "cel.block([msg.oneof_type, cel.index(0).payload, cel.index(1).single_int64, cel.index(1).single_int32, cel.index(2) + cel.index(3), cel.index(4) + cel.index(2), msg.single_int64, cel.index(5) + cel.index(6), cel.index(1).oneof_type, cel.index(8).payload, cel.index(9).single_int64, cel.index(7) + cel.index(10)], cel.index(11))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "31"
            }
          },
          {
            "name": "select_nested_2",
            "expr": "cel.block([msg.oneof_type, cel.index(0).payload, cel.index(1).oneof_type, cel.index(2).payload, cel.index(3).oneof_type, cel.index(4).payload, cel.index(5).oneof_type, cel.index(6).payload, cel.index(7).single_bool, true || cel.index(8), cel.index(4).child, cel.index(10).child, cel.index(11).payload, cel.index(12).single_bool], cel.index(9) || cel.index(13))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "select_nested_message_map_index_1",
            "expr": "cel.block([msg.oneof_type, cel.index(0).payload, cel.index(1).map_int32_int64, cel.index(2)[1], cel.index(3) + cel.index(3), cel.index(4) + cel.index(3)], cel.index(5))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "15"
            }
          },
          {
            "name": "select_nested_message_map_index_2",
            "expr": "cel.block([msg.oneof_type, cel.index(0).payload, cel.index(1).map_int32_int64, cel.index(2)[0], cel.index(2)[1], cel.index(3) + cel.index(4), cel.index(2)[2], cel.index(5) + cel.index(6)], cel.index(7))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "8"
            }
          },
          {
            "name": "ternary",
            "expr": "cel.block([msg.single_int64, cel.index(0) > 0, cel.index(1) ? cel.index(0) : 0], cel.index(2))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "3"
            }
          },
          {
            "name": "nested_ternary",
            "expr": "cel.block([msg.single_int64, msg.single_int32, cel.index(0) > 0, cel.index(1) > 0, cel.index(0) + cel.index(1), cel.index(3) ? cel.index(4) : 0, cel.index(2) ? cel.index(5) : 0], cel.index(6))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "8"
            }
          },
          {
            "name": "multiple_macros_1",
            "expr": "cel.block([[1].exists(cel.iterVar(0, 0), cel.iterVar(0, 0) > 0), size([cel.index(0)]), [2].exists(cel.iterVar(0, 0), cel.iterVar(0, 0) > 1), size([cel.index(2)])], cel.index(1) + cel.index(1) + cel.index(3) + cel.index(3))",
            "value": {
              "int64Value": "4"
            }
          },
          {
            "name": "multiple_macros_2",
            "expr": "cel.block([[1].exists(cel.iterVar(0, 0), cel.iterVar(0, 0) > 0), [cel.index(0)], ['a'].exists(cel.iterVar(0, 1), cel.iterVar(0, 1) == 'a'), [cel.index(2)]], cel.index(1) + cel.index(1) + cel.index(3) + cel.index(3))",
            "value": {
              "listValue": {
                "values": [
                  {
                    "boolValue": true
                  },
                  {
                    "boolValue": true
                  },
                  {
                    "boolValue": true
                  },
                  {
                    "boolValue": true
                  }
                ]
              }
            }
          },
          {
            "name": "multiple_macros_3",
            "expr": "cel.block([[1].exists(cel.iterVar(0, 0), cel.iterVar(0, 0) > 0)], cel.index(0) && cel.index(0) && [1].exists(cel.iterVar(0, 0), cel.iterVar(0, 0) > 1) && [2].exists(cel.iterVar(0, 0), cel.iterVar(0, 0) > 1))",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "nested_macros_1",
            "expr": "cel.block([[1, 2, 3]], cel.index(0).map(cel.iterVar(0, 0), cel.index(0).map(cel.iterVar(1, 0), cel.iterVar(1, 0) + 1)))",
            "value": {
              "listValue": {
                "values": [
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "2"
                        },
                        {
                          "int64Value": "3"
                        },
                        {
                          "int64Value": "4"
                        }
                      ]
                    }
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "2"
                        },
                        {
                          "int64Value": "3"
                        },
                        {
                          "int64Value": "4"
                        }
                      ]
                    }
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "2"
                        },
                        {
                          "int64Value": "3"
                        },
                        {
                          "int64Value": "4"
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "nested_macros_2",
            "expr": "[1, 2].map(cel.iterVar(0, 0), [1, 2, 3].filter(cel.iterVar(1, 0), cel.iterVar(1, 0) == cel.iterVar(0, 0)))",
            "value": {
              "listValue": {
                "values": [
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "1"
                        }
                      ]
                    }
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "int64Value": "2"
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "adjacent_macros",
            "expr": "cel.block([[1, 2, 3], cel.index(0).map(cel.iterVar(0, 0), cel.index(0).map(cel.iterVar(1, 0), cel.iterVar(1, 0) + 1))], cel.index(1) == cel.index(1))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "macro_shadowed_variable_1",
            "expr": "cel.block([x - 1, cel.index(0) > 3], [cel.index(1) ? cel.index(0) : 5].exists(cel.iterVar(0, 0), cel.iterVar(0, 0) - 1 > 3) || cel.index(1))",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "INT64"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "int64Value": "5"
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "macro_shadowed_variable_2",
            "expr": "['foo', 'bar'].map(cel.iterVar(1, 0), [cel.iterVar(1, 0) + cel.iterVar(1, 0), cel.iterVar(1, 0) + cel.iterVar(1, 0)]).map(cel.iterVar(0, 0), [cel.iterVar(0, 0) + cel.iterVar(0, 0), cel.iterVar(0, 0) + cel.iterVar(0, 0)])",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "INT64"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "int64Value": "5"
                }
              }
            },
            "value": {
              "listValue": {
                "values": [
                  {
                    "listValue": {
                      "values": [
                        {
                          "listValue": {
                            "values": [
                              {
                                "stringValue": "foofoo"
                              },
                              {
                                "stringValue": "foofoo"
                              },
                              {
                                "stringValue": "foofoo"
                              },
                              {
                                "stringValue": "foofoo"
                              }
                            ]
                          }
                        },
                        {
                          "listValue": {
                            "values": [
                              {
                                "stringValue": "foofoo"
                              },
                              {
                                "stringValue": "foofoo"
                              },
                              {
                                "stringValue": "foofoo"
                              },
                              {
                                "stringValue": "foofoo"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "listValue": {
                            "values": [
                              {
                                "stringValue": "barbar"
                              },
                              {
                                "stringValue": "barbar"
                              },
                              {
                                "stringValue": "barbar"
                              },
                              {
                                "stringValue": "barbar"
                              }
                            ]
                          }
                        },
                        {
                          "listValue": {
                            "values": [
                              {
                                "stringValue": "barbar"
                              },
                              {
                                "stringValue": "barbar"
                              },
                              {
                                "stringValue": "barbar"
                              },
                              {
                                "stringValue": "barbar"
                              }
                            ]
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "inclusion_list",
            "expr": "cel.block([[1, 2, 3], 1 in cel.index(0), 2 in cel.index(0), cel.index(1) && cel.index(2), [3, cel.index(0)], 3 in cel.index(4), cel.index(5) && cel.index(1)], cel.index(3) && cel.index(6))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "inclusion_map",
            "expr": "cel.block([{true: false}, {\"a\": 1, 2: cel.index(0), 3: cel.index(0)}], 2 in cel.index(1))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "presence_test",
            "expr": "cel.block([{\"a\": true}, has(cel.index(0).a), cel.index(0)[\"a\"]], cel.index(1) && cel.index(2))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "presence_test_2",
            "expr": "cel.block([{\"a\": true}, has(cel.index(0).a)], cel.index(1) && cel.index(1))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "presence_test_with_ternary",
            "expr": "cel.block([msg.oneof_type, has(cel.index(0).payload), cel.index(0).payload, cel.index(2).single_int64, cel.index(1) ? cel.index(3) : 0], cel.index(4))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "10"
            }
          },
          {
            "name": "presence_test_with_ternary_2",
            "expr": "cel.block([msg.oneof_type, cel.index(0).payload, cel.index(1).single_int64, has(cel.index(0).payload), cel.index(2) * 0, cel.index(3) ? cel.index(2) : cel.index(4)], cel.index(5))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "10"
            }
          },
          {
            "name": "presence_test_with_ternary_3",
            "expr": "cel.block([msg.oneof_type, cel.index(0).payload, cel.index(1).single_int64, has(cel.index(1).single_int64), cel.index(2) * 0, cel.index(3) ? cel.index(2) : cel.index(4)], cel.index(5))",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "int64Value": "10"
            }
          },
          {
            "name": "presence_test_with_ternary_nested",
            "expr": "cel.block([msg.oneof_type, cel.index(0).payload, cel.index(1).map_string_string, has(msg.oneof_type), has(cel.index(0).payload), cel.index(3) && cel.index(4), has(cel.index(1).single_int64), cel.index(5) && cel.index(6), has(cel.index(1).map_string_string), has(cel.index(2).key), cel.index(8) && cel.index(9), cel.index(2).key, cel.index(11) == \"A\", cel.index(10) ? cel.index(12) : false], cel.index(7) ? cel.index(13) : false)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 5,
                    "singleInt64": "3",
                    "oneofType": {
                      "payload": {
                        "singleInt32": 8,
                        "singleInt64": "10",
                        "mapInt32Int64": {
                          "0": "1",
                          "1": "5",
                          "2": "2"
                        },
                        "mapStringString": {
                          "key": "A"
                        }
                      }
                    }
                  }
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_list",
            "expr": "cel.block([optional.none(), [?cel.index(0), ?optional.of(opt_x)], [5], [10, ?cel.index(0), cel.index(1), cel.index(1)], [10, cel.index(2), cel.index(2)]], cel.index(3) == cel.index(4))",
            "typeEnv": [
              {
                "name": "opt_x",
                "ident": {
                  "type": {
                    "primitive": "INT64"
                  }
                }
              }
            ],
            "bindings": {
              "opt_x": {
                "value": {
                  "int64Value": "5"
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_map",
            "expr": "cel.block([optional.of(\"hello\"), {?\"hello\": cel.index(0)}, cel.index(1)[\"hello\"], cel.index(2) + cel.index(2)], cel.index(3) == \"hellohello\")",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_map_chained",
            "expr": "cel.block([{\"key\": \"test\"}, optional.of(\"test\"), {?\"key\": cel.index(1)}, cel.index(2)[?\"bogus\"], cel.index(0)[?\"bogus\"], cel.index(3).or(cel.index(4)), cel.index(0)[\"key\"], cel.index(5).orValue(cel.index(6))], cel.index(7))",
            "value": {
              "stringValue": "test"
            }
          },
          {
            "name": "optional_message",
            "expr": "cel.block([optional.ofNonZeroValue(1), optional.of(4), TestAllTypes{?single_int64: cel.index(0), ?single_int32: cel.index(1)}, cel.index(2).single_int32, cel.index(2).single_int64, cel.index(3) + cel.index(4)], cel.index(5))",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "call",
            "expr": "cel.block([\"h\" + \"e\", cel.index(0) + \"l\", cel.index(1) + \"l\", cel.index(2) + \"o\", cel.index(3) + \" world\"], cel.index(4).matches(cel.index(3)))",
            "value": {
              "boolValue": true
            }
          }
        ]
      }
    ]
  },
  {
    "name": "comparisons",
    "description": "Tests for boolean-valued functions and operators.",
    "section": [
      {
        "name": "eq_literal",
        "description": "Literals comparison on _==_",
        "test": [
          {
            "name": "eq_int",
            "expr": "1 == 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_int",
            "expr": "-1 == 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_int_uint",
            "expr": "dyn(1) == 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_int_uint",
            "expr": "dyn(2) == 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_int_double",
            "expr": "dyn(1) == 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_int_double",
            "expr": "dyn(2) == 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_uint",
            "expr": "2u == 2u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_uint",
            "expr": "1u == 2u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_uint_int",
            "expr": "dyn(1u) == 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_uint_int",
            "expr": "dyn(2u) == 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_uint_double",
            "expr": "dyn(1u) == 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_uint_double",
            "expr": "dyn(2u) == 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_double",
            "expr": "1.0 == 1.0e+0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_double",
            "expr": "-1.0 == 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_double_nan",
            "expr": "0.0/0.0 == 0.0/0.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_int_double_nan",
            "expr": "dyn(1) == 0.0/0.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_uint_double_nan",
            "expr": "dyn(1u) == 0.0/0.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_double_int",
            "expr": "dyn(1.0) == 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_double_int",
            "expr": "dyn(2.0) == 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_double_uint",
            "expr": "dyn(1.0) == 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_double_uint",
            "expr": "dyn(2.0) == 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_string",
            "expr": "'' == \"\"",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_string",
            "expr": "'a' == 'b'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_raw_string",
            "expr": "'abc' == r'abc'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_string_case",
            "expr": "'abc' == 'ABC'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_string_unicode",
            "expr": "'ίσος' == 'ίσος'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_string_unicode_ascii",
            "expr": "'a' == 'à'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "no_string_normalization",
            "description": "Should not normalize Unicode.",
            "expr": "'Am\\u00E9lie' == 'Ame\\u0301lie'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "no_string_normalization_surrogate",
            "description": "Should not replace surrogate pairs.",
            "expr": "'\\U0001F436' == '\\xef\\xbf\\xbd\\xef\\xbf\\bd'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_null",
            "expr": "null == null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bool",
            "expr": "true == true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_bool",
            "expr": "false == true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_bytes",
            "description": "Test bytes literal equality with encoding",
            "expr": "b'ÿ' == b'\\303\\277'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_bytes",
            "expr": "b'abc' == b'abcd'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_list_empty",
            "expr": "[] == []",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_list_null",
            "expr": "[null] == [null]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_list_null",
            "expr": "['1', '2', null] == ['1', '2', '3']",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_list_numbers",
            "expr": "[1, 2, 3] == [1, 2, 3]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_list_mixed_type_numbers",
            "expr": "[1.0, 2.0, 3] == [1u, 2, 3u]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_list_mixed_type_numbers",
            "expr": "[1.0, 2.1] == [1u, 2]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_list_order",
            "expr": "[1, 2, 3] == [1, 3, 2]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_list_string_case",
            "expr": "['case'] == ['cAse']",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_list_length",
            "expr": "['one'] == [2, 3]",
            "disableCheck": true,
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_list_false_vs_types",
            "expr": "[1, 'dos', 3] == [1, 2, 4]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_map_empty",
            "expr": "{} == {}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_map_null",
            "expr": "{'k': null} == {'k': null}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_map_null",
            "expr": "{'k': 1, 'j': 2} == {'k': 1, 'j': null}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_map_onekey",
            "expr": "{'k':'v'} == {\"k\":\"v\"}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_map_double_value",
            "expr": "{'k':1.0} == {'k':1e+0}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_map_mixed_type_numbers",
            "expr": "{1: 1.0, 2u: 3u} == {1u: 1, 2: 3.0}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_map_value",
            "expr": "{'k':'v'} == {'k':'v1'}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_map_extra_key",
            "expr": "{'k':'v','k1':'v1'} == {'k':'v'}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_map_key_order",
            "expr": "{'k1':'v1','k2':'v2'} == {'k2':'v2','k1':'v1'}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_map_key_casing",
            "expr": "{'key':'value'} == {'Key':'value'}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_map_false_vs_types",
            "expr": "{'k1': 1, 'k2': 'dos', 'k3': 3} == {'k1': 1, 'k2': 2, 'k3': 4}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_mixed_types",
            "expr": "1.0 == 1",
            "disableCheck": true,
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_list_elem_mixed_types",
            "expr": "[1] == [1.0]",
            "disableCheck": true,
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_map_value_mixed_types",
            "expr": "{'k':'v', 1:1} == {'k':'v', 1:'v1'}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_dyn_json_null",
            "expr": "dyn(google.protobuf.Value{}) == null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_dyn_bool_null",
            "expr": "dyn(false) == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_bytes_null",
            "expr": "dyn(b'') == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_double_null",
            "expr": "dyn(2.1) == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_duration_null",
            "expr": "dyn(duration('0s')) == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_int_null",
            "expr": "dyn(1) == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_list_null",
            "expr": "dyn([]) == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_map_null",
            "expr": "dyn({}) == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_proto2_msg_null",
            "expr": "dyn(TestAllTypes{}) == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_proto3_msg_null",
            "expr": "dyn(TestAllTypes{}) == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_string_null",
            "expr": "dyn('') == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_timestamp_null",
            "expr": "dyn(timestamp(0)) == null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_list_elem_null",
            "expr": "[1, 2, null] == [1, null, 3]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_map_value_null",
            "expr": "{1:'hello', 2:'world'} == {1:'goodbye', 2:null}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_dyn_int_uint",
            "expr": "dyn(1) == 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_dyn_int_double",
            "expr": "dyn(1) == 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_dyn_uint_int",
            "expr": "dyn(1u) == 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_dyn_uint_double",
            "expr": "dyn(1u) == 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_dyn_double_int",
            "expr": "dyn(1.0) == 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_dyn_double_uint",
            "expr": "dyn(1.0) == 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_eq_dyn_int_uint",
            "expr": "dyn(1) == 2u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_int_double",
            "expr": "dyn(1) == 2.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_uint_int",
            "expr": "dyn(1u) == 2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_uint_double",
            "expr": "dyn(1u) == 120",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_double_int",
            "expr": "dyn(1.0) == 2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_eq_dyn_double_uint",
            "expr": "dyn(1.0) == 2u",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "eq_wrapper",
        "description": "Wrapper type comparison on _==_. Wrapper types treated as boxed primitives when they appear on message fields. An unset wrapper field should be treated as null. The tests show the distinction between unset, empty, and set equality behavior.",
        "test": [
          {
            "name": "eq_bool",
            "expr": "google.protobuf.BoolValue{value: true} == true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bool_empty",
            "expr": "google.protobuf.BoolValue{} == false",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bool_not_null",
            "expr": "google.protobuf.BoolValue{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bool_proto2_null",
            "expr": "TestAllTypes{}.single_bool_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bool_proto3_null",
            "expr": "TestAllTypes{}.single_bool_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bytes",
            "expr": "google.protobuf.BytesValue{value: b'set'} == b'set'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bytes_empty",
            "expr": "google.protobuf.BytesValue{} == b''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bytes_not_null",
            "expr": "google.protobuf.BytesValue{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bytes_proto2_null",
            "expr": "TestAllTypes{}.single_bytes_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_bytes_proto3_null",
            "expr": "TestAllTypes{}.single_bytes_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_double",
            "expr": "google.protobuf.DoubleValue{value: -1.175494e-40} == -1.175494e-40",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_double_empty",
            "expr": "google.protobuf.DoubleValue{} == 0.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_double_not_null",
            "expr": "google.protobuf.DoubleValue{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_double_proto2_null",
            "expr": "TestAllTypes{}.single_double_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_double_proto3_null",
            "expr": "TestAllTypes{}.single_double_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_float",
            "expr": "google.protobuf.FloatValue{value: -1.5} == -1.5",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_float_empty",
            "expr": "google.protobuf.FloatValue{} == 0.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_float_not_null",
            "expr": "google.protobuf.FloatValue{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_float_proto2_null",
            "expr": "TestAllTypes{}.single_float_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_float_proto3_null",
            "expr": "TestAllTypes{}.single_float_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int32",
            "expr": "google.protobuf.Int32Value{value: 123} == 123",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int32_empty",
            "expr": "google.protobuf.Int32Value{} == 0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int32_not_null",
            "expr": "google.protobuf.Int32Value{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int32_proto2_null",
            "expr": "TestAllTypes{}.single_int32_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int32_proto3_null",
            "expr": "TestAllTypes{}.single_int32_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int64",
            "expr": "google.protobuf.Int64Value{value: 2147483650} == 2147483650",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int64_empty",
            "expr": "google.protobuf.Int64Value{} == 0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int64_not_null",
            "expr": "google.protobuf.Int64Value{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int64_proto2_null",
            "expr": "TestAllTypes{}.single_int64_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_int64_proto3_null",
            "expr": "TestAllTypes{}.single_int64_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_string",
            "expr": "google.protobuf.StringValue{value: 'set'} == 'set'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_string_empty",
            "expr": "google.protobuf.StringValue{} == ''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_string_not_null",
            "expr": "google.protobuf.StringValue{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_string_proto2_null",
            "expr": "TestAllTypes{}.single_string_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_string_proto3_null",
            "expr": "TestAllTypes{}.single_string_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint32",
            "expr": "google.protobuf.UInt32Value{value: 42u} == 42u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint32_empty",
            "expr": "google.protobuf.UInt32Value{} == 0u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint32_not_null",
            "expr": "google.protobuf.UInt32Value{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint32_proto2_null",
            "expr": "TestAllTypes{}.single_uint32_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint32_proto3_null",
            "expr": "TestAllTypes{}.single_uint32_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint64",
            "expr": "google.protobuf.UInt64Value{value: 4294967296u} == 4294967296u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint64_empty",
            "expr": "google.protobuf.UInt64Value{} == 0u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint64_not_null",
            "expr": "google.protobuf.UInt64Value{} != null",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint64_proto2_null",
            "expr": "TestAllTypes{}.single_uint64_wrapper == null",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_uint64_proto3_null",
            "expr": "TestAllTypes{}.single_uint64_wrapper == null",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_proto2",
            "expr": "TestAllTypes{single_int64: 1234, single_string: '1234'} == TestAllTypes{single_int64: 1234, single_string: '1234'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_proto3",
            "expr": "TestAllTypes{single_int64: 1234, single_string: '1234'} == TestAllTypes{single_int64: 1234, single_string: '1234'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_proto2_missing_fields_neq",
            "expr": "TestAllTypes{single_int64: 1234} == TestAllTypes{single_string: '1234'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto3_missing_fields_neq",
            "expr": "TestAllTypes{single_int64: 1234} == TestAllTypes{single_string: '1234'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto_nan_equal",
            "description": "For proto equality, fields with NaN value are treated as not equal.",
            "expr": "TestAllTypes{single_double: double('NaN')} == TestAllTypes{single_double: double('NaN')}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto_different_types",
            "description": "At runtime, differently typed messages are treated as not equal.",
            "expr": "dyn(TestAllTypes{}) == dyn(NestedTestAllTypes{})",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto2_any_unpack_equal",
            "description": "Any values should be unpacked and compared.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_proto2_any_unpack_not_equal",
            "description": "Any values should be unpacked and compared.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'a\\000\\000\\000\\000\\000H\\223\\300r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto2_any_unpack_bytewise_fallback_not_equal",
            "description": "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto2_any_unpack_bytewise_fallback_equal",
            "description": "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_proto3_any_unpack_equal",
            "description": "Any values should be unpacked and compared.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_proto3_any_unpack_not_equal",
            "description": "Any values should be unpacked and compared.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'a\\000\\000\\000\\000\\000H\\223\\300r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto3_any_unpack_bytewise_fallback_not_equal",
            "description": "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "eq_proto3_any_unpack_bytewise_fallback_equal",
            "description": "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} == TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "ne_literal",
        "description": "Literals comparison on _!=_",
        "test": [
          {
            "name": "ne_int",
            "expr": "24 != 42",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_int",
            "expr": "1 != 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_int_double",
            "expr": "dyn(24) != 24.1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_int_double",
            "expr": "dyn(1) != 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_int_uint",
            "expr": "dyn(24) != 42u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_int_uint",
            "expr": "dyn(1) != 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_uint",
            "expr": "1u != 2u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_uint",
            "expr": "99u != 99u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_uint_double",
            "expr": "dyn(1u) != 2.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_uint_double",
            "expr": "dyn(99u) != 99.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_double",
            "expr": "9.0e+3 != 9001.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_double_nan",
            "expr": "0.0/0.0 != 0.0/0.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_int_double_nan",
            "expr": "dyn(1) != 0.0/0.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_uint_double_nan",
            "expr": "dyn(1u) != 0.0/0.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_double",
            "expr": "1.0 != 1e+0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_double_int",
            "expr": "dyn(9000) != 9001.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_double_int",
            "expr": "dyn(1) != 1e+0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_double_uint",
            "expr": "dyn(9000u) != 9001.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_double_uint",
            "expr": "dyn(1u) != 1e+0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_double_nan",
            "expr": "0.0/0.0 != 0.0/0.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ne_string",
            "expr": "'abc' != ''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_string",
            "expr": "'abc' != 'abc'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_string_unicode",
            "expr": "'résumé' != 'resume'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_string_unicode",
            "expr": "'ίδιο' != 'ίδιο'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_bytes",
            "expr": "b'\\x00\\xFF' != b'ÿ'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_bytes",
            "expr": "b'\\303\\277' != b'ÿ'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_bool",
            "expr": "false != true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_bool",
            "expr": "true != true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_ne_null",
            "description": "null can only be equal to null, or else it won't match",
            "expr": "null != null",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_list_empty",
            "expr": "[] != [1]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_list_empty",
            "expr": "[] != []",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_list_bool",
            "expr": "[true, false, true] != [true, true, false]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_list_bool",
            "expr": "[false, true] != [false, true]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_ne_list_of_list",
            "expr": "[[]] != [[]]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_map_by_value",
            "expr": "{'k':'v'} != {'k':'v1'}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ne_map_by_key",
            "expr": "{'k':true} != {'k1':true}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_ne_map_int_to_float",
            "expr": "{1:1.0} != {1:1.0}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_ne_map_key_order",
            "expr": "{'a':'b','c':'d'} != {'c':'d','a':'b'}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_mixed_types",
            "expr": "2u != 2",
            "disableCheck": true,
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_proto2",
            "expr": "TestAllTypes{single_int64: 1234, single_string: '1234'} != TestAllTypes{single_int64: 1234, single_string: '1234'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_proto3",
            "expr": "TestAllTypes{single_int64: 1234, single_string: '1234'} != TestAllTypes{single_int64: 1234, single_string: '1234'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_proto2_missing_fields_neq",
            "expr": "TestAllTypes{single_int64: 1234} != TestAllTypes{single_string: '1234'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ne_proto3_missing_fields_neq",
            "expr": "TestAllTypes{single_int64: 1234} != TestAllTypes{single_string: '1234'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ne_proto_nan_not_equal",
            "description": "For proto equality, NaN field values are not considered equal.",
            "expr": "TestAllTypes{single_double: double('NaN')} != TestAllTypes{single_double: double('NaN')}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ne_proto_different_types",
            "description": "At runtime, comparing differently typed messages is false.",
            "expr": "dyn(TestAllTypes{}) != dyn(NestedTestAllTypes{})",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ne_proto2_any_unpack",
            "description": "Any values should be unpacked and compared.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_proto2_any_unpack_bytewise_fallback",
            "description": "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ne_proto3_any_unpack",
            "description": "Any values should be unpacked and compared.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "ne_proto3_any_unpack_bytewise_fallback",
            "description": "If an any field is missing its type_url, the comparison should fallback to a bytewise comparison of the serialized proto.",
            "expr": "TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001r\\0041234'}} != TestAllTypes{single_any: google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\242\\006\\023\\022\\021r\\0041234\\020\\256\\366\\377\\377\\377\\377\\377\\377\\377\\001'}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "lt_literal",
        "description": "Literals comparison on _<_. (a < b) == (b > a) == !(a >= b) == !(b <= a)",
        "test": [
          {
            "name": "lt_int",
            "expr": "-1 < 0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_int",
            "expr": "0 < 0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_uint",
            "expr": "0u < 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_uint",
            "expr": "2u < 2u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_double",
            "expr": "1.0 < 1.0000001",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_double",
            "description": "Following IEEE 754, negative zero compares equal to zero",
            "expr": "-0.0 < 0.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_string",
            "expr": "'a' < 'b'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_string_empty_to_nonempty",
            "expr": "'' < 'a'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_string_case",
            "expr": "'Abc' < 'aBC'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_string_length",
            "expr": "'abc' < 'abcd'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_string_diacritical_mark_sensitive",
            "description": "Verifies that the we're not using a string comparison function that strips diacritical marks (á)",
            "expr": "'a' < '\\u00E1'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_string_empty",
            "expr": "'' < ''",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_string_same",
            "expr": "'abc' < 'abc'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_string_case_length",
            "expr": "'a' < 'AB'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "unicode_order_lexical",
            "description": "Compare the actual code points of the string, instead of decomposing ế into 'e' plus accent modifiers.",
            "expr": "'f' < '\\u1EBF'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_bytes",
            "expr": "b'a' < b'b'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_bytes_same",
            "expr": "b'abc' < b'abc'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_bytes_width",
            "expr": "b'á' < b'b'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_bool_false_first",
            "expr": "false < true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_bool_same",
            "expr": "true < true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_bool_true_first",
            "expr": "true < false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_list_unsupported",
            "expr": "[0] < [1]",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lt_map_unsupported",
            "expr": "{0:'a'} < {1:'b'}",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lt_null_unsupported",
            "description": "Ensure _<_ doesn't have a binding for null",
            "expr": "null < null",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lt_mixed_types_error",
            "expr": "'foo' < 1024",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lt_dyn_int_uint",
            "expr": "dyn(1) < 2u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_dyn_int_double",
            "expr": "dyn(1) < 2.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_dyn_uint_int",
            "expr": "dyn(1u) < 2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_dyn_uint_double",
            "expr": "dyn(1u) < 2.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_dyn_double_int",
            "expr": "dyn(1.0) < 2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_dyn_double_uint",
            "expr": "dyn(1.0) < 2u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_dyn_int_uint",
            "expr": "dyn(1) < 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_int_double",
            "expr": "dyn(1) < 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_uint_int",
            "expr": "dyn(1u) < 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_uint_double",
            "expr": "dyn(1u) < 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_double_int",
            "expr": "dyn(1.0) < 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_double_uint",
            "expr": "dyn(1.0) < 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_dyn_int_big_uint",
            "expr": "dyn(1) < 9223372036854775808u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lt_dyn_small_int_uint",
            "expr": "dyn(-1) < 0u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_dyn_int_big_lossy_double",
            "expr": "dyn(9223372036854775807) < 9223372036854775808.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_dyn_int_big_lossy_double",
            "expr": "dyn(9223372036854775807) < 9223372036854777857.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_dyn_int_small_double",
            "expr": "dyn(9223372036854775807) < -9223372036854777857.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_int_small_lossy_double",
            "expr": "dyn(-9223372036854775808) < -9223372036854775809.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_uint_small_int",
            "expr": "dyn(1u) < -9223372036854775808",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_big_uint_int",
            "expr": "dyn(9223372036854775808u) < 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_uint_small_double",
            "expr": "dyn(18446744073709551615u) < -1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lt_dyn_uint_big_double",
            "expr": "dyn(18446744073709551615u) < 18446744073709590000.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lt_dyn_big_double_uint",
            "expr": "dyn(18446744073709553665.0) < 18446744073709551615u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_big_double_int",
            "expr": "dyn(9223372036854775808.0) < 9223372036854775807",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lt_dyn_small_double_int",
            "expr": "dyn(-9223372036854775809.0) < -9223372036854775808",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "gt_literal",
        "description": "Literals comparison on _>_",
        "test": [
          {
            "name": "gt_int",
            "expr": "42 > -42",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_int",
            "expr": "0 > 0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_uint",
            "expr": "48u > 46u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_uint",
            "expr": "0u > 999u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_double",
            "expr": "1e+1 > 1e+0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_double",
            "expr": ".99 > 9.9e-1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_string_case",
            "expr": "'abc' > 'aBc'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_string_to_empty",
            "expr": "'A' > ''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_string_empty_to_empty",
            "expr": "'' > ''",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_string_unicode",
            "expr": "'α' > 'omega'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_bytes_one",
            "expr": "b'\u0001' > b'\u0000'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_bytes_one_to_empty",
            "expr": "b'\u0000' > b''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_bytes_sorting",
            "expr": "b'\u0000\u0001' > b'\u0001'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_bool_true_false",
            "expr": "true > false",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_bool_false_true",
            "expr": "false > true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_bool_same",
            "expr": "true > true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_null_unsupported",
            "expr": "null > null",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gt_list_unsupported",
            "expr": "[1] > [0]",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gt_map_unsupported",
            "expr": "{1:'b'} > {0:'a'}",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gt_mixed_types_error",
            "expr": "'foo' > 1024",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gt_dyn_int_uint",
            "expr": "dyn(2) > 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_int_double",
            "expr": "dyn(2) > 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_uint_int",
            "expr": "dyn(2u) > 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_uint_double",
            "expr": "dyn(2u) > 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_double_int",
            "expr": "dyn(2.0) > 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_double_uint",
            "expr": "dyn(2.0) > 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_dyn_int_uint",
            "expr": "dyn(1) > 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_int_double",
            "expr": "dyn(1) > 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_uint_int",
            "expr": "dyn(1u) > 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_uint_double",
            "expr": "dyn(1u) > 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_double_int",
            "expr": "dyn(1.0) > 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_double_uint",
            "expr": "dyn(1.0) > 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_int_big_uint",
            "expr": "dyn(1) > 9223372036854775808u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_small_int_uint",
            "expr": "dyn(-1) > 0u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_int_big_double",
            "expr": "dyn(9223372036854775807) > 9223372036854775808.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_int_small_lossy_double",
            "description": "The conversion of the int to double is lossy and the numbers end up being equal",
            "expr": "dyn(-9223372036854775808) > -9223372036854775809.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_dyn_int_small_lossy_double_greater",
            "expr": "dyn(-9223372036854775808) > -9223372036854777857.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_uint_small_int",
            "expr": "dyn(1u) > -1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_big_uint_int",
            "expr": "dyn(9223372036854775808u) > 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gt_dyn_uint_small_double",
            "expr": "dyn(9223372036854775807u) > -1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_dyn_uint_big_double",
            "expr": "dyn(18446744073709551615u) > 18446744073709590000.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gt_dyn_big_double_uint",
            "expr": "dyn(18446744073709553665.0) > 18446744073709551615u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gt_dyn_big_double_int",
            "expr": "dyn(9223372036854775808.0) > 9223372036854775807",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gt_dyn_small_double_int",
            "expr": "dyn(-9223372036854775809.0) > -9223372036854775808",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "lte_literal",
        "description": "Literals comparison on _<=_",
        "test": [
          {
            "name": "lte_int_lt",
            "expr": "0 <= 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_int_eq",
            "expr": "1 <= 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_int_gt",
            "expr": "1 <= -1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_uint_lt",
            "expr": "0u <= 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_uint_eq",
            "expr": "1u <= 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_uint_gt",
            "expr": "1u <= 0u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_double_lt",
            "expr": "0.0 <= 0.1e-31",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_double_eq",
            "expr": "0.0 <= 0e-1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_double_gt",
            "expr": "1.0 <= 0.99",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_string_empty",
            "expr": "'' <= ''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_string_from_empty",
            "expr": "'' <= 'a'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_string_to_empty",
            "expr": "'a' <= ''",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_string_lexicographical",
            "expr": "'aBc' <= 'abc'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_string_unicode_eq",
            "expr": "'α' <= 'α'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_string_unicode_lt",
            "expr": "'a' <= 'α'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_string_unicode",
            "expr": "'α' <= 'a'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_bytes_empty",
            "expr": "b'' <= b'\u0000'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_bytes_length",
            "expr": "b'\u0001\u0000' <= b'\u0001'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_bool_false_true",
            "expr": "false <= true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_bool_false_false",
            "expr": "false <= false",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_bool_true_false",
            "expr": "true <= false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_null_unsupported",
            "expr": "null <= null",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lte_list_unsupported",
            "expr": "[0] <= [0]",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lte_map_unsupported",
            "expr": "{0:'a'} <= {1:'b'}",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lte_mixed_types_error",
            "expr": "'foo' <= 1024",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "lte_dyn_int_uint",
            "expr": "dyn(1) <= 2u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_int_double",
            "expr": "dyn(1) <= 2.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_uint_int",
            "expr": "dyn(1u) <= 2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_uint_double",
            "expr": "dyn(1u) <= 2.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_double_int",
            "expr": "dyn(1.0) <= 2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_double_uint",
            "expr": "dyn(1.0) <= 2u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_dyn_int_uint",
            "expr": "dyn(2) <= 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_int_double",
            "expr": "dyn(2) <= 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_uint_int",
            "expr": "dyn(2u) <= 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_uint_double",
            "expr": "dyn(2u) <= 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_double_int",
            "expr": "dyn(2.0) <= 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_double_uint",
            "expr": "dyn(2.0) <= 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_dyn_int_big_uint",
            "expr": "dyn(1) <= 9223372036854775808u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_small_int_uint",
            "expr": "dyn(-1) <= 0u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_int_big_double",
            "expr": "dyn(9223372036854775807) <= 9223372036854775808.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_int_small_lossy_double",
            "description": "The conversion of the int to double is lossy and the numbers end up being equal",
            "expr": "dyn(-9223372036854775808) <= -9223372036854775809.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_dyn_int_small_lossy_double_less",
            "expr": "dyn(-9223372036854775808) <= -9223372036854777857.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_uint_small_int",
            "expr": "dyn(1u) <= -9223372036854775808",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_big_uint_int",
            "expr": "dyn(9223372036854775808u) <= 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_lte_dyn_uint_small_double",
            "expr": "dyn(18446744073709551615u) <= -1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_dyn_uint_big_double",
            "expr": "dyn(18446744073709551615u) <= 18446744073709590000.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_lte_dyn_big_double_uint",
            "expr": "dyn(18446744073709553665.0) <= 18446744073709551615u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "lte_dyn_big_double_int",
            "expr": "dyn(9223372036854775808.0) <= 9223372036854775807",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "lte_dyn_small_double_int",
            "expr": "dyn(-9223372036854775809.0) <= -9223372036854775808",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "gte_literal",
        "description": "Literals comparison on _>=_",
        "test": [
          {
            "name": "gte_int_gt",
            "expr": "0 >= -1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_int_eq",
            "expr": "999 >= 999",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_int_lt",
            "expr": "999 >= 1000",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_uint_gt",
            "expr": "1u >= 0u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_uint_eq",
            "expr": "0u >= 0u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_uint_lt",
            "expr": "1u >= 10u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_double_gt",
            "expr": "1e+1 >= 1e+0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_double_eq",
            "expr": "9.80665 >= 9.80665e+0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_double_lt",
            "expr": "0.9999 >= 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_string_empty",
            "expr": "'' >= ''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_string_to_empty",
            "expr": "'a' >= ''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_string_empty_to_nonempty",
            "expr": "'' >= 'a'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_string_length",
            "expr": "'abcd' >= 'abc'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_string_lexicographical",
            "expr": "'abc' >= 'abd'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_string_unicode_eq",
            "expr": "'τ' >= 'τ'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_string_unicode_gt",
            "expr": "'τ' >= 't'",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_get_string_unicode",
            "expr": "'t' >= 'τ'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_bytes_to_empty",
            "expr": "b'\u0000' >= b''",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_bytes_empty_to_nonempty",
            "expr": "b'' >= b'\u0000'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_bytes_samelength",
            "expr": "b'\u0000\u0001' >= b'\u0001\u0000'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_bool_gt",
            "expr": "true >= false",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_bool_eq",
            "expr": "true >= true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_bool_lt",
            "expr": "false >= true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_null_unsupported",
            "expr": "null >= null",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gte_list_unsupported",
            "expr": "['y'] >= ['x']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gte_map_unsupported",
            "expr": "{1:'b'} >= {0:'a'}",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gte_mixed_types_error",
            "expr": "'foo' >= 1.0",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "gte_dyn_int_uint",
            "expr": "dyn(2) >= 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_int_double",
            "expr": "dyn(2) >= 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_uint_int",
            "expr": "dyn(2u) >= 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_uint_double",
            "expr": "dyn(2u) >= 1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_double_int",
            "expr": "dyn(2.0) >= 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_double_uint",
            "expr": "dyn(2.0) >= 1u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_dyn_int_uint",
            "expr": "dyn(0) >= 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gte_dyn_int_double",
            "expr": "dyn(0) >= 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gte_dyn_uint_int",
            "expr": "dyn(0u) >= 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gte_dyn_uint_double",
            "expr": "dyn(0u) >= 1.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gte_dyn_double_int",
            "expr": "dyn(0.0) >= 1",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gte_dyn_double_uint",
            "expr": "dyn(0.0) >= 1u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gte_dyn_int_big_uint",
            "expr": "dyn(1) >= 9223372036854775808u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_gte_dyn_small_int_uint",
            "expr": "dyn(-1) >= 0u",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_dyn_int_big_lossy_double",
            "expr": "dyn(9223372036854775807) >= 9223372036854775808.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_dyn_int_big_double",
            "expr": "dyn(9223372036854775807) >= 9223372036854777857.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_dyn_int_small_lossy_double_equal",
            "description": "The conversion of the int to double is lossy and the numbers end up being equal",
            "expr": "dyn(-9223372036854775808) >= -9223372036854775809.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_int_small_lossy_double_greater",
            "expr": "dyn(-9223372036854775808) >= -9223372036854777857.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_uint_small_int",
            "expr": "dyn(1u) >= -1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_big_uint_int",
            "expr": "dyn(9223372036854775808u) >= 1",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_uint_small_double",
            "expr": "dyn(9223372036854775807u) >= -1.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_gte_dyn_uint_big_double",
            "expr": "dyn(18446744073709551615u) >= 18446744073709553665.0",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "gte_dyn_big_double_uint",
            "expr": "dyn(18446744073709553665.0) >= 18446744073709551615u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_big_double_int",
            "expr": "dyn(9223372036854775808.0) >= 9223372036854775807",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "gte_dyn_small_double_int",
            "expr": "dyn(-9223372036854775809.0) >= -9223372036854775808",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "in_list_literal",
        "description": "Set membership tests using list literals and the 'in' operator",
        "test": [
          {
            "name": "elem_not_in_empty_list",
            "expr": "'empty' in []",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "elem_in_list",
            "expr": "'elem' in ['elem', 'elemA', 'elemB']",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "elem_not_in_list",
            "expr": "'not' in ['elem1', 'elem2', 'elem3']",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "elem_in_mixed_type_list",
            "description": "Set membership tests should succeed if the 'elem' exists in a mixed element type list.",
            "expr": "'elem' in [1, 'elem', 2]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "elem_in_mixed_type_list_cross_type",
            "description": "Set membership tests should return false due to the introduction of heterogeneous-equality. Set membership via 'in' is equivalent to the macro exists() behavior.",
            "expr": "'elem' in [1u, 'str', 2, b'bytes']",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "in_map_literal",
        "description": "Set membership tests using map literals and the 'in' operator",
        "test": [
          {
            "name": "key_not_in_empty_map",
            "expr": "'empty' in {}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "key_in_map",
            "expr": "'key' in {'key':'1', 'other':'2'}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "key_not_in_map",
            "expr": "'key' in {'lock':1, 'gate':2}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "key_in_mixed_key_type_map",
            "description": "Map keys are of mixed type, but since the key is present the result is true.",
            "expr": "'key' in {3:3.0, 'key':2u}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "key_in_mixed_key_type_map_cross_type",
            "expr": "'key' in {1u:'str', 2:b'bytes'}",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "bound",
        "description": "Comparing bound variables with literals or other variables",
        "test": [
          {
            "name": "bytes_gt_left_false",
            "expr": "x > b'\u0000'",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "BYTES"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "bytesValue": "AA=="
                }
              }
            },
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "int_lte_right_true",
            "expr": "123 <= x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "INT64"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "int64Value": "124"
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "bool_lt_right_true",
            "expr": "false < x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "boolValue": true
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "double_ne_left_false",
            "expr": "x != 9.8",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "DOUBLE"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "doubleValue": 9.8
                }
              }
            },
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_ne_right_false",
            "expr": "{'a':'b','c':'d'} != x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "c"
                        },
                        "value": {
                          "stringValue": "d"
                        }
                      },
                      {
                        "key": {
                          "stringValue": "a"
                        },
                        "value": {
                          "stringValue": "b"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "null_eq_left_true",
            "description": "A comparison _==_ against null only binds if the type is determined to be null or we skip the type checking",
            "expr": "x == null",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "null": null
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "nullValue": null
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_eq_right_false",
            "expr": "[1, 2] == x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "listType": {
                      "elemType": {
                        "primitive": "INT64"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "listValue": {
                    "values": [
                      {
                        "int64Value": "2"
                      },
                      {
                        "int64Value": "1"
                      }
                    ]
                  }
                }
              }
            },
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "string_gte_right_true",
            "expr": "'abcd' >= x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "stringValue": "abc"
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "uint_eq_right_false",
            "expr": "999u == x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "primitive": "UINT64"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "uint64Value": "1000"
                }
              }
            },
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "null_lt_right_no_such_overload",
            "description": "There is no _<_ operation for null, even if both operands are null",
            "expr": "null < x",
            "disableCheck": true,
            "bindings": {
              "x": {
                "value": {
                  "nullValue": null
                }
              }
            },
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "conversions",
    "description": "Tests for type conversions.",
    "section": [
      {
        "name": "bytes",
        "description": "Conversions to bytes.",
        "test": [
          {
            "name": "string_empty",
            "expr": "bytes('')",
            "value": {
              "bytesValue": ""
            }
          },
          {
            "name": "string",
            "expr": "bytes('abc')",
            "value": {
              "bytesValue": "YWJj"
            }
          },
          {
            "name": "string_unicode",
            "expr": "bytes('ÿ')",
            "value": {
              "bytesValue": "w78="
            }
          },
          {
            "name": "string_unicode_vs_literal",
            "expr": "bytes('\\377') == b'\\377'",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "double",
        "description": "Conversions to double.",
        "test": [
          {
            "name": "int_zero",
            "expr": "double(0)",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "int_pos",
            "expr": "double(1000000000000)",
            "value": {
              "doubleValue": 1000000000000
            }
          },
          {
            "name": "int_neg",
            "expr": "double(-1000000000000000)",
            "value": {
              "doubleValue": -1000000000000000
            }
          },
          {
            "name": "int_min_exact",
            "description": "Smallest contiguous representable int (-2^53).",
            "expr": "double(-9007199254740992)",
            "value": {
              "doubleValue": -9007199254740992
            }
          },
          {
            "name": "int_max_exact",
            "description": "Largest contiguous representable int (2^53).",
            "expr": "double(9007199254740992)",
            "value": {
              "doubleValue": 9007199254740992
            }
          },
          {
            "name": "int_range",
            "description": "Largest signed 64-bit. Rounds to nearest double.",
            "expr": "double(9223372036854775807)",
            "value": {
              "doubleValue": 9223372036854776000
            }
          },
          {
            "name": "uint_zero",
            "expr": "double(0u)",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "uint_pos",
            "expr": "double(123u)",
            "value": {
              "doubleValue": 123
            }
          },
          {
            "name": "uint_max_exact",
            "description": "Largest contiguous representable int (2^53).",
            "expr": "double(9007199254740992u)",
            "value": {
              "doubleValue": 9007199254740992
            }
          },
          {
            "name": "uint_range",
            "description": "Largest unsigned 64-bit.",
            "expr": "double(18446744073709551615u)",
            "value": {
              "doubleValue": 18446744073709552000
            }
          },
          {
            "name": "string_zero",
            "expr": "double('0')",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "string_zero_dec",
            "expr": "double('0.0')",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "string_neg_zero",
            "expr": "double('-0.0')",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "string_no_dec",
            "expr": "double('123')",
            "value": {
              "doubleValue": 123
            }
          },
          {
            "name": "string_pos",
            "expr": "double('123.456')",
            "value": {
              "doubleValue": 123.456
            }
          },
          {
            "name": "string_neg",
            "expr": "double('-987.654')",
            "value": {
              "doubleValue": -987.654
            }
          },
          {
            "name": "string_exp_pos_pos",
            "expr": "double('6.02214e23')",
            "value": {
              "doubleValue": 6.02214e+23
            }
          },
          {
            "name": "string_exp_pos_neg",
            "expr": "double('1.38e-23')",
            "value": {
              "doubleValue": 1.38e-23
            }
          },
          {
            "name": "string_exp_neg_pos",
            "expr": "double('-84.32e7')",
            "value": {
              "doubleValue": -843200000
            }
          },
          {
            "name": "string_exp_neg_neg",
            "expr": "double('-5.43e-21')",
            "value": {
              "doubleValue": -5.43e-21
            }
          }
        ]
      },
      {
        "name": "dyn",
        "description": "Tests for dyn annotation.",
        "test": [
          {
            "name": "dyn_heterogeneous_list",
            "description": "No need to disable type checking.",
            "expr": "type(dyn([1, 'one']))",
            "value": {
              "typeValue": "list"
            }
          }
        ]
      },
      {
        "name": "int",
        "description": "Conversions to int.",
        "test": [
          {
            "name": "uint",
            "expr": "int(42u)",
            "value": {
              "int64Value": "42"
            }
          },
          {
            "name": "uint_zero",
            "expr": "int(0u)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "uint_max_exact",
            "expr": "int(9223372036854775807u)",
            "value": {
              "int64Value": "9223372036854775807"
            }
          },
          {
            "name": "uint_range",
            "expr": "int(18446744073709551615u)",
            "evalError": {
              "errors": [
                {
                  "message": "range error"
                }
              ]
            }
          },
          {
            "name": "double_round_neg",
            "expr": "int(-123.456)",
            "value": {
              "int64Value": "-123"
            }
          },
          {
            "name": "double_truncate",
            "expr": "int(1.9)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "double_truncate_neg",
            "expr": "int(-7.9)",
            "value": {
              "int64Value": "-7"
            }
          },
          {
            "name": "double_half_pos",
            "expr": "int(11.5)",
            "value": {
              "int64Value": "11"
            }
          },
          {
            "name": "double_half_neg",
            "expr": "int(-3.5)",
            "value": {
              "int64Value": "-3"
            }
          },
          {
            "name": "double_big_exact",
            "description": "Beyond exact range (2^53), but no loss of precision (2^55).",
            "expr": "int(double(36028797018963968))",
            "value": {
              "int64Value": "36028797018963968"
            }
          },
          {
            "name": "double_big_precision",
            "description": "Beyond exact range (2^53), but loses precisons (2^55 + 1).",
            "expr": "int(double(36028797018963969))",
            "value": {
              "int64Value": "36028797018963968"
            }
          },
          {
            "name": "double_int_max_range",
            "description": "The double(2^63-1) cast produces a floating point value outside the int range",
            "expr": "int(9223372036854775807.0)",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "double_int_min_range",
            "description": "The double(-2^63) cast produces a floating point value outside the int range",
            "expr": "int(-9223372036854775808.0)",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "double_range",
            "expr": "int(1e99)",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "string",
            "expr": "int('987')",
            "value": {
              "int64Value": "987"
            }
          },
          {
            "name": "timestamp",
            "expr": "int(timestamp('2004-09-16T23:59:59Z'))",
            "value": {
              "int64Value": "1095379199"
            }
          }
        ]
      },
      {
        "name": "string",
        "description": "Conversions to string.",
        "test": [
          {
            "name": "int",
            "expr": "string(123)",
            "value": {
              "stringValue": "123"
            }
          },
          {
            "name": "int_neg",
            "expr": "string(-456)",
            "value": {
              "stringValue": "-456"
            }
          },
          {
            "name": "uint",
            "expr": "string(9876u)",
            "value": {
              "stringValue": "9876"
            }
          },
          {
            "name": "double",
            "expr": "string(123.456)",
            "value": {
              "stringValue": "123.456"
            }
          },
          {
            "name": "double_hard",
            "expr": "string(-4.5e-3)",
            "value": {
              "stringValue": "-0.0045"
            }
          },
          {
            "name": "bytes",
            "expr": "string(b'abc')",
            "value": {
              "stringValue": "abc"
            }
          },
          {
            "name": "bytes_unicode",
            "expr": "string(b'\\303\\277')",
            "value": {
              "stringValue": "ÿ"
            }
          },
          {
            "name": "bytes_invalid",
            "expr": "string(b'\\000\\xff')",
            "evalError": {
              "errors": [
                {
                  "message": "invalid UTF-8"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "type",
        "description": "Type reflection tests.",
        "test": [
          {
            "name": "bool",
            "expr": "type(true)",
            "value": {
              "typeValue": "bool"
            }
          },
          {
            "name": "bool_denotation",
            "expr": "bool",
            "value": {
              "typeValue": "bool"
            }
          },
          {
            "name": "dyn_no_denotation",
            "expr": "dyn",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "unknown varaible"
                }
              ]
            }
          },
          {
            "name": "int",
            "expr": "type(0)",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "int_denotation",
            "expr": "int",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "eq_same",
            "expr": "type(true) == type(false)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "uint",
            "expr": "type(64u)",
            "value": {
              "typeValue": "uint"
            }
          },
          {
            "name": "uint_denotation",
            "expr": "uint",
            "value": {
              "typeValue": "uint"
            }
          },
          {
            "name": "double",
            "expr": "type(3.14)",
            "value": {
              "typeValue": "double"
            }
          },
          {
            "name": "double_denotation",
            "expr": "double",
            "value": {
              "typeValue": "double"
            }
          },
          {
            "name": "null_type",
            "expr": "type(null)",
            "value": {
              "typeValue": "null_type"
            }
          },
          {
            "name": "null_type_denotation",
            "expr": "null_type",
            "value": {
              "typeValue": "null_type"
            }
          },
          {
            "name": "string",
            "expr": "type('foo')",
            "value": {
              "typeValue": "string"
            }
          },
          {
            "name": "string_denotation",
            "expr": "string",
            "value": {
              "typeValue": "string"
            }
          },
          {
            "name": "bytes",
            "expr": "type(b'\\xff')",
            "value": {
              "typeValue": "bytes"
            }
          },
          {
            "name": "bytes_denotation",
            "expr": "bytes",
            "value": {
              "typeValue": "bytes"
            }
          },
          {
            "name": "list",
            "expr": "type([1, 2, 3])",
            "value": {
              "typeValue": "list"
            }
          },
          {
            "name": "list_denotation",
            "expr": "list",
            "value": {
              "typeValue": "list"
            }
          },
          {
            "name": "lists_monomorphic",
            "expr": "type([1, 2, 3]) == type(['one', 'two', 'three'])",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map",
            "expr": "type({4: 16})",
            "value": {
              "typeValue": "map"
            }
          },
          {
            "name": "map_denotation",
            "expr": "map",
            "value": {
              "typeValue": "map"
            }
          },
          {
            "name": "map_monomorphic",
            "expr": "type({'one': 1}) == type({1: 'one'})",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_diff",
            "expr": "type(7) == type(7u)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "neq_same",
            "expr": "type(0.0) != type(-0.0)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "neq_diff",
            "expr": "type(0.0) != type(0)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "meta",
            "expr": "type(type(7)) == type(type(7u))",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "type",
            "expr": "type(int)",
            "value": {
              "typeValue": "type"
            }
          },
          {
            "name": "type_denotation",
            "expr": "type",
            "value": {
              "typeValue": "type"
            }
          },
          {
            "name": "type_type",
            "expr": "type(type)",
            "value": {
              "typeValue": "type"
            }
          }
        ]
      },
      {
        "name": "uint",
        "description": "Conversions to uint.",
        "test": [
          {
            "name": "int",
            "expr": "uint(1729)",
            "value": {
              "uint64Value": "1729"
            }
          },
          {
            "name": "int_max",
            "expr": "uint(9223372036854775807)",
            "value": {
              "uint64Value": "9223372036854775807"
            }
          },
          {
            "name": "int_neg",
            "expr": "uint(-1)",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "double",
            "expr": "uint(3.14159265)",
            "value": {
              "uint64Value": "3"
            }
          },
          {
            "name": "double_truncate",
            "expr": "uint(1.9)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "double_half",
            "expr": "uint(25.5)",
            "value": {
              "uint64Value": "25"
            }
          },
          {
            "name": "double_big_exact",
            "description": "Beyond exact range (2^53), but no loss of precision (2^55).",
            "expr": "uint(double(36028797018963968u))",
            "value": {
              "uint64Value": "36028797018963968"
            }
          },
          {
            "name": "double_big_precision",
            "description": "Beyond exact range (2^53), but loses precisons (2^55 + 1).",
            "expr": "uint(double(36028797018963969u))",
            "value": {
              "uint64Value": "36028797018963968"
            }
          },
          {
            "name": "double_uint_max_range",
            "description": "The exact conversion of uint max as a double does not round trip.",
            "expr": "int(18446744073709551615.0)",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "double_range_beyond_uint",
            "expr": "uint(6.022e23)",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "string",
            "expr": "uint('300')",
            "value": {
              "uint64Value": "300"
            }
          }
        ]
      },
      {
        "name": "bool",
        "description": "Conversions to bool",
        "test": [
          {
            "name": "string_1",
            "expr": "bool('1')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "string_t",
            "expr": "bool('t')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "string_true_lowercase",
            "expr": "bool('true')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "string_true_uppercase",
            "expr": "bool('TRUE')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "string_true_pascalcase",
            "expr": "bool('True')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "string_0",
            "expr": "bool('0')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "string_f",
            "expr": "bool('f')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "string_false_lowercase",
            "expr": "bool('false')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "string_false_uppercase",
            "expr": "bool('FALSE')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "string_false_pascalcase",
            "expr": "bool('False')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "string_true_badcase",
            "expr": "bool('TrUe')",
            "evalError": {
              "errors": [
                {
                  "message": "Type conversion error"
                }
              ]
            }
          },
          {
            "name": "string_false_badcase",
            "expr": "bool('FaLsE')",
            "evalError": {
              "errors": [
                {
                  "message": "Type conversion error"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "identity",
        "description": "Identity functions",
        "test": [
          {
            "name": "bool",
            "expr": "bool(true)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "int",
            "expr": "int(1)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "uint",
            "expr": "uint(1u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "double",
            "expr": "double(5.5)",
            "value": {
              "doubleValue": 5.5
            }
          },
          {
            "name": "string",
            "expr": "string('hello')",
            "value": {
              "stringValue": "hello"
            }
          },
          {
            "name": "bytes",
            "expr": "bytes(b'abc')",
            "value": {
              "bytesValue": "YWJj"
            }
          },
          {
            "name": "duration",
            "expr": "duration(duration('100s')) == duration('100s')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "timestamp",
            "expr": "timestamp(timestamp(1000000000)) == timestamp(1000000000)",
            "value": {
              "boolValue": true
            }
          }
        ]
      }
    ]
  },
  {
    "name": "dynamic",
    "description": "Tests for 'dynamic' proto behavior, including JSON, wrapper, and Any messages.",
    "section": [
      {
        "name": "int32",
        "description": "Tests for int32 conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Int32Value{value: -123}",
            "value": {
              "int64Value": "-123"
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Int32Value{value: -123}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_zero",
            "expr": "google.protobuf.Int32Value{}",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Int32Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Int32Value",
                    "value": 2000000
                  }
                }
              }
            },
            "value": {
              "int64Value": "2000000"
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_int32_wrapper: 432}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32Wrapper": 432
              }
            }
          },
          {
            "name": "field_assign_proto2_zero",
            "expr": "TestAllTypes{single_int32_wrapper: 0}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32Wrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto2_max",
            "expr": "TestAllTypes{single_int32_wrapper: 2147483647}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32Wrapper": 2147483647
              }
            }
          },
          {
            "name": "field_assign_proto2_min",
            "expr": "TestAllTypes{single_int32_wrapper: -2147483648}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32Wrapper": -2147483648
              }
            }
          },
          {
            "name": "field_assign_proto2_range",
            "expr": "TestAllTypes{single_int32_wrapper: 12345678900}",
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "range error"
                }
              ]
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_int32_wrapper: 642}.single_int32_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "642"
            }
          },
          {
            "name": "field_read_proto2_zero",
            "expr": "TestAllTypes{single_int32_wrapper: 0}.single_int32_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "field_read_proto2_unset",
            "expr": "TestAllTypes{}.single_int32_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_int32_wrapper: -975}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt32Wrapper": -975
              }
            }
          },
          {
            "name": "field_assign_proto3_zero",
            "expr": "TestAllTypes{single_int32_wrapper: 0}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt32Wrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto3_max",
            "expr": "TestAllTypes{single_int32_wrapper: 2147483647}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt32Wrapper": 2147483647
              }
            }
          },
          {
            "name": "field_assign_proto3_min",
            "expr": "TestAllTypes{single_int32_wrapper: -2147483648}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt32Wrapper": -2147483648
              }
            }
          },
          {
            "name": "field_assign_proto3_range",
            "expr": "TestAllTypes{single_int32_wrapper: -998877665544332211}",
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "range error"
                }
              ]
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_int32_wrapper: 642}.single_int32_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "642"
            }
          },
          {
            "name": "field_read_proto3_zero",
            "expr": "TestAllTypes{single_int32_wrapper: 0}.single_int32_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "field_read_proto3_unset",
            "expr": "TestAllTypes{}.single_int32_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          }
        ]
      },
      {
        "name": "int64",
        "description": "Tests for int64 conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Int64Value{value: -123}",
            "value": {
              "int64Value": "-123"
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Int64Value{value: -123}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_zero",
            "expr": "google.protobuf.Int64Value{}",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Int64Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Int64Value",
                    "value": "2000000"
                  }
                }
              }
            },
            "value": {
              "int64Value": "2000000"
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_int64_wrapper: 432}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt64Wrapper": "432"
              }
            }
          },
          {
            "name": "field_assign_proto2_zero",
            "expr": "TestAllTypes{single_int64_wrapper: 0}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt64Wrapper": "0"
              }
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_int64_wrapper: -975}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt64Wrapper": "-975"
              }
            }
          },
          {
            "name": "field_assign_proto3_zero",
            "expr": "TestAllTypes{single_int64_wrapper: 0}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt64Wrapper": "0"
              }
            }
          }
        ]
      },
      {
        "name": "uint32",
        "description": "Tests for uint32 conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.UInt32Value{value: 123u}",
            "value": {
              "uint64Value": "123"
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.UInt32Value{value: 123u}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_zero",
            "expr": "google.protobuf.UInt32Value{}",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.UInt32Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.UInt32Value",
                    "value": 2000000
                  }
                }
              }
            },
            "value": {
              "uint64Value": "2000000"
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_uint32_wrapper: 432u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint32Wrapper": 432
              }
            }
          },
          {
            "name": "field_assign_proto2_zero",
            "expr": "TestAllTypes{single_uint32_wrapper: 0u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint32Wrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto2_max",
            "expr": "TestAllTypes{single_uint32_wrapper: 4294967295u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint32Wrapper": 4294967295
              }
            }
          },
          {
            "name": "field_assign_proto2_range",
            "expr": "TestAllTypes{single_uint32_wrapper: 6111222333u}",
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "range error"
                }
              ]
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_uint32_wrapper: 975u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint32Wrapper": 975
              }
            }
          },
          {
            "name": "field_assign_proto3_zero",
            "expr": "TestAllTypes{single_uint32_wrapper: 0u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint32Wrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto3_max",
            "expr": "TestAllTypes{single_uint32_wrapper: 4294967295u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint32Wrapper": 4294967295
              }
            }
          },
          {
            "name": "field_assign_proto3_range",
            "expr": "TestAllTypes{single_uint32_wrapper: 6111222333u}",
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "range error"
                }
              ]
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_uint32_wrapper: 258u}.single_uint32_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "uint64Value": "258"
            }
          },
          {
            "name": "field_read_proto2_zero",
            "expr": "TestAllTypes{single_uint32_wrapper: 0u}.single_uint32_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "field_read_proto2_unset",
            "expr": "TestAllTypes{}.single_uint32_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          }
        ]
      },
      {
        "name": "uint64",
        "description": "Tests for uint64 conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.UInt64Value{value: 123u}",
            "value": {
              "uint64Value": "123"
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.UInt64Value{value: 123u}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_zero",
            "expr": "google.protobuf.UInt64Value{}",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.UInt64Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.UInt64Value",
                    "value": "2000000"
                  }
                }
              }
            },
            "value": {
              "uint64Value": "2000000"
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_uint64_wrapper: 432u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint64Wrapper": "432"
              }
            }
          },
          {
            "name": "field_assign_proto2_zero",
            "expr": "TestAllTypes{single_uint64_wrapper: 0u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint64Wrapper": "0"
              }
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_uint64_wrapper: 975u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint64Wrapper": "975"
              }
            }
          },
          {
            "name": "field_assign_proto3_zero",
            "expr": "TestAllTypes{single_uint64_wrapper: 0u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint64Wrapper": "0"
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_uint64_wrapper: 5123123123u}.single_uint64_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "uint64Value": "5123123123"
            }
          },
          {
            "name": "field_read_proto2_zero",
            "expr": "TestAllTypes{single_uint64_wrapper: 0u}.single_uint64_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "field_read_proto2_unset",
            "expr": "TestAllTypes{}.single_uint64_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          }
        ]
      },
      {
        "name": "float",
        "description": "Tests for float conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.FloatValue{value: -1.5e3}",
            "value": {
              "doubleValue": -1500
            }
          },
          {
            "name": "literal_not_double",
            "description": "Use a number with no exact representation to make sure we actually narrow to a float.",
            "expr": "google.protobuf.FloatValue{value: 1.333} == 1.333",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.FloatValue{value: 3.1416}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_zero",
            "expr": "google.protobuf.FloatValue{}",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.FloatValue"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.FloatValue",
                    "value": -1250000
                  }
                }
              }
            },
            "value": {
              "doubleValue": -1250000
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_float_wrapper: 86.75}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloatWrapper": 86.75
              }
            }
          },
          {
            "name": "field_assign_proto2_zero",
            "expr": "TestAllTypes{single_float_wrapper: 0.0}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloatWrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto2_subnorm",
            "description": "Subnormal single floats range from ~1e-38 to ~1e-45.",
            "expr": "TestAllTypes{single_float_wrapper: 1e-40}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloatWrapper": 1e-40
              }
            }
          },
          {
            "name": "field_assign_proto2_round_to_zero",
            "description": "Subnormal single floats range from ~1e-38 to ~1e-45.",
            "expr": "TestAllTypes{single_float_wrapper: 1e-50}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloatWrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto2_range",
            "description": "Single float max is about 3.4e38",
            "expr": "TestAllTypes{single_float_wrapper: 1.4e55}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloatWrapper": "Infinity"
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_float_wrapper: -12.375}.single_float_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "doubleValue": -12.375
            }
          },
          {
            "name": "field_read_proto2_zero",
            "expr": "TestAllTypes{single_float_wrapper: 0.0}.single_float_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "field_read_proto2_unset",
            "expr": "TestAllTypes{}.single_float_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_float_wrapper: -9.75}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFloatWrapper": -9.75
              }
            }
          },
          {
            "name": "field_assign_proto3_zero",
            "expr": "TestAllTypes{single_float_wrapper: 0.0}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFloatWrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto2_subnorm",
            "description": "Subnormal single floats range from ~1e-38 to ~1e-45.",
            "expr": "TestAllTypes{single_float_wrapper: 1e-40}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloatWrapper": 1e-40
              }
            }
          },
          {
            "name": "field_assign_proto3_round_to_zero",
            "expr": "TestAllTypes{single_float_wrapper: -9.9e-100}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFloatWrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto3_range",
            "description": "Single float min is about -3.4e38",
            "expr": "TestAllTypes{single_float_wrapper: -9.9e100}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFloatWrapper": "-Infinity"
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_float_wrapper: 64.25}.single_float_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 64.25
            }
          },
          {
            "name": "field_read_proto3_zero",
            "expr": "TestAllTypes{single_float_wrapper: 0.0}.single_float_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "field_read_proto3_unset",
            "expr": "TestAllTypes{}.single_float_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          }
        ]
      },
      {
        "name": "double",
        "description": "Tests for double conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.DoubleValue{value: -1.5e3}",
            "value": {
              "doubleValue": -1500
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.DoubleValue{value: 3.1416}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_zero",
            "expr": "google.protobuf.DoubleValue{}",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.DoubleValue"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.DoubleValue",
                    "value": -1250000
                  }
                }
              }
            },
            "value": {
              "doubleValue": -1250000
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_double_wrapper: 86.75}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleDoubleWrapper": 86.75
              }
            }
          },
          {
            "name": "field_assign_proto2_zero",
            "expr": "TestAllTypes{single_double_wrapper: 0.0}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleDoubleWrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto2_range",
            "expr": "TestAllTypes{single_double_wrapper: 1.4e55}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleDoubleWrapper": 1.4e+55
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_double_wrapper: -12.375}.single_double_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "doubleValue": -12.375
            }
          },
          {
            "name": "field_read_proto2_zero",
            "expr": "TestAllTypes{single_int32_wrapper: 0}.single_int32_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "field_read_proto2_unset",
            "expr": "TestAllTypes{}.single_double_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_double_wrapper: -9.75}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleDoubleWrapper": -9.75
              }
            }
          },
          {
            "name": "field_assign_proto3_zero",
            "expr": "TestAllTypes{single_double_wrapper: 0.0}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleDoubleWrapper": 0
              }
            }
          },
          {
            "name": "field_assign_proto3_range",
            "expr": "TestAllTypes{single_double_wrapper: -9.9e100}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleDoubleWrapper": -9.9e+100
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_double_wrapper: 64.25}.single_double_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 64.25
            }
          },
          {
            "name": "field_read_proto3_zero",
            "expr": "TestAllTypes{single_double_wrapper: 0.0}.single_double_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "field_read_proto3_unset",
            "expr": "TestAllTypes{}.single_double_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          }
        ]
      },
      {
        "name": "bool",
        "description": "Tests for bool conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.BoolValue{value: true}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.BoolValue{value: true}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.BoolValue{}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.BoolValue"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.BoolValue",
                    "value": true
                  }
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_bool_wrapper: true}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBoolWrapper": true
              }
            }
          },
          {
            "name": "field_assign_proto2_false",
            "expr": "TestAllTypes{single_bool_wrapper: false}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBoolWrapper": false
              }
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_bool_wrapper: true}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBoolWrapper": true
              }
            }
          },
          {
            "name": "field_assign_proto3_false",
            "expr": "TestAllTypes{single_bool_wrapper: false}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBoolWrapper": false
              }
            }
          }
        ]
      },
      {
        "name": "string",
        "description": "Tests for string conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.StringValue{value: 'foo'}",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.StringValue{value: 'foo'}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.StringValue{}",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "literal_unicode",
            "expr": "google.protobuf.StringValue{value: 'flambé'}",
            "value": {
              "stringValue": "flambé"
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.StringValue"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.StringValue",
                    "value": "bar"
                  }
                }
              }
            },
            "value": {
              "stringValue": "bar"
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_string_wrapper: 'baz'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleStringWrapper": "baz"
              }
            }
          },
          {
            "name": "field_assign_proto2_empty",
            "expr": "TestAllTypes{single_string_wrapper: ''}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleStringWrapper": ""
              }
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_string_wrapper: 'bletch'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleStringWrapper": "bletch"
              }
            }
          },
          {
            "name": "field_assign_proto3_empty",
            "expr": "TestAllTypes{single_string_wrapper: ''}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleStringWrapper": ""
              }
            }
          }
        ]
      },
      {
        "name": "bytes",
        "description": "Tests for bytes conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.BytesValue{value: b'foo\\123'}",
            "value": {
              "bytesValue": "Zm9vUw=="
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.BytesValue{value: b'foo'}.value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.BytesValue{}",
            "value": {
              "bytesValue": ""
            }
          },
          {
            "name": "literal_unicode",
            "expr": "google.protobuf.BytesValue{value: b'flambé'}",
            "value": {
              "bytesValue": "ZmxhbWLDqQ=="
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.BytesValue"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.BytesValue",
                    "value": "YmFy"
                  }
                }
              }
            },
            "value": {
              "bytesValue": "YmFy"
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_bytes_wrapper: b'baz'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBytesWrapper": "YmF6"
              }
            }
          },
          {
            "name": "field_assign_proto2_empty",
            "expr": "TestAllTypes{single_bytes_wrapper: b''}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBytesWrapper": ""
              }
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_bytes_wrapper: b'bletch'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBytesWrapper": "YmxldGNo"
              }
            }
          },
          {
            "name": "field_assign_proto3_empty",
            "expr": "TestAllTypes{single_bytes_wrapper: b''}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBytesWrapper": ""
              }
            }
          }
        ]
      },
      {
        "name": "list",
        "description": "Tests for list conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.ListValue{values: [3.0, 'foo', null]}",
            "value": {
              "listValue": {
                "values": [
                  {
                    "doubleValue": 3
                  },
                  {
                    "stringValue": "foo"
                  },
                  {
                    "nullValue": null
                  }
                ]
              }
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.ListValue{values: [3.0, 'foo', null]}.values",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.ListValue{values: []}",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.ListValue"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.ListValue",
                    "value": [
                      "bar",
                      [
                        "a",
                        "b"
                      ]
                    ]
                  }
                }
              }
            },
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "bar"
                  },
                  {
                    "listValue": {
                      "values": [
                        {
                          "stringValue": "a"
                        },
                        {
                          "stringValue": "b"
                        }
                      ]
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{list_value: [1.0, 'one']}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "listValue": [
                  1,
                  "one"
                ]
              }
            }
          },
          {
            "name": "field_assign_proto2_empty",
            "expr": "TestAllTypes{list_value: []}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "listValue": []
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{list_value: [1.0, 'one']}.list_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {
                "values": [
                  {
                    "doubleValue": 1
                  },
                  {
                    "stringValue": "one"
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto2_empty",
            "expr": "TestAllTypes{list_value: []}.list_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "field_read_proto2_unset",
            "description": "Not a wrapper type, so doesn't convert to null.",
            "expr": "TestAllTypes{}.list_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{list_value: [1.0, 'one']}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "listValue": [
                  1,
                  "one"
                ]
              }
            }
          },
          {
            "name": "field_assign_proto3_empty",
            "expr": "TestAllTypes{list_value: []}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "listValue": []
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{list_value: [1.0, 'one']}.list_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {
                "values": [
                  {
                    "doubleValue": 1
                  },
                  {
                    "stringValue": "one"
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto3_empty",
            "expr": "TestAllTypes{list_value: []}.list_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "field_read_proto3_unset",
            "description": "Not a wrapper type, so doesn't convert to null.",
            "expr": "TestAllTypes{}.list_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {}
            }
          }
        ]
      },
      {
        "name": "struct",
        "description": "Tests for struct conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Struct{fields: {'uno': 1.0, 'dos': 2.0}}",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "uno"
                    },
                    "value": {
                      "doubleValue": 1
                    }
                  },
                  {
                    "key": {
                      "stringValue": "dos"
                    },
                    "value": {
                      "doubleValue": 2
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Struct{fields: {'uno': 1.0, 'dos': 2.0}}.fields",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.Struct{fields: {}}",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Struct"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Struct",
                    "value": {
                      "first": "Abraham",
                      "last": "Lincoln"
                    }
                  }
                }
              }
            },
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "first"
                    },
                    "value": {
                      "stringValue": "Abraham"
                    }
                  },
                  {
                    "key": {
                      "stringValue": "last"
                    },
                    "value": {
                      "stringValue": "Lincoln"
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_struct: {'un': 1.0, 'deux': 2.0}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleStruct": {
                  "deux": 2,
                  "un": 1
                }
              }
            }
          },
          {
            "name": "field_assign_proto2_empty",
            "expr": "TestAllTypes{single_struct: {}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleStruct": {}
              }
            }
          },
          {
            "name": "field_assign_proto2_bad",
            "expr": "TestAllTypes{single_struct: {1: 'uno'}}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "bad key type"
                }
              ]
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_struct: {'one': 1.0}}.single_struct",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "one"
                    },
                    "value": {
                      "doubleValue": 1
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto2_empty",
            "expr": "TestAllTypes{single_struct: {}}.single_struct",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "field_read_proto2_unset",
            "description": "Not a wrapper type, so doesn't convert to null.",
            "expr": "TestAllTypes{}.single_struct",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_struct: {'un': 1.0, 'deux': 2.0}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleStruct": {
                  "deux": 2,
                  "un": 1
                }
              }
            }
          },
          {
            "name": "field_assign_proto3_empty",
            "expr": "TestAllTypes{single_struct: {}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleStruct": {}
              }
            }
          },
          {
            "name": "field_assign_proto3_bad",
            "expr": "TestAllTypes{single_struct: {1: 'uno'}}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "bad key type"
                }
              ]
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_struct: {'one': 1.0}}.single_struct",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "one"
                    },
                    "value": {
                      "doubleValue": 1
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto3_empty",
            "expr": "TestAllTypes{single_struct: {}}.single_struct",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "field_read_proto3_unset",
            "description": "Not a wrapper type, so doesn't convert to null.",
            "expr": "TestAllTypes{}.single_struct",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {}
            }
          }
        ]
      },
      {
        "name": "value_null",
        "description": "Tests for null conversions.",
        "test": [
          {
            "name": "literal",
            "expr": "Value{null_value: NullValue.NULL_VALUE}",
            "container": "google.protobuf",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "Value{null_value: NullValue.NULL_VALUE}.null_value",
            "disableCheck": true,
            "container": "google.protobuf",
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_unset",
            "expr": "google.protobuf.Value{}",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Value",
                    "value": null
                  }
                }
              }
            },
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_value: null}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": null
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_value: null}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "field_read_proto2_unset",
            "expr": "TestAllTypes{}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_value: null}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": null
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_value: null}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "field_read_proto3_unset",
            "expr": "TestAllTypes{}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          }
        ]
      },
      {
        "name": "value_number",
        "description": "Tests for number conversions in Value.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Value{number_value: 12.5}",
            "value": {
              "doubleValue": 12.5
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Value{number_value: 12.5}.number_value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_zero",
            "expr": "google.protobuf.Value{number_value: 0.0}",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Value",
                    "value": -26.375
                  }
                }
              }
            },
            "value": {
              "doubleValue": -26.375
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_value: 7e23}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": 7e+23
              }
            }
          },
          {
            "name": "field_assign_proto2_zero",
            "expr": "TestAllTypes{single_value: 0.0}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": 0
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_value: 7e23}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "doubleValue": 7e+23
            }
          },
          {
            "name": "field_read_proto2_zero",
            "expr": "TestAllTypes{single_value: 0.0}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_value: 7e23}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": 7e+23
              }
            }
          },
          {
            "name": "field_assign_proto3_zero",
            "expr": "TestAllTypes{single_value: 0.0}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": 0
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_value: 7e23}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 7e+23
            }
          },
          {
            "name": "field_read_proto3_zero",
            "expr": "TestAllTypes{single_value: 0.0}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 0
            }
          }
        ]
      },
      {
        "name": "value_string",
        "description": "Tests for string conversions in Value.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Value{string_value: 'foo'}",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Value{string_value: 'foo'}.string_value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.Value{string_value: ''}",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Value",
                    "value": "bar"
                  }
                }
              }
            },
            "value": {
              "stringValue": "bar"
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_value: 'baz'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": "baz"
              }
            }
          },
          {
            "name": "field_assign_proto2_empty",
            "expr": "TestAllTypes{single_value: ''}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": ""
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_value: 'bletch'}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "stringValue": "bletch"
            }
          },
          {
            "name": "field_read_proto2_zero",
            "expr": "TestAllTypes{single_value: ''}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_value: 'baz'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": "baz"
              }
            }
          },
          {
            "name": "field_assign_proto3_empty",
            "expr": "TestAllTypes{single_value: ''}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": ""
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_value: 'bletch'}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "bletch"
            }
          },
          {
            "name": "field_read_proto3_zero",
            "expr": "TestAllTypes{single_value: ''}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": ""
            }
          }
        ]
      },
      {
        "name": "value_bool",
        "description": "Tests for boolean conversions in Value.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Value{bool_value: true}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Value{bool_value: true}.bool_value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_false",
            "expr": "google.protobuf.Value{bool_value: false}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Value",
                    "value": true
                  }
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_value: true}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": true
              }
            }
          },
          {
            "name": "field_assign_proto2_false",
            "expr": "TestAllTypes{single_value: false}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": false
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_value: true}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "field_read_proto2_false",
            "expr": "TestAllTypes{single_value: false}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_value: true}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": true
              }
            }
          },
          {
            "name": "field_assign_proto3_false",
            "expr": "TestAllTypes{single_value: false}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": false
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_value: true}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "field_read_proto3_false",
            "expr": "TestAllTypes{single_value: false}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "value_struct",
        "description": "Tests for struct conversions in Value.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Value{struct_value: {'a': 1.0, 'b': 'two'}}",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "a"
                    },
                    "value": {
                      "doubleValue": 1
                    }
                  },
                  {
                    "key": {
                      "stringValue": "b"
                    },
                    "value": {
                      "stringValue": "two"
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Value{struct_value: {'a': 1.0, 'b': 'two'}}.struct_value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.Value{struct_value: {}}",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Value",
                    "value": {
                      "x": null,
                      "y": false
                    }
                  }
                }
              }
            },
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "x"
                    },
                    "value": {
                      "nullValue": null
                    }
                  },
                  {
                    "key": {
                      "stringValue": "y"
                    },
                    "value": {
                      "boolValue": false
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_value: {'un': 1.0, 'deux': 2.0}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": {
                  "deux": 2,
                  "un": 1
                }
              }
            }
          },
          {
            "name": "field_assign_proto2_empty",
            "expr": "TestAllTypes{single_value: {}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": {}
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_value: {'i': true}}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "i"
                    },
                    "value": {
                      "boolValue": true
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto2_empty",
            "expr": "TestAllTypes{single_value: {}}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_value: {'un': 1.0, 'deux': 2.0}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": {
                  "deux": 2,
                  "un": 1
                }
              }
            }
          },
          {
            "name": "field_assign_proto3_empty",
            "expr": "TestAllTypes{single_value: {}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": {}
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_value: {'i': true}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "i"
                    },
                    "value": {
                      "boolValue": true
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto3_empty",
            "expr": "TestAllTypes{single_value: {}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {}
            }
          }
        ]
      },
      {
        "name": "value_list",
        "description": "Tests for list conversions in Value.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Value{list_value: ['a', 3.0]}",
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "a"
                  },
                  {
                    "doubleValue": 3
                  }
                ]
              }
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Value{list_value: []}.list_value",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.Value{list_value: []}",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Value"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Value",
                    "value": [
                      1,
                      true,
                      "hi"
                    ]
                  }
                }
              }
            },
            "value": {
              "listValue": {
                "values": [
                  {
                    "doubleValue": 1
                  },
                  {
                    "boolValue": true
                  },
                  {
                    "stringValue": "hi"
                  }
                ]
              }
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_value: ['un', 1.0]}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": [
                  "un",
                  1
                ]
              }
            }
          },
          {
            "name": "field_assign_proto2_empty",
            "expr": "TestAllTypes{single_value: []}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": []
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_value: ['i', true]}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "i"
                  },
                  {
                    "boolValue": true
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto2_empty",
            "expr": "TestAllTypes{single_value: []}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_value: ['un', 1.0]}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": [
                  "un",
                  1
                ]
              }
            }
          },
          {
            "name": "field_assign_proto3_empty",
            "expr": "TestAllTypes{single_value: []}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": []
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_value: ['i', true]}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "i"
                  },
                  {
                    "boolValue": true
                  }
                ]
              }
            }
          },
          {
            "name": "field_read_proto3_empty",
            "expr": "TestAllTypes{single_value: []}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {}
            }
          }
        ]
      },
      {
        "name": "any",
        "description": "Tests for Any conversion.",
        "test": [
          {
            "name": "literal",
            "expr": "google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\x08\\x96\\x01'}",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32": 150
              }
            }
          },
          {
            "name": "literal_no_field_access",
            "expr": "google.protobuf.Any{type_url: 'type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes', value: b'\\x08\\x96\\x01'}.type_url",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_matching_overload"
                }
              ]
            }
          },
          {
            "name": "literal_empty",
            "expr": "google.protobuf.Any{}",
            "evalError": {
              "errors": [
                {
                  "message": "conversion"
                }
              ]
            }
          },
          {
            "name": "var",
            "expr": "x",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Any"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Any",
                    "value": {
                      "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                      "singleInt32": 150
                    }
                  }
                }
              }
            },
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32": 150
              }
            }
          },
          {
            "name": "field_assign_proto2",
            "expr": "TestAllTypes{single_any: TestAllTypes{single_int32: 150}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleAny": {
                  "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                  "singleInt32": 150
                }
              }
            }
          },
          {
            "name": "field_read_proto2",
            "expr": "TestAllTypes{single_any: TestAllTypes{single_int32: 150}}.single_any",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32": 150
              }
            }
          },
          {
            "name": "field_assign_proto3",
            "expr": "TestAllTypes{single_any: TestAllTypes{single_int32: 150}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleAny": {
                  "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                  "singleInt32": 150
                }
              }
            }
          },
          {
            "name": "field_read_proto3",
            "expr": "TestAllTypes{single_any: TestAllTypes{single_int32: 150}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt32": 150
              }
            }
          }
        ]
      },
      {
        "name": "complex",
        "description": "Tests combining various dynamic conversions.",
        "test": [
          {
            "name": "any_list_map",
            "expr": "TestAllTypes{single_any: [{'almost': 'done'}]}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {
                "values": [
                  {
                    "mapValue": {
                      "entries": [
                        {
                          "key": {
                            "stringValue": "almost"
                          },
                          "value": {
                            "stringValue": "done"
                          }
                        }
                      ]
                    }
                  }
                ]
              }
            }
          }
        ]
      }
    ]
  },
  {
    "name": "encoders_ext",
    "description": "Tests for the encoders extension library.",
    "section": [
      {
        "name": "encode",
        "test": [
          {
            "name": "hello",
            "expr": "base64.encode(b'hello')",
            "value": {
              "stringValue": "aGVsbG8="
            }
          }
        ]
      },
      {
        "name": "decode",
        "test": [
          {
            "name": "hello",
            "expr": "base64.decode('aGVsbG8=')",
            "value": {
              "bytesValue": "aGVsbG8="
            }
          },
          {
            "name": "hello_without_padding",
            "expr": "base64.decode('aGVsbG8')",
            "value": {
              "bytesValue": "aGVsbG8="
            }
          }
        ]
      },
      {
        "name": "round_trip",
        "test": [
          {
            "name": "hello",
            "expr": "base64.decode(base64.encode(b'Hello World!'))",
            "value": {
              "bytesValue": "SGVsbG8gV29ybGQh"
            }
          }
        ]
      }
    ]
  },
  {
    "name": "enums",
    "description": "Tests for enum types.",
    "section": [
      {
        "name": "legacy_proto2",
        "description": "Legacy semantics where all enums are ints, proto2.",
        "test": [
          {
            "name": "literal_global",
            "expr": "GlobalEnum.GAZ",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "literal_nested",
            "expr": "TestAllTypes.NestedEnum.BAR",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "literal_zero",
            "expr": "GlobalEnum.GOO",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "comparision",
            "expr": "GlobalEnum.GAR == 1",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "arithmetic",
            "expr": "TestAllTypes.NestedEnum.BAR + 3",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "4"
            }
          },
          {
            "name": "type_global",
            "expr": "type(GlobalEnum.GOO)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "type_nested",
            "expr": "type(TestAllTypes.NestedEnum.BAZ)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "select_default",
            "expr": "TestAllTypes{}.standalone_enum",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "field_type",
            "expr": "type(TestAllTypes{}.standalone_enum)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "assign_standalone_name",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAZ}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "standaloneEnum": "BAZ"
              }
            }
          },
          {
            "name": "assign_standalone_int",
            "expr": "TestAllTypes{standalone_enum: 1}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "standaloneEnum": "BAR"
              }
            }
          },
          {
            "name": "assign_standalone_int_too_big",
            "expr": "TestAllTypes{standalone_enum: 5000000000}",
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "assign_standalone_int_too_neg",
            "expr": "TestAllTypes{standalone_enum: -7000000000}",
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "legacy_proto3",
        "description": "Legacy semantics where all enums are ints, proto3",
        "test": [
          {
            "name": "literal_global",
            "expr": "GlobalEnum.GAZ",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "literal_nested",
            "expr": "TestAllTypes.NestedEnum.BAR",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "literal_zero",
            "expr": "GlobalEnum.GOO",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "comparision",
            "expr": "GlobalEnum.GAR == 1",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "arithmetic",
            "expr": "TestAllTypes.NestedEnum.BAR + 3",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "4"
            }
          },
          {
            "name": "type_global",
            "expr": "type(GlobalEnum.GOO)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "type_nested",
            "expr": "type(TestAllTypes.NestedEnum.BAZ)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "select_default",
            "expr": "TestAllTypes{}.standalone_enum",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "select",
            "expr": "x.standalone_enum",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "container": "cel.expr.conformance.proto3",
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "standaloneEnum": "BAZ"
                  }
                }
              }
            },
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "select_big",
            "expr": "x.standalone_enum",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "container": "cel.expr.conformance.proto3",
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "standaloneEnum": 108
                  }
                }
              }
            },
            "value": {
              "int64Value": "108"
            }
          },
          {
            "name": "select_neg",
            "expr": "x.standalone_enum",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "container": "cel.expr.conformance.proto3",
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "standaloneEnum": -3
                  }
                }
              }
            },
            "value": {
              "int64Value": "-3"
            }
          },
          {
            "name": "field_type",
            "expr": "type(TestAllTypes{}.standalone_enum)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "typeValue": "int"
            }
          },
          {
            "name": "assign_standalone_name",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAZ}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": "BAZ"
              }
            }
          },
          {
            "name": "assign_standalone_int",
            "expr": "TestAllTypes{standalone_enum: 1}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": "BAR"
              }
            }
          },
          {
            "name": "assign_standalone_int_big",
            "expr": "TestAllTypes{standalone_enum: 99}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": 99
              }
            }
          },
          {
            "name": "assign_standalone_int_neg",
            "expr": "TestAllTypes{standalone_enum: -1}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": -1
              }
            }
          },
          {
            "name": "assign_standalone_int_too_big",
            "expr": "TestAllTypes{standalone_enum: 5000000000}",
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "assign_standalone_int_too_neg",
            "expr": "TestAllTypes{standalone_enum: -7000000000}",
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "strong_proto2",
        "description": "String semantics where enums are distinct types, proto2.",
        "test": [
          {
            "name": "literal_global",
            "expr": "GlobalEnum.GAZ",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.GlobalEnum",
                "value": 2
              }
            }
          },
          {
            "name": "literal_nested",
            "expr": "TestAllTypes.NestedEnum.BAR",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.TestAllTypes.NestedEnum",
                "value": 1
              }
            }
          },
          {
            "name": "literal_zero",
            "expr": "GlobalEnum.GOO",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.GlobalEnum"
              }
            }
          },
          {
            "name": "comparision_true",
            "expr": "GlobalEnum.GAR == GlobalEnum.GAR",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "comparision_false",
            "expr": "GlobalEnum.GAR == GlobalEnum.GAZ",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "type_global",
            "expr": "type(GlobalEnum.GOO)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "typeValue": "cel.expr.conformance.proto2.GlobalEnum"
            }
          },
          {
            "name": "type_nested",
            "expr": "type(TestAllTypes.NestedEnum.BAZ)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "typeValue": "cel.expr.conformance.proto2.TestAllTypes.NestedEnum"
            }
          },
          {
            "name": "select_default",
            "expr": "TestAllTypes{}.standalone_enum",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.TestAllTypes.NestedEnum"
              }
            }
          },
          {
            "name": "field_type",
            "expr": "type(TestAllTypes{}.standalone_enum)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "typeValue": "cel.expr.conformance.proto2.TestAllTypes.NestedEnum"
            }
          },
          {
            "name": "assign_standalone_name",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAZ}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "standaloneEnum": "BAZ"
              }
            }
          },
          {
            "name": "assign_standalone_int",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum(1)}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "standaloneEnum": "BAR"
              }
            }
          },
          {
            "name": "convert_symbol_to_int",
            "expr": "int(GlobalEnum.GAZ)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "convert_unnamed_to_int",
            "description": "Disable check - missing way to declare enums.",
            "expr": "int(x)",
            "disableCheck": true,
            "bindings": {
              "x": {
                "value": {
                  "enumValue": {
                    "type": "cel.expr.conformance.proto2.GlobalEnum",
                    "value": 444
                  }
                }
              }
            },
            "value": {
              "int64Value": "444"
            }
          },
          {
            "name": "convert_int_inrange",
            "expr": "TestAllTypes.NestedEnum(2)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.TestAllTypes.NestedEnum",
                "value": 2
              }
            }
          },
          {
            "name": "convert_int_big",
            "expr": "TestAllTypes.NestedEnum(20000)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.TestAllTypes.NestedEnum",
                "value": 20000
              }
            }
          },
          {
            "name": "convert_int_neg",
            "expr": "GlobalEnum(-33)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.GlobalEnum",
                "value": -33
              }
            }
          },
          {
            "name": "convert_int_too_big",
            "expr": "TestAllTypes.NestedEnum(5000000000)",
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "convert_int_too_neg",
            "expr": "TestAllTypes.NestedEnum(-7000000000)",
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "convert_string",
            "expr": "TestAllTypes.NestedEnum('BAZ')",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto2.TestAllTypes.NestedEnum",
                "value": 2
              }
            }
          },
          {
            "name": "convert_string_bad",
            "expr": "TestAllTypes.NestedEnum('BLETCH')",
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "invalid"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "strong_proto3",
        "description": "String semantics where enums are distinct types, proto3.",
        "test": [
          {
            "name": "literal_global",
            "expr": "GlobalEnum.GAZ",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.GlobalEnum",
                "value": 2
              }
            }
          },
          {
            "name": "literal_nested",
            "expr": "TestAllTypes.NestedEnum.BAR",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum",
                "value": 1
              }
            }
          },
          {
            "name": "literal_zero",
            "expr": "GlobalEnum.GOO",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.GlobalEnum"
              }
            }
          },
          {
            "name": "comparision_true",
            "expr": "GlobalEnum.GAR == GlobalEnum.GAR",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "comparision_false",
            "expr": "GlobalEnum.GAR == GlobalEnum.GAZ",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "type_global",
            "expr": "type(GlobalEnum.GOO)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "typeValue": "cel.expr.conformance.proto3.GlobalEnum"
            }
          },
          {
            "name": "type_nested",
            "expr": "type(TestAllTypes.NestedEnum.BAZ)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "typeValue": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum"
            }
          },
          {
            "name": "select_default",
            "expr": "TestAllTypes{}.standalone_enum",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum"
              }
            }
          },
          {
            "name": "select",
            "expr": "x.standalone_enum",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "container": "cel.expr.conformance.proto3",
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "standaloneEnum": "BAZ"
                  }
                }
              }
            },
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum",
                "value": 2
              }
            }
          },
          {
            "name": "select_big",
            "expr": "x.standalone_enum",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "container": "cel.expr.conformance.proto3",
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "standaloneEnum": 108
                  }
                }
              }
            },
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum",
                "value": 108
              }
            }
          },
          {
            "name": "select_neg",
            "expr": "x.standalone_enum",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "container": "cel.expr.conformance.proto3",
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "standaloneEnum": -3
                  }
                }
              }
            },
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum",
                "value": -3
              }
            }
          },
          {
            "name": "field_type",
            "expr": "type(TestAllTypes{}.standalone_enum)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "typeValue": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum"
            }
          },
          {
            "name": "assign_standalone_name",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAZ}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": "BAZ"
              }
            }
          },
          {
            "name": "assign_standalone_int",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum(1)}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": "BAR"
              }
            }
          },
          {
            "name": "assign_standalone_int_big",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum(99)}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": 99
              }
            }
          },
          {
            "name": "assign_standalone_int_neg",
            "expr": "TestAllTypes{standalone_enum: TestAllTypes.NestedEnum(-1)}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "standaloneEnum": -1
              }
            }
          },
          {
            "name": "convert_symbol_to_int",
            "expr": "int(GlobalEnum.GAZ)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "convert_unnamed_to_int",
            "description": "Disable check - missing way to declare enums.",
            "expr": "int(x)",
            "disableCheck": true,
            "bindings": {
              "x": {
                "value": {
                  "enumValue": {
                    "type": "cel.expr.conformance.proto3.GlobalEnum",
                    "value": 444
                  }
                }
              }
            },
            "value": {
              "int64Value": "444"
            }
          },
          {
            "name": "convert_unnamed_to_int_select",
            "expr": "int(x.standalone_enum)",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "standaloneEnum": -987
                  }
                }
              }
            },
            "value": {
              "int64Value": "-987"
            }
          },
          {
            "name": "convert_int_inrange",
            "expr": "TestAllTypes.NestedEnum(2)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum",
                "value": 2
              }
            }
          },
          {
            "name": "convert_int_big",
            "expr": "TestAllTypes.NestedEnum(20000)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum",
                "value": 20000
              }
            }
          },
          {
            "name": "convert_int_neg",
            "expr": "GlobalEnum(-33)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.GlobalEnum",
                "value": -33
              }
            }
          },
          {
            "name": "convert_int_too_big",
            "expr": "TestAllTypes.NestedEnum(5000000000)",
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "convert_int_too_neg",
            "expr": "TestAllTypes.NestedEnum(-7000000000)",
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "convert_string",
            "expr": "TestAllTypes.NestedEnum('BAZ')",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "enumValue": {
                "type": "cel.expr.conformance.proto3.TestAllTypes.NestedEnum",
                "value": 2
              }
            }
          },
          {
            "name": "convert_string_bad",
            "expr": "TestAllTypes.NestedEnum('BLETCH')",
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "invalid"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "fields",
    "description": "Tests for field access in maps.",
    "section": [
      {
        "name": "map_fields",
        "description": "select an element in a map",
        "test": [
          {
            "name": "map_key_int64",
            "expr": "{0:1,2:2,5:true}[5]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_key_uint64",
            "expr": "{0u:1u,2u:'happy',5u:3u}[2u]",
            "value": {
              "stringValue": "happy"
            }
          },
          {
            "name": "map_key_string",
            "expr": "{'name':100u}['name']",
            "value": {
              "uint64Value": "100"
            }
          },
          {
            "name": "map_key_bool",
            "expr": "{true:5}[true]",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "map_key_mixed_type",
            "expr": "{true:1,2:2,5u:3}[true]",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "map_key_mixed_numbers_double_key",
            "expr": "{1u: 1.0, 2: 2.0, 3u: 3.0}[3.0]",
            "value": {
              "doubleValue": 3
            }
          },
          {
            "name": "map_key_mixed_numbers_lossy_double_key",
            "expr": "{1u: 1.0, 2: 2.0, 3u: 3.0}[3.1]",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_key_mixed_numbers_uint_key",
            "expr": "{1u: 1.0, 2: 2.0, 3u: 3.0}[2u]",
            "value": {
              "doubleValue": 2
            }
          },
          {
            "name": "map_key_mixed_numbers_int_key",
            "expr": "{1u: 1.0, 2: 2.0, 3u: 3.0}[1]",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "map_field_access",
            "expr": "x.name",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "INT64"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "name"
                        },
                        "value": {
                          "int64Value": "1024"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "value": {
              "int64Value": "1024"
            }
          },
          {
            "name": "map_no_such_key",
            "expr": "{0:1,2:2,5:3}[1]",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_no_such_key_or_false",
            "expr": "dyn({0:1,2:2,5:3}[1]) || false",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_no_such_key_or_true",
            "expr": "dyn({0:1,2:2,5:3}[1]) || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_no_such_key_and_false",
            "expr": "dyn({0:1,2:2,5:3}[1]) && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_no_such_key_and_true",
            "expr": "dyn({0:1,2:2,5:3}[1]) && true",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_bad_key_type",
            "expr": "{0:1,2:2,5:3}[dyn(b'')]",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_bad_key_type_or_false",
            "expr": "dyn({0:1,2:2,5:3}[dyn(b'')]) || false",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_bad_key_type_or_true",
            "expr": "dyn({0:1,2:2,5:3}[dyn(b'')]) || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_bad_key_type_and_false",
            "expr": "dyn({0:1,2:2,5:3}[dyn(b'')]) && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_bad_key_type_and_true",
            "expr": "dyn({0:1,2:2,5:3}[dyn(b'')]) && true",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_field_select_no_such_key",
            "expr": "x.name",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "holiday"
                        },
                        "value": {
                          "stringValue": "field"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "evalError": {
              "errors": [
                {
                  "message": "no such key: 'name'"
                }
              ]
            }
          },
          {
            "name": "map_field_select_no_such_key_or_false",
            "expr": "dyn(x.name) || false",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "holiday"
                        },
                        "value": {
                          "stringValue": "field"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "evalError": {
              "errors": [
                {
                  "message": "no such key: 'name'"
                }
              ]
            }
          },
          {
            "name": "map_field_select_no_such_key_or_true",
            "expr": "dyn(x.name) || true",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "holiday"
                        },
                        "value": {
                          "stringValue": "field"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_field_select_no_such_key_and_false",
            "expr": "dyn(x.name) && false",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "holiday"
                        },
                        "value": {
                          "stringValue": "field"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_field_select_no_such_key_and_true",
            "expr": "dyn(x.name) && true",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "holiday"
                        },
                        "value": {
                          "stringValue": "field"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "evalError": {
              "errors": [
                {
                  "message": "no such key: 'name'"
                }
              ]
            }
          },
          {
            "name": "map_value_null",
            "expr": "{true:null}[true]",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "map_value_bool",
            "expr": "{27:false}[27]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_value_string",
            "expr": "{'n':'x'}['n']",
            "value": {
              "stringValue": "x"
            }
          },
          {
            "name": "map_value_float",
            "expr": "{3:15.15}[3]",
            "value": {
              "doubleValue": 15.15
            }
          },
          {
            "name": "map_value_uint64",
            "expr": "{0u:1u,2u:2u,5u:3u}[0u]",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "map_value_int64",
            "expr": "{true:1,false:2}[true]",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "map_value_bytes",
            "expr": "{0:b\"\"}[0]",
            "value": {
              "bytesValue": ""
            }
          },
          {
            "name": "map_value_list",
            "expr": "{0u:[1]}[0u]",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "1"
                  }
                ]
              }
            }
          },
          {
            "name": "map_value_map",
            "expr": "{\"map\": {\"k\": \"v\"}}[\"map\"]",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "k"
                    },
                    "value": {
                      "stringValue": "v"
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "map_value_mix_type",
            "expr": "{\"map\": {\"k\": \"v\"}, \"list\": [1]}[\"map\"]",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "k"
                    },
                    "value": {
                      "stringValue": "v"
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      {
        "name": "map_has",
        "description": "Has macro for map entries.",
        "test": [
          {
            "name": "has",
            "expr": "has({'a': 1, 'b': 2}.a)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "has_not",
            "expr": "has({'a': 1, 'b': 2}.c)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "has_empty",
            "expr": "has({}.a)",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "qualified_identifier_resolution",
        "description": "Tests for qualified identifier resolution.",
        "test": [
          {
            "name": "qualified_ident",
            "expr": "a.b.c",
            "typeEnv": [
              {
                "name": "a.b.c",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "a.b.c": {
                "value": {
                  "stringValue": "yeah"
                }
              }
            },
            "value": {
              "stringValue": "yeah"
            }
          },
          {
            "name": "map_field_select",
            "expr": "a.b.c",
            "typeEnv": [
              {
                "name": "a.b",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "a.b": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "c"
                        },
                        "value": {
                          "stringValue": "yeah"
                        }
                      }
                    ]
                  }
                }
              }
            },
            "value": {
              "stringValue": "yeah"
            }
          },
          {
            "name": "qualified_identifier_resolution_unchecked",
            "description": "namespace resolution should try to find the longest prefix for the evaluator.",
            "expr": "a.b.c",
            "disableCheck": true,
            "typeEnv": [
              {
                "name": "a.b.c",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              },
              {
                "name": "a.b",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "a.b": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "c"
                        },
                        "value": {
                          "stringValue": "oops"
                        }
                      }
                    ]
                  }
                }
              },
              "a.b.c": {
                "value": {
                  "stringValue": "yeah"
                }
              }
            },
            "value": {
              "stringValue": "yeah"
            }
          },
          {
            "name": "list_field_select_unsupported",
            "expr": "a.b.pancakes",
            "disableCheck": true,
            "typeEnv": [
              {
                "name": "a.b",
                "ident": {
                  "type": {
                    "listType": {
                      "elemType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "a.b": {
                "value": {
                  "listValue": {
                    "values": [
                      {
                        "stringValue": "pancakes"
                      }
                    ]
                  }
                }
              }
            },
            "evalError": {
              "errors": [
                {
                  "message": "type 'list_type:<elem_type:<primitive:STRING > > ' does not support field selection"
                }
              ]
            }
          },
          {
            "name": "int64_field_select_unsupported",
            "expr": "a.pancakes",
            "disableCheck": true,
            "typeEnv": [
              {
                "name": "a",
                "ident": {
                  "type": {
                    "primitive": "INT64"
                  }
                }
              }
            ],
            "bindings": {
              "a": {
                "value": {
                  "int64Value": "15"
                }
              }
            },
            "evalError": {
              "errors": [
                {
                  "message": "type 'int64_type' does not support field selection"
                }
              ]
            }
          },
          {
            "name": "ident_with_longest_prefix_check",
            "description": "namespace resolution should try to find the longest prefix for the checker.",
            "expr": "a.b.c",
            "typeEnv": [
              {
                "name": "a.b.c",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              },
              {
                "name": "a.b",
                "ident": {
                  "type": {
                    "mapType": {
                      "keyType": {
                        "primitive": "STRING"
                      },
                      "valueType": {
                        "primitive": "STRING"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "a.b": {
                "value": {
                  "mapValue": {
                    "entries": [
                      {
                        "key": {
                          "stringValue": "c"
                        },
                        "value": {
                          "stringValue": "oops"
                        }
                      }
                    ]
                  }
                }
              },
              "a.b.c": {
                "value": {
                  "stringValue": "yeah"
                }
              }
            },
            "value": {
              "stringValue": "yeah"
            }
          },
          {
            "name": "map_key_float",
            "description": "map should not support float as the key.",
            "expr": "{3.3:15.15, 1.0: 5}[1.0]",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "unsupported key type"
                }
              ]
            }
          },
          {
            "name": "map_key_null",
            "description": "map should not support null as the key.",
            "expr": "{null:false}[null]",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "unsupported key type"
                }
              ]
            }
          },
          {
            "name": "map_value_repeat_key",
            "description": "map should not support repeated key.",
            "expr": "{true:1,false:2,true:3}[true]",
            "evalError": {
              "errors": [
                {
                  "message": "Failed with repeated key"
                }
              ]
            }
          },
          {
            "name": "map_value_repeat_key_heterogeneous",
            "description": "map should not support repeated key.",
            "expr": "{0: 1, 0u: 2}[0.0]",
            "evalError": {
              "errors": [
                {
                  "message": "Failed with repeated key"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "in",
        "description": "Tests for 'in' operator for maps.",
        "test": [
          {
            "name": "empty",
            "expr": "7 in {}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "singleton",
            "expr": "true in {true: 1}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "present",
            "expr": "'George' in {'John': 'smart', 'Paul': 'cute', 'George': 'quiet', 'Ringo': 'funny'}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "absent",
            "expr": "'spider' in {'ant': 6, 'fly': 6, 'centipede': 100}",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "mixed_numbers_and_keys_present",
            "expr": "3.0 in {1: 1, 2: 2, 3u: 3} && 2u in {1u: 1, 2: 2} && 1 in {1u: 1, 2: 2}",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "mixed_numbers_and_keys_absent",
            "expr": "3.1 in {1: 1, 2: 2, 3u: 3}",
            "value": {
              "boolValue": false
            }
          }
        ]
      }
    ]
  },
  {
    "name": "fp_math",
    "description": "Tests for floating-point math.",
    "section": [
      {
        "name": "fp_math",
        "description": "Simple tests for floating point.",
        "test": [
          {
            "name": "add_positive_positive",
            "expr": "4.25 + 15.25",
            "value": {
              "doubleValue": 19.5
            }
          },
          {
            "name": "add_positive_negative",
            "expr": "17.75 + (-7.75)",
            "value": {
              "doubleValue": 10
            }
          },
          {
            "name": "add_negative_negative",
            "expr": "-4.125 + (-2.125)",
            "value": {
              "doubleValue": -6.25
            }
          },
          {
            "name": "sub_positive_positive",
            "expr": "42.0 - 12.0",
            "value": {
              "doubleValue": 30
            }
          },
          {
            "name": "sub_positive_negative",
            "expr": "42.875 - (-22.0)",
            "value": {
              "doubleValue": 64.875
            }
          },
          {
            "name": "sub_negative_negative",
            "expr": "-4.875 - (-0.125)",
            "value": {
              "doubleValue": -4.75
            }
          },
          {
            "name": "multiply_positive_positive",
            "expr": "42.5 * 0.2",
            "value": {
              "doubleValue": 8.5
            }
          },
          {
            "name": "multiply_positive_negative",
            "expr": "40.75 * (-2.25)",
            "value": {
              "doubleValue": -91.6875
            }
          },
          {
            "name": "multiply_negative_negative",
            "expr": "-3.0 * (-2.5)",
            "value": {
              "doubleValue": 7.5
            }
          },
          {
            "name": "divide_positive_positive",
            "expr": "0.0625 / 0.002",
            "value": {
              "doubleValue": 31.25
            }
          },
          {
            "name": "divide_positive_negative",
            "expr": "-2.0 / 2.0",
            "value": {
              "doubleValue": -1
            }
          },
          {
            "name": "divide_negative_negative",
            "expr": "-8.875 / (-0.0625)",
            "value": {
              "doubleValue": 142
            }
          },
          {
            "name": "mod_not_support",
            "expr": "47.5 % 5.5",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "found no matching overload for '_%_' applied to '(double, double)'"
                }
              ]
            }
          },
          {
            "name": "negative",
            "expr": "-(4.5)",
            "value": {
              "doubleValue": -4.5
            }
          },
          {
            "name": "double_negative",
            "expr": "-(-1.25)",
            "value": {
              "doubleValue": 1.25
            }
          },
          {
            "name": "negative_zero",
            "expr": "-(0.0)",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "divide_zero",
            "expr": "15.75 / 0.0",
            "value": {
              "doubleValue": "Infinity"
            }
          },
          {
            "name": "multiply_zero",
            "expr": "15.36 * 0.0",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "add_left_identity",
            "expr": "0.0 + 1.75",
            "value": {
              "doubleValue": 1.75
            }
          },
          {
            "name": "add_right_identity",
            "expr": " 2.5 + 0.0",
            "value": {
              "doubleValue": 2.5
            }
          },
          {
            "name": "add_commutative",
            "expr": "7.5 + 1.5 == 1.5 + 7.5",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_associative",
            "expr": "5.625 + (15.75 + 2.0) == (5.625 + 15.75) + 2.0",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "mul_left_identity",
            "expr": "1.0 * 45.25",
            "value": {
              "doubleValue": 45.25
            }
          },
          {
            "name": "mul_right_identity",
            "expr": "-25.25 * 1.0",
            "value": {
              "doubleValue": -25.25
            }
          },
          {
            "name": "mul_commutative",
            "expr": "1.5 * 25.875 == 25.875 * 1.5",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "mul_associative",
            "expr": "1.5 * (23.625 * 0.75) == (1.5 * 23.625) * 0.75",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_mul_distribute",
            "expr": "5.75 * (1.5 + 2.5)  == 5.75 * 1.5 + 5.75 * 2.5",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "fp_overflow_positive",
            "description": "DBL_MAX(2^1023) times two",
            "expr": "2.0 * 8.988466e+307 ",
            "value": {
              "doubleValue": "Infinity"
            }
          },
          {
            "name": "fp_overflow_negative",
            "description": "-DBL_MAX(-2^1023) times two",
            "expr": "2.0 * -8.988466e+307 ",
            "value": {
              "doubleValue": "-Infinity"
            }
          },
          {
            "name": "fp_underflow",
            "description": "DBL_MIN(2^-1074) divided by two",
            "expr": "1e-324  / 2.0",
            "value": {
              "doubleValue": 0
            }
          }
        ]
      }
    ]
  },
  {
    "name": "integer_math",
    "description": "Tests for int and uint math.",
    "section": [
      {
        "name": "int64_math",
        "description": "Simple tests for int64.",
        "test": [
          {
            "name": "add_positive_positive",
            "expr": "40 + 2",
            "value": {
              "int64Value": "42"
            }
          },
          {
            "name": "add_positive_negative",
            "expr": "42 + (-7)",
            "value": {
              "int64Value": "35"
            }
          },
          {
            "name": "add_negative_negative",
            "expr": "-4 + (-2)",
            "value": {
              "int64Value": "-6"
            }
          },
          {
            "name": "sub_positive_positive",
            "expr": "42 - 12",
            "value": {
              "int64Value": "30"
            }
          },
          {
            "name": "sub_positive_negative",
            "expr": "42 - (-22)",
            "value": {
              "int64Value": "64"
            }
          },
          {
            "name": "sub_negative_negative",
            "expr": "-42 - (-12)",
            "value": {
              "int64Value": "-30"
            }
          },
          {
            "name": "multiply_positive_positive",
            "expr": "42 * 2",
            "value": {
              "int64Value": "84"
            }
          },
          {
            "name": "multiply_positive_negative",
            "expr": "40 * (-2)",
            "value": {
              "int64Value": "-80"
            }
          },
          {
            "name": "multiply_negative_negative",
            "expr": "-30 * (-2)",
            "value": {
              "int64Value": "60"
            }
          },
          {
            "name": "divide_positive_positive",
            "expr": "42 / 2",
            "value": {
              "int64Value": "21"
            }
          },
          {
            "name": "divide_positive_negative",
            "expr": "-20 / 2",
            "value": {
              "int64Value": "-10"
            }
          },
          {
            "name": "divide_negative_negative",
            "expr": "-80 / (-2)",
            "value": {
              "int64Value": "40"
            }
          },
          {
            "name": "mod_positive_positive",
            "expr": "47 % 5",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "mod_positive_negative",
            "expr": "43 % (-5)",
            "value": {
              "int64Value": "3"
            }
          },
          {
            "name": "mod_negative_negative",
            "expr": "-42 % (-5)",
            "value": {
              "int64Value": "-2"
            }
          },
          {
            "name": "mod_negative_positive",
            "expr": "-3 % 5",
            "value": {
              "int64Value": "-3"
            }
          },
          {
            "name": "unary_minus_pos",
            "expr": "-(42)",
            "value": {
              "int64Value": "-42"
            }
          },
          {
            "name": "unary_minus_neg",
            "expr": "-(-42)",
            "value": {
              "int64Value": "42"
            }
          },
          {
            "name": "unary_minus_no_overload",
            "expr": "-(42u)",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_such_overload"
                }
              ]
            }
          },
          {
            "name": "unary_minus_not_bool",
            "expr": "-false",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no_such_overload"
                }
              ]
            }
          },
          {
            "name": "mod_zero",
            "expr": "34 % 0",
            "evalError": {
              "errors": [
                {
                  "message": "modulus by zero"
                }
              ]
            }
          },
          {
            "name": "negtive_zero",
            "expr": "-(0)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "double_negative",
            "expr": "-(-42)",
            "value": {
              "int64Value": "42"
            }
          },
          {
            "name": "divide_zero",
            "expr": "15 / 0",
            "evalError": {
              "errors": [
                {
                  "message": "divide by zero"
                }
              ]
            }
          },
          {
            "name": "multiply_zero",
            "expr": "15 * 0",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "add_left_identity",
            "expr": "0 + 17",
            "value": {
              "int64Value": "17"
            }
          },
          {
            "name": "add_right_identity",
            "expr": " 29 + 0",
            "value": {
              "int64Value": "29"
            }
          },
          {
            "name": "add_commutative",
            "expr": "75 + 15 == 15 + 75",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_associative",
            "expr": "5 + (15 + 20) == (5 + 15) + 20",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "mul_left_identity",
            "expr": "1 * 45",
            "value": {
              "int64Value": "45"
            }
          },
          {
            "name": "mul_right_identity",
            "expr": "-25 * 1",
            "value": {
              "int64Value": "-25"
            }
          },
          {
            "name": "mul_commutative",
            "expr": "15 * 25 == 25 * 15",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "mul_associative",
            "expr": "15 * (23 * 88) == (15 * 23) * 88",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_mul_distribute",
            "expr": "5 * (15 + 25)  == 5 * 15 + 5 * 25",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "int64_overflow_positive",
            "description": "LLONG_MAX plus one.",
            "expr": "9223372036854775807 + 1",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_overflow_negative",
            "description": "LLONG_MIN minus one.",
            "expr": "-9223372036854775808 - 1",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_overflow_add_negative",
            "description": "negative overflow via addition",
            "expr": "-9223372036854775808 + (-1)",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_overflow_sub_positive",
            "description": "positive overflow via subtraction",
            "expr": "1 - (-9223372036854775807)",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_min_negate",
            "description": "Negated LLONG_MIN is not representable.",
            "expr": "-(-9223372036854775808)",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_min_negate_mul",
            "description": "Negate LLONG_MIN via multiplication",
            "expr": "(-9223372036854775808) * -1",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_min_negate_div",
            "description": "Negate LLONG_MIN via division.",
            "expr": "(-9223372036854775808)/-1",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_overflow_mul_positive",
            "description": "Overflow via multiplication.",
            "expr": "5000000000 * 5000000000",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "int64_overflow_mul_negative",
            "description": "Overflow via multiplication.",
            "expr": "(-5000000000) * 5000000000",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "uint64_overflow_positive",
            "description": "ULLONG_MAX plus one.",
            "expr": "18446744073709551615u + 1u",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "uint64_overflow_negative",
            "description": "zero minus one.",
            "expr": "0u - 1u",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          },
          {
            "name": "uint64_overflow_mul_positive",
            "description": "Overflow via multiplication.",
            "expr": "5000000000u * 5000000000u",
            "evalError": {
              "errors": [
                {
                  "message": "return error for overflow"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "uint64_math",
        "description": "Simple tests for uint64.",
        "test": [
          {
            "name": "add",
            "expr": "42u + 2u",
            "value": {
              "uint64Value": "44"
            }
          },
          {
            "name": "sub",
            "expr": "42u - 12u",
            "value": {
              "uint64Value": "30"
            }
          },
          {
            "name": "multiply",
            "expr": "40u * 2u",
            "value": {
              "uint64Value": "80"
            }
          },
          {
            "name": "divide",
            "expr": "60u / 2u",
            "value": {
              "uint64Value": "30"
            }
          },
          {
            "name": "mod",
            "expr": "42u % 5u",
            "value": {
              "uint64Value": "2"
            }
          },
          {
            "name": "negtive_no_overload",
            "expr": "-(5u)",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "mod_zero",
            "expr": "34u % 0u",
            "evalError": {
              "errors": [
                {
                  "message": "modulus by zero"
                }
              ]
            }
          },
          {
            "name": "divide_zero",
            "expr": "15u / 0u",
            "evalError": {
              "errors": [
                {
                  "message": "divide by zero"
                }
              ]
            }
          },
          {
            "name": "multiply_zero",
            "expr": "15u * 0u",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "add_left_identity",
            "expr": "0u + 17u",
            "value": {
              "uint64Value": "17"
            }
          },
          {
            "name": "add_right_identity",
            "expr": " 29u + 0u",
            "value": {
              "uint64Value": "29"
            }
          },
          {
            "name": "add_commutative",
            "expr": "75u + 15u == 15u + 75u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_associative",
            "expr": "5u + (15u + 20u) == (5u + 15u) + 20u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "mul_left_identity",
            "expr": "1u * 45u",
            "value": {
              "uint64Value": "45"
            }
          },
          {
            "name": "mul_right_identity",
            "expr": "25u * 1u",
            "value": {
              "uint64Value": "25"
            }
          },
          {
            "name": "mul_commutative",
            "expr": "15u * 25u == 25u * 15u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "mul_associative",
            "expr": "15u * (23u * 88u) == (15u * 23u) * 88u",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_mul_distribute",
            "expr": "5u * (15u + 25u)  == 5u * 15u + 5u * 25u",
            "value": {
              "boolValue": true
            }
          }
        ]
      }
    ]
  },
  {
    "name": "lists",
    "description": "Tests for list operations.",
    "section": [
      {
        "name": "concatentation",
        "description": "Tests for list concatenation.",
        "test": [
          {
            "name": "list_append",
            "expr": "[0, 1, 2] + [3, 4, 5] == [0, 1, 2, 3, 4, 5]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_not_commutative",
            "expr": "[0, 1, 2] + [3, 4, 5] == [3, 4, 5, 0, 1, 2]",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_repeat",
            "expr": "[2] + [2]",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "2"
                  },
                  {
                    "int64Value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "empty_empty",
            "expr": "[] + []",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "left_unit",
            "expr": "[] + [3, 4]",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "3"
                  },
                  {
                    "int64Value": "4"
                  }
                ]
              }
            }
          },
          {
            "name": "right_unit",
            "expr": "[1, 2] + []",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "1"
                  },
                  {
                    "int64Value": "2"
                  }
                ]
              }
            }
          }
        ]
      },
      {
        "name": "index",
        "description": "List indexing tests.",
        "test": [
          {
            "name": "zero_based",
            "expr": "[7, 8, 9][0]",
            "value": {
              "int64Value": "7"
            }
          },
          {
            "name": "zero_based_double",
            "expr": "[7, 8, 9][dyn(0.0)]",
            "value": {
              "int64Value": "7"
            }
          },
          {
            "name": "zero_based_double_error",
            "expr": "[7, 8, 9][dyn(0.1)]",
            "evalError": {
              "errors": [
                {
                  "message": "invalid_argument"
                }
              ]
            }
          },
          {
            "name": "zero_based_uint",
            "expr": "[7, 8, 9][dyn(0u)]",
            "value": {
              "int64Value": "7"
            }
          },
          {
            "name": "singleton",
            "expr": "['foo'][0]",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "middle",
            "expr": "[0, 1, 1, 2, 3, 5, 8, 13][4]",
            "value": {
              "int64Value": "3"
            }
          },
          {
            "name": "last",
            "expr": "['George', 'John', 'Paul', 'Ringo'][3]",
            "value": {
              "stringValue": "Ringo"
            }
          },
          {
            "name": "index_out_of_bounds",
            "expr": "[1, 2, 3][3]",
            "evalError": {
              "errors": [
                {
                  "message": "invalid_argument"
                }
              ]
            }
          },
          {
            "name": "index_out_of_bounds_or_false",
            "expr": "dyn([1, 2, 3][3]) || false",
            "evalError": {
              "errors": [
                {
                  "message": "invalid_argument"
                }
              ]
            }
          },
          {
            "name": "index_out_of_bounds_or_true",
            "expr": "dyn([1, 2, 3][3]) || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "index_out_of_bounds_and_false",
            "expr": "dyn([1, 2, 3][3]) && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "index_out_of_bounds_and_true",
            "expr": "dyn([1, 2, 3][3]) && true",
            "evalError": {
              "errors": [
                {
                  "message": "invalid_argument"
                }
              ]
            }
          },
          {
            "name": "bad_index_type",
            "expr": "[1, 2, 3][dyn('')]",
            "evalError": {
              "errors": [
                {
                  "message": "invalid_argument"
                }
              ]
            }
          },
          {
            "name": "bad_index_type_or_false",
            "expr": "dyn([1, 2, 3][dyn('')]) || false",
            "evalError": {
              "errors": [
                {
                  "message": "invalid_argument"
                }
              ]
            }
          },
          {
            "name": "bad_index_type_or_true",
            "expr": "dyn([1, 2, 3][dyn('')]) || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "bad_index_type_and_false",
            "expr": "dyn([1, 2, 3][dyn('')]) && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "bad_index_type_and_true",
            "expr": "dyn([1, 2, 3][dyn('')]) && true",
            "evalError": {
              "errors": [
                {
                  "message": "invalid_argument"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "in",
        "description": "List membership tests.",
        "test": [
          {
            "name": "empty",
            "expr": "7 in []",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "singleton",
            "expr": "4u in [4u]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "first",
            "expr": "'alpha' in ['alpha', 'beta', 'gamma']",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "middle",
            "expr": "3 in [5, 4, 3, 2, 1]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "last",
            "expr": "20u in [4u, 6u, 8u, 12u, 20u]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "double_in_ints",
            "expr": "dyn(3.0) in [5, 4, 3, 2, 1]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "uint_in_ints",
            "expr": "dyn(3u) in [5, 4, 3, 2, 1]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "int_in_doubles",
            "expr": "dyn(3) in [5.0, 4.0, 3.0, 2.0, 1.0]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "uint_in_doubles",
            "expr": "dyn(3u) in [5.0, 4.0, 3.0, 2.0, 1.0]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "int_in_uints",
            "expr": "dyn(3) in [5u, 4u, 3u, 2u, 1u]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "double_in_uints",
            "expr": "dyn(3.0) in [5u, 4u, 3u, 2u, 1u]",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "missing",
            "expr": "'hawaiian' in ['meat', 'veggie', 'margarita', 'cheese']",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "size",
        "description": "List and map size tests.",
        "test": [
          {
            "name": "list_empty",
            "expr": "size([])",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "list",
            "expr": "size([1, 2, 3])",
            "value": {
              "int64Value": "3"
            }
          },
          {
            "name": "map_empty",
            "expr": "size({})",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "map",
            "expr": "size({1: 'one', 2: 'two', 3: 'three'})",
            "value": {
              "int64Value": "3"
            }
          }
        ]
      }
    ]
  },
  {
    "name": "logic",
    "description": "Tests for logical special operators.",
    "section": [
      {
        "name": "conditional",
        "description": "Tests for the conditional operator.",
        "test": [
          {
            "name": "true_case",
            "expr": "true ? 1 : 2",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "false_case",
            "expr": "false ? 'foo' : 'bar'",
            "value": {
              "stringValue": "bar"
            }
          },
          {
            "name": "error_case",
            "expr": "2 / 0 > 4 ? 'baz' : 'quux'",
            "evalError": {
              "errors": [
                {
                  "message": "division by zero"
                }
              ]
            }
          },
          {
            "name": "mixed_type",
            "expr": "true ? 'cows' : 17",
            "disableCheck": true,
            "value": {
              "stringValue": "cows"
            }
          },
          {
            "name": "bad_type",
            "expr": "'cows' ? false : 17",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "AND",
        "description": "Tests for logical AND.",
        "test": [
          {
            "name": "all_true",
            "expr": "true && true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "all_false",
            "expr": "false && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "false_left",
            "expr": "false && true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "false_right",
            "expr": "true && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "short_circuit_type_left",
            "expr": "false && 32",
            "disableCheck": true,
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "short_circuit_type_right",
            "expr": "'horses' && false",
            "disableCheck": true,
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "short_circuit_error_left",
            "expr": "false && (2 / 0 > 3 ? false : true)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "short_circuit_error_right",
            "expr": "(2 / 0 > 3 ? false : true) && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "error_right",
            "expr": "true && 1/0 != 0",
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          },
          {
            "name": "error_left",
            "expr": "1/0 != 0 && true",
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          },
          {
            "name": "no_overload",
            "expr": "'less filling' && 'tastes great'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "OR",
        "description": "Tests for logical OR",
        "test": [
          {
            "name": "all_true",
            "expr": "true || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "all_false",
            "expr": "false || false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "false_left",
            "expr": "false || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "false_right",
            "expr": "true || false",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "short_circuit_type_left",
            "expr": "true || 32",
            "disableCheck": true,
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "short_circuit_type_right",
            "expr": "'horses' || true",
            "disableCheck": true,
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "short_circuit_error_left",
            "expr": "true || (2 / 0 > 3 ? false : true)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "short_circuit_error_right",
            "expr": "(2 / 0 > 3 ? false : true) || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "error_right",
            "expr": "false || 1/0 != 0",
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          },
          {
            "name": "error_left",
            "expr": "1/0 != 0 || false",
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          },
          {
            "name": "no_overload",
            "expr": "'less filling' || 'tastes great'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "NOT",
        "description": "Tests for logical NOT.",
        "test": [
          {
            "name": "not_true",
            "expr": "!true",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "not_false",
            "expr": "!false",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "no_overload",
            "expr": "!0",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no matching overload"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "macros",
    "description": "Tests for CEL macros.",
    "section": [
      {
        "name": "exists",
        "description": "Tests for the .exists() macro, which is equivalent to joining the evaluated elements with logical-OR.",
        "test": [
          {
            "name": "list_elem_all_true",
            "expr": "[1, 2, 3].exists(e, e > 0)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_elem_some_true",
            "expr": "[1, 2, 3].exists(e, e == 2)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_elem_none_true",
            "expr": "[1, 2, 3].exists(e, e > 3)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_elem_type_shortcircuit",
            "description": "Exists filter is true for the last element.",
            "expr": "[1, 'foo', 3].exists(e, e != '1')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_elem_type_exhaustive",
            "description": "Exists filter is never true, but heterogenous equality ensure the result is false.",
            "expr": "[1, 'foo', 3].exists(e, e == '10')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_elem_exists_error",
            "expr": "[1, 2, 3].exists(e, e / 0 == 17)",
            "evalError": {
              "errors": [
                {
                  "message": "divide by zero"
                }
              ]
            }
          },
          {
            "name": "list_empty",
            "expr": "[].exists(e, e == 2)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_key",
            "expr": "{'key1':1, 'key2':2}.exists(k, k == 'key2')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_map_key",
            "expr": "!{'key1':1, 'key2':2}.exists(k, k == 'key3')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_key_type_shortcircuit",
            "description": "Exists filter is true for the second key",
            "expr": "{'key':1, 1:21}.exists(k, k != 2)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_key_type_exhaustive",
            "description": "Exists filter is never true, but heterogeneous equality ensures the result is false.",
            "expr": "!{'key':1, 1:42}.exists(k, k == 2)",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "all",
        "description": "Tests for the .all() macro, which is equivalent to joining the evaluated elements with logical-AND.",
        "test": [
          {
            "name": "list_elem_all_true",
            "expr": "[1, 2, 3].all(e, e > 0)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_elem_some_true",
            "expr": "[1, 2, 3].all(e, e == 2)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_elem_none_true",
            "expr": "[1, 2, 3].all(e, e == 17)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_elem_type_shortcircuit",
            "expr": "[1, 'foo', 3].all(e, e == 1)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_elem_type_exhaustive",
            "expr": "[1, 'foo', 3].all(e, e % 2 == 1)",
            "evalError": {
              "errors": [
                {
                  "message": "no_such_overload"
                }
              ]
            }
          },
          {
            "name": "list_elem_error_shortcircuit",
            "expr": "[1, 2, 3].all(e, 6 / (2 - e) == 6)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_elem_error_exhaustive",
            "expr": "[1, 2, 3].all(e, e / 0 != 17)",
            "evalError": {
              "errors": [
                {
                  "message": "divide by zero"
                }
              ]
            }
          },
          {
            "name": "list_empty",
            "expr": "[].all(e, e > 0)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_key",
            "expr": "{'key1':1, 'key2':2}.all(k, k == 'key2')",
            "value": {
              "boolValue": false
            }
          }
        ]
      },
      {
        "name": "exists_one",
        "description": "Tests for exists_one() macro. An expression 'L.exists_one(I, E)' is equivalent to 'size(L.filter(I, E)) == 1'.",
        "test": [
          {
            "name": "list_empty",
            "expr": "[].exists_one(a, a == 7)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_one_true",
            "expr": "[7].exists_one(a, a == 7)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_one_false",
            "expr": "[8].exists_one(a, a == 7)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_none",
            "expr": "[1, 2, 3].exists_one(x, x > 20)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_one",
            "expr": "[6, 7, 8].exists_one(foo, foo % 5 == 2)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "list_many",
            "expr": "[0, 1, 2, 3, 4].exists_one(n, n % 2 == 1)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_all",
            "expr": "['foal', 'foo', 'four'].exists_one(n, n.startsWith('fo'))",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_no_shortcircuit",
            "description": "Errors invalidate everything, even if already false.",
            "expr": "[3, 2, 1, 0].exists_one(n, 12 / n > 1)",
            "evalError": {
              "errors": [
                {
                  "message": "divide by zero"
                }
              ]
            }
          },
          {
            "name": "map_one",
            "expr": "{6: 'six', 7: 'seven', 8: 'eight'}.exists_one(foo, foo % 5 == 2)",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "map",
        "description": "Tests for map() macro.",
        "test": [
          {
            "name": "list_empty",
            "expr": "[].map(n, n / 2)",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "list_one",
            "expr": "[3].map(n, n * n)",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "9"
                  }
                ]
              }
            }
          },
          {
            "name": "list_many",
            "expr": "[2, 4, 6].map(n, n / 2)",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "1"
                  },
                  {
                    "int64Value": "2"
                  },
                  {
                    "int64Value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "list_error",
            "expr": "[2, 1, 0].map(n, 4 / n)",
            "evalError": {
              "errors": [
                {
                  "message": "divide by zero"
                }
              ]
            }
          },
          {
            "name": "map_extract_keys",
            "expr": "{'John': 'smart'}.map(key, key) == ['John']",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "filter",
        "description": "Tests for filter() macro.",
        "test": [
          {
            "name": "list_empty",
            "expr": "[].filter(n, n % 2 == 0)",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "list_one_true",
            "expr": "[2].filter(n, n == 2)",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "2"
                  }
                ]
              }
            }
          },
          {
            "name": "list_one_false",
            "expr": "[1].filter(n, n > 3)",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "list_none",
            "expr": "[1, 2, 3].filter(e, e > 3)",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "list_some",
            "expr": "[0, 1, 2, 3, 4].filter(x, x % 2 == 1)",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "1"
                  },
                  {
                    "int64Value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "list_all",
            "expr": "[1, 2, 3].filter(n, n > 0)",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "1"
                  },
                  {
                    "int64Value": "2"
                  },
                  {
                    "int64Value": "3"
                  }
                ]
              }
            }
          },
          {
            "name": "list_no_shortcircuit",
            "expr": "[3, 2, 1, 0].filter(n, 12 / n > 4)",
            "evalError": {
              "errors": [
                {
                  "message": "divide by zero"
                }
              ]
            }
          },
          {
            "name": "map_filter_keys",
            "expr": "{'John': 'smart', 'Paul': 'cute', 'George': 'quiet', 'Ringo': 'funny'}.filter(key, key == 'Ringo') == ['Ringo']",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "nested",
        "description": "Tests with nested macros.",
        "test": [
          {
            "name": "filter_all",
            "expr": "['signer'].filter(signer, ['artifact'].all(artifact, true))",
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "signer"
                  }
                ]
              }
            }
          },
          {
            "name": "all_all",
            "expr": "['signer'].all(signer, ['artifact'].all(artifact, true))",
            "value": {
              "boolValue": true
            }
          }
        ]
      }
    ]
  },
  {
    "name": "math_ext",
    "description": "Tests for the math extension library.",
    "section": [
      {
        "name": "greatest_int_result",
        "test": [
          {
            "name": "unary_negative",
            "expr": "math.greatest(-5)",
            "value": {
              "int64Value": "-5"
            }
          },
          {
            "name": "unary_positive",
            "expr": "math.greatest(5)",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "binary_same_args",
            "expr": "math.greatest(1, 1)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "binary_with_decimal",
            "expr": "math.greatest(1, 1.0) == 1"
          },
          {
            "name": "binary_with_uint",
            "expr": "math.greatest(1, 1u) == 1"
          },
          {
            "name": "binary_first_arg_greater",
            "expr": "math.greatest(3, -3)",
            "value": {
              "int64Value": "3"
            }
          },
          {
            "name": "binary_second_arg_greater",
            "expr": "math.greatest(-7, 5)",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "binary_first_arg_int_max",
            "expr": "math.greatest(9223372036854775807, 1)",
            "value": {
              "int64Value": "9223372036854775807"
            }
          },
          {
            "name": "binary_second_arg_int_max",
            "expr": "math.greatest(1, 9223372036854775807)",
            "value": {
              "int64Value": "9223372036854775807"
            }
          },
          {
            "name": "binary_first_arg_int_min",
            "expr": "math.greatest(-9223372036854775808, 1)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "binary_second_arg_int_min",
            "expr": "math.greatest(1, -9223372036854775808)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "ternary_same_args",
            "expr": "math.greatest(1, 1, 1) == 1"
          },
          {
            "name": "ternary_with_decimal",
            "expr": "math.greatest(1, 1.0, 1.0) == 1"
          },
          {
            "name": "ternary_with_uint",
            "expr": "math.greatest(1, 1u, 1u) == 1"
          },
          {
            "name": "ternary_first_arg_greatest",
            "expr": "math.greatest(10, 1, 3) == 10"
          },
          {
            "name": "ternary_third_arg_greatest",
            "expr": "math.greatest(1, 3, 10) == 10"
          },
          {
            "name": "ternary_with_negatives",
            "expr": "math.greatest(-1, -2, -3) == -1"
          },
          {
            "name": "ternary_int_max",
            "expr": "math.greatest(9223372036854775807, 1, 5) == 9223372036854775807"
          },
          {
            "name": "ternary_int_min",
            "expr": "math.greatest(-9223372036854775807, -1, -5) == -1"
          },
          {
            "name": "quaternary_mixed",
            "expr": "math.greatest(5.4, 10, 3u, -5.0, 9223372036854775807) == 9223372036854775807"
          },
          {
            "name": "quaternary_mixed_array",
            "expr": "math.greatest([5.4, 10, 3u, -5.0, 3.5]) == 10"
          },
          {
            "name": "quaternary_mixed_dyn_array",
            "expr": "math.greatest([dyn(5.4), dyn(10), dyn(3u), dyn(-5.0), dyn(3.5)]) == 10"
          }
        ]
      },
      {
        "name": "greatest_double_result",
        "test": [
          {
            "name": "unary_negative",
            "expr": "math.greatest(-5.0)",
            "value": {
              "doubleValue": -5
            }
          },
          {
            "name": "unary_positive",
            "expr": "math.greatest(5.0)",
            "value": {
              "doubleValue": 5
            }
          },
          {
            "name": "binary_same_args",
            "expr": "math.greatest(1.0, 1.0)",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "binary_with_int",
            "expr": "math.greatest(1.0, 1) == 1.0"
          },
          {
            "name": "binary_with_uint",
            "expr": "math.greatest(1.0, 1u) == 1.0"
          },
          {
            "name": "binary_first_arg_greater",
            "expr": "math.greatest(5.0, -7.0)",
            "value": {
              "doubleValue": 5
            }
          },
          {
            "name": "binary_second_arg_greater",
            "expr": "math.greatest(-3.0, 3.0)",
            "value": {
              "doubleValue": 3
            }
          },
          {
            "name": "binary_first_arg_double_max",
            "expr": "math.greatest(1.797693e308, 1)",
            "value": {
              "doubleValue": 1.797693e+308
            }
          },
          {
            "name": "binary_second_arg_double_max",
            "expr": "math.greatest(1, 1.797693e308)",
            "value": {
              "doubleValue": 1.797693e+308
            }
          },
          {
            "name": "binary_first_arg_double_min",
            "expr": "math.greatest(-1.797693e308, 1.5)",
            "value": {
              "doubleValue": 1.5
            }
          },
          {
            "name": "binary_second_arg_double_min",
            "expr": "math.greatest(1.5, -1.797693e308)",
            "value": {
              "doubleValue": 1.5
            }
          },
          {
            "name": "ternary_same_args",
            "expr": "math.greatest(1.0, 1.0, 1.0) == 1.0"
          },
          {
            "name": "ternary_with_int",
            "expr": "math.greatest(1.0, 1, 1) == 1.0"
          },
          {
            "name": "ternary_with_uint",
            "expr": "math.greatest(1.0, 1u, 1u) == 1.0"
          },
          {
            "name": "ternary_first_arg_greatest",
            "expr": "math.greatest(10.5, 1.5, 3.5) == 10.5"
          },
          {
            "name": "ternary_third_arg_greatest",
            "expr": "math.greatest(1.5, 3.5, 10.5) == 10.5"
          },
          {
            "name": "ternary_with_negatives",
            "expr": "math.greatest(-1.5, -2.5, -3.5) == -1.5"
          },
          {
            "name": "ternary_double_max",
            "expr": "math.greatest(1.797693e308, 1, 5) == 1.797693e308"
          },
          {
            "name": "ternary_double_min",
            "expr": "math.greatest(-1.797693e308, -1, -5) == -1"
          },
          {
            "name": "quaternary_mixed",
            "expr": "math.greatest(5.4, 10, 3u, -5.0, 1.797693e308) == 1.797693e308"
          },
          {
            "name": "quaternary_mixed_array",
            "expr": "math.greatest([5.4, 10.5, 3u, -5.0, 3.5]) == 10.5"
          },
          {
            "name": "quaternary_mixed_dyn_array",
            "expr": "math.greatest([dyn(5.4), dyn(10.5), dyn(3u), dyn(-5.0), dyn(3.5)]) == 10.5"
          }
        ]
      },
      {
        "name": "greatest_uint_result",
        "test": [
          {
            "name": "unary",
            "expr": "math.greatest(5u)",
            "value": {
              "uint64Value": "5"
            }
          },
          {
            "name": "binary_same_args",
            "expr": "math.greatest(1u, 1u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "binary_with_decimal",
            "expr": "math.greatest(1u, 1.0) == 1"
          },
          {
            "name": "binary_with_int",
            "expr": "math.greatest(1u, 1) == 1u"
          },
          {
            "name": "binary_first_arg_greater",
            "expr": "math.greatest(5u, -7)",
            "value": {
              "uint64Value": "5"
            }
          },
          {
            "name": "binary_second_arg_greater",
            "expr": "math.greatest(-3, 3u)",
            "value": {
              "uint64Value": "3"
            }
          },
          {
            "name": "binary_first_arg_uint_max",
            "expr": "math.greatest(18446744073709551615u, 1u)",
            "value": {
              "uint64Value": "18446744073709551615"
            }
          },
          {
            "name": "binary_second_arg_uint_max",
            "expr": "math.greatest(1u, 18446744073709551615u)",
            "value": {
              "uint64Value": "18446744073709551615"
            }
          },
          {
            "name": "ternary_same_args",
            "expr": "math.greatest(1u, 1u, 1u) == 1u"
          },
          {
            "name": "ternary_with_decimal",
            "expr": "math.greatest(1u, 1.0, 1.0) == 1u"
          },
          {
            "name": "ternary_with_int",
            "expr": "math.greatest(1u, 1, 1) == 1u"
          },
          {
            "name": "ternary_first_arg_greatest",
            "expr": "math.greatest(10u, 1u, 3u) == 10u"
          },
          {
            "name": "ternary_third_arg_greatest",
            "expr": "math.greatest(1u, 3u, 10u) == 10u"
          },
          {
            "name": "ternary_int_max",
            "expr": "math.greatest(18446744073709551615u, 1u, 5u) == 18446744073709551615u"
          },
          {
            "name": "quaternary_mixed",
            "expr": "math.greatest(5.4, 10, 3u, -5.0, 18446744073709551615u) == 18446744073709551615u"
          },
          {
            "name": "quaternary_mixed_array",
            "expr": "math.greatest([5.4, 10u, 3u, -5.0, 3.5]) == 10u"
          },
          {
            "name": "quaternary_mixed_dyn_array",
            "expr": "math.greatest([dyn(5.4), dyn(10u), dyn(3u), dyn(-5.0), dyn(3.5)]) == 10u"
          }
        ]
      },
      {
        "name": "least_int_result",
        "test": [
          {
            "name": "unary_negative",
            "expr": "math.least(-5)",
            "value": {
              "int64Value": "-5"
            }
          },
          {
            "name": "unary_positive",
            "expr": "math.least(5)",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "binary_same_args",
            "expr": "math.least(1, 1)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "binary_with_decimal",
            "expr": "math.least(1, 1.0) == 1"
          },
          {
            "name": "binary_with_uint",
            "expr": "math.least(1, 1u) == 1"
          },
          {
            "name": "binary_first_arg_least",
            "expr": "math.least(-3, 3)",
            "value": {
              "int64Value": "-3"
            }
          },
          {
            "name": "binary_second_arg_least",
            "expr": "math.least(5, -7)",
            "value": {
              "int64Value": "-7"
            }
          },
          {
            "name": "binary_first_arg_int_max",
            "expr": "math.least(9223372036854775807, 1)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "binary_second_arg_int_max",
            "expr": "math.least(1, 9223372036854775807)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "binary_first_arg_int_min",
            "expr": "math.least(-9223372036854775808, 1)",
            "value": {
              "int64Value": "-9223372036854775808"
            }
          },
          {
            "name": "binary_second_arg_int_min",
            "expr": "math.least(1, -9223372036854775808)",
            "value": {
              "int64Value": "-9223372036854775808"
            }
          },
          {
            "name": "ternary_same_args",
            "expr": "math.least(1, 1, 1) == 1"
          },
          {
            "name": "ternary_with_decimal",
            "expr": "math.least(1, 1.0, 1.0) == 1"
          },
          {
            "name": "ternary_with_uint",
            "expr": "math.least(1, 1u, 1u) == 1"
          },
          {
            "name": "ternary_first_arg_least",
            "expr": "math.least(0, 1, 3) == 0"
          },
          {
            "name": "ternary_third_arg_least",
            "expr": "math.least(1, 3, 0) == 0"
          },
          {
            "name": "ternary_with_negatives",
            "expr": "math.least(-1, -2, -3) == -3"
          },
          {
            "name": "ternary_int_max",
            "expr": "math.least(9223372036854775807, 1, 5) == 1"
          },
          {
            "name": "ternary_int_min",
            "expr": "math.least(-9223372036854775808, -1, -5) == -9223372036854775808"
          },
          {
            "name": "quaternary_mixed",
            "expr": "math.least(5.4, 10, 3u, -5.0, 9223372036854775807) == -5.0"
          },
          {
            "name": "quaternary_mixed_array",
            "expr": "math.least([5.4, 10, 3u, -5.0, 3.5]) == -5.0"
          },
          {
            "name": "quaternary_mixed_dyn_array",
            "expr": "math.least([dyn(5.4), dyn(10), dyn(3u), dyn(-5.0), dyn(3.5)]) == -5.0"
          }
        ]
      },
      {
        "name": "least_double_result",
        "test": [
          {
            "name": "unary_negative",
            "expr": "math.least(-5.5)",
            "value": {
              "doubleValue": -5.5
            }
          },
          {
            "name": "unary_positive",
            "expr": "math.least(5.5)",
            "value": {
              "doubleValue": 5.5
            }
          },
          {
            "name": "binary_same_args",
            "expr": "math.least(1.5, 1.5)",
            "value": {
              "doubleValue": 1.5
            }
          },
          {
            "name": "binary_with_int",
            "expr": "math.least(1.0, 1) == 1"
          },
          {
            "name": "binary_with_uint",
            "expr": "math.least(1, 1u) == 1"
          },
          {
            "name": "binary_first_arg_least",
            "expr": "math.least(-3.5, 3.5)",
            "value": {
              "doubleValue": -3.5
            }
          },
          {
            "name": "binary_second_arg_least",
            "expr": "math.least(5.5, -7.5)",
            "value": {
              "doubleValue": -7.5
            }
          },
          {
            "name": "binary_first_arg_double_max",
            "expr": "math.least(1.797693e308, 1.5)",
            "value": {
              "doubleValue": 1.5
            }
          },
          {
            "name": "binary_second_arg_double_max",
            "expr": "math.least(1.5, 1.797693e308)",
            "value": {
              "doubleValue": 1.5
            }
          },
          {
            "name": "binary_first_arg_double_min",
            "expr": "math.least(-1.797693e308, 1.5)",
            "value": {
              "doubleValue": -1.797693e+308
            }
          },
          {
            "name": "binary_second_arg_double_min",
            "expr": "math.least(1.5, -1.797693e308)",
            "value": {
              "doubleValue": -1.797693e+308
            }
          },
          {
            "name": "ternary_same_args",
            "expr": "math.least(1.5, 1.5, 1.5) == 1.5"
          },
          {
            "name": "ternary_with_int",
            "expr": "math.least(1.0, 1, 1) == 1.0"
          },
          {
            "name": "ternary_with_uint",
            "expr": "math.least(1.0, 1u, 1u) == 1"
          },
          {
            "name": "ternary_first_arg_least",
            "expr": "math.least(0.5, 1.5, 3.5) == 0.5"
          },
          {
            "name": "ternary_third_arg_least",
            "expr": "math.least(1.5, 3.5, 0.5) == 0.5"
          },
          {
            "name": "ternary_with_negatives",
            "expr": "math.least(-1.5, -2.5, -3.5) == -3.5"
          },
          {
            "name": "ternary_double_max",
            "expr": "math.least(1.797693e308, 1, 5) == 1"
          },
          {
            "name": "ternary_double_min",
            "expr": "math.least(-1.797693e308, -1, -5) == -1.797693e308"
          },
          {
            "name": "quaternary_mixed",
            "expr": "math.least(5.4, 10, 3u, -5.0, 1.797693e308) == -5.0"
          },
          {
            "name": "quaternary_mixed_array",
            "expr": "math.least([5.4, 10.5, 3u, -5.0, 3.5]) == -5.0"
          },
          {
            "name": "quaternary_mixed_dyn_array",
            "expr": "math.least([dyn(5.4), dyn(10.5), dyn(3u), dyn(-5.0), dyn(3.5)]) == -5.0"
          }
        ]
      },
      {
        "name": "least_uint_result",
        "test": [
          {
            "name": "unary",
            "expr": "math.least(5u)",
            "value": {
              "uint64Value": "5"
            }
          },
          {
            "name": "binary_same_args",
            "expr": "math.least(1u, 1u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "binary_with_decimal",
            "expr": "math.least(1u, 1.0) == 1u"
          },
          {
            "name": "binary_with_int",
            "expr": "math.least(1u, 1) == 1u"
          },
          {
            "name": "binary_first_arg_least",
            "expr": "math.least(1u, 3u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "binary_second_arg_least",
            "expr": "math.least(5u, 2u)",
            "value": {
              "uint64Value": "2"
            }
          },
          {
            "name": "binary_first_arg_uint_max",
            "expr": "math.least(18446744073709551615u, 1u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "binary_second_arg_uint_max",
            "expr": "math.least(1u, 18446744073709551615u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "ternary_same_args",
            "expr": "math.least(1u, 1u, 1u) == 1u"
          },
          {
            "name": "ternary_with_decimal",
            "expr": "math.least(1u, 1.0, 1.0) == 1u"
          },
          {
            "name": "ternary_with_int",
            "expr": "math.least(1u, 1, 1) == 1u"
          },
          {
            "name": "ternary_first_arg_least",
            "expr": "math.least(1u, 10u, 3u) == 1u"
          },
          {
            "name": "ternary_third_arg_least",
            "expr": "math.least(10u, 3u, 1u) == 1u"
          },
          {
            "name": "ternary_uint_max",
            "expr": "math.least(18446744073709551615u, 1u, 5u) == 1u"
          },
          {
            "name": "quaternary_mixed",
            "expr": "math.least(5.4, 10, 3u, 1u, 18446744073709551615u) == 1u"
          },
          {
            "name": "quaternary_mixed_array",
            "expr": "math.least([5.4, 10u, 3u, 1u, 3.5]) == 1u"
          },
          {
            "name": "quaternary_mixed_dyn_array",
            "expr": "math.least([dyn(5.4), dyn(10u), dyn(3u), dyn(1u), dyn(3.5)]) == 1u"
          }
        ]
      },
      {
        "name": "ceil",
        "test": [
          {
            "name": "negative",
            "expr": "math.ceil(-1.2)",
            "value": {
              "doubleValue": -1
            }
          },
          {
            "name": "positive",
            "expr": "math.ceil(1.2)",
            "value": {
              "doubleValue": 2
            }
          },
          {
            "name": "dyn_error",
            "expr": "math.ceil(dyn(1))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "floor",
        "test": [
          {
            "name": "negative",
            "expr": "math.floor(-1.2)",
            "value": {
              "doubleValue": -2
            }
          },
          {
            "name": "positive",
            "expr": "math.floor(1.2)",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "dyn_error",
            "expr": "math.floor(dyn(1))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "round",
        "test": [
          {
            "name": "negative_down",
            "expr": "math.round(-1.6)",
            "value": {
              "doubleValue": -2
            }
          },
          {
            "name": "negative_up",
            "expr": "math.round(-1.4)",
            "value": {
              "doubleValue": -1
            }
          },
          {
            "name": "negative_mid",
            "expr": "math.round(-1.5)",
            "value": {
              "doubleValue": -2
            }
          },
          {
            "name": "positive_down",
            "expr": "math.round(1.2)",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "positive_up",
            "expr": "math.round(1.5)",
            "value": {
              "doubleValue": 2
            }
          },
          {
            "name": "nan",
            "expr": "math.isNaN(math.round(0.0/0.0))"
          },
          {
            "name": "dyn_error",
            "expr": "math.round(dyn(1))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "trunc",
        "test": [
          {
            "name": "negative",
            "expr": "math.trunc(-1.2)",
            "value": {
              "doubleValue": -1
            }
          },
          {
            "name": "positive",
            "expr": "math.trunc(1.2)",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "nan",
            "expr": "math.isNaN(math.trunc(0.0/0.0))"
          },
          {
            "name": "dyn_error",
            "expr": "math.trunc(dyn(1))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "abs",
        "test": [
          {
            "name": "uint",
            "expr": "math.abs(1u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "positive_int",
            "expr": "math.abs(1)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "negative_int",
            "expr": "math.abs(-11)",
            "value": {
              "int64Value": "11"
            }
          },
          {
            "name": "positive_double",
            "expr": "math.abs(1.5)",
            "value": {
              "doubleValue": 1.5
            }
          },
          {
            "name": "negative_double",
            "expr": "math.abs(-11.5)",
            "value": {
              "doubleValue": 11.5
            }
          },
          {
            "name": "int_overflow",
            "expr": "math.abs(-9223372036854775808)",
            "evalError": {
              "errors": [
                {
                  "message": "overflow"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "sign",
        "test": [
          {
            "name": "positive_uint",
            "expr": "math.sign(100u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "zero_uint",
            "expr": "math.sign(0u)",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "positive_int",
            "expr": "math.sign(100)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "negative_int",
            "expr": "math.sign(-11)",
            "value": {
              "int64Value": "-1"
            }
          },
          {
            "name": "zero_int",
            "expr": "math.sign(0)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "positive_double",
            "expr": "math.sign(100.5)",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "negative_double",
            "expr": "math.sign(-32.0)",
            "value": {
              "doubleValue": -1
            }
          },
          {
            "name": "zero_double",
            "expr": "math.sign(0.0)",
            "value": {
              "doubleValue": 0
            }
          },
          {
            "name": "dyn_error",
            "expr": "math.sign(dyn(true))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "isNaN",
        "test": [
          {
            "name": "true",
            "expr": "math.isNaN(0.0/0.0)"
          },
          {
            "name": "false",
            "expr": "!math.isNaN(1.0/0.0)"
          },
          {
            "name": "dyn_error",
            "expr": "math.isNaN(dyn(true))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "isInf",
        "test": [
          {
            "name": "true",
            "expr": "math.isInf(1.0/0.0)"
          },
          {
            "name": "false",
            "expr": "!math.isInf(0.0/0.0)"
          },
          {
            "name": "dyn_error",
            "expr": "math.isInf(dyn(true))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "isFinite",
        "test": [
          {
            "name": "true",
            "expr": "math.isFinite(1.0/1.5)"
          },
          {
            "name": "false_nan",
            "expr": "!math.isFinite(0.0/0.0)"
          },
          {
            "name": "false_inf",
            "expr": "!math.isFinite(-1.0/0.0)"
          },
          {
            "name": "dyn_error",
            "expr": "math.isFinite(dyn(true))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "bit_and",
        "test": [
          {
            "name": "int_int_non_intersect",
            "expr": "math.bitAnd(1, 2)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "int_int_intersect",
            "expr": "math.bitAnd(1, 3)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "int_int_intersect_neg",
            "expr": "math.bitAnd(1, -1)",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "uint_uint_non_intersect",
            "expr": "math.bitAnd(1u, 2u)",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "uint_uint_intersect",
            "expr": "math.bitAnd(1u, 3u)",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "int_dyn_error",
            "expr": "math.bitAnd(2u, dyn(''))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "bit_or",
        "test": [
          {
            "name": "int_int_positive",
            "expr": "math.bitOr(1, 2)",
            "value": {
              "int64Value": "3"
            }
          },
          {
            "name": "int_int_positive_negative",
            "expr": "math.bitOr(4, -2)",
            "value": {
              "int64Value": "-2"
            }
          },
          {
            "name": "uint_uint",
            "expr": "math.bitOr(1u, 4u)",
            "value": {
              "uint64Value": "5"
            }
          },
          {
            "name": "dyn_int_error",
            "expr": "math.bitOr(dyn(1.2), 1)",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "bit_xor",
        "test": [
          {
            "name": "int_int_positive",
            "expr": "math.bitXor(1, 3)",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "int_int_positive_negative",
            "expr": "math.bitXor(4, -2)",
            "value": {
              "int64Value": "-6"
            }
          },
          {
            "name": "uint_uint",
            "expr": "math.bitXor(1u, 3u)",
            "value": {
              "uint64Value": "2"
            }
          },
          {
            "name": "dyn_dyn_error",
            "expr": "math.bitXor(dyn([]), dyn([1]))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "bit_not",
        "test": [
          {
            "name": "int_positive",
            "expr": "math.bitNot(1)",
            "value": {
              "int64Value": "-2"
            }
          },
          {
            "name": "int_negative",
            "expr": "math.bitNot(-1)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "int_zero",
            "expr": "math.bitNot(0)",
            "value": {
              "int64Value": "-1"
            }
          },
          {
            "name": "uint_positive",
            "expr": "math.bitNot(1u)",
            "value": {
              "uint64Value": "18446744073709551614"
            }
          },
          {
            "name": "uint_zero",
            "expr": "math.bitNot(0u)",
            "value": {
              "uint64Value": "18446744073709551615"
            }
          },
          {
            "name": "dyn_error",
            "expr": "math.bitNot(dyn(''))",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "bit_shift_left",
        "test": [
          {
            "name": "int",
            "expr": "math.bitShiftLeft(1, 2)",
            "value": {
              "int64Value": "4"
            }
          },
          {
            "name": "int_large_shift",
            "expr": "math.bitShiftLeft(1, 200)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "int_negative_large_shift",
            "expr": "math.bitShiftLeft(-1, 200)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "uint",
            "expr": "math.bitShiftLeft(1u, 2)",
            "value": {
              "uint64Value": "4"
            }
          },
          {
            "name": "uint_large_shift",
            "expr": "math.bitShiftLeft(1u, 200)",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "bad_shift",
            "expr": "math.bitShiftLeft(1u, -1)",
            "evalError": {
              "errors": [
                {
                  "message": "negative offset"
                }
              ]
            }
          },
          {
            "name": "dyn_int_error",
            "expr": "math.bitShiftLeft(dyn(4.3), 1)",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "bit_shift_right",
        "test": [
          {
            "name": "int",
            "expr": "math.bitShiftRight(1024, 2)",
            "value": {
              "int64Value": "256"
            }
          },
          {
            "name": "int_large_shift",
            "expr": "math.bitShiftRight(1024, 64)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "int_negative",
            "expr": "math.bitShiftRight(-1024, 3)",
            "value": {
              "int64Value": "2305843009213693824"
            }
          },
          {
            "name": "int_negative_large_shift",
            "expr": "math.bitShiftRight(-1024, 64)",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "uint",
            "expr": "math.bitShiftRight(1024u, 2)",
            "value": {
              "uint64Value": "256"
            }
          },
          {
            "name": "uint_large_shift",
            "expr": "math.bitShiftRight(1024u, 200)",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "bad_shift",
            "expr": "math.bitShiftRight(1u, -1)",
            "evalError": {
              "errors": [
                {
                  "message": "negative offset"
                }
              ]
            }
          },
          {
            "name": "dyn_int_error",
            "expr": "math.bitShiftRight(dyn(b'123'), 1)",
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "namespace",
    "description": "Uses of qualified identifiers and namespaces.",
    "section": [
      {
        "name": "qualified",
        "description": "Qualified variable lookups.",
        "test": [
          {
            "name": "self_eval_qualified_lookup",
            "expr": "x.y",
            "typeEnv": [
              {
                "name": "x.y",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              }
            ],
            "bindings": {
              "x.y": {
                "value": {
                  "boolValue": true
                }
              }
            },
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "namespace",
        "description": "Namespaced identifiers.",
        "test": [
          {
            "name": "self_eval_container_lookup",
            "expr": "y",
            "typeEnv": [
              {
                "name": "x.y",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              },
              {
                "name": "y",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "container": "x",
            "bindings": {
              "x.y": {
                "value": {
                  "boolValue": true
                }
              },
              "y": {
                "value": {
                  "stringValue": "false"
                }
              }
            },
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "self_eval_container_lookup_unchecked",
            "expr": "y",
            "disableCheck": true,
            "typeEnv": [
              {
                "name": "x.y",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              },
              {
                "name": "y",
                "ident": {
                  "type": {
                    "primitive": "BOOL"
                  }
                }
              }
            ],
            "container": "x",
            "bindings": {
              "x.y": {
                "value": {
                  "boolValue": true
                }
              },
              "y": {
                "value": {
                  "boolValue": false
                }
              }
            },
            "value": {
              "boolValue": true
            }
          }
        ]
      }
    ]
  },
  {
    "name": "optionals",
    "description": "Tests for optionals.",
    "section": [
      {
        "name": "optionals",
        "test": [
          {
            "name": "null",
            "expr": "optional.of(null).hasValue()",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "null_non_zero_value",
            "expr": "optional.ofNonZeroValue(null).hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "none_or_none_or_value",
            "expr": "optional.none().or(optional.none()).orValue(42)",
            "value": {
              "int64Value": "42"
            }
          },
          {
            "name": "none_optMap_hasValue",
            "expr": "optional.none().optMap(y, y + 1).hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_map_optFlatMap_hasValue",
            "expr": "{}.?key.optFlatMap(k, k.?subkey).hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_empty_submap_optFlatMap_hasValue",
            "expr": "{'key': {}}.?key.optFlatMap(k, k.?subkey).hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_null_entry_hasValue",
            "expr": "{'null_key': dyn(null)}.?null_key.hasValue()",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_null_entry_no_such_key",
            "expr": "{'null_key': dyn(null)}.?null_key.invalid.hasValue()",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_absent_key_absent_field_none",
            "expr": "{true: dyn(0)}[?false].absent.hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_present_key_invalid_field",
            "expr": "{true: dyn(0)}[?true].absent.hasValue()",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "map_undefined_entry_hasValue",
            "expr": "{}.?null_key.invalid.hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_submap_subkey_optFlatMap_value",
            "expr": "{'key': {'subkey': 'subvalue'}}.?key.optFlatMap(k, k.?subkey).value()",
            "value": {
              "stringValue": "subvalue"
            }
          },
          {
            "name": "map_submap_optFlatMap_value",
            "expr": "{'key': {'subkey': ''}}.?key.optFlatMap(k, k.?subkey).value()",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "map_optindex_optFlatMap_optional_ofNonZeroValue_hasValue",
            "expr": "{'key': {'subkey': ''}}.?key.optFlatMap(k, optional.ofNonZeroValue(k.subkey)).hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_of_optMap_value",
            "expr": "optional.of(42).optMap(y, y + 1).value()",
            "value": {
              "int64Value": "43"
            }
          },
          {
            "name": "optional_ofNonZeroValue_or_optional_value",
            "expr": "optional.ofNonZeroValue(42).or(optional.of(20)).value() == 42",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "ternary_optional_hasValue",
            "expr": "(has({}.x) ? optional.of({}.x) : optional.none()).hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_optindex_hasValue",
            "expr": "{}.?x.hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "has_map_optindex",
            "expr": "has({}.?x.y)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "has_map_optindex_field",
            "expr": "has({'x': {'y': 'z'}}.?x.y)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "type",
            "expr": "type(optional.none()) == optional_type",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_chaining_1",
            "expr": "optional.ofNonZeroValue('').or(optional.of({'c': {'dashed-index': 'goodbye'}}.c['dashed-index'])).orValue('default value')",
            "value": {
              "stringValue": "goodbye"
            }
          },
          {
            "name": "optional_chaining_2",
            "expr": "{'c': {'dashed-index': 'goodbye'}}.c[?'dashed-index'].orValue('default value')",
            "value": {
              "stringValue": "goodbye"
            }
          },
          {
            "name": "optional_chaining_3",
            "expr": "{'c': {}}.c[?'missing-index'].orValue('default value')",
            "value": {
              "stringValue": "default value"
            }
          },
          {
            "name": "optional_chaining_4",
            "expr": "optional.of({'c': {'index': 'goodbye'}}).c.index.orValue('default value')",
            "value": {
              "stringValue": "goodbye"
            }
          },
          {
            "name": "optional_chaining_5",
            "expr": "optional.of({'c': {}}).c.missing.or(optional.none()[0]).orValue('default value')",
            "value": {
              "stringValue": "default value"
            }
          },
          {
            "name": "optional_chaining_6",
            "expr": "optional.of({'c': {}}).c.missing.or(optional.of(['list-value'])[0]).orValue('default value')",
            "value": {
              "stringValue": "list-value"
            }
          },
          {
            "name": "optional_chaining_7",
            "expr": "optional.of({'c': {'index': 'goodbye'}}).c['index'].orValue('default value')",
            "value": {
              "stringValue": "goodbye"
            }
          },
          {
            "name": "optional_chaining_8",
            "expr": "optional.of({'c': {}}).c['missing'].orValue('default value')",
            "value": {
              "stringValue": "default value"
            }
          },
          {
            "name": "optional_chaining_9",
            "expr": "has(optional.of({'c': {'entry': 'hello world'}}).c) && !has(optional.of({'c': {'entry': 'hello world'}}).c.missing)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_chaining_10",
            "expr": "optional.ofNonZeroValue({'c': {'dashed-index': 'goodbye'}}.a.z).orValue({'c': {'dashed-index': 'goodbye'}}.c['dashed-index'])",
            "evalError": {
              "errors": [
                {
                  "message": "no such key"
                }
              ]
            }
          },
          {
            "name": "optional_chaining_11",
            "expr": "{'c': {'dashed-index': 'goodbye'}}.?c.missing.or({'c': {'dashed-index': 'goodbye'}}.?c['dashed-index']).orValue('').size()",
            "value": {
              "int64Value": "7"
            }
          },
          {
            "name": "optional_chaining_12",
            "expr": "{?'nested_map': optional.ofNonZeroValue({?'map': {'c': {'dashed-index': 'goodbye'}}.?c})}",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "nested_map"
                    },
                    "value": {
                      "mapValue": {
                        "entries": [
                          {
                            "key": {
                              "stringValue": "map"
                            },
                            "value": {
                              "mapValue": {
                                "entries": [
                                  {
                                    "key": {
                                      "stringValue": "dashed-index"
                                    },
                                    "value": {
                                      "stringValue": "goodbye"
                                    }
                                  }
                                ]
                              }
                            }
                          }
                        ]
                      }
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "optional_chaining_13",
            "expr": "{?'nested_map': optional.ofNonZeroValue({?'map': {}.?c}), 'singleton': true}",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "singleton"
                    },
                    "value": {
                      "boolValue": true
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "optional_chaining_14",
            "expr": "[?{}.?c, ?optional.of(42), ?optional.none()]",
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "42"
                  }
                ]
              }
            }
          },
          {
            "name": "optional_chaining_15",
            "expr": "[?optional.ofNonZeroValue({'c': []}.?c.orValue(dyn({})))]",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "optional_chaining_16",
            "expr": "optional.ofNonZeroValue({?'nested_map': optional.ofNonZeroValue({?'map': optional.of({}).?c})}).hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "has_optional_ofNonZeroValue_struct_optional_ofNonZeroValue_map_optindex_field",
            "expr": "has(TestAllTypes{?single_double_wrapper: optional.ofNonZeroValue(0.0)}.single_double_wrapper)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_ofNonZeroValue_struct_optional_ofNonZeroValue_map_optindex_field",
            "expr": "optional.ofNonZeroValue(TestAllTypes{?single_double_wrapper: optional.ofNonZeroValue(0.0)}).hasValue()",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "struct_map_optindex_field",
            "expr": "TestAllTypes{?map_string_string: {'nested': {}}[?'nested']}.map_string_string",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "struct_optional_ofNonZeroValue_map_optindex_field",
            "expr": "TestAllTypes{?map_string_string: optional.ofNonZeroValue({'nested': {}}[?'nested'].orValue({}))}.map_string_string",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {}
            }
          },
          {
            "name": "struct_map_optindex_field_nested",
            "expr": "TestAllTypes{?map_string_string: {'nested': {'hello': 'world'}}[?'nested']}.map_string_string",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "hello"
                    },
                    "value": {
                      "stringValue": "world"
                    }
                  }
                ]
              }
            }
          },
          {
            "name": "struct_list_optindex_field",
            "expr": "TestAllTypes{repeated_string: ['greetings', ?{'nested': {'hello': 'world'}}.nested.?hello]}.repeated_string",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "greetings"
                  },
                  {
                    "stringValue": "world"
                  }
                ]
              }
            }
          },
          {
            "name": "optional_empty_map_optindex_hasValue",
            "expr": "optional.of({}).?c.hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_struct_optindex_hasValue",
            "expr": "TestAllTypes{}.?repeated_string.hasValue()",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_empty_struct_optindex_hasValue",
            "expr": "optional.of(TestAllTypes{}).?repeated_string.hasValue()",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_none_optselect_hasValue",
            "expr": "optional.none().?repeated_string.hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "struct_optindex_value",
            "expr": "TestAllTypes{repeated_string: ['foo']}.?repeated_string.value()",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "foo"
                  }
                ]
              }
            }
          },
          {
            "name": "optional_struct_optindex_value",
            "expr": "optional.of(TestAllTypes{repeated_string: ['foo']}).?repeated_string.value()",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {
                "values": [
                  {
                    "stringValue": "foo"
                  }
                ]
              }
            }
          },
          {
            "name": "optional_struct_optindex_index_value",
            "expr": "optional.of(TestAllTypes{repeated_string: ['foo']}).?repeated_string[0].value()",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "empty_list_optindex_hasValue",
            "expr": "[][?0].hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_empty_list_optindex_hasValue",
            "expr": "optional.of([])[?0].hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_none_optindex_hasValue",
            "expr": "optional.none()[?0].hasValue()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "list_optindex_value",
            "expr": "['foo'][?0].value()",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "optional_list_optindex_value",
            "expr": "optional.of(['foo'])[?0].value()",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "map_key_mixed_type_optindex_value",
            "expr": "{true: 1, 2: 2, 5u: 3}[?true].value()",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "map_key_mixed_numbers_double_key_optindex_value",
            "expr": "{1u: 1.0, 2: 2.0, 3u: 3.0}[?3.0].value()",
            "value": {
              "doubleValue": 3
            }
          },
          {
            "name": "map_key_mixed_numbers_uint_key_optindex_value",
            "expr": "{1u: 1.0, 2: 2.0, 3u: 3.0}[?2u].value()",
            "value": {
              "doubleValue": 2
            }
          },
          {
            "name": "map_key_mixed_numbers_int_key_optindex_value",
            "expr": "{1u: 1.0, 2: 2.0, 3u: 3.0}[?1].value()",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "optional_eq_none_none",
            "expr": "optional.none() == optional.none()",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_eq_none_int",
            "expr": "optional.none() == optional.of(1)",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_eq_int_none",
            "expr": "optional.of(1) == optional.none()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_eq_int_int",
            "expr": "optional.of(1) == optional.of(1)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_ne_none_none",
            "expr": "optional.none() != optional.none()",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_ne_none_int",
            "expr": "optional.none() != optional.of(1)",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_ne_int_none",
            "expr": "optional.of(1) != optional.none()",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_ne_int_int",
            "expr": "optional.of(1) != optional.of(1)",
            "value": {
              "boolValue": false
            }
          }
        ]
      }
    ]
  },
  {
    "name": "parse",
    "description": "End-to-end parsing tests.",
    "section": [
      {
        "name": "nest",
        "description": "Deep parse trees which all implementations must support.",
        "test": [
          {
            "name": "list_index",
            "description": "Member = Member '[' Expr ']'. Nested indices are supported up to 12 times.",
            "expr": "a[a[a[a[a[a[a[a[a[a[a[a[0]]]]]]]]]]]]",
            "typeEnv": [
              {
                "name": "a",
                "ident": {
                  "type": {
                    "listType": {
                      "elemType": {
                        "primitive": "INT64"
                      }
                    }
                  }
                }
              }
            ],
            "bindings": {
              "a": {
                "value": {
                  "listValue": {
                    "values": [
                      {
                        "int64Value": "0"
                      }
                    ]
                  }
                }
              }
            },
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "message_literal",
            "description": "Member = Member '{' [FieldInits] '}'. Nested messages supported up to 12 levels deep.",
            "expr": "NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{child: NestedTestAllTypes{payload: TestAllTypes{single_int64: 137}}}}}}}}}}}}.payload.single_int64",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "funcall",
            "description": "Primary = ['.'] IDENT ['(' [ExprList] ')']. Nested function calls supported up to 12 levels deep.",
            "expr": "int(uint(int(uint(int(uint(int(uint(int(uint(int(uint(7))))))))))))",
            "value": {
              "int64Value": "7"
            }
          },
          {
            "name": "list_literal",
            "description": "Primary = '[' [ExprList] ']'. Nested list literals up to 12 levels deep.",
            "expr": "size([[[[[[[[[[[[0]]]]]]]]]]]])",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "map_literal",
            "description": "Primary = '{' [MapInits] '}'. Nested map literals up to 12 levels deep.",
            "expr": "size({0: {0: {0: {0: {0: {0: {0: {0: {0: {0: {0: {0: 'foo'}}}}}}}}}}}})",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "parens",
            "description": "Primary = '(' Expr ')'",
            "expr": "((((((((((((((((((((((((((((((((7))))))))))))))))))))))))))))))))",
            "value": {
              "int64Value": "7"
            }
          }
        ]
      },
      {
        "name": "repeat",
        "description": "Repetitive parse trees which all implementations must support.",
        "test": [
          {
            "name": "conditional",
            "description": "Expr = ConditionalOr ['?' ConditionalOr ':' Expr]. Chained ternary operators up to 24 levels.",
            "expr": "true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : true ? true : false",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "or",
            "description": "ConditionalOr = [ConditionalOr '||'] ConditionalAnd. Logical OR statements with 32 conditions.",
            "expr": "false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || false || true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "and",
            "description": "ConditionalAnd = [ConditionalAnd '&&'] Relation. Logical AND statements with 32 conditions.",
            "expr": "true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && true && false",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "add_sub",
            "description": "Addition = [Addition ('+' | '-')] Multiplication. Addition operators are supported up to 24 times consecutively.",
            "expr": "3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3 - 3 + 3",
            "value": {
              "int64Value": "3"
            }
          },
          {
            "name": "mul_div",
            "description": "Multiplication = [Multiplication ('*' | '/' | '%')] Unary. Multiplication operators are supported up to 24 times consecutively.",
            "expr": "4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4 * 4 / 4",
            "value": {
              "int64Value": "4"
            }
          },
          {
            "name": "not",
            "description": "Unary = '!' {'!'} Member",
            "expr": "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!true",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "unary_neg",
            "description": "Unary = '-' {'-'} Member",
            "expr": "--------------------------------19",
            "value": {
              "int64Value": "19"
            }
          },
          {
            "name": "select",
            "description": "Member = Member '.' IDENT ['(' [ExprList] ')']. Selection is supported up to 12 times consecutively.",
            "expr": "NestedTestAllTypes{}.child.child.child.child.child.child.child.child.child.child.payload.single_int32",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "index",
            "description": "Member = Member '[' Expr ']'. Indexing is supported up to 12 times consecutively.",
            "expr": "[[[[[[[[[[[['foo']]]]]]]]]]]][0][0][0][0][0][0][0][0][0][0][0][0]",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "list_literal",
            "description": "Primary = '[' [ExprList] ']'. List literals with up to 32 elements.",
            "expr": "[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31][17]",
            "value": {
              "int64Value": "17"
            }
          },
          {
            "name": "map_literal",
            "description": "Primary = '{' [MapInits] '}'. Map literals with up to 32 entries.",
            "expr": "{0: 'zero', 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten', 11: 'eleven', 12: 'twelve', 13: 'thirteen', 14: 'fourteen', 15: 'fifteen', 16: 'sixteen', 17: 'seventeen', 18: 'eighteen', 19: 'nineteen', 20: 'twenty', 21: 'twenty-one', 22: 'twenty-two', 23: 'twenty-three', 24: 'twenty-four', 25: 'twenty-five', 26: 'twenty-six', 27: 'twenty-seven', 28: 'twenty-eight', 29: 'twenty-nine', 30: 'thirty', 31: 'thirty-one'}[17]",
            "value": {
              "stringValue": "seventeen"
            }
          },
          {
            "name": "message_literal",
            "description": "Member = Member '{' [FieldInits] '}'. Message literals with up to 32 fields.",
            "expr": "TestAllTypes{single_int32: 5, single_int64: 10, single_uint32: 15u, single_uint64: 20u, single_sint32: 25, single_sint64: 30, single_fixed32: 35u, single_fixed64: 40u, single_float: 45.0, single_double: 50.0, single_bool: true, single_string: 'sixty', single_bytes: b'sixty-five', single_value: 70.0, single_int64_wrapper: 75, single_int32_wrapper: 80, single_double_wrapper: 85.0, single_float_wrapper: 90.0, single_uint64_wrapper: 95u, single_uint32_wrapper: 100u, single_string_wrapper: 'one hundred five', single_bool_wrapper: true, repeated_int32: [115], repeated_int64: [120], repeated_uint32: [125u], repeated_uint64: [130u], repeated_sint32: [135], repeated_sint64: [140], repeated_fixed32: [145u], repeated_fixed64: [150u], repeated_sfixed32: [155], repeated_float: [160.0]}.single_sint64",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "30"
            }
          }
        ]
      }
    ]
  },
  {
    "name": "plumbing",
    "description": "Check that the ConformanceService server can accept all arguments and return all responses.",
    "section": [
      {
        "name": "min",
        "description": "Minimal programs.",
        "test": [
          {
            "name": "min_program",
            "description": "Smallest functionality: expr in, result out.",
            "expr": "17",
            "value": {
              "int64Value": "17"
            }
          }
        ]
      },
      {
        "name": "eval_results",
        "description": "All evaluation result kinds.",
        "test": [
          {
            "name": "error_result",
            "description": "Check that error results go through.",
            "expr": "1 / 0",
            "evalError": {
              "errors": [
                {
                  "message": "foo"
                }
              ]
            }
          },
          {
            "name": "eval_map_results",
            "description": "Check that map literals results are order independent.",
            "expr": "{\"k1\":\"v1\",\"k\":\"v\"}",
            "value": {
              "mapValue": {
                "entries": [
                  {
                    "key": {
                      "stringValue": "k"
                    },
                    "value": {
                      "stringValue": "v"
                    }
                  },
                  {
                    "key": {
                      "stringValue": "k1"
                    },
                    "value": {
                      "stringValue": "v1"
                    }
                  }
                ]
              }
            }
          }
        ]
      },
      {
        "name": "check_inputs",
        "description": "All inputs to Check phase.",
        "test": [
          {
            "name": "skip_check",
            "description": "Make sure we can skip type checking.",
            "expr": "[17, 'pancakes']",
            "disableCheck": true,
            "value": {
              "listValue": {
                "values": [
                  {
                    "int64Value": "17"
                  },
                  {
                    "stringValue": "pancakes"
                  }
                ]
              }
            }
          }
        ]
      },
      {
        "name": "eval_inputs",
        "description": "All inputs to Eval phase.",
        "test": [
          {
            "name": "one_ignored_value_arg",
            "description": "Check that value bindings can be given, even if ignored.",
            "expr": "'foo'",
            "bindings": {
              "x": {
                "value": {
                  "int64Value": "17"
                }
              }
            },
            "value": {
              "stringValue": "foo"
            }
          }
        ]
      }
    ]
  },
  {
    "name": "proto2",
    "description": "Protocol buffer version 2 tests.  See notes for the available set of protos for tests.",
    "section": [
      {
        "name": "literal_singular",
        "description": "Literals with singular fields set.",
        "test": [
          {
            "name": "int64_nocontainer",
            "expr": "cel.expr.conformance.proto2.TestAllTypes{single_int64: 17}",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt64": "17"
              }
            }
          },
          {
            "name": "int32",
            "expr": "TestAllTypes{single_int32: -34}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32": -34
              }
            }
          },
          {
            "name": "int32_eq_uint",
            "expr": "Int32Value{value: 34} == dyn(UInt64Value{value: 34u})",
            "container": "google.protobuf",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_int32_eq_uint",
            "expr": "Int32Value{value: 34} == dyn(UInt64Value{value: 18446744073709551615u})",
            "container": "google.protobuf",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "int32_eq_double",
            "expr": "Int32Value{value: 34} == dyn(DoubleValue{value: 34.0})",
            "container": "google.protobuf",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_int32_eq_double",
            "expr": "Int32Value{value: 34} == dyn(DoubleValue{value: -9223372036854775809.0})",
            "container": "google.protobuf",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "int64",
            "expr": "TestAllTypes{single_int64: 17}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt64": "17"
              }
            }
          },
          {
            "name": "uint32",
            "expr": "TestAllTypes{single_uint32: 1u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint32": 1
              }
            }
          },
          {
            "name": "uint32_eq_int",
            "expr": "UInt32Value{value: 34u} == dyn(Int64Value{value: 34})",
            "container": "google.protobuf",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_uint32_eq_int",
            "expr": "UInt32Value{value: 34u} == dyn(Int64Value{value: -1})",
            "container": "google.protobuf",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "uint32_eq_double",
            "expr": "UInt32Value{value: 34u} == dyn(DoubleValue{value: 34.0})",
            "container": "google.protobuf",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_uint32_eq_double",
            "expr": "UInt32Value{value: 34u} == dyn(DoubleValue{value: 18446744073709551616.0})",
            "container": "google.protobuf",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "uint64",
            "expr": "TestAllTypes{single_uint64: 9999u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint64": "9999"
              }
            }
          },
          {
            "name": "sint32",
            "expr": "TestAllTypes{single_sint32: -3}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleSint32": -3
              }
            }
          },
          {
            "name": "sint64",
            "expr": "TestAllTypes{single_sint64: 255}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleSint64": "255"
              }
            }
          },
          {
            "name": "fixed32",
            "expr": "TestAllTypes{single_fixed32: 43u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFixed32": 43
              }
            }
          },
          {
            "name": "fixed64",
            "expr": "TestAllTypes{single_fixed64: 1880u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFixed64": "1880"
              }
            }
          },
          {
            "name": "sfixed32",
            "expr": "TestAllTypes{single_sfixed32: -404}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleSfixed32": -404
              }
            }
          },
          {
            "name": "sfixed64",
            "expr": "TestAllTypes{single_sfixed64: -1}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleSfixed64": "-1"
              }
            }
          },
          {
            "name": "float",
            "expr": "TestAllTypes{single_float: 3.1416}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloat": 3.1416
              }
            }
          },
          {
            "name": "float_eq_int",
            "expr": "FloatValue{value: 3.0} == dyn(Int64Value{value: 3})",
            "container": "google.protobuf",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_float_eq_int",
            "expr": "FloatValue{value: -1.14} == dyn(Int64Value{value: -1})",
            "container": "google.protobuf",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "float_eq_uint",
            "expr": "FloatValue{value: 34.0} == dyn(UInt64Value{value: 34u})",
            "container": "google.protobuf",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "not_float_eq_uint",
            "expr": "FloatValue{value: -1.0} == dyn(UInt64Value{value: 18446744073709551615u})",
            "container": "google.protobuf",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "double",
            "expr": "TestAllTypes{single_double: 6.022e23}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleDouble": 6.022e+23
              }
            }
          },
          {
            "name": "bool",
            "expr": "TestAllTypes{single_bool: true}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBool": true
              }
            }
          },
          {
            "name": "string",
            "expr": "TestAllTypes{single_string: 'foo'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleString": "foo"
              }
            }
          },
          {
            "name": "bytes",
            "expr": "TestAllTypes{single_bytes: b'\\377'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBytes": "/w=="
              }
            }
          }
        ]
      },
      {
        "name": "literal_wellknown",
        "description": "Literals with well-known fields set.",
        "test": [
          {
            "name": "any",
            "expr": "TestAllTypes{single_any: TestAllTypes{single_int32: 1}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleAny": {
                  "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                  "singleInt32": 1
                }
              }
            }
          },
          {
            "name": "duration",
            "expr": "TestAllTypes{single_duration: duration('123s')}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleDuration": "123s"
              }
            }
          },
          {
            "name": "timestamp",
            "expr": "TestAllTypes{single_timestamp: timestamp('2009-02-13T23:31:30Z')}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleTimestamp": "2009-02-13T23:31:30Z"
              }
            }
          },
          {
            "name": "struct",
            "expr": "TestAllTypes{single_struct: {'one': 1, 'two': 2}}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleStruct": {
                  "one": 1,
                  "two": 2
                }
              }
            }
          },
          {
            "name": "value",
            "expr": "TestAllTypes{single_value: 'foo'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleValue": "foo"
              }
            }
          },
          {
            "name": "int64_wrapper",
            "expr": "TestAllTypes{single_int64_wrapper: -321}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt64Wrapper": "-321"
              }
            }
          },
          {
            "name": "int32_wrapper",
            "expr": "TestAllTypes{single_int32_wrapper: -456}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleInt32Wrapper": -456
              }
            }
          },
          {
            "name": "double_wrapper",
            "expr": "TestAllTypes{single_double_wrapper: 2.71828}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleDoubleWrapper": 2.71828
              }
            }
          },
          {
            "name": "float_wrapper",
            "expr": "TestAllTypes{single_float_wrapper: 2.99792e8}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleFloatWrapper": 299792000
              }
            }
          },
          {
            "name": "uint64_wrapper",
            "expr": "TestAllTypes{single_uint64_wrapper: 8675309u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint64Wrapper": "8675309"
              }
            }
          },
          {
            "name": "uint32_wrapper",
            "expr": "TestAllTypes{single_uint32_wrapper: 987u}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleUint32Wrapper": 987
              }
            }
          },
          {
            "name": "string_wrapper",
            "expr": "TestAllTypes{single_string_wrapper: 'hubba'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleStringWrapper": "hubba"
              }
            }
          },
          {
            "name": "bool_wrapper",
            "expr": "TestAllTypes{single_bool_wrapper: true}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBoolWrapper": true
              }
            }
          },
          {
            "name": "bytes_wrapper",
            "expr": "TestAllTypes{single_bytes_wrapper: b'\\301\\103'}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                "singleBytesWrapper": "wUM="
              }
            }
          }
        ]
      },
      {
        "name": "singular_bind",
        "description": "Binding the singlular fields.",
        "test": [
          {
            "name": "int32",
            "expr": "x.single_int32",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "singleInt32": 17
                  }
                }
              }
            },
            "value": {
              "int64Value": "17"
            }
          },
          {
            "name": "int64",
            "expr": "x.single_int64",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "singleInt64": "-99"
                  }
                }
              }
            },
            "value": {
              "int64Value": "-99"
            }
          }
        ]
      },
      {
        "name": "empty_field",
        "description": "Tests on empty fields.",
        "test": [
          {
            "name": "scalar_with_default",
            "expr": "TestAllTypes{}.single_int32",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "-32"
            }
          },
          {
            "name": "scalar_no_default",
            "expr": "TestAllTypes{}.single_fixed32",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "nested_message",
            "expr": "TestAllTypes{}.single_nested_message",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes.NestedMessage"
              }
            }
          },
          {
            "name": "nested_message_subfield",
            "expr": "TestAllTypes{}.single_nested_message.bb",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "wkt",
            "expr": "TestAllTypes{}.single_int64_wrapper",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "repeated_scalar",
            "expr": "TestAllTypes{}.repeated_int64",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "repeated_nested",
            "expr": "TestAllTypes{}.repeated_nested_message",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "map",
            "expr": "TestAllTypes{}.map_string_string",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "mapValue": {}
            }
          }
        ]
      },
      {
        "name": "has",
        "description": "Tests for the has() macro on proto2 messages.",
        "test": [
          {
            "name": "undefined",
            "expr": "has(TestAllTypes{}.no_such_field)",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "no_such_field"
                }
              ]
            }
          },
          {
            "name": "repeated_none_implicit",
            "expr": "has(TestAllTypes{}.repeated_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "repeated_none_explicit",
            "expr": "has(TestAllTypes{repeated_int32: []}.repeated_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "repeated_one",
            "expr": "has(TestAllTypes{repeated_int32: [1]}.repeated_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "repeated_many",
            "expr": "has(TestAllTypes{repeated_int32: [1, 2, 3]}.repeated_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_none_implicit",
            "expr": "has(TestAllTypes{}.map_string_string)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_none_explicit",
            "expr": "has(TestAllTypes{map_string_string: {}}.map_string_string)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_one_default",
            "expr": "has(TestAllTypes{map_string_string: {'MT': ''}}.map_string_string)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_one",
            "expr": "has(TestAllTypes{map_string_string: {'one': 'uno'}}.map_string_string)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_many",
            "expr": "has(TestAllTypes{map_string_string: {'one': 'uno', 'two': 'dos'}}.map_string_string)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "required",
            "expr": "has(TestRequired{required_int32: 4}.required_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_unset_no_default",
            "expr": "has(TestAllTypes{}.single_sint32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_set_no_default",
            "expr": "has(TestAllTypes{single_sint32: -4}.single_sint32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_unset_with_default",
            "expr": "has(TestAllTypes{}.single_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_set_with_default",
            "expr": "has(TestAllTypes{single_int32: 16}.single_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_set_to_default",
            "expr": "has(TestAllTypes{single_int32: -32}.single_int32)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_message_unset",
            "expr": "has(TestAllTypes{}.standalone_message)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_message_set",
            "expr": "has(TestAllTypes{standalone_message: TestAllTypes.NestedMessage{}}.standalone_message)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_enum_unset",
            "expr": "has(TestAllTypes{}.standalone_enum)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "optional_enum_set",
            "expr": "has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAR}.standalone_enum)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "optional_enum_set_zero",
            "expr": "has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.FOO}.standalone_enum)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "oneof_unset",
            "expr": "has(TestAllTypes{}.single_nested_message)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "oneof_other_set",
            "expr": "has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.BAZ}.single_nested_message)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "oneof_set",
            "expr": "has(TestAllTypes{single_nested_message: TestAllTypes.NestedMessage{}}.single_nested_message)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "oneof_set_default",
            "expr": "has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.FOO}.single_nested_enum)",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "set_null",
        "test": [
          {
            "name": "single_message",
            "expr": "TestAllTypes{single_nested_message: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_any",
            "expr": "TestAllTypes{single_any: null}.single_any",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "single_value",
            "expr": "TestAllTypes{single_value: null}.single_value",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "single_duration",
            "expr": "TestAllTypes{single_duration: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_timestamp",
            "expr": "TestAllTypes{single_timestamp: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto2",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_scalar",
            "expr": "TestAllTypes{single_bool: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "repeated",
            "expr": "TestAllTypes{repeated_int32: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "map",
            "expr": "TestAllTypes{map_string_string: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "list_value",
            "expr": "TestAllTypes{list_value: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "single_struct",
            "expr": "TestAllTypes{single_struct: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto2",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "proto2_ext",
    "description": "Tests for the proto extension library.",
    "section": [
      {
        "name": "has_ext",
        "test": [
          {
            "name": "package_scoped_int32",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.int32_ext)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.int32_ext]": 42
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_nested_ext",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.nested_ext)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.nested_ext]": {}
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_test_all_types_ext",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.test_all_types_ext)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.test_all_types_ext]": {}
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_test_all_types_nested_enum_ext",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.nested_enum_ext)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.nested_enum_ext]": "BAR"
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_repeated_test_all_types",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.repeated_test_all_types)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.repeated_test_all_types]": [
                      {
                        "singleInt64": "1"
                      },
                      {
                        "singleBool": true
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_int64",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.int64_ext)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.int64_ext]": "42"
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_nested_ext",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_nested_ext)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_nested_ext]": {}
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_nested_enum_ext",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.nested_enum_ext)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.nested_enum_ext]": "BAR"
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_repeated_test_all_types",
            "expr": "proto.hasExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_repeated_test_all_types)",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_repeated_test_all_types]": [
                      {
                        "singleInt64": "1"
                      },
                      {
                        "singleBool": true
                      }
                    ]
                  }
                }
              }
            }
          }
        ]
      },
      {
        "name": "get_ext",
        "test": [
          {
            "name": "package_scoped_int32",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.int32_ext) == 42",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.int32_ext]": 42
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_nested_ext",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.nested_ext) == cel.expr.conformance.proto2.TestAllTypes{}",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.nested_ext]": {}
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_test_all_types_ext",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.test_all_types_ext) == cel.expr.conformance.proto2.TestAllTypes{}",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.test_all_types_ext]": {}
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_test_all_types_nested_enum_ext",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.nested_enum_ext) == cel.expr.conformance.proto2.TestAllTypes.NestedEnum.BAR",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.nested_enum_ext]": "BAR"
                  }
                }
              }
            }
          },
          {
            "name": "package_scoped_repeated_test_all_types",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.repeated_test_all_types) == [cel.expr.conformance.proto2.TestAllTypes{single_int64: 1}, cel.expr.conformance.proto2.TestAllTypes{single_bool: true}]",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.repeated_test_all_types]": [
                      {
                        "singleInt64": "1"
                      },
                      {
                        "singleBool": true
                      }
                    ]
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_int64",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.int64_ext) == 42",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.int64_ext]": "42"
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_nested_ext",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_nested_ext) == cel.expr.conformance.proto2.TestAllTypes{}",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_nested_ext]": {}
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_nested_enum_ext",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.nested_enum_ext) == cel.expr.conformance.proto2.TestAllTypes.NestedEnum.BAR",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.nested_enum_ext]": "BAR"
                  }
                }
              }
            }
          },
          {
            "name": "message_scoped_repeated_test_all_types",
            "expr": "proto.getExt(msg, cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_repeated_test_all_types) == [cel.expr.conformance.proto2.TestAllTypes{single_int64: 1}, cel.expr.conformance.proto2.TestAllTypes{single_bool: true}]",
            "typeEnv": [
              {
                "name": "msg",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto2.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "msg": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto2.TestAllTypes",
                    "[cel.expr.conformance.proto2.Proto2ExtensionScopedMessage.message_scoped_repeated_test_all_types]": [
                      {
                        "singleInt64": "1"
                      },
                      {
                        "singleBool": true
                      }
                    ]
                  }
                }
              }
            }
          }
        ]
      }
    ]
  },
  {
    "name": "proto3",
    "description": "Protocol buffer version 3 tests.  See notes for the available set of protos for tests.",
    "section": [
      {
        "name": "literal_singular",
        "description": "Literals with singular fields set.",
        "test": [
          {
            "name": "int64_nocontainer",
            "expr": "cel.expr.conformance.proto3.TestAllTypes{single_int64: 17}",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt64": "17"
              }
            }
          },
          {
            "name": "int32",
            "expr": "TestAllTypes{single_int32: -34}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt32": -34
              }
            }
          },
          {
            "name": "int64",
            "expr": "TestAllTypes{single_int64: 17}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt64": "17"
              }
            }
          },
          {
            "name": "uint32",
            "expr": "TestAllTypes{single_uint32: 1u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint32": 1
              }
            }
          },
          {
            "name": "uint64",
            "expr": "TestAllTypes{single_uint64: 9999u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint64": "9999"
              }
            }
          },
          {
            "name": "sint32",
            "expr": "TestAllTypes{single_sint32: -3}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleSint32": -3
              }
            }
          },
          {
            "name": "sint64",
            "expr": "TestAllTypes{single_sint64: 255}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleSint64": "255"
              }
            }
          },
          {
            "name": "fixed32",
            "expr": "TestAllTypes{single_fixed32: 43u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFixed32": 43
              }
            }
          },
          {
            "name": "fixed64",
            "expr": "TestAllTypes{single_fixed64: 1880u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFixed64": "1880"
              }
            }
          },
          {
            "name": "sfixed32",
            "expr": "TestAllTypes{single_sfixed32: -404}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleSfixed32": -404
              }
            }
          },
          {
            "name": "sfixed64",
            "expr": "TestAllTypes{single_sfixed64: -1}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleSfixed64": "-1"
              }
            }
          },
          {
            "name": "float",
            "expr": "TestAllTypes{single_float: 3.1416}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFloat": 3.1416
              }
            }
          },
          {
            "name": "double",
            "expr": "TestAllTypes{single_double: 6.022e23}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleDouble": 6.022e+23
              }
            }
          },
          {
            "name": "bool",
            "expr": "TestAllTypes{single_bool: true}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBool": true
              }
            }
          },
          {
            "name": "string",
            "expr": "TestAllTypes{single_string: 'foo'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleString": "foo"
              }
            }
          },
          {
            "name": "bytes",
            "expr": "TestAllTypes{single_bytes: b'\\377'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBytes": "/w=="
              }
            }
          }
        ]
      },
      {
        "name": "literal_wellknown",
        "description": "Literals with well-known fields set.",
        "test": [
          {
            "name": "any",
            "expr": "TestAllTypes{single_any: TestAllTypes{single_int32: 1}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleAny": {
                  "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                  "singleInt32": 1
                }
              }
            }
          },
          {
            "name": "duration",
            "expr": "TestAllTypes{single_duration: duration('123s')}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleDuration": "123s"
              }
            }
          },
          {
            "name": "timestamp",
            "expr": "TestAllTypes{single_timestamp: timestamp('2009-02-13T23:31:30Z')}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleTimestamp": "2009-02-13T23:31:30Z"
              }
            }
          },
          {
            "name": "struct",
            "expr": "TestAllTypes{single_struct: {'one': 1, 'two': 2}}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleStruct": {
                  "one": 1,
                  "two": 2
                }
              }
            }
          },
          {
            "name": "value",
            "expr": "TestAllTypes{single_value: 'foo'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleValue": "foo"
              }
            }
          },
          {
            "name": "int64_wrapper",
            "expr": "TestAllTypes{single_int64_wrapper: -321}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt64Wrapper": "-321"
              }
            }
          },
          {
            "name": "int32_wrapper",
            "expr": "TestAllTypes{single_int32_wrapper: -456}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleInt32Wrapper": -456
              }
            }
          },
          {
            "name": "double_wrapper",
            "expr": "TestAllTypes{single_double_wrapper: 2.71828}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleDoubleWrapper": 2.71828
              }
            }
          },
          {
            "name": "float_wrapper",
            "expr": "TestAllTypes{single_float_wrapper: 2.99792e8}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleFloatWrapper": 299792000
              }
            }
          },
          {
            "name": "uint64_wrapper",
            "expr": "TestAllTypes{single_uint64_wrapper: 8675309u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint64Wrapper": "8675309"
              }
            }
          },
          {
            "name": "uint32_wrapper",
            "expr": "TestAllTypes{single_uint32_wrapper: 987u}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleUint32Wrapper": 987
              }
            }
          },
          {
            "name": "string_wrapper",
            "expr": "TestAllTypes{single_string_wrapper: 'hubba'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleStringWrapper": "hubba"
              }
            }
          },
          {
            "name": "bool_wrapper",
            "expr": "TestAllTypes{single_bool_wrapper: true}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBoolWrapper": true
              }
            }
          },
          {
            "name": "bytes_wrapper",
            "expr": "TestAllTypes{single_bytes_wrapper: b'\\301\\103'}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                "singleBytesWrapper": "wUM="
              }
            }
          }
        ]
      },
      {
        "name": "singular_bind",
        "description": "Binding the singlular fields.",
        "test": [
          {
            "name": "int32",
            "expr": "x.single_int32",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt32": 17
                  }
                }
              }
            },
            "value": {
              "int64Value": "17"
            }
          },
          {
            "name": "int64",
            "expr": "x.single_int64",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "cel.expr.conformance.proto3.TestAllTypes"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes",
                    "singleInt64": "-99"
                  }
                }
              }
            },
            "value": {
              "int64Value": "-99"
            }
          }
        ]
      },
      {
        "name": "empty_field",
        "description": "Tests on empty fields.",
        "test": [
          {
            "name": "scalar",
            "expr": "TestAllTypes{}.single_fixed32",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "uint64Value": "0"
            }
          },
          {
            "name": "nested_message",
            "expr": "TestAllTypes{}.single_nested_message",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "objectValue": {
                "@type": "type.googleapis.com/cel.expr.conformance.proto3.TestAllTypes.NestedMessage"
              }
            }
          },
          {
            "name": "nested_message_subfield",
            "expr": "TestAllTypes{}.single_nested_message.bb",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "wkt",
            "expr": "TestAllTypes{}.single_int64_wrapper",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "repeated_scalar",
            "expr": "TestAllTypes{}.repeated_int64",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "repeated_nested",
            "expr": "TestAllTypes{}.repeated_nested_message",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {}
            }
          },
          {
            "name": "map",
            "expr": "TestAllTypes{}.map_string_string",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {}
            }
          }
        ]
      },
      {
        "name": "has",
        "description": "Tests for the has() macro on proto3 messages.",
        "test": [
          {
            "name": "undefined",
            "expr": "has(TestAllTypes{}.no_such_field)",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "no_such_field"
                }
              ]
            }
          },
          {
            "name": "repeated_none_implicit",
            "expr": "has(TestAllTypes{}.repeated_int32)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "repeated_none_explicit",
            "expr": "has(TestAllTypes{repeated_int32: []}.repeated_int32)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "repeated_one",
            "expr": "has(TestAllTypes{repeated_int32: [1]}.repeated_int32)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "repeated_many",
            "expr": "has(TestAllTypes{repeated_int32: [1, 2, 3]}.repeated_int32)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_none_implicit",
            "expr": "has(TestAllTypes{}.map_string_string)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_none_explicit",
            "expr": "has(TestAllTypes{map_string_string: {}}.map_string_string)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "map_one_default",
            "expr": "has(TestAllTypes{map_string_string: {'MT': ''}}.map_string_string)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_one",
            "expr": "has(TestAllTypes{map_string_string: {'one': 'uno'}}.map_string_string)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "map_many",
            "expr": "has(TestAllTypes{map_string_string: {'one': 'uno', 'two': 'dos'}}.map_string_string)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_unset",
            "expr": "has(TestAllTypes{}.single_int32)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "single_set",
            "expr": "has(TestAllTypes{single_int32: 16}.single_int32)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_set_to_default",
            "expr": "has(TestAllTypes{single_int32: 0}.single_int32)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "single_message_unset",
            "expr": "has(TestAllTypes{}.standalone_message)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "single_message_set",
            "expr": "has(TestAllTypes{standalone_message: TestAllTypes.NestedMessage{bb: 123}}.standalone_message)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_message_set_to_default",
            "expr": "has(TestAllTypes{standalone_message: TestAllTypes.NestedMessage{}}.standalone_message)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_enum_unset",
            "expr": "has(TestAllTypes{}.standalone_enum)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "single_enum_set",
            "expr": "has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.BAR}.standalone_enum)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_enum_set_zero",
            "expr": "has(TestAllTypes{standalone_enum: TestAllTypes.NestedEnum.FOO}.standalone_enum)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "oneof_unset",
            "expr": "has(TestAllTypes{}.single_nested_message)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "oneof_other_set",
            "expr": "has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.BAZ}.single_nested_message)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "oneof_set",
            "expr": "has(TestAllTypes{single_nested_message: TestAllTypes.NestedMessage{}}.single_nested_message)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "oneof_set_default",
            "expr": "has(TestAllTypes{single_nested_enum: TestAllTypes.NestedEnum.FOO}.single_nested_enum)",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "set_null",
        "test": [
          {
            "name": "single_message",
            "expr": "TestAllTypes{single_nested_message: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_any",
            "expr": "TestAllTypes{single_any: null}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "single_value",
            "expr": "TestAllTypes{single_value: null}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          },
          {
            "name": "single_duration",
            "expr": "TestAllTypes{single_duration: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_timestamp",
            "expr": "TestAllTypes{single_timestamp: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "single_scalar",
            "expr": "TestAllTypes{single_bool: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "repeated",
            "expr": "TestAllTypes{repeated_int32: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "map",
            "expr": "TestAllTypes{map_string_string: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "list_value",
            "expr": "TestAllTypes{list_value: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          },
          {
            "name": "single_struct",
            "expr": "TestAllTypes{single_struct: null} == TestAllTypes{}",
            "disableCheck": true,
            "container": "cel.expr.conformance.proto3",
            "evalError": {
              "errors": [
                {
                  "message": "unsupported field type"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "string",
    "description": "Tests for string and bytes operations.",
    "section": [
      {
        "name": "size",
        "description": "Tests for the size() function.",
        "test": [
          {
            "name": "empty",
            "expr": "size('')",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "one_ascii",
            "expr": "size('A')",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "one_unicode",
            "expr": "size('ÿ')",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "ascii",
            "expr": "size('four')",
            "value": {
              "int64Value": "4"
            }
          },
          {
            "name": "unicode",
            "expr": "size('πέντε')",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "bytes_empty",
            "expr": "size(b'')",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "bytes",
            "expr": "size(b'abc')",
            "value": {
              "int64Value": "3"
            }
          }
        ]
      },
      {
        "name": "starts_with",
        "description": "Tests for the startsWith() function.",
        "test": [
          {
            "name": "basic_true",
            "expr": "'foobar'.startsWith('foo')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "basic_false",
            "expr": "'foobar'.startsWith('bar')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_target",
            "expr": "''.startsWith('foo')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_arg",
            "expr": "'foobar'.startsWith('')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "empty_empty",
            "expr": "''.startsWith('')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "unicode",
            "expr": "'завтра'.startsWith('за')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "unicode_smp",
            "expr": "'🐱😀😛'.startsWith('🐱')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "ends_with",
        "description": "Tests for the endsWith() function.",
        "test": [
          {
            "name": "basic_true",
            "expr": "'foobar'.endsWith('bar')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "basic_false",
            "expr": "'foobar'.endsWith('foo')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_target",
            "expr": "''.endsWith('foo')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_arg",
            "expr": "'foobar'.endsWith('')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "empty_empty",
            "expr": "''.endsWith('')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "unicode",
            "expr": "'forté'.endsWith('té')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "unicode_smp",
            "expr": "'🐱😀😛'.endsWith('😛')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "matches",
        "description": "Tests for regexp matching.  For now, we will only test the subset of regular languages.",
        "test": [
          {
            "name": "basic",
            "expr": "'hubba'.matches('ubb')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "empty_target",
            "expr": "''.matches('foo|bar')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_arg",
            "expr": "'cows'.matches('')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "empty_empty",
            "expr": "''.matches('')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "re_concat",
            "expr": "'abcd'.matches('bc')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "re_alt",
            "expr": "'grey'.matches('gr(a|e)y')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "re_rep",
            "expr": "'banana'.matches('ba(na)*')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "unicode",
            "expr": "'mañana'.matches('a+ñ+a+')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "unicode_smp",
            "expr": "'🐱😀😀'.matches('(a|😀){2}')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "concatentation",
        "description": "Tests for string concatenation.",
        "test": [
          {
            "name": "concat_true",
            "expr": "'he' + 'llo'",
            "value": {
              "stringValue": "hello"
            }
          },
          {
            "name": "concat_with_spaces",
            "expr": "'hello' + ' ' == 'hello'",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "concat_empty_string_beginning",
            "expr": "'' + 'abc'",
            "value": {
              "stringValue": "abc"
            }
          },
          {
            "name": "concat_empty_string_end",
            "expr": "'abc' + ''",
            "value": {
              "stringValue": "abc"
            }
          },
          {
            "name": "concat_empty_with_empty",
            "expr": "'' + ''",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "unicode_unicode",
            "expr": "'¢' + 'ÿ' + 'Ȁ'",
            "value": {
              "stringValue": "¢ÿȀ"
            }
          },
          {
            "name": "ascii_unicode",
            "expr": "'r' + 'ô' + 'le'",
            "value": {
              "stringValue": "rôle"
            }
          },
          {
            "name": "ascii_unicode_unicode_smp",
            "expr": "'a' + 'ÿ' + '🐱'",
            "value": {
              "stringValue": "aÿ🐱"
            }
          },
          {
            "name": "empty_unicode",
            "expr": "'' + 'Ω' + ''",
            "value": {
              "stringValue": "Ω"
            }
          }
        ]
      },
      {
        "name": "contains",
        "description": "Tests for contains.",
        "test": [
          {
            "name": "contains_true",
            "expr": "'hello'.contains('he')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "contains_empty",
            "expr": "'hello'.contains('')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "contains_false",
            "expr": "'hello'.contains('ol')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "contains_multiple",
            "expr": "'abababc'.contains('ababc')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "contains_unicode",
            "expr": "'Straße'.contains('aß')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "contains_unicode_smp",
            "expr": "'🐱😀😁'.contains('😀')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "empty_contains",
            "expr": "''.contains('something')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "empty_empty",
            "expr": "''.contains('')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "bytes_concat",
        "description": "Tests for bytes concatenation.",
        "test": [
          {
            "name": "concat",
            "expr": "b'abc' + b'def'",
            "value": {
              "bytesValue": "YWJjZGVm"
            }
          },
          {
            "name": "left_unit",
            "expr": "b'' + b'\\xffoo'",
            "value": {
              "bytesValue": "/29v"
            }
          },
          {
            "name": "right_unit",
            "expr": "b'zxy' + b''",
            "value": {
              "bytesValue": "enh5"
            }
          },
          {
            "name": "empty_empty",
            "expr": "b'' + b''",
            "value": {
              "bytesValue": ""
            }
          }
        ]
      }
    ]
  },
  {
    "name": "string_ext",
    "description": "Tests for the strings extension library.",
    "section": [
      {
        "name": "char_at",
        "test": [
          {
            "name": "middle_index",
            "expr": "'tacocat'.charAt(3)",
            "value": {
              "stringValue": "o"
            }
          },
          {
            "name": "end_index",
            "expr": "'tacocat'.charAt(7)",
            "value": {
              "stringValue": ""
            }
          },
          {
            "name": "multiple",
            "expr": "'©αT'.charAt(0) == '©' && '©αT'.charAt(1) == 'α' && '©αT'.charAt(2) == 'T'"
          }
        ]
      },
      {
        "name": "index_of",
        "test": [
          {
            "name": "empty_index",
            "expr": "'tacocat'.indexOf('')",
            "value": {
              "int64Value": "0"
            }
          },
          {
            "name": "string_index",
            "expr": "'tacocat'.indexOf('ac')",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "nomatch",
            "expr": "'tacocat'.indexOf('none') == -1"
          },
          {
            "name": "empty_index",
            "expr": "'tacocat'.indexOf('', 3) == 3"
          },
          {
            "name": "char_index",
            "expr": "'tacocat'.indexOf('a', 3) == 5"
          },
          {
            "name": "string_index",
            "expr": "'tacocat'.indexOf('at', 3) == 5"
          },
          {
            "name": "unicode_char",
            "expr": "'ta©o©αT'.indexOf('©') == 2"
          },
          {
            "name": "unicode_char_index",
            "expr": "'ta©o©αT'.indexOf('©', 3) == 4"
          },
          {
            "name": "unicode_string_index",
            "expr": "'ta©o©αT'.indexOf('©αT', 3) == 4"
          },
          {
            "name": "unicode_string_nomatch_index",
            "expr": "'ta©o©αT'.indexOf('©α', 5) == -1"
          },
          {
            "name": "char_index",
            "expr": "'ijk'.indexOf('k') == 2"
          },
          {
            "name": "string_with_space_fullmatch",
            "expr": "'hello wello'.indexOf('hello wello') == 0"
          },
          {
            "name": "string_with_space_index",
            "expr": "'hello wello'.indexOf('ello', 6) == 7"
          },
          {
            "name": "string_nomatch_index",
            "expr": "'hello wello'.indexOf('elbo room!!') == -1"
          }
        ]
      },
      {
        "name": "last_index_of",
        "test": [
          {
            "name": "empty",
            "expr": "'tacocat'.lastIndexOf('') == 7"
          },
          {
            "name": "string",
            "expr": "'tacocat'.lastIndexOf('at') == 5"
          },
          {
            "name": "string_nomatch",
            "expr": "'tacocat'.lastIndexOf('none') == -1"
          },
          {
            "name": "empty_index",
            "expr": "'tacocat'.lastIndexOf('', 3) == 3"
          },
          {
            "name": "char_index",
            "expr": "'tacocat'.lastIndexOf('a', 3) == 1"
          },
          {
            "name": "unicode_char",
            "expr": "'ta©o©αT'.lastIndexOf('©') == 4"
          },
          {
            "name": "unicode_char_index",
            "expr": "'ta©o©αT'.lastIndexOf('©', 3) == 2"
          },
          {
            "name": "unicode_string_index",
            "expr": "'ta©o©αT'.lastIndexOf('©α', 4) == 4"
          },
          {
            "name": "string_with_space_string_index",
            "expr": "'hello wello'.lastIndexOf('ello', 6) == 1"
          },
          {
            "name": "string_with_space_string_nomatch",
            "expr": "'hello wello'.lastIndexOf('low') == -1"
          },
          {
            "name": "string_with_space_string_with_space_nomatch",
            "expr": "'hello wello'.lastIndexOf('elbo room!!') == -1"
          },
          {
            "name": "string_with_space_fullmatch",
            "expr": "'hello wello'.lastIndexOf('hello wello') == 0"
          },
          {
            "name": "repeated_string",
            "expr": "'bananananana'.lastIndexOf('nana', 7) == 6"
          }
        ]
      },
      {
        "name": "ascii_casing",
        "test": [
          {
            "name": "lowerascii",
            "expr": "'TacoCat'.lowerAscii() == 'tacocat'"
          },
          {
            "name": "lowerascii_unicode",
            "expr": "'TacoCÆt'.lowerAscii() == 'tacocÆt'"
          },
          {
            "name": "lowerascii_unicode_with_space",
            "expr": "'TacoCÆt Xii'.lowerAscii() == 'tacocÆt xii'"
          },
          {
            "name": "upperascii",
            "expr": "'tacoCat'.upperAscii() == 'TACOCAT'"
          },
          {
            "name": "upperascii_unicode",
            "expr": "'tacoCαt'.upperAscii() == 'TACOCαT'"
          },
          {
            "name": "upperascii_unicode_with_space",
            "expr": "'TacoCÆt Xii'.upperAscii() == 'TACOCÆT XII'"
          }
        ]
      },
      {
        "name": "replace",
        "test": [
          {
            "name": "no_placeholder",
            "expr": "'12 days 12 hours'.replace('{0}', '2') == '12 days 12 hours'"
          },
          {
            "name": "basic",
            "expr": "'{0} days {0} hours'.replace('{0}', '2') == '2 days 2 hours'"
          },
          {
            "name": "chained",
            "expr": "'{0} days {0} hours'.replace('{0}', '2', 1).replace('{0}', '23') == '2 days 23 hours'"
          },
          {
            "name": "unicode",
            "expr": "'1 ©αT taco'.replace('αT', 'o©α') == '1 ©o©α taco'"
          }
        ]
      },
      {
        "name": "split",
        "test": [
          {
            "name": "empty",
            "expr": "'hello world'.split(' ') == ['hello', 'world']"
          },
          {
            "name": "zero_limit",
            "expr": "'hello world events!'.split(' ', 0) == []"
          },
          {
            "name": "one_limit",
            "expr": "'hello world events!'.split(' ', 1) == ['hello world events!']"
          },
          {
            "name": "unicode_negative_limit",
            "expr": "'o©o©o©o'.split('©', -1) == ['o', 'o', 'o', 'o']"
          }
        ]
      },
      {
        "name": "substring",
        "test": [
          {
            "name": "start",
            "expr": "'tacocat'.substring(4) == 'cat'"
          },
          {
            "name": "start_with_max_length",
            "expr": "'tacocat'.substring(7) == ''"
          },
          {
            "name": "start_and_end",
            "expr": "'tacocat'.substring(0, 4) == 'taco'"
          },
          {
            "name": "start_and_end_equal_value",
            "expr": "'tacocat'.substring(4, 4) == ''"
          },
          {
            "name": "unicode_start_and_end",
            "expr": "'ta©o©αT'.substring(2, 6) == '©o©α'"
          },
          {
            "name": "unicode_start_and_end_equal_value",
            "expr": "'ta©o©αT'.substring(7, 7) == ''"
          }
        ]
      },
      {
        "name": "trim",
        "test": [
          {
            "name": "blank_spaces_escaped_chars",
            "expr": "' \\f\\n\\r\\t\\vtext  '.trim() == 'text'"
          },
          {
            "name": "unicode_space_chars_1",
            "expr": "'\\u0085\\u00a0\\u1680text'.trim() == 'text'"
          },
          {
            "name": "unicode_space_chars_2",
            "expr": "'text\\u2000\\u2001\\u2002\\u2003\\u2004\\u2004\\u2006\\u2007\\u2008\\u2009'.trim() == 'text'"
          },
          {
            "name": "unicode_space_chars_3",
            "expr": "'\\u200atext\\u2028\\u2029\\u202F\\u205F\\u3000'.trim() == 'text'"
          },
          {
            "name": "unicode_no_trim",
            "expr": "'\\u180etext\\u200b\\u200c\\u200d\\u2060\\ufeff'.trim() == '\\u180etext\\u200b\\u200c\\u200d\\u2060\\ufeff'"
          }
        ]
      },
      {
        "name": "join",
        "test": [
          {
            "name": "empty_separator",
            "expr": "['x', 'y'].join() == 'xy'"
          },
          {
            "name": "dash_separator",
            "expr": "['x', 'y'].join('-') == 'x-y'"
          },
          {
            "name": "empty_string_empty_separator",
            "expr": "[].join() == ''"
          },
          {
            "name": "empty_string_dash_separator",
            "expr": "[].join('-') == ''"
          }
        ]
      },
      {
        "name": "quote",
        "test": [
          {
            "name": "multiline",
            "expr": "strings.quote(\"first\\nsecond\") == \"\\\"first\\\\nsecond\\\"\""
          },
          {
            "name": "escaped",
            "expr": "strings.quote(\"bell\\a\") == \"\\\"bell\\\\a\\\"\""
          },
          {
            "name": "backspace",
            "expr": "strings.quote(\"\\bbackspace\") == \"\\\"\\\\bbackspace\\\"\""
          },
          {
            "name": "form_feed",
            "expr": "strings.quote(\"\\fform feed\") == \"\\\"\\\\fform feed\\\"\""
          },
          {
            "name": "carriage_return",
            "expr": "strings.quote(\"carriage \\r return\") == \"\\\"carriage \\\\r return\\\"\""
          },
          {
            "name": "horizontal_tab",
            "expr": "strings.quote(\"horizontal tab\\t\") == \"\\\"horizontal tab\\\\t\\\"\""
          },
          {
            "name": "vertical_tab",
            "expr": "strings.quote(\"vertical \\v tab\") == \"\\\"vertical \\\\v tab\\\"\""
          },
          {
            "name": "double_slash",
            "expr": "strings.quote(\"double \\\\\\\\ slash\") == \"\\\"double \\\\\\\\\\\\\\\\ slash\\\"\""
          },
          {
            "name": "two_escape_sequences",
            "expr": "strings.quote(\"two escape sequences \\\\a\\\\n\") == \"\\\"two escape sequences \\\\\\\\a\\\\\\\\n\\\"\""
          },
          {
            "name": "verbatim",
            "expr": "strings.quote(\"verbatim\") == \"\\\"verbatim\\\"\""
          },
          {
            "name": "ends_with",
            "expr": "strings.quote(\"ends with \\\\\") == \"\\\"ends with \\\\\\\\\\\"\""
          },
          {
            "name": "starts_with",
            "expr": "strings.quote(\"\\\\ starts with\") == \"\\\"\\\\\\\\ starts with\\\"\""
          },
          {
            "name": "printable_unicode",
            "expr": "strings.quote(\"printable unicode😀\") == \"\\\"printable unicode😀\\\"\""
          },
          {
            "name": "mid_string_quote",
            "expr": "strings.quote(\"mid string \\\" quote\") == \"\\\"mid string \\\\\\\" quote\\\"\""
          },
          {
            "name": "single_quote_with_double_quote",
            "expr": "strings.quote('single-quote with \"double quote\"') == \"\\\"single-quote with \\\\\\\"double quote\\\\\\\"\\\"\""
          },
          {
            "name": "size_unicode_char",
            "expr": "strings.quote(\"size('ÿ')\") == \"\\\"size('ÿ')\\\"\""
          },
          {
            "name": "size_unicode_string",
            "expr": "strings.quote(\"size('πέντε')\") == \"\\\"size('πέντε')\\\"\""
          },
          {
            "name": "unicode",
            "expr": "strings.quote(\"завтра\") == \"\\\"завтра\\\"\""
          },
          {
            "name": "unicode_code_points",
            "expr": "strings.quote(\"\\U0001F431\\U0001F600\\U0001F61B\")",
            "value": {
              "stringValue": "\"🐱😀😛\""
            }
          },
          {
            "name": "unicode_2",
            "expr": "strings.quote(\"ta©o©αT\") == \"\\\"ta©o©αT\\\"\""
          },
          {
            "name": "empty_quote",
            "expr": "strings.quote(\"\")",
            "value": {
              "stringValue": "\"\""
            }
          }
        ]
      },
      {
        "name": "format",
        "test": [
          {
            "name": "no-op",
            "expr": "\"no substitution\".format([])",
            "value": {
              "stringValue": "no substitution"
            }
          },
          {
            "name": "mid-string substitution",
            "expr": "\"str is %s and some more\".format([\"filler\"])",
            "value": {
              "stringValue": "str is filler and some more"
            }
          },
          {
            "name": "percent escaping",
            "expr": "\"%% and also %%\".format([])",
            "value": {
              "stringValue": "% and also %"
            }
          },
          {
            "name": "substution inside escaped percent signs",
            "expr": "\"%%%s%%\".format([\"text\"])",
            "value": {
              "stringValue": "%text%"
            }
          },
          {
            "name": "substitution with one escaped percent sign on the right",
            "expr": "\"%s%%\".format([\"percent on the right\"])",
            "value": {
              "stringValue": "percent on the right%"
            }
          },
          {
            "name": "substitution with one escaped percent sign on the left",
            "expr": "\"%%%s\".format([\"percent on the left\"])",
            "value": {
              "stringValue": "%percent on the left"
            }
          },
          {
            "name": "multiple substitutions",
            "expr": "\"%d %d %d, %s %s %s, %d %d %d, %s %s %s\".format([1, 2, 3, \"A\", \"B\", \"C\", 4, 5, 6, \"D\", \"E\", \"F\"])",
            "value": {
              "stringValue": "1 2 3, A B C, 4 5 6, D E F"
            }
          },
          {
            "name": "percent sign escape sequence support",
            "expr": "\"%%escaped %s%%\".format([\"percent\"])",
            "value": {
              "stringValue": "%escaped percent%"
            }
          },
          {
            "name": "fixed point formatting clause",
            "expr": "\"%.3f\".format([1.2345])",
            "value": {
              "stringValue": "1.234"
            }
          },
          {
            "name": "binary formatting clause",
            "expr": "\"this is 5 in binary: %b\".format([5])",
            "value": {
              "stringValue": "this is 5 in binary: 101"
            }
          },
          {
            "name": "uint support for binary formatting",
            "expr": "\"unsigned 64 in binary: %b\".format([uint(64)])",
            "value": {
              "stringValue": "unsigned 64 in binary: 1000000"
            }
          },
          {
            "name": "bool support for binary formatting",
            "expr": "\"bit set from bool: %b\".format([true])",
            "value": {
              "stringValue": "bit set from bool: 1"
            }
          },
          {
            "name": "octal formatting clause",
            "expr": "\"%o\".format([11])",
            "value": {
              "stringValue": "13"
            }
          },
          {
            "name": "uint support for octal formatting clause",
            "expr": "\"this is an unsigned octal: %o\".format([uint(65535)])",
            "value": {
              "stringValue": "this is an unsigned octal: 177777"
            }
          },
          {
            "name": "lowercase hexadecimal formatting clause",
            "expr": "\"%x is 20 in hexadecimal\".format([30])",
            "value": {
              "stringValue": "1e is 20 in hexadecimal"
            }
          },
          {
            "name": "uppercase hexadecimal formatting clause",
            "expr": "\"%X is 20 in hexadecimal\".format([30])",
            "value": {
              "stringValue": "1E is 20 in hexadecimal"
            }
          },
          {
            "name": "unsigned support for hexadecimal formatting clause",
            "expr": "\"%X is 6000 in hexadecimal\".format([uint(6000)])",
            "value": {
              "stringValue": "1770 is 6000 in hexadecimal"
            }
          },
          {
            "name": "string support with hexadecimal formatting clause",
            "expr": "\"%x\".format([\"Hello world!\"])",
            "value": {
              "stringValue": "48656c6c6f20776f726c6421"
            }
          },
          {
            "name": "string support with uppercase hexadecimal formatting clause",
            "expr": "\"%X\".format([\"Hello world!\"])",
            "value": {
              "stringValue": "48656C6C6F20776F726C6421"
            }
          },
          {
            "name": "byte support with hexadecimal formatting clause",
            "expr": "\"%x\".format([b\"byte string\"])",
            "value": {
              "stringValue": "6279746520737472696e67"
            }
          },
          {
            "name": "byte support with uppercase hexadecimal formatting clause",
            "expr": "\"%X\".format([b\"byte string\"])",
            "value": {
              "stringValue": "6279746520737472696E67"
            }
          },
          {
            "name": "scientific notation formatting clause",
            "expr": "\"%.6e\".format([1052.032911275])",
            "value": {
              "stringValue": "1.052033 × 10⁰³"
            }
          },
          {
            "name": "default precision for fixed-point clause",
            "expr": "\"%f\".format([2.71828])",
            "value": {
              "stringValue": "2.718280"
            }
          },
          {
            "name": "default precision for scientific notation",
            "expr": "\"%e\".format([2.71828])",
            "value": {
              "stringValue": "2.718280 × 10⁰⁰"
            }
          },
          {
            "name": "unicode output for scientific notation",
            "expr": "\"unescaped unicode: %e, escaped unicode: %e\".format([2.71828, 2.71828])",
            "value": {
              "stringValue": "unescaped unicode: 2.718280 × 10⁰⁰, escaped unicode: 2.718280 × 10⁰⁰"
            }
          },
          {
            "name": "NaN support for fixed-point",
            "expr": "\"%f\".format([\"NaN\"])",
            "value": {
              "stringValue": "NaN"
            }
          },
          {
            "name": "positive infinity support for fixed-point",
            "expr": "\"%f\".format([\"Infinity\"])",
            "value": {
              "stringValue": "∞"
            }
          },
          {
            "name": "negative infinity support for fixed-point",
            "expr": "\"%f\".format([\"-Infinity\"])",
            "value": {
              "stringValue": "-∞"
            }
          },
          {
            "name": "uint support for decimal clause",
            "expr": "\"%d\".format([uint(64)])",
            "value": {
              "stringValue": "64"
            }
          },
          {
            "name": "null support for string",
            "expr": "\"null: %s\".format([null])",
            "value": {
              "stringValue": "null: null"
            }
          },
          {
            "name": "int support for string",
            "expr": "\"%s\".format([999999999999])",
            "value": {
              "stringValue": "999999999999"
            }
          },
          {
            "name": "bytes support for string",
            "expr": "\"some bytes: %s\".format([b\"xyz\"])",
            "value": {
              "stringValue": "some bytes: xyz"
            }
          },
          {
            "name": "type() support for string",
            "expr": "\"type is %s\".format([type(\"test string\")])",
            "value": {
              "stringValue": "type is string"
            }
          },
          {
            "name": "timestamp support for string",
            "expr": "\"%s\".format([timestamp(\"2023-02-03T23:31:20+00:00\")])",
            "value": {
              "stringValue": "2023-02-03T23:31:20Z"
            }
          },
          {
            "name": "duration support for string",
            "expr": "\"%s\".format([duration(\"1h45m47s\")])",
            "value": {
              "stringValue": "6347s"
            }
          },
          {
            "name": "list support for string",
            "expr": "\"%s\".format([[\"abc\", 3.14, null, [9, 8, 7, 6], timestamp(\"2023-02-03T23:31:20Z\")]])",
            "value": {
              "stringValue": "[\"abc\", 3.140000, null, [9, 8, 7, 6], timestamp(\"2023-02-03T23:31:20Z\")]"
            }
          },
          {
            "name": "map support for string",
            "expr": "\"%s\".format([{\"key1\": b\"xyz\", \"key5\": null, \"key2\": duration(\"2h\"), \"key4\": true, \"key3\": 2.71828}])",
            "value": {
              "stringValue": "{\"key1\":b\"xyz\", \"key2\":duration(\"7200s\"), \"key3\":2.718280, \"key4\":true, \"key5\":null}"
            }
          },
          {
            "name": "map support (all key types)",
            "expr": "\"map with multiple key types: %s\".format([{1: \"value1\", uint(2): \"value2\", true: double(\"NaN\")}])",
            "value": {
              "stringValue": "map with multiple key types: {1:\"value1\", 2:\"value2\", true:\"NaN\"}"
            }
          },
          {
            "name": "boolean support for %s",
            "expr": "\"true bool: %s, false bool: %s\".format([true, false])",
            "value": {
              "stringValue": "true bool: true, false bool: false"
            }
          },
          {
            "name": "dyntype support for string formatting clause",
            "expr": "\"dynamic string: %s\".format([dyn(\"a string\")])",
            "value": {
              "stringValue": "dynamic string: a string"
            }
          },
          {
            "name": "dyntype support for numbers with string formatting clause",
            "expr": "\"dynIntStr: %s dynDoubleStr: %s\".format([dyn(32), dyn(56.8)])",
            "value": {
              "stringValue": "dynIntStr: 32 dynDoubleStr: 56.8"
            }
          },
          {
            "name": "dyntype support for integer formatting clause",
            "expr": "\"dynamic int: %d\".format([dyn(128)])",
            "value": {
              "stringValue": "dynamic int: 128"
            }
          },
          {
            "name": "dyntype support for integer formatting clause (unsigned)",
            "expr": "\"dynamic unsigned int: %d\".format([dyn(256u)])",
            "value": {
              "stringValue": "dynamic unsigned int: 256"
            }
          },
          {
            "name": "dyntype support for hex formatting clause",
            "expr": "\"dynamic hex int: %x\".format([dyn(22)])",
            "value": {
              "stringValue": "dynamic hex int: 16"
            }
          },
          {
            "name": "dyntype support for hex formatting clause (uppercase)",
            "expr": "\"dynamic hex int: %X (uppercase)\".format([dyn(26)])",
            "value": {
              "stringValue": "dynamic hex int: 1A (uppercase)"
            }
          },
          {
            "name": "dyntype support for unsigned hex formatting clause",
            "expr": "\"dynamic hex int: %x (unsigned)\".format([dyn(500u)])",
            "value": {
              "stringValue": "dynamic hex int: 1f4 (unsigned)"
            }
          },
          {
            "name": "dyntype support for fixed-point formatting clause",
            "expr": "\"dynamic double: %.3f\".format([dyn(4.5)])",
            "value": {
              "stringValue": "dynamic double: 4.500"
            }
          },
          {
            "name": "dyntype support for scientific notation",
            "expr": "\"(dyntype) e: %e\".format([dyn(2.71828)])",
            "value": {
              "stringValue": "(dyntype) e: 2.718280 × 10⁰⁰"
            }
          },
          {
            "name": "dyntype NaN/infinity support for fixed-point",
            "expr": "\"NaN: %f, infinity: %f\".format([dyn(\"NaN\"), dyn(\"Infinity\")])",
            "value": {
              "stringValue": "NaN: NaN, infinity: ∞"
            }
          },
          {
            "name": "dyntype support for timestamp",
            "expr": "\"dyntype timestamp: %s\".format([dyn(timestamp(\"2009-11-10T23:00:00Z\"))])",
            "value": {
              "stringValue": "dyntype timestamp: 2009-11-10T23:00:00Z"
            }
          },
          {
            "name": "dyntype support for duration",
            "expr": "\"dyntype duration: %s\".format([dyn(duration(\"8747s\"))])",
            "value": {
              "stringValue": "dyntype duration: 8747s"
            }
          },
          {
            "name": "dyntype support for lists",
            "expr": "\"dyntype list: %s\".format([dyn([6, 4.2, \"a string\"])])",
            "value": {
              "stringValue": "dyntype list: [6, 4.200000, \"a string\"]"
            }
          },
          {
            "name": "dyntype support for maps",
            "expr": "\"dyntype map: %s\".format([{\"strKey\":\"x\", 6:duration(\"422s\"), true:42}])",
            "value": {
              "stringValue": "dyntype map: {\"strKey\":\"x\", 6:duration(\"422s\"), true:42}"
            }
          },
          {
            "name": "message field support",
            "expr": "\"message field msg.single_int32: %d, msg.single_double: %.1f\".format([2, 1.0])",
            "value": {
              "stringValue": "message field msg.single_int32: 2, msg.single_double: 1.0"
            }
          },
          {
            "name": "string substitution in a string variable",
            "expr": "str_var.format([\"filler\"])",
            "typeEnv": [
              {
                "name": "str_var",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "str_var": {
                "value": {
                  "stringValue": "str is %s and some more"
                }
              }
            },
            "value": {
              "stringValue": "str is filler and some more"
            }
          },
          {
            "name": "multiple substitutions in a string variable",
            "expr": "str_var.format([1, 2, 3, \"A\", \"B\", \"C\", 4, 5, 6, \"D\", \"E\", \"F\"])",
            "typeEnv": [
              {
                "name": "str_var",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "str_var": {
                "value": {
                  "stringValue": "%d %d %d, %s %s %s, %d %d %d, %s %s %s"
                }
              }
            },
            "value": {
              "stringValue": "1 2 3, A B C, 4 5 6, D E F"
            }
          },
          {
            "name": "substution inside escaped percent signs in a string variable",
            "expr": "str_var.format([\"text\"])",
            "typeEnv": [
              {
                "name": "str_var",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "str_var": {
                "value": {
                  "stringValue": "%%%s%%"
                }
              }
            },
            "value": {
              "stringValue": "%text%"
            }
          },
          {
            "name": "fixed point formatting clause in a string variable",
            "expr": "str_var.format([1.2345])",
            "typeEnv": [
              {
                "name": "str_var",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "str_var": {
                "value": {
                  "stringValue": "%.3f"
                }
              }
            },
            "value": {
              "stringValue": "1.234"
            }
          },
          {
            "name": "binary formatting clause in a string variable",
            "expr": "str_var.format([5])",
            "typeEnv": [
              {
                "name": "str_var",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "str_var": {
                "value": {
                  "stringValue": "this is 5 in binary: %b"
                }
              }
            },
            "value": {
              "stringValue": "this is 5 in binary: 101"
            }
          },
          {
            "name": "scientific notation formatting clause in a string variable",
            "expr": "str_var.format([1052.032911275])",
            "typeEnv": [
              {
                "name": "str_var",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "str_var": {
                "value": {
                  "stringValue": "%.6e"
                }
              }
            },
            "value": {
              "stringValue": "1.052033 × 10⁰³"
            }
          },
          {
            "name": "default precision for fixed-point clause in a string variable",
            "expr": "str_var.format([2.71828])",
            "typeEnv": [
              {
                "name": "str_var",
                "ident": {
                  "type": {
                    "primitive": "STRING"
                  }
                }
              }
            ],
            "bindings": {
              "str_var": {
                "value": {
                  "stringValue": "%f"
                }
              }
            },
            "value": {
              "stringValue": "2.718280"
            }
          }
        ]
      },
      {
        "name": "format_errors",
        "test": [
          {
            "name": "multiline",
            "expr": "strings.quote(\"first\\nsecond\") == \"\\\"first\\\\nsecond\\\"\""
          },
          {
            "name": "unrecognized formatting clause",
            "expr": "\"%a\".format([1])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "could not parse formatting clause: unrecognized formatting clause \"a\""
                }
              ]
            }
          },
          {
            "name": "out of bounds arg index",
            "expr": "\"%d %d %d\".format([0, 1])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "index 2 out of range"
                }
              ]
            }
          },
          {
            "name": "string substitution is not allowed with binary clause",
            "expr": "\"string is %b\".format([\"abc\"])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: only integers and bools can be formatted as binary, was given string"
                }
              ]
            }
          },
          {
            "name": "duration substitution not allowed with decimal clause",
            "expr": "\"%d\".format([duration(\"30m2s\")])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: decimal clause can only be used on integers, was given google.protobuf.Duration"
                }
              ]
            }
          },
          {
            "name": "string substitution not allowed with octal clause",
            "expr": "\"octal: %o\".format([\"a string\"])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: octal clause can only be used on integers, was given string"
                }
              ]
            }
          },
          {
            "name": "double substitution not allowed with hex clause",
            "expr": "\"double is %x\".format([0.5])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: only integers, byte buffers, and strings can be formatted as hex, was given double"
                }
              ]
            }
          },
          {
            "name": "uppercase not allowed for scientific clause",
            "expr": "\"double is %E\".format([0.5])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "could not parse formatting clause: unrecognized formatting clause \"E\""
                }
              ]
            }
          },
          {
            "name": "object not allowed",
            "expr": "\"object is %s\".format([cel.expr.conformance.proto3.TestAllTypes{}])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: string clause can only be used on strings, bools, bytes, ints, doubles, maps, lists, types, durations, and timestamps, was given cel.expr.conformance.proto3.TestAllTypes"
                }
              ]
            }
          },
          {
            "name": "object inside list",
            "expr": "\"%s\".format([[1, 2, cel.expr.conformance.proto3.TestAllTypes{}]])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: string clause can only be used on strings, bools, bytes, ints, doubles, maps, lists, types, durations, and timestamps, was given cel.expr.conformance.proto3.TestAllTypes"
                }
              ]
            }
          },
          {
            "name": "object inside map",
            "expr": "\"%s\".format([{1: \"a\", 2: cel.expr.conformance.proto3.TestAllTypes{}}])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: string clause can only be used on strings, bools, bytes, ints, doubles, maps, lists, types, durations, and timestamps, was given cel.expr.conformance.proto3.TestAllTypes"
                }
              ]
            }
          },
          {
            "name": "null not allowed for %d",
            "expr": "\"null: %d\".format([null])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: decimal clause can only be used on integers, was given null_type"
                }
              ]
            }
          },
          {
            "name": "null not allowed for %e",
            "expr": "\"null: %e\".format([null])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: scientific clause can only be used on doubles, was given null_type"
                }
              ]
            }
          },
          {
            "name": "null not allowed for %f",
            "expr": "\"null: %f\".format([null])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: fixed-point clause can only be used on doubles, was given null_type"
                }
              ]
            }
          },
          {
            "name": "null not allowed for %x",
            "expr": "\"null: %x\".format([null])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: only integers, byte buffers, and strings can be formatted as hex, was given null_type"
                }
              ]
            }
          },
          {
            "name": "null not allowed for %X",
            "expr": "\"null: %X\".format([null])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: only integers, byte buffers, and strings can be formatted as hex, was given null_type"
                }
              ]
            }
          },
          {
            "name": "null not allowed for %b",
            "expr": "\"null: %b\".format([null])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: only integers and bools can be formatted as binary, was given null_type"
                }
              ]
            }
          },
          {
            "name": "null not allowed for %o",
            "expr": "\"null: %o\".format([null])",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "error during formatting: octal clause can only be used on integers, was given null_type"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "value_errors",
        "test": [
          {
            "name": "charat_out_of_range",
            "expr": "'tacocat'.charAt(30) == ''",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: 30"
                }
              ]
            }
          },
          {
            "name": "indexof_out_of_range",
            "expr": "'tacocat'.indexOf('a', 30) == -1",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: 30"
                }
              ]
            }
          },
          {
            "name": "lastindexof_negative_index",
            "expr": "'tacocat'.lastIndexOf('a', -1) == -1",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: -1"
                }
              ]
            }
          },
          {
            "name": "lastindexof_out_of_range",
            "expr": "'tacocat'.lastIndexOf('a', 30) == -1",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: 30"
                }
              ]
            }
          },
          {
            "name": "substring_out_of_range",
            "expr": "'tacocat'.substring(40) == 'cat'",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: 40"
                }
              ]
            }
          },
          {
            "name": "substring_negative_index",
            "expr": "'tacocat'.substring(-1) == 'cat'",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: -1"
                }
              ]
            }
          },
          {
            "name": "substring_end_index_out_of_range",
            "expr": "'tacocat'.substring(1, 50) == 'cat'",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: 50"
                }
              ]
            }
          },
          {
            "name": "substring_begin_index_out_of_range",
            "expr": "'tacocat'.substring(49, 50) == 'cat'",
            "evalError": {
              "errors": [
                {
                  "message": "index out of range: 49"
                }
              ]
            }
          },
          {
            "name": "substring_end_index_greater_than_begin_index",
            "expr": "'tacocat'.substring(4, 3) == ''",
            "evalError": {
              "errors": [
                {
                  "message": "invalid substring range. start: 4, end: 3"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "type_errors",
        "test": [
          {
            "name": "charat_invalid_type",
            "expr": "42.charAt(2) == ''",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "charat_invalid_argument",
            "expr": "'hello'.charAt(true) == ''",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "indexof_unary_invalid_type",
            "expr": "24.indexOf('2') == 0",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "indexof_unary_invalid_argument",
            "expr": "'hello'.indexOf(true) == 1",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "indexof_binary_invalid_argument",
            "expr": "42.indexOf('4', 0) == 0",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "indexof_binary_invalid_argument_2",
            "expr": "'42'.indexOf(4, 0) == 0",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "indexof_binary_both_invalid_arguments",
            "expr": "'42'.indexOf('4', '0') == 0",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "indexof_ternary_invalid_arguments",
            "expr": "'42'.indexOf('4', 0, 1) == 0",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "split_invalid_type",
            "expr": "42.split('2') == ['4']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_invalid_type",
            "expr": "42.replace(2, 1) == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_binary_invalid_argument",
            "expr": "'42'.replace(2, 1) == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_binary_invalid_argument_2",
            "expr": "'42'.replace('2', 1) == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_ternary_invalid_argument",
            "expr": "42.replace('2', '1', 1) == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_ternary_invalid_argument_2",
            "expr": "'42'.replace(2, '1', 1) == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_ternary_invalid_argument_3",
            "expr": "'42'.replace('2', 1, 1) == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_ternary_invalid_argument_4",
            "expr": "'42'.replace('2', '1', '1') == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "replace_quaternary_invalid_argument",
            "expr": "'42'.replace('2', '1', 1, false) == '41'",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "split_invalid_type_empty_arg",
            "expr": "42.split('') == ['4', '2']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "split_invalid_argument",
            "expr": "'42'.split(2) == ['4']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "split_binary_invalid_type",
            "expr": "42.split('2', '1') == ['4']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "split_binary_invalid_argument",
            "expr": "'42'.split(2, 1) == ['4']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "split_binary_invalid_argument_2",
            "expr": "'42'.split('2', '1') == ['4']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "split_ternary_invalid_argument",
            "expr": "'42'.split('2', 1, 1) == ['4']",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "substring_ternary_invalid_argument",
            "expr": "'hello'.substring(1, 2, 3) == ''",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "substring_binary_invalid_type",
            "expr": "30.substring(true, 3) == ''",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "substring_binary_invalid_argument",
            "expr": "'tacocat'.substring(true, 3) == ''",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          },
          {
            "name": "substring_binary_invalid_argument_2",
            "expr": "'tacocat'.substring(0, false) == ''",
            "disableCheck": true,
            "evalError": {
              "errors": [
                {
                  "message": "no such overload"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "timestamps",
    "description": "Timestamp and duration tests.",
    "section": [
      {
        "name": "timestamp_conversions",
        "description": "Conversions of timestamps to other types.",
        "test": [
          {
            "name": "toInt_timestamp",
            "expr": "int(timestamp('2009-02-13T23:31:30Z'))",
            "value": {
              "int64Value": "1234567890"
            }
          },
          {
            "name": "toString_timestamp",
            "expr": "string(timestamp('2009-02-13T23:31:30Z'))",
            "value": {
              "stringValue": "2009-02-13T23:31:30Z"
            }
          },
          {
            "name": "toString_timestamp_nanos",
            "expr": "string(timestamp('9999-12-31T23:59:59.999999999Z'))",
            "value": {
              "stringValue": "9999-12-31T23:59:59.999999999Z"
            }
          },
          {
            "name": "toType_timestamp",
            "expr": "type(timestamp('2009-02-13T23:31:30Z'))",
            "value": {
              "typeValue": "google.protobuf.Timestamp"
            }
          }
        ]
      },
      {
        "name": "duration_conversions",
        "description": "Conversions of durations to other types.",
        "test": [
          {
            "name": "toString_duration",
            "expr": "string(duration('1000000s'))",
            "value": {
              "stringValue": "1000000s"
            }
          },
          {
            "name": "toType_duration",
            "expr": "type(duration('1000000s'))",
            "value": {
              "typeValue": "google.protobuf.Duration"
            }
          }
        ]
      },
      {
        "name": "timestamp_selectors",
        "description": "Timestamp selection operators without timezones",
        "test": [
          {
            "name": "getDate",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDate()",
            "value": {
              "int64Value": "13"
            }
          },
          {
            "name": "getDayOfMonth",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDayOfMonth()",
            "value": {
              "int64Value": "12"
            }
          },
          {
            "name": "getDayOfWeek",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDayOfWeek()",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "getDayOfYear",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDayOfYear()",
            "value": {
              "int64Value": "43"
            }
          },
          {
            "name": "getFullYear",
            "expr": "timestamp('2009-02-13T23:31:30Z').getFullYear()",
            "value": {
              "int64Value": "2009"
            }
          },
          {
            "name": "getHours",
            "expr": "timestamp('2009-02-13T23:31:30Z').getHours()",
            "value": {
              "int64Value": "23"
            }
          },
          {
            "name": "getMilliseconds",
            "expr": "timestamp('2009-02-13T23:31:20.123456789Z').getMilliseconds()",
            "value": {
              "int64Value": "123"
            }
          },
          {
            "name": "getMinutes",
            "expr": "timestamp('2009-02-13T23:31:30Z').getMinutes()",
            "value": {
              "int64Value": "31"
            }
          },
          {
            "name": "getMonth",
            "expr": "timestamp('2009-02-13T23:31:30Z').getMonth()",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "getSeconds",
            "expr": "timestamp('2009-02-13T23:31:30Z').getSeconds()",
            "value": {
              "int64Value": "30"
            }
          }
        ]
      },
      {
        "name": "timestamp_selectors_tz",
        "description": "Timestamp selection operators with timezones",
        "test": [
          {
            "name": "getDate",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDate('Australia/Sydney')",
            "value": {
              "int64Value": "14"
            }
          },
          {
            "name": "getDayOfMonth_name_pos",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDayOfMonth('US/Central')",
            "value": {
              "int64Value": "12"
            }
          },
          {
            "name": "getDayOfMonth_numerical_pos",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDayOfMonth('+11:00')",
            "value": {
              "int64Value": "13"
            }
          },
          {
            "name": "getDayOfMonth_numerical_neg",
            "expr": "timestamp('2009-02-13T02:00:00Z').getDayOfMonth('-02:30')",
            "value": {
              "int64Value": "11"
            }
          },
          {
            "name": "getDayOfMonth_name_neg",
            "expr": "timestamp('2009-02-13T02:00:00Z').getDayOfMonth('America/St_Johns')",
            "value": {
              "int64Value": "11"
            }
          },
          {
            "name": "getDayOfWeek",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDayOfWeek('UTC')",
            "value": {
              "int64Value": "5"
            }
          },
          {
            "name": "getDayOfYear",
            "expr": "timestamp('2009-02-13T23:31:30Z').getDayOfYear('US/Central')",
            "value": {
              "int64Value": "43"
            }
          },
          {
            "name": "getFullYear",
            "expr": "timestamp('2009-02-13T23:31:30Z').getFullYear('-09:30')",
            "value": {
              "int64Value": "2009"
            }
          },
          {
            "name": "getHours",
            "expr": "timestamp('2009-02-13T23:31:30Z').getHours('02:00')",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "getMinutes",
            "expr": "timestamp('2009-02-13T23:31:30Z').getMinutes('Asia/Kathmandu')",
            "value": {
              "int64Value": "16"
            }
          },
          {
            "name": "getMonth",
            "expr": "timestamp('2009-02-13T23:31:30Z').getMonth('UTC')",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "getSeconds",
            "expr": "timestamp('2009-02-13T23:31:30Z').getSeconds('-00:00')",
            "value": {
              "int64Value": "30"
            }
          }
        ]
      },
      {
        "name": "timestamp_equality",
        "description": "Equality operations on timestamps.",
        "test": [
          {
            "name": "eq_same",
            "expr": "timestamp('2009-02-13T23:31:30Z') == timestamp('2009-02-13T23:31:30Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_diff",
            "expr": "timestamp('2009-02-13T23:31:29Z') == timestamp('2009-02-13T23:31:30Z')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "neq_same",
            "expr": "timestamp('1945-05-07T02:41:00Z') != timestamp('1945-05-07T02:41:00Z')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "neq_diff",
            "expr": "timestamp('2000-01-01T00:00:00Z') != timestamp('2001-01-01T00:00:00Z')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "duration_equality",
        "description": "Equality tests for durations.",
        "test": [
          {
            "name": "eq_same",
            "expr": "duration('123s') == duration('123s')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "eq_diff",
            "expr": "duration('60s') == duration('3600s')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "neq_same",
            "expr": "duration('604800s') != duration('604800s')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "neq_diff",
            "expr": "duration('86400s') != duration('86164s')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "timestamp_arithmetic",
        "description": "Arithmetic operations on timestamps and/or durations.",
        "test": [
          {
            "name": "add_duration_to_time",
            "expr": "timestamp('2009-02-13T23:00:00Z') + duration('240s') == timestamp('2009-02-13T23:04:00Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_time_to_duration",
            "expr": "duration('120s') + timestamp('2009-02-13T23:01:00Z') == timestamp('2009-02-13T23:03:00Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_duration_to_duration",
            "expr": "duration('600s') + duration('50s') == duration('650s')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_time_to_duration_nanos_negative",
            "expr": "timestamp('0001-01-01T00:00:01.000000001Z') + duration('-999999999ns') == timestamp('0001-01-01T00:00:00.000000002Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "add_time_to_duration_nanos_positive",
            "expr": "timestamp('0001-01-01T00:00:01.999999999Z') + duration('999999999ns') == timestamp('0001-01-01T00:00:02.999999998Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "subtract_duration_from_time",
            "expr": "timestamp('2009-02-13T23:10:00Z') - duration('600s') == timestamp('2009-02-13T23:00:00Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "subtract_time_from_time",
            "expr": "timestamp('2009-02-13T23:31:00Z') - timestamp('2009-02-13T23:29:00Z') == duration('120s')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "subtract_duration_from_duration",
            "expr": "duration('900s') - duration('42s') == duration('858s')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "comparisons",
        "description": "Comparisons on timestamps and/or durations.",
        "test": [
          {
            "name": "leq_timestamp_true",
            "expr": "timestamp('2009-02-13T23:00:00Z') <= timestamp('2009-02-13T23:00:00Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "leq_timestamp_false",
            "expr": "timestamp('2009-02-13T23:00:00Z') <= timestamp('2009-02-13T22:59:59Z')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "leq_duration_true",
            "expr": "duration('200s') <= duration('200s')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "leq_duration_false",
            "expr": "duration('300s') <= duration('200s')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "less_timestamp_true",
            "expr": "timestamp('2009-02-13T23:00:00Z') < timestamp('2009-03-13T23:00:00Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "less_duration_true",
            "expr": "duration('200s') < duration('300s')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "geq_timestamp_true",
            "expr": "timestamp('2009-02-13T23:00:00Z') >= timestamp('2009-02-13T23:00:00Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "geq_timestamp_false",
            "expr": "timestamp('2009-02-13T22:58:00Z') >= timestamp('2009-02-13T23:00:00Z')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "geq_duration_true",
            "expr": "duration('200s') >= duration('200s')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "geq_duration_false",
            "expr": "duration('120s') >= duration('200s')",
            "value": {
              "boolValue": false
            }
          },
          {
            "name": "greater_timestamp_true",
            "expr": "timestamp('2009-02-13T23:59:00Z') > timestamp('2009-02-13T23:00:00Z')",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "greater_duration_true",
            "expr": "duration('300s') > duration('200s')",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "duration_converters",
        "description": "Conversion functions on durations. Unlike timestamps, we don't, e.g. select the 'minutes' field - we convert the duration to integer minutes.",
        "test": [
          {
            "name": "get_hours",
            "expr": "duration('10000s').getHours()",
            "value": {
              "int64Value": "2"
            }
          },
          {
            "name": "get_milliseconds",
            "description": "Obtain the milliseconds component of the duration. Note, this is not the same as converting the duration to milliseconds. This behavior will be deprecated.",
            "expr": "x.getMilliseconds()",
            "typeEnv": [
              {
                "name": "x",
                "ident": {
                  "type": {
                    "messageType": "google.protobuf.Duration"
                  }
                }
              }
            ],
            "bindings": {
              "x": {
                "value": {
                  "objectValue": {
                    "@type": "type.googleapis.com/google.protobuf.Duration",
                    "value": "123.321456789s"
                  }
                }
              }
            },
            "value": {
              "int64Value": "321"
            }
          },
          {
            "name": "get_minutes",
            "expr": "duration('3730s').getMinutes()",
            "value": {
              "int64Value": "62"
            }
          },
          {
            "name": "get_seconds",
            "expr": "duration('3730s').getSeconds()",
            "value": {
              "int64Value": "3730"
            }
          }
        ]
      },
      {
        "name": "timestamp_range",
        "description": "Tests for out-of-range operations on timestamps.",
        "test": [
          {
            "name": "from_string_under",
            "expr": "timestamp('0000-01-01T00:00:00Z')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "from_string_over",
            "expr": "timestamp('10000-01-01T00:00:00Z')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "add_duration_under",
            "expr": "timestamp('0001-01-01T00:00:00Z') + duration('-1s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "add_duration_over",
            "expr": "timestamp('9999-12-31T23:59:59Z') + duration('1s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "add_duration_nanos_over",
            "expr": "timestamp('9999-12-31T23:59:59.999999999Z') + duration('1ns')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "add_duration_nanos_under",
            "expr": "timestamp('0001-01-01T00:00:00Z') + duration('-1ns')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "sub_time_duration_over",
            "expr": "timestamp('9999-12-31T23:59:59Z') - timestamp('0001-01-01T00:00:00Z')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "sub_time_duration_under",
            "expr": "timestamp('0001-01-01T00:00:00Z') - timestamp('9999-12-31T23:59:59Z')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          }
        ]
      },
      {
        "name": "duration_range",
        "description": "Tests for out-of-range operations on durations.",
        "test": [
          {
            "name": "from_string_under",
            "expr": "duration('-320000000000s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "from_string_over",
            "expr": "duration('320000000000s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "add_under",
            "expr": "duration('-200000000000s') + duration('-200000000000s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "add_over",
            "expr": "duration('200000000000s') + duration('200000000000s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "sub_under",
            "expr": "duration('-200000000000s') - duration('200000000000s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          },
          {
            "name": "sub_over",
            "expr": "duration('200000000000s') - duration('-200000000000s')",
            "evalError": {
              "errors": [
                {
                  "message": "range"
                }
              ]
            }
          }
        ]
      }
    ]
  },
  {
    "name": "unknowns",
    "description": "Tests for evaluation with unknown inputs."
  },
  {
    "name": "wrappers",
    "description": "Conformance tests related to wrapper types.",
    "section": [
      {
        "name": "bool",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.BoolValue{value: true}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.BoolValue{value: true}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_bool_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "int32",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.Int32Value{value: 1}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.Int32Value{value: 1}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_int32_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "int64",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.Int64Value{value: 1}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "int64Value": "1"
            }
          },
          {
            "name": "to_json_number",
            "expr": "TestAllTypes{single_value: google.protobuf.Int64Value{value: 1}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_json_string",
            "expr": "TestAllTypes{single_value: google.protobuf.Int64Value{value: 9223372036854775807}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "9223372036854775807"
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_int64_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "uint32",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.UInt32Value{value: 1u}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.UInt32Value{value: 1u}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_uint32_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "uint64",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.UInt64Value{value: 1u}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "uint64Value": "1"
            }
          },
          {
            "name": "to_json_number",
            "expr": "TestAllTypes{single_value: google.protobuf.UInt64Value{value: 1u}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_json_string",
            "expr": "TestAllTypes{single_value: google.protobuf.UInt64Value{value: 18446744073709551615u}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "18446744073709551615"
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_uint64_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "float",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.FloatValue{value: 1.0}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.FloatValue{value: 1.0}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_float_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "double",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.DoubleValue{value: 1.0}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.DoubleValue{value: 1.0}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "doubleValue": 1
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_double_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "bytes",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.BytesValue{value: b'foo'}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "bytesValue": "Zm9v"
            }
          },
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.BytesValue{value: b'foo'}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "Zm9v"
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_bytes_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "string",
        "test": [
          {
            "name": "to_any",
            "expr": "TestAllTypes{single_any: google.protobuf.StringValue{value: 'foo'}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.StringValue{value: 'foo'}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "foo"
            }
          },
          {
            "name": "to_null",
            "expr": "TestAllTypes{single_string_wrapper: null} == TestAllTypes{}",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "boolValue": true
            }
          }
        ]
      },
      {
        "name": "value",
        "test": [
          {
            "name": "default_to_json",
            "expr": "TestAllTypes{single_any: TestAllTypes{}.single_value}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "nullValue": null
            }
          }
        ]
      },
      {
        "name": "list_value",
        "test": [
          {
            "name": "literal_to_any",
            "expr": "TestAllTypes{single_any: []}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "listValue": {}
            }
          }
        ]
      },
      {
        "name": "struct",
        "test": [
          {
            "name": "literal_to_any",
            "expr": "TestAllTypes{single_any: {}}.single_any",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {}
            }
          }
        ]
      },
      {
        "name": "field_mask",
        "test": [
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.FieldMask{paths: ['foo', 'bar']}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "foo,bar"
            }
          }
        ]
      },
      {
        "name": "duration",
        "test": [
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: duration('1000000s')}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "1000000s"
            }
          }
        ]
      },
      {
        "name": "timestamp",
        "test": [
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: timestamp('9999-12-31T23:59:59.999999999Z')}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "stringValue": "9999-12-31T23:59:59.999999999Z"
            }
          }
        ]
      },
      {
        "name": "empty",
        "test": [
          {
            "name": "to_json",
            "expr": "TestAllTypes{single_value: google.protobuf.Empty{}}.single_value",
            "container": "cel.expr.conformance.proto3",
            "value": {
              "mapValue": {}
            }
          }
        ]
      }
    ]
  }
];