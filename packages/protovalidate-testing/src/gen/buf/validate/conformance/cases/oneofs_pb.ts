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

// @generated by protoc-gen-es v2.6.2 with parameter "target=ts,import_extension=.js,ts_nocheck=false"
// @generated from file buf/validate/conformance/cases/oneofs.proto (package buf.validate.conformance.cases, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv2";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv2";
import { file_buf_validate_validate } from "../../validate_pb.js";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file buf/validate/conformance/cases/oneofs.proto.
 */
export const file_buf_validate_conformance_cases_oneofs: GenFile = /*@__PURE__*/
  fileDesc("CitidWYvdmFsaWRhdGUvY29uZm9ybWFuY2UvY2FzZXMvb25lb2ZzLnByb3RvEh5idWYudmFsaWRhdGUuY29uZm9ybWFuY2UuY2FzZXMiJAoMVGVzdE9uZW9mTXNnEhQKA3ZhbBgBIAEoCEIHukgEagIIASIqCglPbmVvZk5vbmUSCwoBeBgBIAEoCUgAEgsKAXkYAiABKAVIAEIDCgFvInYKBU9uZW9mEhcKAXgYASABKAlCCrpIB3IFOgNmb29IABIUCgF5GAIgASgFQge6SAQaAiAASAASOQoBehgDIAEoCzIsLmJ1Zi52YWxpZGF0ZS5jb25mb3JtYW5jZS5jYXNlcy5UZXN0T25lb2ZNc2dIAEIDCgFvInQKDU9uZW9mUmVxdWlyZWQSCwoBeBgBIAEoCUgAEgsKAXkYAiABKAVIABIfChVuYW1lX3dpdGhfdW5kZXJzY29yZXMYAyABKAVIABIcChJ1bmRlcl9hbmRfMV9udW1iZXIYBCABKAVIAEIKCgFvEgW6SAIIASJOCh5PbmVvZlJlcXVpcmVkV2l0aFJlcXVpcmVkRmllbGQSEwoBYRgBIAEoCUIGukgDyAEBSAASCwoBYhgCIAEoCUgAQgoKAW8SBbpIAggBYgZwcm90bzM", [file_buf_validate_validate]);

/**
 * @generated from message buf.validate.conformance.cases.TestOneofMsg
 */
export type TestOneofMsg = Message<"buf.validate.conformance.cases.TestOneofMsg"> & {
  /**
   * @generated from field: bool val = 1;
   */
  val: boolean;
};

/**
 * Describes the message buf.validate.conformance.cases.TestOneofMsg.
 * Use `create(TestOneofMsgSchema)` to create a new message.
 */
export const TestOneofMsgSchema: GenMessage<TestOneofMsg> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_cases_oneofs, 0);

/**
 * @generated from message buf.validate.conformance.cases.OneofNone
 */
export type OneofNone = Message<"buf.validate.conformance.cases.OneofNone"> & {
  /**
   * @generated from oneof buf.validate.conformance.cases.OneofNone.o
   */
  o: {
    /**
     * @generated from field: string x = 1;
     */
    value: string;
    case: "x";
  } | {
    /**
     * @generated from field: int32 y = 2;
     */
    value: number;
    case: "y";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message buf.validate.conformance.cases.OneofNone.
 * Use `create(OneofNoneSchema)` to create a new message.
 */
export const OneofNoneSchema: GenMessage<OneofNone> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_cases_oneofs, 1);

/**
 * @generated from message buf.validate.conformance.cases.Oneof
 */
export type Oneof = Message<"buf.validate.conformance.cases.Oneof"> & {
  /**
   * @generated from oneof buf.validate.conformance.cases.Oneof.o
   */
  o: {
    /**
     * @generated from field: string x = 1;
     */
    value: string;
    case: "x";
  } | {
    /**
     * @generated from field: int32 y = 2;
     */
    value: number;
    case: "y";
  } | {
    /**
     * @generated from field: buf.validate.conformance.cases.TestOneofMsg z = 3;
     */
    value: TestOneofMsg;
    case: "z";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message buf.validate.conformance.cases.Oneof.
 * Use `create(OneofSchema)` to create a new message.
 */
export const OneofSchema: GenMessage<Oneof> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_cases_oneofs, 2);

/**
 * @generated from message buf.validate.conformance.cases.OneofRequired
 */
export type OneofRequired = Message<"buf.validate.conformance.cases.OneofRequired"> & {
  /**
   * @generated from oneof buf.validate.conformance.cases.OneofRequired.o
   */
  o: {
    /**
     * @generated from field: string x = 1;
     */
    value: string;
    case: "x";
  } | {
    /**
     * @generated from field: int32 y = 2;
     */
    value: number;
    case: "y";
  } | {
    /**
     * @generated from field: int32 name_with_underscores = 3;
     */
    value: number;
    case: "nameWithUnderscores";
  } | {
    /**
     * @generated from field: int32 under_and_1_number = 4;
     */
    value: number;
    case: "underAnd1Number";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message buf.validate.conformance.cases.OneofRequired.
 * Use `create(OneofRequiredSchema)` to create a new message.
 */
export const OneofRequiredSchema: GenMessage<OneofRequired> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_cases_oneofs, 3);

/**
 * @generated from message buf.validate.conformance.cases.OneofRequiredWithRequiredField
 */
export type OneofRequiredWithRequiredField = Message<"buf.validate.conformance.cases.OneofRequiredWithRequiredField"> & {
  /**
   * @generated from oneof buf.validate.conformance.cases.OneofRequiredWithRequiredField.o
   */
  o: {
    /**
     * @generated from field: string a = 1;
     */
    value: string;
    case: "a";
  } | {
    /**
     * @generated from field: string b = 2;
     */
    value: string;
    case: "b";
  } | { case: undefined; value?: undefined };
};

/**
 * Describes the message buf.validate.conformance.cases.OneofRequiredWithRequiredField.
 * Use `create(OneofRequiredWithRequiredFieldSchema)` to create a new message.
 */
export const OneofRequiredWithRequiredFieldSchema: GenMessage<OneofRequiredWithRequiredField> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_cases_oneofs, 4);

