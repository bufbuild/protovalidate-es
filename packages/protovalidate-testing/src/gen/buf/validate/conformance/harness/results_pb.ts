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
// @generated from file buf/validate/conformance/harness/results.proto (package buf.validate.conformance.harness, syntax proto3)
/* eslint-disable */

import type { GenFile, GenMessage } from "@bufbuild/protobuf/codegenv2";
import { fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv2";
import type { TestResult } from "./harness_pb.js";
import { file_buf_validate_conformance_harness_harness } from "./harness_pb.js";
import type { Any, FileDescriptorSet } from "@bufbuild/protobuf/wkt";
import { file_google_protobuf_any, file_google_protobuf_descriptor } from "@bufbuild/protobuf/wkt";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file buf/validate/conformance/harness/results.proto.
 */
export const file_buf_validate_conformance_harness_results: GenFile = /*@__PURE__*/
  fileDesc("Ci5idWYvdmFsaWRhdGUvY29uZm9ybWFuY2UvaGFybmVzcy9yZXN1bHRzLnByb3RvEiBidWYudmFsaWRhdGUuY29uZm9ybWFuY2UuaGFybmVzcyKHAQoNUmVzdWx0T3B0aW9ucxIUCgxzdWl0ZV9maWx0ZXIYASABKAkSEwoLY2FzZV9maWx0ZXIYAiABKAkSDwoHdmVyYm9zZRgDIAEoCBIWCg5zdHJpY3RfbWVzc2FnZRgFIAEoCBIUCgxzdHJpY3RfZXJyb3IYBiABKAhKBAgEEAVSBnN0cmljdCLNAQoJUmVzdWx0U2V0EhEKCXN1Y2Nlc3NlcxgBIAEoBRIQCghmYWlsdXJlcxgCIAEoBRI+CgZzdWl0ZXMYAyADKAsyLi5idWYudmFsaWRhdGUuY29uZm9ybWFuY2UuaGFybmVzcy5TdWl0ZVJlc3VsdHMSQAoHb3B0aW9ucxgEIAEoCzIvLmJ1Zi52YWxpZGF0ZS5jb25mb3JtYW5jZS5oYXJuZXNzLlJlc3VsdE9wdGlvbnMSGQoRZXhwZWN0ZWRfZmFpbHVyZXMYBSABKAUizAEKDFN1aXRlUmVzdWx0cxIMCgRuYW1lGAEgASgJEhEKCXN1Y2Nlc3NlcxgCIAEoBRIQCghmYWlsdXJlcxgDIAEoBRI7CgVjYXNlcxgEIAMoCzIsLmJ1Zi52YWxpZGF0ZS5jb25mb3JtYW5jZS5oYXJuZXNzLkNhc2VSZXN1bHQSMQoFZmRzZXQYBSABKAsyIi5nb29nbGUucHJvdG9idWYuRmlsZURlc2NyaXB0b3JTZXQSGQoRZXhwZWN0ZWRfZmFpbHVyZXMYBiABKAUi4wEKCkNhc2VSZXN1bHQSDAoEbmFtZRgBIAEoCRIPCgdzdWNjZXNzGAIgASgIEjwKBndhbnRlZBgDIAEoCzIsLmJ1Zi52YWxpZGF0ZS5jb25mb3JtYW5jZS5oYXJuZXNzLlRlc3RSZXN1bHQSOQoDZ290GAQgASgLMiwuYnVmLnZhbGlkYXRlLmNvbmZvcm1hbmNlLmhhcm5lc3MuVGVzdFJlc3VsdBIjCgVpbnB1dBgFIAEoCzIULmdvb2dsZS5wcm90b2J1Zi5BbnkSGAoQZXhwZWN0ZWRfZmFpbHVyZRgGIAEoCGIGcHJvdG8z", [file_buf_validate_conformance_harness_harness, file_google_protobuf_any, file_google_protobuf_descriptor]);

/**
 * ResultOptions are the options passed to the test runner to configure the
 * test run.
 *
 * @generated from message buf.validate.conformance.harness.ResultOptions
 */
export type ResultOptions = Message<"buf.validate.conformance.harness.ResultOptions"> & {
  /**
   * The suite filter is a regex that matches against the suite name.
   *
   * @generated from field: string suite_filter = 1;
   */
  suiteFilter: string;

  /**
   * The case filter is a regex that matches against the case name.
   *
   * @generated from field: string case_filter = 2;
   */
  caseFilter: string;

  /**
   * If the test runner should print verbose output.
   *
   * @generated from field: bool verbose = 3;
   */
  verbose: boolean;

  /**
   * If the violation message must be an exact match.
   *
   * @generated from field: bool strict_message = 5;
   */
  strictMessage: boolean;

  /**
   * If the distinction between runtime and compile time errors must be exact.
   *
   * @generated from field: bool strict_error = 6;
   */
  strictError: boolean;
};

/**
 * Describes the message buf.validate.conformance.harness.ResultOptions.
 * Use `create(ResultOptionsSchema)` to create a new message.
 */
export const ResultOptionsSchema: GenMessage<ResultOptions> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_harness_results, 0);

/**
 * A result is the result of a test run.
 *
 * @generated from message buf.validate.conformance.harness.ResultSet
 */
export type ResultSet = Message<"buf.validate.conformance.harness.ResultSet"> & {
  /**
   * Count of successes.
   *
   * @generated from field: int32 successes = 1;
   */
  successes: number;

  /**
   * Count of failures.
   *
   * @generated from field: int32 failures = 2;
   */
  failures: number;

  /**
   * List of suite results.
   *
   * @generated from field: repeated buf.validate.conformance.harness.SuiteResults suites = 3;
   */
  suites: SuiteResults[];

  /**
   * Options used to generate this result.
   *
   * @generated from field: buf.validate.conformance.harness.ResultOptions options = 4;
   */
  options?: ResultOptions;

  /**
   * Count of expected failures.
   *
   * @generated from field: int32 expected_failures = 5;
   */
  expectedFailures: number;
};

/**
 * Describes the message buf.validate.conformance.harness.ResultSet.
 * Use `create(ResultSetSchema)` to create a new message.
 */
export const ResultSetSchema: GenMessage<ResultSet> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_harness_results, 1);

/**
 * A suite result is a single test suite result.
 *
 * @generated from message buf.validate.conformance.harness.SuiteResults
 */
export type SuiteResults = Message<"buf.validate.conformance.harness.SuiteResults"> & {
  /**
   * The suite name.
   *
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * Count of successes.
   *
   * @generated from field: int32 successes = 2;
   */
  successes: number;

  /**
   * Count of failures.
   *
   * @generated from field: int32 failures = 3;
   */
  failures: number;

  /**
   * List of case results.
   *
   * @generated from field: repeated buf.validate.conformance.harness.CaseResult cases = 4;
   */
  cases: CaseResult[];

  /**
   * The file descriptor set used to generate this result.
   *
   * @generated from field: google.protobuf.FileDescriptorSet fdset = 5;
   */
  fdset?: FileDescriptorSet;

  /**
   * Count of expected failures.
   *
   * @generated from field: int32 expected_failures = 6;
   */
  expectedFailures: number;
};

/**
 * Describes the message buf.validate.conformance.harness.SuiteResults.
 * Use `create(SuiteResultsSchema)` to create a new message.
 */
export const SuiteResultsSchema: GenMessage<SuiteResults> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_harness_results, 2);

/**
 * A case result is a single test case result.
 *
 * @generated from message buf.validate.conformance.harness.CaseResult
 */
export type CaseResult = Message<"buf.validate.conformance.harness.CaseResult"> & {
  /**
   * The case name.
   *
   * @generated from field: string name = 1;
   */
  name: string;

  /**
   * Success state of the test case. True if the test case succeeded.
   *
   * @generated from field: bool success = 2;
   */
  success: boolean;

  /**
   * The expected result.
   *
   * @generated from field: buf.validate.conformance.harness.TestResult wanted = 3;
   */
  wanted?: TestResult;

  /**
   * The actual result.
   *
   * @generated from field: buf.validate.conformance.harness.TestResult got = 4;
   */
  got?: TestResult;

  /**
   * The input used to invoke the test case.
   *
   * @generated from field: google.protobuf.Any input = 5;
   */
  input?: Any;

  /**
   * Denotes if the test is expected to fail. True, if the test case was expected to fail.
   *
   * @generated from field: bool expected_failure = 6;
   */
  expectedFailure: boolean;
};

/**
 * Describes the message buf.validate.conformance.harness.CaseResult.
 * Use `create(CaseResultSchema)` to create a new message.
 */
export const CaseResultSchema: GenMessage<CaseResult> = /*@__PURE__*/
  messageDesc(file_buf_validate_conformance_harness_results, 3);

