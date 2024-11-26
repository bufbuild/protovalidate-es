import {
  type IMessageTypeRegistry,
  type IExtensionRegistry,
  createRegistry,
  proto3,
  proto2,
} from "@bufbuild/protobuf";
import * as test_all_types_proto3 from "../gen/cel/expr/conformance/proto3/test_all_types_pb.js";
import * as test_all_types_proto2 from "../gen/cel/expr/conformance/proto2/test_all_types_pb.js";
import * as test_all_types_extensions_proto2 from "../gen/cel/expr/conformance/proto2/test_all_types_extensions_pb.js";

export function getTestRegistry(): IMessageTypeRegistry & IExtensionRegistry {
  return createRegistry(
    test_all_types_proto3.TestAllTypes,
    proto3.getEnumType(test_all_types_proto3.GlobalEnum),
    test_all_types_proto2.TestAllTypes,
    proto2.getEnumType(test_all_types_proto2.GlobalEnum),
    test_all_types_extensions_proto2.Proto2ExtensionScopedMessage,
    test_all_types_extensions_proto2.Proto2ExtensionScopedMessage_int64_ext,
    test_all_types_extensions_proto2.Proto2ExtensionScopedMessage_message_scoped_nested_ext,
    test_all_types_extensions_proto2.Proto2ExtensionScopedMessage_nested_enum_ext,
    test_all_types_extensions_proto2.Proto2ExtensionScopedMessage_message_scoped_repeated_test_all_types,
    test_all_types_extensions_proto2.int32_ext,
    test_all_types_extensions_proto2.nested_ext,
    test_all_types_extensions_proto2.test_all_types_ext,
    test_all_types_extensions_proto2.nested_enum_ext,
    test_all_types_extensions_proto2.repeated_test_all_types,
  );
}
