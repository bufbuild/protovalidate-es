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

import * as assert from "node:assert/strict";
import { suite, test } from "node:test";
import {
  bytesContains,
  bytesEndsWith,
  bytesStartsWith,
  isEmail,
  isHostAndPort,
  isHostname,
  isInf,
  isIp,
  isIpPrefix,
  isUri,
  isUriRef,
  unique,
} from "./lib.js";
import { type CelResult, CelUint } from "@bufbuild/cel";

void suite("isHostname", () => {
  function t(name: string, val: string) {
    const m = /^(valid|invalid)\/.+/.exec(name);
    assert.ok(m !== null);
    const expect = m[1] === "valid";
    void test(name, () => {
      assert.strictEqual(isHostname(val), expect);
    });
  }

  t("valid/basic_rfc1034_example_1", "A.ISI.EDU");
  t("valid/basic_rfc1034_example_2", "XX.LCS.MIT.EDU");
  t("valid/basic_rfc1034_example_3", "SRI-NIC.ARPA");
  t("valid/basic_example", "example.com");
  t("valid/basic/basic_example_with_hyphen", "foo-bar.com");
  t("invalid/empty_string", "");
  t("invalid/leading_space", " example.com");
  t("invalid/trailing_space", "example.com ");
  t("invalid/underscore", "foo_bar.com");
  t("invalid/internationalized_domain_name", "你好.com");
  t(
    "valid/label_all_characters",
    "abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  );
  t(
    "valid/name_253_characters",
    "123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.abc",
  );
  t(
    "invalid/name_254_characters",
    "123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.abcd",
  );
  t("invalid/single_dot", ".");
  t("valid/trailing_dot", "a.");
  t("invalid/empty_label", ".a");
  t("invalid/empty_label_trailing_dot", "..");
  t("invalid/empty_interior_label", "a..b");
  t("valid/label_interior_hyphen", "a-b.a--b");
  t("invalid/label_starts_with_hyphen", "-a");
  t("invalid/label_ends_with_hyphen", "a-");
  t(
    "valid/label_can_start_and_end_with_letter",
    "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P.Q.R.S.T.U.V.W.X.Y.Z",
  );
  t(
    "valid/labels_can_start_and_end_with_digits_but_last_label_must_not_be_all_digits",
    "0.1.2.3.4.5.6.7.8.9.com",
  );
  t("valid/single_label_must_not_be_all_digits", "com1");
  t("invalid/last_label_must_not_be_all_digits", "a.1");
  t(
    "valid/label_must_end_with_letter_or_digit",
    "a.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9",
  );
  t(
    "valid/label_must_start_with_letter_or_digit",
    "0.1.2.3.4.5.6.7.8.9.0a.1a.2a.3a.4a.5a.6a.7a.8a.9a",
  );
  t(
    "valid/first_label_63_characters",
    "abc012345678901234567890123456789012345678901234567890123456789.com",
  );
  t(
    "valid/last_label_63_characters",
    "foo.abc012345678901234567890123456789012345678901234567890123456789",
  );
  t(
    "valid/interior_label_63_characters",
    "foo.abc012345678901234567890123456789012345678901234567890123456789.com",
  );
  t(
    "invalid/first_label_64_characters",
    "abcd012345678901234567890123456789012345678901234567890123456789.com",
  );
  t(
    "invalid/last_label_64_characters",
    "foo.abcd012345678901234567890123456789012345678901234567890123456789",
  );
  t(
    "invalid/interior_label_64_characters",
    "foo.abcd012345678901234567890123456789012345678901234567890123456789.com",
  );
  t("invalid/fuzz1", "İ");
});

void suite("isHostAndPort", () => {
  function t(name: string, val: string) {
    const m = /^port_required\/(true|false)\/(valid|invalid)\/.+/.exec(name);
    assert.ok(m !== null);
    const portRequired = m[1] === "true";
    const expect = m[2] === "valid";
    void test(name, () => {
      assert.strictEqual(isHostAndPort(val, portRequired), expect);
      if (expect && portRequired) {
        // A valid host with required port must be a valid host with optional port
        assert.strictEqual(isHostAndPort(val, false), expect);
      }
    });
  }

  t("port_required/false/valid/example", "example.com");
  t("port_required/true/valid/example", "example.com:8080");
  t("port_required/false/valid/trailing_dot", "a.");
  t("port_required/false/invalid/empty_string", "");
  t("port_required/false/invalid/leading_space", " example.com");
  t("port_required/false/invalid/trailing_space", "example.com ");
  t("port_required/true/invalid/empty_string", "");
  t("port_required/true/invalid/leading_space", " example.com");
  t("port_required/true/invalid/trailing_space", "example.com ");
  t("port_required/false/invalid/internationalized_domain_name", "你好.com");
  t("port_required/true/invalid/missing_port", "example.com");
  t("port_required/true/invalid/missing_port_number", "example.com:");
  t("port_required/false/invalid/missing_port_number", "example.com:");
  t("port_required/true/valid/port_zero", "example.com:0");
  t("port_required/true/invalid/port_double_zero", "example.com:00");
  t("port_required/true/invalid/port_leading_zero", "example.com:080");
  t("port_required/false/invalid/port_double_zero", "example.com:00");
  t("port_required/false/invalid/port_leading_zero", "example.com:080");
  t("port_required/true/invalid/port_number_sign", "example.com:+0");
  t("port_required/false/invalid/port_number_sign", "example.com:+0");
  t("port_required/false/invalid/port_number_0x", "example.com:0xFA");
  t("port_required/true/invalid/port_number_0x", "example.com:0xFA");
  t("port_required/false/valid/port_65535", "example.com:65535");
  t("port_required/true/valid/port_65535", "example.com:65535");
  t("port_required/false/invalid/port_65536", "example.com:65536");
  t("port_required/true/invalid/port_65536", "example.com:65536");
  t("port_required/false/valid/ipv4", "192.168.0.1");
  t("port_required/false/valid/ipv4_min", "0.0.0.0");
  t("port_required/false/valid/ipv4_max", "255.255.255.255");
  t("port_required/false/invalid/ipv4_octet_too_big", "256.0.0.0");
  t("port_required/false/invalid/ipv4_missing_octet", "127.0.0");
  t("port_required/false/invalid/ipv4_empty_octet", "127..0.1");
  t("port_required/true/valid/ipv4_port_zero", "192.168.0.1:0");
  t("port_required/false/valid/ipv4_port_zero", "192.168.0.1:0");
  t("port_required/true/valid/ipv4_port_8080", "192.168.0.1:8080");
  t("port_required/false/valid/ipv4_port_8080", "192.168.0.1:8080");
  t("port_required/false/valid/ipv4_port_65535", "192.168.0.1:65535");
  t("port_required/true/invalid/ipv4_port_65536", "192.168.0.1:65536");
  t("port_required/true/invalid/ipv4_missing_port", "192.168.0.1");
  t("port_required/false/valid/ipv4_missing_port", "192.168.0.1");
  t("port_required/true/invalid/ipv4_missing_port_number", "192.168.0.1:");
  t("port_required/false/invalid/ipv4_missing_port_number", "192.168.0.1:");
  t("port_required/false/valid/ipv6", "[::1]");
  t("port_required/false/valid/ipv6_with_zone-id", "[::1%foo]");
  t("port_required/false/valid/ipv6_min", "[0:0:0:0:0:0:0:0]");
  t(
    "port_required/false/valid/ipv6_max",
    "[ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff]",
  );
  t(
    "port_required/false/valid/ipv6_embedded_ipv4",
    "[0:0:0:0:0:ffff:192.1.56.10]",
  );
  t("port_required/false/invalid/ipv6_zone-id_too_short", "[::1%]");
  t(
    "port_required/false/valid/ipv6_zone-id_any_non_null_character",
    "[::1%% :x\x1F]",
  );
  t(
    "port_required/false/valid/ipv6_zone-id_any_non_null_character_2",
    "[::0%00]]",
  );
  t("port_required/false/invalid/ipv4_in_brackets", "[127.0.0.1]");
  t("port_required/false/invalid/name_in_brackets", "[example.com]");
  t("port_required/true/valid/ipv6_port_0", "[::1]:0");
  t("port_required/true/valid/ipv6_port_8080", "[::1]:8080");
  t("port_required/true/valid/ipv6_port_65535", "[::1]:65535");
  t("port_required/true/invalid/ipv6_port_65536", "[::1]:65536");
  t("port_required/true/invalid/ipv6_missing_port", "[::1]");
  t("port_required/true/invalid/ipv6_missing_port_number", "[::1]:");
});

void suite("isIpPrefix", () => {
  function t(name: string, val: string) {
    const m =
      /^version\/(omitted|\d+)\/strict\/(omitted|true|false)\/(valid|invalid)\/.+/.exec(
        name,
      );
    assert.ok(m !== null);
    const version = m[1] === "omitted" ? undefined : parseInt(m[1]);
    const strict = m[2] === "omitted" ? undefined : m[2] === "true";
    const expect = m[3] === "valid";
    void test(name, () => {
      assert.strictEqual(isIpPrefix(val, version, strict), expect);
      if (typeof version == "number") {
        // Version given as number or bigint must have same result
        assert.strictEqual(isIpPrefix(val, BigInt(version), strict), expect);
      }
      if (expect && strict === true) {
        // A valid strict prefix must be a valid unstrict prefix
        assert.strictEqual(isIpPrefix(val, version, false), true);
      }
      if (expect && version === 4) {
        // A valid IPv4 prefix cannot be a valid IPv6 prefix
        assert.strictEqual(isIpPrefix(val, 6, strict), false);
      }
      if (expect && version === 6) {
        // A valid IPv6 prefix cannot be a valid IPv4 prefix
        assert.strictEqual(isIpPrefix(val, 4, strict), false);
      }
    });
  }

  t("version/4/strict/false/valid/example", "192.168.5.21/16");
  t("version/6/strict/false/valid/example", "2001:0DB8:ABCD:0012::F1/64");
  t("version/4/strict/true/valid/example", "192.168.0.0/16");
  t("version/6/strict/true/valid/example", "2001:0DB8:ABCD:0012::0/64");
  t("version/omitted/strict/omitted/valid/ipv6_prefix", "::1/64");
  t("version/omitted/strict/omitted/valid/ipv4_prefix", "127.0.0.1/16");
  t("version/0/strict/omitted/valid/ipv6_prefix", "::1/64");
  t("version/0/strict/omitted/valid/ipv4_prefix", "127.0.0.1/16");
  t("version/6/strict/omitted/valid/ipv6_prefix", "::1/64");
  t("version/4/strict/omitted/valid/ipv4_prefix", "127.0.0.1/16");
  t("version/6/strict/omitted/invalid/ipv4_prefix", "127.0.0.1/16");
  t("version/4/strict/omitted/invalid/ipv6_prefix", "::1/64");
  t("version/5/strict/omitted/invalid/ipv6_prefix", "::1/64");
  t("version/7/strict/omitted/invalid/ipv6_prefix", "::1/64");
  t(
    "version/omitted/strict/true/valid/ipv6_prefix",
    "2001:0DB8:ABCD:0012:0:0:0:0/64",
  );
  t("version/omitted/strict/true/valid/ipv4_prefix", "255.255.0.0/16");
  t(
    "version/omitted/strict/true/invalid/ipv6_prefix",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64",
  );
  t("version/omitted/strict/true/invalid/ipv4_prefix", "255.255.128.0/16");
  t(
    "version/omitted/strict/false/valid/ipv6_prefix",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64",
  );
  t("version/omitted/strict/false/valid/ipv4_prefix", "255.255.128.0/16");
  t(
    "version/omitted/strict/omitted/valid/ipv6_prefix/a",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64",
  );
  t(
    "version/omitted/strict/omitted/valid/ipv6_prefix/b",
    "2001:0DB8:ABCD:0012:0:0:0:0/64",
  );
  t("version/omitted/strict/omitted/invalid/empty_string", "");
  t("version/1/strict/omitted/invalid/empty_string", "");
  t("version/4/strict/omitted/invalid/empty_string", "");
  t("version/6/strict/omitted/invalid/empty_string", "");
  t(
    "version/omitted/strict/omitted/invalid/ipv6_prefix_leading_space",
    " ::1/64",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv6_prefix_trailing_space",
    "::1/64 ",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv4_prefix_leading_space",
    " 127.0.0.1/16",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv4_prefix_trailing_space",
    "127.0.0.1/16 ",
  );
  t(
    "version/omitted/strict/omitted/valid/ipv4_prefix_16/a",
    "255.255.128.0/16",
  );
  t("version/omitted/strict/omitted/valid/ipv4_prefix_16/b", "255.255.0.0/16");
  t("version/omitted/strict/omitted/valid/ipv4_prefix_24", "192.168.1.0/24");
  t("version/omitted/strict/omitted/valid/ipv4_prefix_0", "192.168.1.0/0");
  t("version/omitted/strict/omitted/valid/ipv4_0_prefix_0", "0.0.0.0/0");
  t("version/omitted/strict/true/invalid/ipv4_prefix_0", "1.0.0.0/0");
  t(
    "version/omitted/strict/omitted/valid/ipv4_prefix_32/a",
    "255.255.255.255/32",
  );
  t("version/omitted/strict/omitted/valid/ipv4_prefix_32/b", "192.168.1.0/32");
  t("version/omitted/strict/omitted/invalid/ipv4_prefix_33", "192.168.1.0/33");
  t(
    "version/omitted/strict/omitted/invalid/ipv4_bad_leading_zero_in_prefix-length",
    "192.168.1.0/024",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv4_bad_prefix-length",
    "192.168.1.0/12345678901234567890",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv4_missing_prefix-length",
    "192.168.1.0/",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv4_missing_prefix",
    "192.168.1.0",
  );
  t("version/omitted/strict/true/valid/ipv4_prefix_0", "0.0.0.0/0");
  t("version/omitted/strict/true/invalid/ipv4_prefix_0/a", "1.0.0.0/0");
  t("version/omitted/strict/true/invalid/ipv4_prefix_0/b", "128.0.0.0/0");
  t("version/omitted/strict/true/valid/ipv4_prefix_1/a", "0.0.0.0/1");
  t("version/omitted/strict/true/valid/ipv4_prefix_1/b", "128.0.0.0/1");
  t("version/omitted/strict/true/invalid/ipv4_prefix_1/a", "127.0.0.0/1");
  t("version/omitted/strict/true/invalid/ipv4_prefix_1/b", "129.0.0.0/1");
  t("version/omitted/strict/true/invalid/ipv4_prefix_1/c", "1.0.0.0/1");
  t("version/omitted/strict/true/valid/ipv4_prefix_2/a", "192.0.0.0/2");
  t("version/omitted/strict/true/valid/ipv4_prefix_2/b", "64.0.0.0/2");
  t("version/omitted/strict/true/valid/ipv4_prefix_2/c", "0.0.0.0/2");
  t("version/omitted/strict/true/invalid/ipv4_prefix_2/a", "193.0.0.0/2");
  t("version/omitted/strict/true/invalid/ipv4_prefix_2/b", "224.0.0.0/2");
  t("version/omitted/strict/true/valid/ipv4_prefix_7/a", "254.0.0.0/7");
  t("version/omitted/strict/true/valid/ipv4_prefix_7/b", "0.0.0.0/7");
  t("version/omitted/strict/true/invalid/ipv4_prefix_7/a", "255.0.0.0/7");
  t("version/omitted/strict/true/valid/ipv4_prefix_8/a", "255.0.0.0/8");
  t("version/omitted/strict/true/valid/ipv4_prefix_8/b", "128.0.0.0/8");
  t("version/omitted/strict/true/valid/ipv4_prefix_8/c", "0.0.0.0/8");
  t("version/omitted/strict/true/invalid/ipv4_prefix_8/a", "255.128.0.0/8");
  t("version/omitted/strict/true/valid/ipv4_prefix_9", "255.128.0.0/9");
  t("version/omitted/strict/true/valid/ipv4_prefix_15", "255.254.0.0/15");
  t("version/omitted/strict/true/valid/ipv4_prefix_16/a", "255.255.0.0/16");
  t("version/omitted/strict/true/valid/ipv4_prefix_16/b", "0.0.0.0/16");
  t("version/omitted/strict/true/invalid/ipv4_prefix_16/a", "255.255.128.0/16");
  t("version/omitted/strict/true/invalid/ipv4_prefix_16/b", "255.255.0.128/16");
  t("version/omitted/strict/true/valid/ipv4_prefix_17", "255.255.128.0/17");
  t("version/omitted/strict/true/valid/ipv4_prefix_23/a", "255.255.254.0/23");
  t("version/omitted/strict/true/valid/ipv4_prefix_23/b", "0.0.0.0/23");
  t("version/omitted/strict/true/invalid/ipv4_prefix_23/a", "255.255.255.0/23");
  t(
    "version/omitted/strict/true/invalid/ipv4_prefix_23/b",
    "255.255.254.128/23",
  );
  t("version/omitted/strict/true/valid/ipv4_prefix_24/a", "255.255.255.0/24");
  t("version/omitted/strict/true/valid/ipv4_prefix_24/b", "0.0.0.0/24");
  t("version/omitted/strict/true/invalid/ipv4_prefix_24", "255.255.255.128/24");
  t("version/omitted/strict/true/valid/ipv4_prefix_25/a", "255.255.255.128/25");
  t("version/omitted/strict/true/valid/ipv4_prefix_25/b", "0.0.0.0/25");
  t("version/omitted/strict/true/invalid/ipv4_prefix_25", "255.255.255.129/25");
  t("version/omitted/strict/true/valid/ipv4_prefix_31/a", "255.255.255.254/31");
  t("version/omitted/strict/true/valid/ipv4_prefix_31/b", "0.0.0.0/31");
  t("version/omitted/strict/true/invalid/ipv4_prefix_31", "255.255.255.255/31");
  t("version/omitted/strict/true/valid/ipv4_prefix_32/a", "255.255.255.255/32");
  t("version/omitted/strict/true/valid/ipv4_prefix_32/b", "0.0.0.0/32");
  t(
    "version/omitted/strict/omitted/valid/ipv6_prefix_64",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64",
  );
  t("version/omitted/strict/omitted/valid/ipv6_compressed_prefix/a", "::1/64");
  t(
    "version/omitted/strict/omitted/valid/ipv6_compressed_prefix/b",
    "::2:3:4:5:6:7:8/128",
  );
  t(
    "version/omitted/strict/omitted/valid/ipv6_compressed_prefix/c",
    "1:2:3:4::6:7:8/128",
  );
  t(
    "version/omitted/strict/omitted/valid/ipv6_compressed_prefix/d",
    "1::8/128",
  );
  t(
    "version/omitted/strict/omitted/valid/ipv6_compressed_prefix/e",
    "1:2:3:4:5:6:7::/128",
  );
  t("version/omitted/strict/omitted/valid/ipv6_compressed_prefix/f", "1::/128");
  t("version/omitted/strict/omitted/valid/ipv6_compressed_prefix/g", "::/128");
  t(
    "version/omitted/strict/omitted/valid/ipv6_prefix-length_0",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/0",
  );
  t(
    "version/omitted/strict/omitted/valid/ipv6_prefix-length_128",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/128",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv6_prefix-length_129",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/129",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv6_bad_leading_zero_in_prefix-length",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/024",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv6_bad_prefix-length",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/12345678901234567890",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv6_missing_prefix-length",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/",
  );
  t(
    "version/omitted/strict/omitted/invalid/ipv6_missing_prefix",
    "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF",
  );
  t("version/omitted/strict/omitted/invalid/ipv6_zone-id/a", "::1%en1/64");
  t("version/omitted/strict/omitted/invalid/ipv6_zone-id/b", "::1/64%en1");
  t("version/omitted/strict/true/valid/ipv6_prefix_0", "0:0:0:0:0:0:0:0/0");
  t("version/omitted/strict/true/invalid/ipv6_prefix_0", "1:0:0:0:0:0:0:0/0");
  t("version/omitted/strict/true/valid/ipv6_prefix_1/a", "0:0:0:0:0:0:0:0/1");
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_1/b",
    "8000:0:0:0:0:0:0:0/1",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_prefix_1",
    "c000:0:0:0:0:0:0:0/1",
  );
  t("version/omitted/strict/true/valid/ipv6_prefix_8/a", "0:0:0:0:0:0:0:0/8");
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_8/b",
    "ff00:0:0:0:0:0:0:0/8",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_prefix_8/a",
    "ff80:0:0:0:0:0:0:0/8",
  );
  t("version/omitted/strict/true/valid/ipv6_prefix_64/a", "1:2:3:4:0:0:0:0/64");
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_64/b",
    "ffff:ffff:ffff:ffff:0:0:0:0/64",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_prefix_64",
    "ffff:ffff:ffff:ffff:8000:0:0:0/64",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_112/a",
    "1:2:3:4:5:6:7:0/112",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_112/b",
    "ffff:ffff:ffff:ffff:ffff:ffff:ffff:0/112",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_prefix_112",
    "ffff:ffff:ffff:ffff:ffff:ffff:ffff:8000/112",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_127/a",
    "ffff:ffff:ffff:ffff:ffff:ffff:ffff:0/127",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_127/b",
    "ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe/127",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_prefix_127",
    "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/127",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_128/a",
    "1:2:3:4:5:6:7:8/128",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_128/b",
    "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_prefix_128/c",
    "0:0:0:0:0:0:0:0/128",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_dotted_decimal_prefix_128",
    "0:0:0:0:0:ffff:192.1.56.10/128",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_dotted_decimal_prefix_112",
    "0:0:0:0:0:ffff:192.1.0.0/112",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_dotted_decimal_prefix_112",
    "0:0:0:0:0:ffff:192.1.0.128/112",
  );
  t(
    "version/omitted/strict/false/valid/ipv6_dotted_decimal_prefix_112",
    "0:0:0:0:0:ffff:192.1.0.128/112",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_dotted_decimal_prefix_96",
    "0:0:0:0:0:ffff:0.0.0.0/96",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_dotted_decimal_prefix_96",
    "0:0:0:0:0:ffff:0.0.128.0/96",
  );
  t(
    "version/omitted/strict/false/valid/ipv6_dotted_decimal_prefix_96",
    "0:0:0:0:0:ffff:0.0.128.0/96",
  );
  t(
    "version/omitted/strict/true/valid/ipv6_dotted_decimal_double_colon",
    "::ffff:192.1.0.0/112",
  );
  t(
    "version/omitted/strict/true/invalid/ipv6_dotted_decimal_double_colon",
    "::ffff:192.1.128.0/112",
  );
  t(
    "version/omitted/strict/false/valid/ipv6_dotted_decimal_double_colon",
    "::ffff:192.1.128.0/112",
  );
});

void suite("isIp", () => {
  function t(name: string, val: string) {
    const m = /^version\/(omitted|\d+)\/(valid|invalid)\/.+/.exec(name);
    assert.ok(m !== null);
    const version = m[1] === "omitted" ? undefined : parseInt(m[1]);
    const expect = m[2] === "valid";
    void test(name, () => {
      assert.strictEqual(isIp(val, version), expect);
      if (typeof version == "number") {
        // Version given as number or bigint must have same result
        assert.strictEqual(isIp(val, BigInt(version)), expect);
      }
      if (expect && version === 4) {
        // A valid IPv4 cannot be a valid IPv6
        assert.strictEqual(isIp(val, 6), false);
      }
      if (expect && version === 6) {
        // A valid IPv6 cannot be a valid IPv4
        assert.strictEqual(isIp(val, 4), false);
      }
    });
  }

  t("version/4/valid/example", "192.168.5.21");
  t("version/6/valid/example", "2001:0DB8:ABCD:0012::F1");
  t("version/omitted/valid/ipv6", "::1");
  t("version/omitted/valid/ipv4", "127.0.0.1");
  t("version/0/valid/ipv6", "::1");
  t("version/0/valid/ipv4", "127.0.0.1");
  t("version/6/valid/ipv6", "::1");
  t("version/4/valid/ipv4", "127.0.0.1");
  t("version/4/invalid/ipv6", "::1");
  t("version/6/invalid/ipv4", "127.0.0.1");
  t("version/4/invalid/ipv4_prefix", "127.0.0.1/16");
  t("version/4/invalid/ipv4_leading_space", " 127.0.0.1");
  t("version/4/invalid/ipv4_trailing_space", "127.0.0.1 ");
  t("version/omitted/invalid/ipv4_leading_space", " 127.0.0.1");
  t("version/omitted/invalid/ipv4_trailing_space", "127.0.0.1 ");
  t("version/6/invalid/ipv6_prefix", "::1/64");
  t("version/4/invalid/ipv4_literal", "[127.0.0.1]");
  t("version/6/invalid/ipv6_literal", "[::1]");
  t("version/6/invalid/ipv6_leading_space", " ::1");
  t("version/6/invalid/ipv6_trailing_space", "::1 ");
  t("version/omitted/invalid/ipv6_leading_space", " ::1");
  t("version/omitted/invalid/ipv6_trailing_space", "::1 ");
  t("version/1/invalid/ipv6", "::1");
  t("version/1/invalid/ipv4", "127.0.0.1");
  t("version/5/invalid/ipv6", "::1");
  t("version/5/invalid/ipv4", "127.0.0.1");
  t("version/7/invalid/ipv6", "::1");
  t("version/7/invalid/ipv4", "127.0.0.1");
  t("version/omitted/invalid/empty_string", "");
  t("version/1/invalid/empty_string", "");
  t("version/4/invalid/empty_string", "");
  t("version/6/invalid/empty_string", "");
  t("version/omitted/valid/ipv6/a", "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff");
  t("version/omitted/valid/ipv6/b", "fd7a:115c:a1e0:ab12:4843:cd96:626b:430b");
  t("version/omitted/valid/ipv6/c", "d7a:115c:a1e0:ab12:4843:cd96:626b:430b");
  t("version/omitted/valid/ipv6/d", "7a:115c:a1e0:ab12:4843:cd96:626b:430b");
  t("version/omitted/valid/ipv6/e", "a:115c:a1e0:ab12:4843:cd96:626b:430b");
  t("version/omitted/valid/ipv6/f", "1:2:3:4:5:6:7:8");
  t("version/omitted/valid/ipv6/g", "0:0:0:0:0:0:0:0");
  t("version/omitted/valid/ipv6/j", "0:00::000:0000");
  t("version/omitted/valid/ipv6_embedded_ipv4", "0:0:0:0:0:ffff:192.1.56.10");
  t(
    "version/omitted/invalid/ipv6_embedded_ipv4/a",
    "0:0:0:0:0:ffff:256.1.56.10",
  );
  t(
    "version/omitted/invalid/ipv6_embedded_ipv4/b",
    "0:0:0:0:0:ffff:192.x.56.10",
  );
  t(
    "version/omitted/invalid/ipv6_embedded_ipv4/c",
    "0:0:0:0:0:ffff:192..56.10",
  );
  t("version/omitted/invalid/ipv6_embedded_ipv4/d", "0:0:0:0:0:ffff:192.1.56.");
  t("version/omitted/invalid/ipv6_embedded_ipv4/e", "0:0:0:0:0:ffff:192.1.56");
  t("version/omitted/valid/ipv6_zone-id", "::1%foo");
  t("version/omitted/invalid/ipv6_zone-id", "::1%");
  t(
    "version/omitted/valid/ipv6_zone-id_any_non_null_character",
    "::1%% :x\x1F",
  );
  t("version/omitted/invalid/ipv6/a", ":2:3:4:5:6:7:8");
  t("version/omitted/invalid/ipv6/b", "12345:2:3:4:5:6:7:8");
  t("version/omitted/invalid/ipv6/c", "g:2:3:4:5:6:7:8");
  t("version/omitted/invalid/ipv6/d", ":::1");
  t("version/omitted/invalid/ipv6/e", "1::3:4::6:7:8");
  t("version/omitted/invalid/ipv6/f", "1::3:4::6:7:8");
  t("version/omitted/invalid/ipv6/g", ":0::0");
  t("version/omitted/invalid/ipv6/h", "0::0:");
  t("version/omitted/invalid/ipv6/i", "0::0:");
  t("version/omitted/invalid/ipv6/j", "::0000ffff");
  t("version/omitted/valid/ipv4/a", "127.0.0.1");
  t("version/omitted/valid/ipv4/b", "255.255.255.255");
  t("version/omitted/valid/ipv4/c", "0.0.0.0");
  t("version/omitted/valid/ipv4/d", "127.0.0.1");
  t("version/omitted/valid/ipv4/e", "127.0.0.1");
  t("version/omitted/invalid/ipv4/a", "127.0.1");
  t("version/omitted/invalid/ipv4/b", "127.0.1.");
  t("version/omitted/invalid/ipv4/c", "127..0.1");
  t("version/omitted/invalid/ipv4/d", "127.0.0.0.1");
  t("version/omitted/invalid/ipv4/e", "256.0.0.0");
  t("version/omitted/invalid/ipv4/f", "0x0.0.0.0");
  // From rule IPv6address from RFC 3986, we can have zero to seven h16,
  // and a double colon at the end:
  //
  //     [ *6( h16 ":" ) h16 ] "::"
  //
  t("version/6/valid/ipv6/double_colon", "::");
  t("version/6/valid/ipv6/1h16_double_colon", "1::");
  t("version/6/valid/ipv6/2h16_double_colon", "1:2::");
  t("version/6/valid/ipv6/3h16_double_colon", "1:2:3::");
  t("version/6/valid/ipv6/4h16_double_colon", "1:2:3:4::");
  t("version/6/valid/ipv6/5h16_double_colon", "1:2:3:4:5::");
  t("version/6/valid/ipv6/6h16_double_colon", "1:2:3:4:5:6::");
  t("version/6/valid/ipv6/7h16_double_colon", "1:2:3:4:5:6:7::");
  t("version/6/invalid/ipv6/7h16_double_colon", "1:2:3:4:5:6:7:8::"); // Eight or more is invalid
  // We can have zero to six 16, a double colon and one h16 at the end:
  t("version/6/valid/ipv6/1h16_double_colon_1h16", "1::1");
  t("version/6/valid/ipv6/2h16_double_colon_1h16", "1:2::1");
  t("version/6/valid/ipv6/3h16_double_colon_1h16", "1:2:3::1");
  t("version/6/valid/ipv6/4h16_double_colon_1h16", "1:2:3:4::1");
  t("version/6/valid/ipv6/5h16_double_colon_1h16", "1:2:3:4:5::1");
  t("version/6/valid/ipv6/6h16_double_colon_1h16", "1:2:3:4:5:6::1");
  t("version/6/invalid/ipv6/7h16_double_colon_1h16", "1:2:3:4:5:6:7::1"); // Seven or more is invalid
  // Following the first eight lines of the grammar, we can have a double colon
  // at the start, followed by zero to seven h16:
  t("version/6/valid/ipv6/double_colon_1h16", "::1");
  t("version/6/valid/ipv6/double_colon_2h16", "::1:2");
  t("version/6/valid/ipv6/double_colon_3h16", "::1:2:3");
  t("version/6/valid/ipv6/double_colon_4h16", "::1:2:3:4");
  t("version/6/valid/ipv6/double_colon_5h16", "::1:2:3:4:5");
  t("version/6/valid/ipv6/double_colon_6h16", "::1:2:3:4:5:6");
  t("version/6/valid/ipv6/double_colon_7h16", "::1:2:3:4:5:6:7");
  t("version/6/invalid/ipv6/double_colon_8h16", "::1:2:3:4:5:6:7:8"); // Eight or more is invalid
  // With one h16 and a double colon at the start, we can have zero to six h16:
  t("version/6/valid/ipv6/1h16_double_colon_2h16", "1::1:2");
  t("version/6/valid/ipv6/1h16_double_colon_3h16", "1::1:2:3");
  t("version/6/valid/ipv6/1h16_double_colon_4h16", "1::1:2:3:4");
  t("version/6/valid/ipv6/1h16_double_colon_5h16", "1::1:2:3:4:5");
  t("version/6/valid/ipv6/1h16_double_colon_6h16", "1::1:2:3:4:5:6");
  t("version/6/invalid/ipv6/1h16_double_colon_7h16", "1::1:2:3:4:5:6:7"); // Seven or more is invalid
});

void suite("isEmail", () => {
  function t(name: string, val: string) {
    const m = /^(valid|invalid)\/.+/.exec(name);
    assert.ok(m !== null);
    const expect = m[1] === "valid";
    void test(name, () => {
      assert.strictEqual(isEmail(val), expect);
    });
  }

  t("valid/a", "foo@example.com");
  t("valid/b", "foo+x@example.com");
  t("valid/c", "foo@example");
  t("invalid/missing_at", "example.com");
  t("invalid/non_ascii", "µ@example.com");
  t("invalid/left_side_empty", "@example.com");
  t("invalid/empty_string", "");
  t("invalid/leading_space", " foo@example.com");
  t("invalid/trailing_space", "foo@example.com ");
  t("invalid/leading_newline", "\nfoo.bar@example.com");
  t("invalid/trailing_newline", "foo.bar@example.com\n");
  t("valid/multiple_atext", "foo.bar@example.com");
  t("valid/empty_atext", ".@example.com");
  t("valid/multiple_empty_atext", "...@example.com");
  t(
    "valid/exhaust_atext",
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&'*+-/=?^_`{|}~@example.com",
  );
  t("invalid/left_side_space", "foo @example.com");
  t("invalid/right_side_empty", "foo@");
  t("invalid/trailing_dot", "foo@example.com.");
  t("invalid/empty_label", "foo@.a");
  t("invalid/label_starts_with_hyphen", "foo@-a");
  t("invalid/label_ends_with_hyphen", "foo@a-");
  t("valid/label_interior_hyphen", "foo@a-b.a--b");
  t(
    "valid/label_63_characters",
    "foo@abc012345678901234567890123456789012345678901234567890123456789.com",
  );
  t(
    "invalid/label_64_characters",
    "foo@abcd012345678901234567890123456789012345678901234567890123456789.com",
  );
  t("valid/label_all_digits", "foo@0.1.2.3.4.5.6.7.8.9");
  t(
    "valid/label_all_letters",
    "foo@a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P.Q.R.S.T.U.V.W.X.Y.Z",
  );
  t(
    "valid/exhaust_label",
    "foo@abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  );
  t("invalid/internationalized_domain_name", "foo@你好.com");
  t("invalid/quoted-string/a", `"foo bar"@example.com`);
  t("invalid/quoted-string/b", `"foo..bar"@example.com`);
  t("invalid/quoted-string/c", `"foo@bar"@example.com`);
  t("invalid/space", "foobar@ example.com");
  t("invalid/comment", "foo@example.com (comment)");
  t("invalid/mailbox", "John Doe <john@example.com>");
  t("invalid/ip_literal", "postmaster@[123.123.123.123]");
});

void suite("isUri", () => {
  function t(name: string, val: string) {
    const m = /^(valid|invalid)\/.+/.exec(name);
    assert.ok(m !== null);
    const expect = m[1] === "valid";
    void test(name, () => {
      assert.strictEqual(isUri(val), expect);
      if (expect) {
        // A valid URI must be a valid URI Reference
        assert.strictEqual(isUriRef(val), expect);
      }
    });
  }

  t("valid/example", "https://example.com");
  t("valid/example_with_path_segment", "https://example.com/foo");
  t("valid/example_with_path_segments", "https://example.com/foo/bar");
  t(
    "valid/example_with_path_query_fragment",
    "https://example.com/foo/bar?baz=quux#frag",
  );
  t("valid/example_with_userinfo", "https://joe@example.com/foo");
  t("invalid/empty_string", "");
  t("invalid/space", " ");
  t("invalid/leading_space", " https://example.com");
  t("invalid/trailing_space", "https://example.com ");
  t("invalid/relative-ref", "./");
  t("invalid/relative-ref_with_authority", "//example.com/foo");
  t(
    "valid/extreme",
    "scheme0123456789azAZ+-.://userinfo0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::@host!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789/path0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20//foo/?query0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?#fragment0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
  );
  t("valid/scheme_ftp", "ftp://example.com");
  t("valid/scheme_exhaust", "foo0123456789azAZ+-.://example.com");
  t("invalid/scheme/a", "1foo://example.com");
  t("invalid/scheme/b", "-foo://example.com");
  t("invalid/scheme/c", ".foo://example.com");
  t("invalid/scheme/d", ":foo://example.com");
  t("invalid/scheme/e", "foo%20bar://example.com");
  t("invalid/scheme/f", "foo\x1Fbar://example.com");
  t("invalid/scheme/g", "foo^bar://example.com");
  t("valid/userinfo_name", "https://user@example.com");
  t("valid/userinfo_name_password", "https://user:password@example.com");
  t("valid/userinfo_pct-encoded_ascii", "https://%61%20%23@example.com");
  t("valid/userinfo_pct-encoded_utf8", "https://%c3%963@example.com");
  t("valid/userinfo_pct-encoded_invalid-utf8", "https://%c3x%963@example.com");
  t(
    "valid/userinfo_unreserved",
    "https://0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~@example.com",
  );
  t("valid/userinfo_sub-delims", "https://!$&'()*+,;=@example.com");
  t("valid/userinfo_extra", "https://:@example.com");
  t("valid/userinfo_multiple_colons", "https://:::@example.com");
  t(
    "valid/userinfo_reserved_slash_parses_as_path-abempty",
    "https:///@example.com",
  );
  t(
    "valid/userinfo_reserved_questionmark_parses_as_query",
    "https://?@example.com",
  );
  t("valid/userinfo_reserved_hash_parses_as_fragment", "https://#@example.com");
  t("invalid/userinfo_reserved_square_bracket_open", "https://[@example.com");
  t("invalid/userinfo_reserved_square_bracket_close", "https://]@example.com");
  t("invalid/userinfo_reserved_at", "https://@@example.com");
  t("invalid/userinfo_bad_pct-encoded/a", "https://%@example.com");
  t("invalid/userinfo_bad_pct-encoded/b", "https://%2x@example.com");
  t(
    "valid/userinfo_exhaust",
    "https://0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::@example.com",
  );
  t("invalid/userinfo_control_character", "https://\x1F@example.com");
  t("invalid/userinfo_caret", "https://^@example.com");
  t("valid/host_reg-name", "https://foo");
  t(
    "valid/host_reg-name_exhaust",
    "https://!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  );
  t("valid/host_reg-name_empty", "https://:8080");
  t("valid/host_reg-name_pct-encoded_ascii", "https://foo%61%20%23");
  t("valid/host_reg-name_pct-encoded_utf8", "https://foo%c3%96");
  t("invalid/host_reg-name_pct-encoded_invalid_utf8", "https://foo%c3x%96");
  t("invalid/host_reg-name_bad_pct-encoded/a", "https://foo%");
  t("invalid/host_reg-name_bad_pct-encoded/b", "https://foo%2x");
  t("valid/host_ipv4", "https://127.0.0.1");
  t("valid/host_ip4v_bad_octet", "https://256.0.0.1");
  t("valid/host_ipv6", "https://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]");
  t("invalid/host_ipv6/a", "https://2001:0db8:85a3:0000:0000:8a2e:0370:7334");
  t("invalid/host_ipv6/b", "https://[2001::0370::7334]");
  t("valid/host_ipfuture_short", "https://[v1.x]");
  t("valid/host_ipfuture_long", "https://[v1234AF.x]");
  t(
    "valid/host_ipfuture_exhaust",
    "https://[vF.-!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]",
  );
  t("invalid/host_ipfuture", "https://[v1x]");
  t("invalid/host/a", "https://\x1F.com");
  t("invalid/host/b", "https://^.com");
  t("invalid/host/c", "https://foo@你好.com");
  t("valid/host_ipv6_zone-id", "https://[::1%25eth0]");
  t(
    "valid/host_ipv6_zone-id_pct-encoded_ascii",
    "https://[::1%25foo%61%20%23]",
  );
  t("valid/host_ipv6_zone-id_pct-encoded_utf8", "https://[::1%25foo%c3%96]");
  t(
    "invalid/host_ipv6_zone-id_pct-encoded_invalid_utf8",
    "https://[::1%25foo%c3x%96]",
  );
  t("invalid/host_ipv6_zone-id_empty", "https://[::1%25]");
  t("invalid/host_ipv6_zone-id_unquoted", "https://[::1%eth0]");
  t("invalid/host_ipv6_zone-id_bad_pct-encoded/a", "https://[::1%25foo%]");
  t("invalid/host_ipv6_zone-id_bad_pct-encoded/b", "https://[::1%25foo%2x]");
  t("valid/port_8080", "https://example.com:8080");
  t("valid/port_65535", "https://example.com:65535");
  t("valid/port_65536", "https://example.com:65536");
  t("valid/port_0", "https://example.com:0");
  t("valid/port_1", "https://example.com:1");
  t("valid/port_empty", "https://example.com:");
  t("valid/port_empty_reg-name_empty", "https://:");
  t("invalid/port/a", "https://example.com:8a");
  t("invalid/port/b", "https://example.com:x");
  t("invalid/port/c", "https://example.com: 1");
  t("valid/path_simple", "https://example.com/foo");
  t("valid/path_simple_nested", "https://example.com/foo/bar");
  t("valid/path_simple_nested_trailing_slash", "https://example.com/foo/bar/");
  t("valid/path-absolute", "foo:/nz");
  t("valid/path-absolute_with_segment", "foo:/nz/a");
  t("valid/path-absolute_with_segments", "foo:/nz//segment//segment/");
  t("valid/path-absolute_with_empty_pchar", "foo:/nz/");
  t("invalid/path-absolute_segment-nz-bad_caret", "foo:/^");
  t("invalid/path-absolute_segment-nz-bad_control_character", "foo:/\x1F");
  t("invalid/path-absolute_segment-nz-bad_pct-encoded", "foo:/%x");
  t("valid/path-absolute_segment-nz-pct-encoded_ascii", "foo:/%61%20%23");
  t("valid/path-absolute_segment-nz-pct-encoded_utf8", "foo:/%c3%96");
  t("valid/path-absolute_segment-nz-pct-encoded_invalid_utf8", "foo:/%c3x%96");
  t(
    "valid/path-absolute_exhaust_segment",
    "foo:/nz/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
  );
  t("invalid/path-absolute_segment_bad_caret", "foo:/nz/^");
  t("invalid/path-absolute_segment_bad_control_character", "foo:/nz/\x1F");
  t("invalid/path-absolute_segment_bad_pct-encoded", "foo:/nz/%x");
  t("valid/path-absolute_segment_pct-encoded_ascii", "foo:/nz/%61%20%23");
  t("valid/path-absolute_segment_pct-encoded_utf8", "foo:/nz/%c3%96%c3");
  t("valid/path-absolute_segment_pct-encoded_invalid_utf8", "foo:/nz/%c3x%96");
  t(
    "valid/path-absolute_exhaust_segment-nz",
    "foo:/@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~:",
  );
  t("valid/path-absolute_with_query_and_fragment", "foo:/nz?q#f");
  t("valid/path-rootless", "foo:nz");
  t("valid/path-rootless_with_segment", "foo:nz/a");
  t("valid/path-rootless_with_segments", "foo:nz//segment//segment/");
  t("valid/path-rootless_segment_empty_pchar", "foo:nz/");
  t("invalid/path-rootless_segment-nz_bad_caret", "foo:^");
  t("invalid/path-rootless_segment-nz_bad_control_character", "foo:\x1F");
  t("invalid/path-rootless_segment-nz_bad_pct-encoded", "foo:%x");
  t("valid/path-rootless_segment-nz_pct-encoded_ascii", "foo:%61%20%23");
  t("valid/path-rootless_segment-nz_pct-encoded_utf8", "foo:%c3%96");
  t("valid/path-rootless_segment-nz_pct-encoded_invalid_utf8", "foo:%c3x%96");
  t(
    "valid/path-rootless_segment-nz_exhaust",
    "foo:@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~:",
  );
  t("invalid/path-rootless_segment_bad_caret", "foo:nz/^");
  t("invalid/path-rootless_segment_bad_control_character", "foo:nz/\x1F");
  t("invalid/path-rootless_segment_bad_pct-encoded", "foo:nz/%x");
  t("valid/path-rootless_segment_pct-encoded_ascii", "foo:nz/%61%20%23");
  t("valid/path-rootless_segment_pct-encoded_utf8", "foo:nz/%c3%96");
  t("valid/path-rootless_segment_pct-encoded_invalid_utf8", "foo:nz/%c3x%96");
  t(
    "valid/path-rootless_segment_exhaust",
    "foo:nz/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
  );
  t("valid/path-rootless_with_query_and_fragment", "foo:nz?q#f");
  t("valid/path-empty", "foo:");
  t("valid/path-empty_with_query_and_fragment", "foo:?q#f");
  t("valid/authority_path-abempty", "foo://example.com");
  t("valid/authority_path-abempty_with_segment", "foo://example.com/a");
  t(
    "valid/authority_path-abempty_with_segments",
    "foo://example.com/segment//segment/",
  );
  t("valid/authority_path-abempty_segment_empty_pchar", "foo://example.com/");
  t("invalid/authority_path-abempty_segment_bad_caret", "foo://example.com/^");
  t(
    "invalid/authority_path-abempty_segment_bad_control_character",
    "foo://example.com/\x1F",
  );
  t(
    "invalid/authority_path-abempty_segment_bad_pct-encoded",
    "foo://example.com/%x",
  );
  t(
    "valid/authority_path-abempty_segment_pct-encoded_ascii",
    "foo://example.com/%61%20%23",
  );
  t(
    "valid/authority_path-abempty_segment_pct-encoded_utf8",
    "foo://example.com/%c3%96",
  );
  t(
    "valid/authority_path-abempty_segment_pct-encoded_invalid_utf8",
    "foo://example.com/%c3x%96",
  );
  t(
    "valid/authority_path-abempty_segment_exhaust",
    "foo://example.com/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
  );
  t(
    "valid/authority_path-abempty_with_query_and_fragment",
    "foo://example.com/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
  );
  t("valid/query", "https://example.com?baz=quux");
  t("valid/query_pct-encoded_ascii", "https://example.com?%61%20%23");
  t("valid/query_pct-encoded_utf8", "https://example.com?%c3%96%c3");
  t("valid/query_pct-encoded_invalid_utf8", "https://example.com?%c3x%96");
  t("invalid/query_bad_pct-encoded", "https://example.com?%2x");
  t("invalid/query_bad_control_character", "https://example.com?\x1F");
  t("invalid/query_bad_caret", "https://example.com?^");
  t("valid/query_sub-delims", "https://example.com?!$&'()*+,=");
  t("valid/query_sub-delim_semicolon", "https://example.com?;");
  t("valid/query_pchar_extra", "https://example.com?:@");
  t("valid/query_extra", "https://example.com?/?");
  t(
    "valid/query_unusual_key_value_structure",
    "https://example.com?a=b&c&&=1&==",
  );
  t(
    "valid/query_exhaust",
    "https://example.com?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
  );
  t("valid/fragment", "https://example.com?#frag");
  t("valid/fragment_pct-encoded_ascii", "https://example.com#%61%20%23");
  t("valid/fragment_pct-encoded_utf8", "https://example.com#%c3%96");
  t("valid/fragment_pct-encoded_invalid_utf8", "https://example.com#%c3x%96");
  t("invalid/fragment_bad_pct-encoded/a", "https://example.com#%2x");
  t("invalid/fragment_bad_pct-encoded/b", "https://example.com#%");
  t("valid/fragment_sub-delims", "https://example.com#!$&'()*+,;=");
  t("valid/fragment_pchar_extra", "https://example.com#/?");
  t("invalid/fragment_bad_hash", "https://example.com##");
  t("invalid/fragment_bad_caret", "https://example.com#^");
  t("invalid/fragment_bad_control_character", "https://example.com#\x1F");
  t(
    "valid/fragment_exhaust",
    "https://example.com/#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
  );
  t("valid/fuzz1", "A://");
});

void suite("isUriRef", () => {
  function t(name: string, val: string) {
    const m = /^(valid|invalid)\/.+/.exec(name);
    assert.ok(m !== null);
    const expect = m[1] === "valid";
    void test(name, () => {
      assert.strictEqual(isUriRef(val), expect);
    });
  }

  t("valid/path-noscheme_with_segment", "./foo");
  t(
    "valid/path-noscheme_with_segment_query_fragment",
    "./foo/bar?baz=quux#frag",
  );
  t("valid/empty_string", "");
  t(
    "valid/extreme",
    "//userinfo0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::@host!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ:0123456789/path0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20//foo/?query0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?#fragment0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
  );
  t("invalid/space", " ");
  t("invalid/leading_space", " ./foo");
  t("invalid/trailing_space", "./foo ");
  t("invalid/bad_relative-part", ":");
  t("invalid/uri_with_bad_scheme", "1foo://example.com");
  t("valid/authority_path-abempty", "//host");
  t(
    "valid/authority_path-abempty_with_segment_query_fragment",
    "//host/foo?baz=quux#frag",
  );
  t("valid/authority_path-abempty_segment_empty_pchar", "//host/");
  t(
    "invalid/authority_path-abempty_segment_bad_control_character",
    "//host/\x1F",
  );
  t("invalid/path-abempty_segment_bad_pct-encoded", "//host/%x");
  t("valid/path-abempty_segment_pct-encoded_ascii", "//host/%61%20%23");
  t("valid/path-abempty_segment_pct-encoded_utf-8", "//host/%c3%96");
  t("valid/path-abempty_segment_pct-encoded_invalid_utf-8", "//host/%c3x%96");
  t(
    "valid/path-abempty_exhaust_segment",
    "//host/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&()*+,;=:@",
  );
  t("valid/path-abempty_multiple_segments/a", "//host//");
  t("valid/path-abempty_multiple_segments/b", "//host/a/b/c");
  t("valid/path-abempty_multiple_segments/c", "//host/a/b/c/");
  t("valid/path-abempty_with_query/a", "//host?baz=quux");
  t("valid/path-abempty_with_query/b", "//host/foo/bar?baz=quux");
  t("valid/path-abempty_with_fragment/a", "//host#frag");
  t("valid/path-abempty_with_fragment/b", "//host/foo/bar#frag");
  t(
    "valid/path-abempty_exhaust_fragment",
    "//host#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
  );
  t("invalid/path-abempty_fragment_bad_fragment", "//host##");
  t("invalid/path-abempty_fragment_bad_caret", "//host#^");
  t("invalid/path-abempty_fragment_bad_control_character", "//host#\x1F");
  t("invalid/path-abempty_fragment_bad_pct-encoding", "//host#%");
  t(
    "valid/path-abempty_exhaust_query",
    "//host?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
  );
  t("invalid/path-abempty_query_bad_caret", "//host?^");
  t("invalid/path-abempty_query_bad_pct-encoded", "//host?%");
  t("invalid/path-abempty_query_bad_control_character", "//host?\x1F");
  t(
    "valid/path-abempty_exhaust_userinfo",
    "//0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::@example.com",
  );
  t("valid/path-abempty_port", "//host:8080");
  t("valid/path-abempty_ipv4", "//127.0.0.1");
  t("valid/path-abempty_ipv6", "//[::1]");
  t("valid/path-absolute", "/");
  t("valid/path-absolute_segment-nz", "/nz");
  t("valid/path-absolute_segment-nz_matches_colon", "/:");
  t("invalid/path-absolute_segment-nz_bad_caret", "/^");
  t("invalid/path-absolute_segment-nz_bad_control_character", "/\x1F");
  t("invalid/path-absolute_segment-nz_bad_pct-encoded", "/%x");
  t("valid/path-absolute_segment-nz_pct-encoded_ascii", "/%61%20%23");
  t("valid/path-absolute_segment-nz_pct-encoded_utf-8", "/%c3%96");
  t("valid/path-absolute_segment-nz_pct-encoded_invalid_utf-8", "/%c3x%96");
  t(
    "valid/path-absolute_exhaust_segment-nz",
    "/@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~:",
  );
  t("valid/path-absolute_segment_empty_pchar", "/nz/");
  t("invalid/path-absolute_segment_bad_caret", "/nz/^");
  t("invalid/path-absolute_segment_bad_control_character", "/nz/\x1F");
  t("invalid/path-absolute_segment_bad_pct-encoded", "/nz/%x");
  t("valid/path-absolute_segment_pct-encoded_ascii", "/nz/%61%20%23");
  t("valid/path-absolute_segment_pct-encoded_utf-8", "/nz/%c3%96");
  t("valid/path-absolute_segment_pct-encoded_invalid_utf-8", "/nz/%c3x%96");
  t(
    "valid/path-absolute_exhaust_segment",
    "/nz/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&()*+,;=:@",
  );
  t("valid/path-absolute_with_query/a", "/?baz=quux");
  t("valid/path-absolute_with_query/b", "/foo/bar?baz=quux");
  t("valid/path-absolute_with_fragment/a", "/#frag");
  t("valid/path-absolute_with_fragment/b", "/foo/bar#frag");
  t("invalid/path-absolute_bad_control_character", "/foo/\x1F");
  t(
    "valid/path-absolute_exhaust_fragment",
    "/#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
  );
  t("invalid/path-absolute_fragment_bad_fragment", "/##");
  t("invalid/path-absolute_fragment_bad_caret", "/#^");
  t("invalid/path-absolute_fragment_bad_control_character", "/#\x1F");
  t("invalid/path-absolute_fragment_bad_pct-encoding", "/#%");
  t(
    "valid/path-absolute_exhaust_query",
    "/?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
  );
  t("invalid/path-absolute_query_bad_caret", "/?^");
  t("invalid/path-absolute_query_bad_pct-encoded", "/?%");
  t("invalid/path-absolute_query_bad_control_character", "/?\x1F");
  t("valid/path-noscheme/a", "./foo/bar");
  t("valid/path-noscheme/b", "*");
  t("valid/path-noscheme/c", "./foo");
  t("invalid/path-noscheme_segment-nz_bad_colon", ":");
  t("invalid/path-noscheme_segment-nz_bad_caret", "^");
  t("invalid/path-noscheme_segment-nz_bad_control_character", "\x1F");
  t("invalid/path-noscheme_segment-nz_bad_pct-encoded", "%x");
  t("valid/path-noscheme_segment-nz_pct-encoded_ascii", "%61%20%23");
  t("valid/path-noscheme_segment-nz_pct-encoded_utf-8", "%c3%96");
  t("valid/path-noscheme_segment-nz_pct-encoded_invalid_utf-8", "%c3x%96");
  t(
    "valid/path-noscheme_exhaust_segment-nz-nc",
    "@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~",
  );
  t("valid/path-noscheme_segment_empty_pchar", "./");
  t("invalid/path-noscheme_segment_bad_caret", "./^");
  t("invalid/path-noscheme_segment-bad_control_character", "./\x1F");
  t("invalid/path-noscheme_segment_bad_pct-encoded", "./%x");
  t("valid/path-noscheme_segment_pct-encoded_ascii", "./%61%20%23");
  t("valid/path-noscheme_segment_pct-encoded_utf-8", "./%c3%96");
  t("valid/path-noscheme_segment_pct-encoded_invalid_utf-8", "./%c3x%96");
  t(
    "valid/path-noscheme_exhaust_segment",
    "./0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
  );
  t("valid/path-noscheme_multiple_segments/a", ".///");
  t("valid/path-noscheme_multiple_segments/b", "./a/b/c");
  t("valid/path-noscheme_multiple_segments/c", "./a/b/c/");
  t("valid/path-noscheme_with_query/a", ".?baz=quux");
  t("valid/path-noscheme_with_query/b", "./foo/bar?baz=quux");
  t("valid/path-noscheme_with_fragment/a", ".#frag");
  t("valid/path-noscheme_with_fragment/b", "./foo/bar#frag");
  t("invalid/path-noscheme_bad_control_character", "./foo/\x1F");
  t(
    "valid/path-noscheme_exhaust_fragment",
    ".#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
  );
  t("invalid/path-noscheme_fragment_bad_fragment", ".##");
  t("invalid/path-noscheme_fragment_bad_caret", ".#^");
  t("invalid/path-noscheme_fragment_bad_control_character", ".#\x1F");
  t("invalid/path-noscheme_fragment_bad_pct-encoded", ".#%");
  t(
    "valid/path-noscheme_exhaust_query",
    ".?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
  );
  t("invalid/path-noscheme_query_bad_caret", ".?^");
  t("invalid/path-noscheme_query_bad_pct-encoded", ".?%");
  t("invalid/path-noscheme_query_bad_control_character", ".?\x1F");
  t("valid/path-empty", "");
  t(
    "valid/path-empty_exhaust_fragment",
    "#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
  );
  t("invalid/path-empty_fragment_bad_fragment", "##");
  t("invalid/path-empty_fragment_bad_caret", "#^");
  t("invalid/path-empty_fragment_bad_control_character", "#\x1F");
  t("invalid/path-empty_fragment_bad_pct-encoded", "#%");
  t(
    "valid/path-empty_exhaust_query",
    "?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
  );
  t("invalid/path-empty_query_bad_caret", "?^");
  t("invalid/path-empty_query_bad_pct-encoded", "?%");
  t("invalid/path-empty_query_bad_control_character", "?\x1F");
});

void test("isInf", () => {
  assert.strictEqual(isInf(Number.POSITIVE_INFINITY), true);
  assert.strictEqual(isInf(Number.POSITIVE_INFINITY, 0), true);
  assert.strictEqual(isInf(Number.POSITIVE_INFINITY, 1), true);
  assert.strictEqual(isInf(Number.POSITIVE_INFINITY, BigInt(77)), true);
  assert.strictEqual(isInf(Number.NEGATIVE_INFINITY), true);
  assert.strictEqual(isInf(Number.NEGATIVE_INFINITY, 0), true);
  assert.strictEqual(isInf(Number.NEGATIVE_INFINITY, -1), true);
  assert.strictEqual(isInf(Number.NEGATIVE_INFINITY, BigInt(-77)), true);
  assert.strictEqual(isInf(NaN), false);
  assert.strictEqual(isInf(1), false);
  assert.strictEqual(isInf(1, 0), false);
  assert.strictEqual(isInf(1, -1), false);
  assert.strictEqual(isInf(Number.POSITIVE_INFINITY, -1), false);
  assert.strictEqual(isInf(Number.NEGATIVE_INFINITY, 1), false);
});

void suite("unique", () => {
  // Uint8Array
  t(true, []);
  t(true, [new Uint8Array(0), new Uint8Array([0])]);
  t(true, [new Uint8Array([222, 173, 190, 239])]);
  t(true, [new Uint8Array([222, 173, 190, 239]), new Uint8Array([1])]);
  t(false, [new Uint8Array(0), new Uint8Array(0)]);
  t(false, [new Uint8Array([1]), new Uint8Array([1])]);
  t(false, [
    new Uint8Array([222, 173, 190, 239]),
    new Uint8Array([222, 173, 190, 239]),
  ]);

  // CelUint
  t(true, []);
  t(true, [new CelUint(1n)]);
  t(true, [new CelUint(1n), new CelUint(2n)]);
  t(false, [new CelUint(1n), new CelUint(1n)]);
  t(false, [
    new CelUint(1n),
    new CelUint(2n),
    new CelUint(3n),
    new CelUint(1n),
  ]);

  // bool
  t(true, []);
  t(true, [true]);
  t(true, [false]);
  t(true, [true, false]);
  t(false, [true, true]);
  t(false, [false, false]);

  // bigint
  t(true, []);
  t(true, [1n]);
  t(true, [1n, 2n]);
  t(false, [1n, 1n]);
  t(false, [1n, 2n, 3n, 1n]);

  // number
  t(true, []);
  t(true, [1]);
  t(true, [1, 2]);
  t(true, [1, 1.1]);
  t(false, [3.14, 3.14]);
  t(false, [1, 2, 3, 1]);

  // string
  t(true, []);
  t(true, ["a"]);
  t(true, ["a", "b"]);
  t(true, ["a", "A"]);
  t(false, ["a", "a"]);
  t(false, ["abc", "abc"]);
  t(false, ["a", "b", "a"]);

  // mixed
  t(true, [true, 1n, 1, 3.14, "a", "1", false, new Uint8Array(0)]);

  function t(expect: boolean, val: CelResult[], comment = "") {
    void test(`${arrayLiteral(val)} ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
      assert.strictEqual(
        unique({
          getItems(): CelResult[] {
            return val;
          },
        }),
        expect,
      );
    });
  }

  function arrayLiteral(arr: unknown[]): string {
    return (
      "[" +
      arr
        .map((v) => {
          switch (typeof v) {
            case "string":
              return `"${v}"`;
            case "number":
              return v.toString();
            case "bigint":
              return `${v}n`;
            case "boolean":
              return v.toString();
            default:
              if (v instanceof CelUint) {
                return `CelUint(${v.value})`;
              }
              if (v instanceof Uint8Array) {
                return `Uint8Array([${v.toString()}])`;
              }
              return String(v);
          }
        })
        .join(", ") +
      "]"
    );
  }
});

void suite("bytes overloads", () => {
  function s2b(str: string) {
    return new TextEncoder().encode(str);
  }
  void test("contains", () => {
    assert.strictEqual(
      bytesContains(s2b("hello world"), s2b("hello world")),
      true,
    );
    assert.strictEqual(bytesContains(s2b("hello world"), s2b("o w")), true);
    assert.strictEqual(bytesContains(s2b("hello world"), s2b("hello")), true);
    assert.strictEqual(bytesContains(s2b("hello world"), s2b("world")), true);
    assert.strictEqual(bytesContains(s2b("hello world"), s2b("earth")), false);
    assert.strictEqual(bytesContains(s2b("hello world"), s2b("")), true);
    assert.strictEqual(
      bytesContains(s2b("hello world"), s2b("hello world from moon")),
      false,
    );
  });
  void test("startsWith", () => {
    assert.strictEqual(
      bytesStartsWith(s2b("hello world"), s2b("hello world")),
      true,
    );
    assert.strictEqual(bytesStartsWith(s2b("hello world"), s2b("hello")), true);
    assert.strictEqual(
      bytesStartsWith(s2b("hello world"), s2b("world")),
      false,
    );
    assert.strictEqual(
      bytesStartsWith(s2b("hello world"), s2b("hello world from moon")),
      false,
    );
    assert.strictEqual(bytesStartsWith(s2b("hello world"), s2b("")), true);
  });
  void test("endsWith", () => {
    assert.strictEqual(
      bytesEndsWith(s2b("hello world"), s2b("hello world")),
      true,
    );
    assert.strictEqual(bytesEndsWith(s2b("hello world"), s2b("world")), true);
    assert.strictEqual(bytesEndsWith(s2b("hello world"), s2b("hello")), false);
    assert.strictEqual(
      bytesEndsWith(s2b("hello world"), s2b("hello world from moon")),
      false,
    );
    assert.strictEqual(bytesEndsWith(s2b("hello world"), s2b("")), true);
  });
});

// from a call to t(), generate conformance test cases
// function generateGoConformanceTest(kind: "isIpPrefix" | "isHostname" | "isHostAndPort" | "isIp" | "isEmail" | "isUri" | "isUriRef", name: string, val: string) {
//   function goValLit(val: string): string {
//     if (val.includes("\x1F")) {
//       val = val.split("\x1F").join("\\x1F");
//     }
//     return val.includes(`"`) ? `\`${val}\`` : `"${val}"`;
//   }
//   switch (kind) {
//     case "isIpPrefix": {
//       const m = /^version\/(omitted|\d+)\/strict\/(omitted|true|false)\/(valid|invalid)\/.+/.exec(name);
//       assert.ok(m !== null);
//       const version = m[1] === "omitted" ? undefined : parseInt(m[1]);
//       const strict = m[2] === "omitted" ? undefined : m[2] === "true";
//       const expect = m[3] === "valid";
//       const e = expect ? `results.Success(true)` : `results.Violations(
// 				&validate.Violation{
// 					RuleId: proto.String("library.is_ip_prefix"),
// 				},
// 				)`;
//       const p = version !== undefined ? `, Version: proto.Int32(${version})` : ``;
//       const s = strict !== undefined ? `, Strict: proto.Bool(${strict})` : ``;
//       return `"${name}": {
//           Message: &cases.IsIpPrefix{Val: "${val}"${p}${s}},
//           Expected: ${e},
//         },
// 		  `;
//     }
//     case "isHostname": {
//       const m = /^(valid|invalid)\/.+/.exec(name);
//       assert.ok(m !== null);
//       const expect = m[1] === "valid";
//       const e = expect ? `results.Success(true)` : `results.Violations(
// 				&validate.Violation{
// 					RuleId: proto.String("library.is_hostname"),
// 				},
// 				)`;
//       return `"${name}": {
//             Message: &cases.IsHostname{Val: ${goValLit(val)}},
//             Expected: ${e},
//           },
//       `;
//     }
//     case "isHostAndPort": {
//       const m = /^port_required\/(true|false)\/(valid|invalid)\/.+/.exec(name);
//       assert.ok(m !== null);
//       const portRequired = m[1] === "true";
//       const expect = m[2] === "valid";
//       const e = expect ? `results.Success(true)` : `results.Violations(
// 				&validate.Violation{
// 					RuleId: proto.String("library.is_host_and_port"),
// 				},
// 				)`;
//       const p = portRequired ? `, PortRequired: true` : ``;
//       return `"${name}": {
//             Message: &cases.IsHostAndPort{Val: ${goValLit(val)}${p}},
//             Expected: ${e},
//           },
//       `;
//     }
//     case "isEmail": {
//       const m = /^(valid|invalid)\/.+/.exec(name);
//       assert.ok(m !== null);
//       const expect = m[1] === "valid";
//       const e = expect ? `results.Success(true)` : `results.Violations(
// 				&validate.Violation{
// 					RuleId: proto.String("library.is_email"),
// 				},
// 				)`;
//       return `"${name}": {
// 			Message: &cases.IsEmail{Val: ${goValLit(val)}},
// 			Expected: ${e},
// 		},
// `;
//     }
//     case "isIp": {
//       const m = /^version\/(omitted|\d+)\/(valid|invalid)\/.+/.exec(name);
//       assert.ok(m !== null);
//       const version = m[1] === "omitted" ? undefined : parseInt(m[1]);
//       const expect = m[2] === "valid";
//       const e = expect ? `results.Success(true)` : `results.Violations(
// 				&validate.Violation{
// 					RuleId: proto.String("library.is_ip"),
// 				},
// 				)`;
//       const p = version !== undefined ? `, Version: proto.Int32(${version})` : ``;
//       return `"${name}": {
// 			Message: &cases.IsIp{Val: ${goValLit(val)}${p}},
// 			Expected: ${e},
// 		},
// `;
//     }
//     case "isUri": {
//       const m = /^(valid|invalid)\/.+/.exec(name);
//       assert.ok(m !== null);
//       const expect = m[1] === "valid";
//       const e = expect ? `results.Success(true)` : `results.Violations(
// 				&validate.Violation{
// 					RuleId: proto.String("library.is_uri"),
// 				},
// 				)`;
//       return `"${name}": {
// 			Message: &cases.IsUri{Val: ${goValLit(val)}},
// 			Expected: ${e},
// 		},
// `;
//     }
//     case "isUriRef": {
//       const m = /^(valid|invalid)\/.+/.exec(name);
//       assert.ok(m !== null);
//       const expect = m[1] === "valid";
//       const e = expect ? `results.Success(true)` : `results.Violations(
// 				&validate.Violation{
// 					RuleId: proto.String("library.is_uri_ref"),
// 				},
// 				)`;
//       return `"${name}": {
// 			Message: &cases.IsUriRef{Val: ${goValLit(val)}},
// 			Expected: ${e},
// 		},
// `;
//     }
//   }
// }
