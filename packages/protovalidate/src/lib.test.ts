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
  t(true, "A.ISI.EDU");
  t(true, "XX.LCS.MIT.EDU");
  t(true, "SRI-NIC.ARPA");
  t(true, "example.com");
  t(true, "foo-bar.com");
  t(false, "", "empty is invalid");
  t(false, "foo_bar.com");
  t(false, "你好.com", "IDN is not supported");
  t(
    true,
    "abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "label can use a-z, A-Z, 0-9, hyphen",
  );
  const name253chars =
    "123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.123456789.abc";
  const name254chars = name253chars + "d";
  t(
    true,
    name253chars,
    "host name without trailing dot can be 253 characters at most",
  );
  t(
    false,
    name254chars,
    "host name without trailing dot cannot be more than 253 characters",
  );
  t(false, ".", "single dot is invalid");
  t(true, "a.", "label must not be empty, but trailing dot is allowed");
  t(false, ".a", "label must not be empty");
  t(false, "..", "label must not be empty");
  t(false, "a..b", "label must not be empty");
  t(true, "a-b.a--b", "label can have an interior hyphen");
  t(false, "-a", "label must not start with hyphen");
  t(false, "a-", "label must not end with hyphen");
  t(
    true,
    "a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P.Q.R.S.T.U.V.W.X.Y.Z",
    "labels can start and end with letters",
  );
  t(
    true,
    "0.1.2.3.4.5.6.7.8.9.com",
    "labels can start and end with digits, but the last label must not be all digits",
  );
  t(true, "com1", "last label must not be all digits");
  t(false, "a.1", "last label must not be all digits");
  t(
    true,
    "a.a0.a1.a2.a3.a4.a5.a6.a7.a8.a9",
    "label must end with a letter or digit",
  );
  t(
    true,
    "0.1.2.3.4.5.6.7.8.9.0a.1a.2a.3a.4a.5a.6a.7a.8a.9a",
    "label must start with a letter or digit (RFC 1123)",
  );
  t(
    true,
    "abc012345678901234567890123456789012345678901234567890123456789.com",
    "label can be 63 characters at most",
  );
  t(
    true,
    "foo.abc012345678901234567890123456789012345678901234567890123456789",
    "label can be 63 characters at most",
  );
  t(
    true,
    "foo.abc012345678901234567890123456789012345678901234567890123456789.com",
    "label can be 63 characters at most",
  );
  t(
    false,
    "abcd012345678901234567890123456789012345678901234567890123456789.com",
    "label cannot be more than 63 characters",
  );
  t(
    false,
    "foo.abcd012345678901234567890123456789012345678901234567890123456789",
    "label cannot be more than 63 characters",
  );
  t(
    false,
    "foo.abcd012345678901234567890123456789012345678901234567890123456789.com",
    "label cannot be more than 63 characters",
  );

  function t(expect: boolean, str: string, comment = "") {
    void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
      assert.strictEqual(isHostname(str), expect);
    });
  }
});

void suite("isHostAndPort", () => {
  // hostname
  testIsHostAndOptionalPort(true, "example.com");
  testIsHostAndOptionalPort(true, "a.");
  testIsHostAndOptionalPort(false, "你好.com", "IDN is not supported");
  testIsHostAndOptionalPort(false, "", "empty is invalid");
  testIsHostAndRequiredPort(false, "", "empty is invalid");

  // port
  testIsHostAndRequiredPort(false, "example.com", "missing port");
  testIsHostAndRequiredPort(false, "example.com:", "missing port");
  testIsHostAndRequiredPort(true, "example.com:0", "port number can be zero");
  testIsHostAndRequiredPort(
    false,
    "example.com:+1",
    "port number cannot have sign",
  );
  testIsHostAndRequiredPort(
    false,
    "example.com:0xFA",
    "port number must be decimal",
  );
  testIsHostAndRequiredPort(
    true,
    "example.com:65535",
    "port number can be 65535",
  );
  testIsHostAndRequiredPort(
    false,
    "example.com:65536",
    "port number must be 65535 or smaller",
  );

  // ipv4
  testIsHostAndOptionalPort(true, "192.168.0.1");
  testIsHostAndOptionalPort(true, "0.0.0.0");
  testIsHostAndOptionalPort(true, "255.255.255.255");
  testIsHostAndOptionalPort(false, "256.0.0.0", "octet too big");
  testIsHostAndOptionalPort(false, "127.0.1", "not enough octets");
  testIsHostAndOptionalPort(false, "127..0.1", "empty octet");

  // ipv4 + port
  testIsHostAndRequiredPort(true, "192.168.0.1:0");
  testIsHostAndRequiredPort(true, "192.168.0.1:8080");
  testIsHostAndRequiredPort(false, "192.168.0.1", "missing port");

  // ipv6
  testIsHostAndOptionalPort(true, "[::1]");
  testIsHostAndOptionalPort(true, "[::1%foo]", "zone id");
  testIsHostAndOptionalPort(true, "[0:0:0:0:0:0:0:0]");
  testIsHostAndOptionalPort(true, "[ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff]");
  testIsHostAndOptionalPort(
    true,
    "[0:0:0:0:0:ffff:192.1.56.10]",
    "IPv4 address embedded in IPv6 address",
  );
  testIsHostAndOptionalPort(false, "[::1%]", "zone id too short");
  testIsHostAndOptionalPort(
    true,
    "[::1%% :x\x1F]",
    "zone id allows any non-null string",
  );
  testIsHostAndOptionalPort(false, "[127.0.0.1]", "not an IPv6");
  testIsHostAndOptionalPort(false, "[example.com]", "not an IPv6");

  // ipv6 + port
  testIsHostAndRequiredPort(true, "[::1]:0");
  testIsHostAndRequiredPort(true, "[::1]:8080");
  testIsHostAndRequiredPort(false, "[::1]", "missing port");

  function testIsHostAndOptionalPort(
    expect: boolean,
    str: string,
    comment = "",
  ) {
    void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
      assert.strictEqual(isHostAndPort(str, false), expect);
    });
  }

  function testIsHostAndRequiredPort(
    expect: boolean,
    str: string,
    comment = "",
  ) {
    void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
      assert.strictEqual(isHostAndPort(str, true), expect);
      if (expect) {
        // A valid host with required port must be a valid host with optional port
        assert.strictEqual(isHostAndPort(str, false), expect);
      }
    });
  }
});

void suite("isIpPrefix", () => {
  void suite("version argument", () => {
    // argument omitted
    t(true, "::1/64", undefined, "is either v4 or v6");
    t(true, "127.0.0.1/16", undefined, "is either v4 or v6");

    // version = 0
    t(true, "::1/64", 0, "version 0 means either 4 or 6");
    t(true, "127.0.0.1/16", 0, "version 0 means either 4 or 6");

    // specific version
    t(true, "::1/64", 6, "version 6 only");
    t(true, "127.0.0.1/16", 4, "is v4");
    t(false, "127.0.0.1/16", 6, "is v6");
    t(false, "::1/64", 4, "is not v4");

    // version out of range
    t(false, "127.0.0.0/16", 1, "bad version");
    t(false, "::1/64", 1, "bad version");
    t(false, "::1/64", 5, "bad version");
    t(false, "::1/64", 7, "bad version");

    function t(
      expect: boolean,
      str: string,
      version: number | bigint | undefined,
      comment = "",
    ) {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        if (typeof version == "number") {
          assert.strictEqual(isIpPrefix(str, version), expect);
          // Version given as number or bigint must have same result
          assert.strictEqual(isIpPrefix(str, BigInt(version)), expect);
        } else {
          assert.strictEqual(isIpPrefix(str), expect);
        }
      });
    }
  });

  void suite("strict argument", () => {
    // argument omitted
    t(
      true,
      "2001:0DB8:ABCD:0012:0:0:0:0/64",
      undefined,
      "IPv6 zero accepted by default",
    );
    t(
      true,
      "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64",
      undefined,
      "IPv6 non-zero accepted by default",
    );
    t(true, "255.255.0.0/16", undefined, "IPv4 zero accepted by default");
    t(true, "255.255.128.0/16", undefined, "IPv4 non-zero accepted by default");

    // strict = false
    t(
      true,
      "2001:0DB8:ABCD:0012:0:0:0:0/64",
      false,
      "IPv6 zero accepted with strict = false",
    );
    t(
      true,
      "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64",
      false,
      "IPv6 non-zero accepted with strict = false",
    );
    t(true, "255.255.0.0/16", false, "IPv4 zero accepted with strict = false");
    t(
      true,
      "255.255.128.0/16",
      false,
      "IPv4 non-zero accepted with strict = false",
    );

    // strict = true
    t(
      true,
      "2001:0DB8:ABCD:0012:0:0:0:0/64",
      true,
      "IPv6 zero accepted with strict = true",
    );
    t(
      false,
      "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64",
      true,
      "IPv6 non-zero not accepted with strict = true",
    );
    t(true, "255.255.0.0/16", true, "IPv4 zero accepted with strict = true");
    t(
      false,
      "255.255.128.0/16",
      true,
      "IPv4 non-zero not accepted with strict = true",
    );

    function t(
      expect: boolean,
      str: string,
      strict: boolean | undefined,
      comment = "",
    ) {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        if (typeof strict == "boolean") {
          assert.strictEqual(isIpPrefix(str, undefined, strict), expect);
        } else {
          assert.strictEqual(isIpPrefix(str), expect);
        }
      });
    }
  });

  void suite("v4", () => {
    // simple examples
    t(true, "192.168.1.0/24");
    t(true, "192.168.1.0/0", "min prefix-length");
    t(true, "192.168.1.0/32", "max prefix-length");
    t(true, "0.0.0.0/0");
    t(true, "255.255.255.255/32");

    // bad forms
    t(false, "192.168.1.0/024", "bad leading zero in decimal prefix-length");
    t(false, "192.168.1.0/33", "prefix-length out of range");
    t(false, "192.168.1.0/12345678901234567890", "prefix-length out of range");
    t(false, "192.168.1.0/", "missing decimal prefix-length");

    function t(expect: boolean, str: string, comment = "") {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        assert.strictEqual(isIpPrefix(str, 4, false), expect);
        if (expect) {
          // A valid IPv4 prefix is never a valid IPv6 prefix
          assert.strictEqual(isIpPrefix(str, 6, false), false);
        } else {
          // An invalid prefix is never a valid strict prefix
          assert.strictEqual(isIpPrefix(str, 6, true), false);
        }
      });
    }
  });

  void suite("v4 strict", () => {
    t(true, "0.0.0.0/0");
    t(false, "1.0.0.0/0");
    t(false, "128.0.0.0/0");
    t(true, "128.0.0.0/1");
    t(true, "0.0.0.0/1");
    t(false, "127.0.0.0/1");
    t(false, "129.0.0.0/1");
    t(false, "1.0.0.0/1");
    t(true, "192.0.0.0/2");
    t(true, "64.0.0.0/2");
    t(true, "0.0.0.0/2");
    t(false, "193.0.0.0/2");
    t(false, "224.0.0.0/2");
    t(true, "254.0.0.0/7");
    t(true, "0.0.0.0/7");
    t(false, "255.0.0.0/7");
    t(true, "255.0.0.0/8");
    t(true, "128.0.0.0/8");
    t(true, "0.0.0.0/8");
    t(false, "255.128.0.0/8");
    t(true, "255.128.0.0/9");
    t(true, "255.254.0.0/15");
    t(true, "255.255.0.0/16");
    t(true, "0.0.0.0/16");
    t(false, "255.255.128.0/16");
    t(false, "255.255.0.128/16");
    t(true, "255.255.128.0/17");
    t(true, "255.255.254.0/23");
    t(true, "0.0.0.0/23");
    t(false, "255.255.255.0/23");
    t(false, "255.255.254.128/23");
    t(true, "255.255.255.0/24");
    t(true, "0.0.0.0/24");
    t(false, "255.255.255.128/24");
    t(true, "255.255.255.128/25");
    t(true, "0.0.0.0/25");
    t(false, "255.255.255.129/25");
    t(true, "255.255.255.254/31");
    t(true, "0.0.0.0/31");
    t(false, "255.255.255.255/31");
    t(true, "255.255.255.255/32");
    t(true, "0.0.0.0/32");

    function t(expect: boolean, str: string, comment = "") {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        assert.strictEqual(isIpPrefix(str, 4, true), expect);
        if (expect) {
          // A valid strict prefix must be a valid non-strict prefix
          assert.strictEqual(isIpPrefix(str, 4, false), true);
          // A valid IPv4 prefix is never a valid IPv6 prefix
          assert.strictEqual(isIpPrefix(str, 6, false), false);
        }
      });
    }
  });

  void suite("v6", () => {
    // simple examples
    t(true, "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/64");
    t(true, "::1/64", "compressed");
    t(true, "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/0", "min prefix-length");
    t(true, "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/128", "max prefix-length");

    // bad forms
    t(
      false,
      "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/064",
      "bad leading zero in decimal prefix-length",
    );
    t(
      false,
      "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/129",
      "prefix-length out of range",
    );
    t(
      false,
      "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/12345678901234567890",
      "prefix-length out of range",
    );
    t(
      false,
      "2001:0DB8:ABCD:0012:FFFF:FFFF:FFFF:FFFF/",
      "missing decimal prefix-length",
    );
    t(false, "::1%en1/64", "zone id not permitted");
    t(false, "::1/64%en1", "zone id not permitted");

    function t(expect: boolean, str: string, comment = "") {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        assert.strictEqual(isIpPrefix(str, 6, false), expect);
        if (expect) {
          // A valid IPv6 prefix is never a valid IPv4 prefix
          assert.strictEqual(isIpPrefix(str, 4, false), false);
        } else {
          // An invalid prefix is never a valid strict prefix
          assert.strictEqual(isIpPrefix(str, 4, true), false);
        }
      });
    }
  });

  void suite("v6 strict", () => {
    // 0 bit prefix
    t(true, "0:0:0:0:0:0:0:0/0");
    t(false, "1:0:0:0:0:0:0:0/0");

    // 1 bit prefix
    t(true, "0:0:0:0:0:0:0:0/1");
    t(true, "8000:0:0:0:0:0:0:0/1");
    t(false, "c000:0:0:0:0:0:0:0/1");

    // 8 bit prefix
    t(true, "0:0:0:0:0:0:0:0/8");
    t(true, "ff00:0:0:0:0:0:0:0/8");
    t(false, "ff80:0:0:0:0:0:0:0/8");

    // 64 bit prefix
    t(true, "1:2:3:4:0:0:0:0/64");
    t(true, "ffff:ffff:ffff:ffff:0:0:0:0/64");
    t(false, "ffff:ffff:ffff:ffff:8000:0:0:0/64");

    // 112 bit prefix
    t(true, "1:2:3:4:5:6:7:0/112");
    t(true, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:0/112");
    t(false, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:8000/112");

    // 127 bit prefix
    t(true, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:0/127");
    t(true, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:fffe/127");
    t(false, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/127");

    // 128 bit prefix
    t(true, "1:2:3:4:5:6:7:8/128");
    t(true, "ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff/128");
    t(true, "0:0:0:0:0:0:0:0/128");

    // double colon
    t(true, "::2:3:4:5:6:7:8/128", "double colon at start");
    t(true, "::8/128", "double colon at start compresses many");
    t(true, "1:2:3:4::6:7:8/128", "double colon in the middle");
    t(true, "1::8/128", "double colon in the middle compresses many");
    t(true, "1:2:3:4:5:6:7::/128", "double colon at end");
    t(true, "1::/128", "double colon at end compresses many");
    t(true, "::/128", "double colon");

    // dotted decimal for right-most 32 bits
    t(
      true,
      "0:0:0:0:0:ffff:192.1.56.10/128",
      "fully masked with dotted decimal notation",
    );
    t(true, "0:0:0:0:0:ffff:192.1.0.0/112", "last 16-bit piece zero");
    t(false, "0:0:0:0:0:ffff:192.1.0.128/112", "last 16-bit piece not zero");
    t(true, "0:0:0:0:0:ffff:0.0.0.0/96", "last two 16-bit pieces zero");
    t(false, "0:0:0:0:0:ffff:0.0.128.0/96", "last two 16-bit pieces not zero");

    // dotted decimal and double colon
    t(true, "::ffff:192.1.0.0/112", "last 16-bit piece zero");
    t(false, "::ffff:192.1.128.0/112", "last 16-bit piece not zero");

    function t(expect: boolean, str: string, comment = "") {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        assert.strictEqual(isIpPrefix(str, 6, true), expect);
        if (expect) {
          // A valid strict prefix must be a valid non-strict prefix
          assert.strictEqual(isIpPrefix(str, 6, false), true);
          // A valid IPv6 prefix is never a valid IPv4 prefix
          assert.strictEqual(isIpPrefix(str, 4, false), false);
        }
      });
    }
  });
});

void suite("isIp", () => {
  void suite("version argument", () => {
    // argument omitted
    t(true, "::1", undefined); // "either 4 or 6"
    t(true, "127.0.0.1", undefined); // "either 4 or 6"

    // version = 0
    t(true, "::1", 0, "version 0 means either 4 or 6");
    t(true, "127.0.0.1", 0, "version 0 means either 4 or 6");

    // specific version
    t(true, "::1", 6, "version 6 only");
    t(true, "127.0.0.1", 4, "is v4");
    t(false, "127.0.0.1", 6, "is v6");
    t(false, "::1", 4, "is not v4");

    // version out of range
    t(false, "127.0.0.1", 1, "bad version");
    t(false, "::1", 1, "bad version");
    t(false, "::1", 5, "bad version");
    t(false, "::1", 7, "bad version");

    function t(
      expect: boolean,
      str: string,
      version: number | bigint | undefined,
      comment = "",
    ) {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        if (typeof version == "number") {
          assert.strictEqual(isIp(str, version), expect);
          // Version given as number or bigint must have same result
          assert.strictEqual(isIp(str, BigInt(version)), expect);
        } else {
          assert.strictEqual(isIp(str), expect);
        }
      });
    }
  });

  void suite("IPv6", () => {
    t(true, `::1`);
    t(true, `::`);
    t(true, `0:0:0:0:0:0:0:0`);
    t(true, `ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff`);
    t(true, `fd7a:115c:a1e0:ab12:4843:cd96:626b:430b`);
    t(true, `d7a:115c:a1e0:ab12:4843:cd96:626b:430b`);
    t(true, `7a:115c:a1e0:ab12:4843:cd96:626b:430b`);
    t(true, `a:115c:a1e0:ab12:4843:cd96:626b:430b`);
    t(true, `1:2:3:4:5:6:7:8`);
    t(
      true,
      `0:0:0:0:0:ffff:192.1.56.10`,
      "IPv4 address embedded in IPv6 address",
    );
    t(
      false,
      `0:0:0:0:0:ffff:256.1.56.10`,
      "invalid IPv4 address embedded in IPv6 address",
    );
    t(true, `::1%foo`, "IPv6 with zone id");
    t(false, `::1%`, "zone id too short");
    t(true, `::1%% :x\x1F`, "zone id allows any non-null string");
    t(false, ``);
    t(false, ` ::`);
    t(false, `:: `);
    t(false, `:::`);
    t(false, `:2:3:4:5:6:7:8`);
    t(false, `12345:2:3:4:5:6:7:8`, "octet too long");
    t(false, `g:2:3:4:5:6:7:8`, "bad octet");
    t(false, `1::3:4::6:7:8`, "more than 1 double colon");
    t(false, `127.0.0.1`, "not an IPv6");
    t(false, `0.0.0.1`, "not an IPv6");

    function t(expect: boolean, str: string, comment = "") {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        assert.strictEqual(isIp(str, 6), expect);
        if (expect) {
          // A valid IPv6 must be a valid IPv4 / IPv6
          assert.strictEqual(isIp(str), expect);
          // A valid IPv6 is never a valid IPv4
          assert.strictEqual(isIp(str, 4), false);
        }
      });
    }
  });

  void suite("IPv4", () => {
    t(true, `127.0.0.1`);
    t(true, `255.255.255.255`);
    t(true, `0.0.0.0`);
    t(false, ``);
    t(false, ` 127.0.0.1`);
    t(false, `127.0.0.1 `);
    t(false, `127.0.1`, "not enough octets");
    t(false, `127.0.1.`, "empty octet");
    t(false, `127..0.1`, "empty octet");
    t(false, `127.0.0.0.1`, "too many octets");
    t(false, `256.0.0.0`, "octet too big");
    t(false, `0x0.0.0.0`);
    t(false, `::`);
    t(false, `::1`);
    t(false, `fd7a:115c:a1e0:ab12:4843:cd96:626b:430b`);
    function t(expect: boolean, str: string, comment = "") {
      void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
        assert.strictEqual(isIp(str, 4), expect);
        if (expect) {
          // A valid IPv4 must be a valid IPv4 / IPv6
          assert.strictEqual(isIp(str), expect);
          // A valid IPv4 is never a valid IPv6
          assert.strictEqual(isIp(str, 6), false);
        }
      });
    }
  });
});

void suite("isEmail", () => {
  t(true, "foo@example.com");
  t(true, "foo+x@example.com");
  t(true, "foo@example");
  t(false, "example.com", "missing @");
  t(false, `µ@example.com`);

  // before "@"
  t(false, "@example.com", "require left side");
  t(true, "foo.bar@example.com", "multiple atext");
  t(true, ".@example.com", "multiple atext");
  t(true, "...@example.com", "multiple atext");
  t(
    true,
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!#$%&'*+-/=?^_`{|}~@example.com",
    "exhaust atext",
  );
  t(false, "foo @example.com", "whitespace is not permitted");

  // after "@"
  t(false, "foo@", "require right side");
  t(false, "foo@example.com.", "trailing dot is invalid");
  t(false, "foo@.a", "label must not be empty");
  t(false, "foo@a..b", "label must not be empty");
  t(false, "foo@-a", "label must not start with hyphen");
  t(false, "foo@a-", "label must not end with hyphen");
  t(true, "foo@a-b.a--b", "label can have an interior hyphen");
  t(
    true,
    "foo@abc012345678901234567890123456789012345678901234567890123456789.com",
    "label can be 63 characters at most",
  );
  t(
    false,
    "foo@abcd012345678901234567890123456789012345678901234567890123456789.com",
    "label cannot be more than 63 characters",
  );
  t(
    true,
    "foo@0.1.2.3.4.5.6.7.8.9",
    "last label can be all digits, unlike isHostname()",
  );
  t(
    true,
    "foo@a.b.c.d.e.f.g.h.i.j.k.l.m.n.o.p.q.r.s.t.u.v.w.x.y.z.A.B.C.D.E.F.G.H.I.J.K.L.M.N.O.P.Q.R.S.T.U.V.W.X.Y.Z",
    "labels can start and end with letters",
  );
  t(
    true,
    "foo@abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    "label can use a-z, A-Z, 0-9, hyphen",
  );
  t(false, "foo@你好.com", "IDN is not supported");

  // valid in RFC 5322, but not in WHATWG (far from exhaustive)
  t(false, `"foo bar"@example.com`, "quoted-string is not valid");
  t(false, `foobar@ example.com`, "quoted-string is not valid");
  t(false, `"foo..bar"@example.com`, "quoted-string is not valid");
  t(false, `"foo@bar"@example.com`, "quoted-string is not valid");
  t(false, "foo@example.com (comment)", "comments are not valid");
  t(false, "John Doe <john@example.com>", "mailbox is not valid");
  t(false, "postmaster@[123.123.123.123]", "ip literal is not valid");

  function t(expect: boolean, str: string, comment = "") {
    void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
      assert.strictEqual(isEmail(str), expect);
    });
  }
});

void suite("isUri", () => {
  // simple examples
  t(true, "https://example.com");
  t(
    true,
    "https://example.com/foo/bar?baz=quux#frag",
    "URI with segment, query and fragment",
  );
  t(true, "https://joe@example.com/foo", "URI with userinfo");
  t(false, "./", "relative-ref is not valid with isUri");
  t(
    false,
    "//example.com/foo",
    "relative-ref with authority is not valid with isUri",
  );

  // extreme examples
  let extreme = "scheme0123456789azAZ+-." + "://";
  extreme +=
    "userinfo0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::" +
    "@";
  extreme +=
    "host!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  extreme += ":0123456789";
  extreme +=
    "/path0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20//foo/";
  extreme +=
    "?query0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?";
  extreme +=
    "#fragment0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/";
  t(true, extreme);

  // §3.1 Scheme
  t(true, "ftp://example.com", "scheme");
  t(true, "foo0123456789azAZ+-.://example.com", "valid scheme");
  t(false, "1foo://example.com", "invalid scheme");
  t(false, "+foo://example.com", "invalid scheme");
  t(false, "-foo://example.com", "invalid scheme");
  t(false, ".foo://example.com", "invalid scheme");
  t(false, ":foo://example.com", "invalid scheme");
  t(false, "foo%20bar://example.com", "invalid scheme");
  t(false, "foo\x1Fbar://example.com", "invalid scheme");
  t(false, "foo^bar://example.com", "invalid scheme");

  // §3.2.1 User information
  t(true, "https://user@example.com", "basic userinfo");
  t(true, "https://user:password@example.com", "basic userinfo");
  t(true, "https://%61%20%23@example.com", `userinfo pct-encoded ASCII`);
  t(true, "https://%c3%963@example.com", "userinfo pct-encoded UTF-8");
  t(true, "https://%c3x%963@example.com", "userinfo pct-encoded invalid UTF-8");
  t(false, "https://%@example.com", "userinfo bad pct-encoded");
  t(false, "https://%2x@example.com", "userinfo bad pct-encoded");
  t(
    true,
    "https://0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~@example.com",
    "userinfo unreserved",
  );
  t(true, "https://!$&'()*+,;=@example.com", "userinfo sub-delims");
  t(true, "https://:@example.com", "userinfo extra");
  t(true, "https://:::@example.com", `userinfo multiple ":"`);
  t(
    true,
    "https:///@example.com",
    `userinfo reserved "/" parses as path-abempty`,
  );
  t(true, "https://?@example.com", `userinfo reserved "?" parses as query`);
  t(true, "https://#@example.com", `userinfo reserved "#" parses as fragment`);
  t(false, "https://[@example.com", `userinfo reserved "["`);
  t(false, "https://]@example.com", `userinfo reserved "]"`);
  t(false, "https://@@example.com", `userinfo reserved "@"`);
  t(
    true,
    "https://0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::@example.com",
    `exhaust userinfo`,
  );
  t(false, "https://\x1F@example.com", "userinfo bad control character");
  t(false, "https://^@example.com", `userinfo bad "^"`);

  // §3.2.2 Host
  t(true, "https://foo", "host reg-name");
  t(
    true,
    "https://!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "host reg-name",
  );
  t(true, "https://:8080", `empty reg-name`);
  t(true, "https://foo%61%20%23", `host reg-name pct-encoded ASCII`);
  t(true, "https://foo%c3%96", "host reg-name pct-encoded UTF-8");
  t(false, "https://foo%c3x%96", "host reg-name pct-encoded invalid UTF-8");
  t(false, "https://foo%", "host reg-name bad pct-encoded");
  t(false, "https://foo%2x", "host reg-name bad pct-encoded");
  t(true, "https://127.0.0.1", "host IPv4address");
  t(true, "https://256.0.0.1", "host IPv4address bad octet matches reg-name");
  t(
    true,
    "https://[2001:0db8:85a3:0000:0000:8a2e:0370:7334]",
    "host IPv6address",
  );
  t(false, "https://[2001::0370::7334]", "bad host IPv6address");
  t(true, "https://[v1.x]", "host IPvFuture short version");
  t(true, "https://[v1234AF.x]", "host IPvFuture long version");
  t(
    true,
    "https://[vF.-!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ]",
    "host IPvFuture all characters",
  );
  t(false, "https://[v1x]", "host bad IPvFuture");
  t(false, "https://\x1F.com", "host bad control character");
  t(false, "https://^.com", `host bad "^"`);

  // RFC 6874 IPv6 zone identifiers
  t(true, "https://[::1%25eth0]", "host IPv6address with zone");
  t(false, "https://[::1%25]", "host IPv6address zone-id too short");
  t(false, "https://[::1%eth0]", "host IPv6address with unquoted zone");
  t(
    true,
    "https://[::1%25foo%61%20%23]",
    `host IPv6address zone pct-encoded ASCII`,
  );
  t(
    true,
    "https://[::1%25foo%c3%96]",
    "host IPv6address zone pct-encoded UTF-8",
  );
  t(
    false,
    "https://[::1%25foo%c3x%96]",
    "host IPv6address zone pct-encoded invalid UTF-8",
  );
  t(false, "https://[::1%25foo%]", "host IPv6address zone bad pct-encoded");
  t(false, "https://[::1%25foo%2x]", "host IPv6address zone bad pct-encoded");

  // §3.2.3 Port
  t(true, "https://example.com:8080", "port");
  t(false, "https://example.com:8a", "port number invalid");
  t(false, "https://example.com:x", "port number invalid");
  t(true, "https://example.com:0", "port zero is valid");
  t(true, "https://example.com:", `empty port`);
  t(true, "https://:", `empty reg-name and port`);

  // §3.3 Path
  t(true, "https://example.com/foo", "simple path");
  t(true, "https://example.com/foo/bar", "nested path");
  t(true, "https://example.com/foo/bar/", "path with trailing slash");

  // path-absolute
  t(true, "foo:/nz", "path-absolute");
  t(true, "foo:/nz/a", "path-absolute with segment");
  t(true, "foo:/nz//segment//segment/", "path-absolute with segments");
  t(true, "foo:/nz/", "path-absolute segment empty pchar");
  t(false, "foo:/^", `path-absolute segment-nz bad "^"`);
  t(false, "foo:/\x1F", "path-absolute segment-nz bad control character");
  t(false, "foo:/%x", "path-absolute segment-nz bad pct-encoded");
  t(true, "foo:/%61%20%23", "path-absolute segment-nz pct-encoded ASCII");
  t(true, "foo:/%c3%96", "path-absolute segment-nz pct-encoded UTF-8");
  t(true, "foo:/%c3x%96", "path-absolute segment-nz pct-encoded invalid UTF-8");
  t(
    true,
    "foo:/nz/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
    "path-absolute exhaust segment",
  );
  t(false, "foo:/nz/^", `path-absolute segment bad "^"`);
  t(false, "foo:/nz/\x1F", "path-absolute segment bad control character");
  t(false, "foo:/nz/%x", "path-absolute segment bad pct-encoded");
  t(true, "foo:/nz/%61%20%23", "path-absolute segment pct-encoded ASCII");
  t(true, "foo:/nz/%c3%96%c3", "path-absolute segment pct-encoded UTF-8");
  t(
    true,
    "foo:/@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~:",
    "path-absolute exhaust segment-nz",
  );
  t(true, "foo:/nz?q#f", "path-absolute with query and fragment");

  // path-rootless
  t(true, "foo:nz", "path-rootless");
  t(true, "foo:nz/a", "path-rootless with segment");
  t(true, "foo:nz//segment//segment/", "path-rootless with segments");
  t(true, "foo:nz/", "path-rootless segment empty pchar");
  t(false, "foo:^", `path-rootless segment-nz bad "^"`);
  t(false, "foo:\x1F", "path-rootless segment-nz bad control character");
  t(false, "foo:%x", "path-rootless segment-nz bad pct-encoded");
  t(true, "foo:%61%20%23", "path-rootless segment-nz pct-encoded ASCII");
  t(true, "foo:%c3%96", "path-rootless segment-nz pct-encoded UTF-8");
  t(true, "foo:%c3x%96", "path-rootless segment-nz pct-encoded invalid UTF-8");
  t(
    true,
    "foo:@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~:",
    "path-rootless exhaust segment-nz",
  );
  t(false, "foo:nz/^", `path-rootless segment bad "^"`);
  t(false, "foo:nz/\x1F", "path-rootless segment-nz bad control character");
  t(false, "foo:nz/%x", "path-rootless segment bad pct-encoded");
  t(true, "foo:nz/%61%20%23", "path-rootless segment pct-encoded ASCII");
  t(true, "foo:nz/%c3%96", "path-rootless segment pct-encoded UTF-8");
  t(
    true,
    "foo:nz/%c3%96x%c3",
    "path-rootless segment pct-encoded invalid UTF-8",
  );
  t(
    true,
    "foo:nz/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
    "path-rootless exhaust segment",
  );
  t(true, "foo:nz?q#f", "path-rootless with query and fragment");

  // path-empty
  t(true, "foo:", "path-empty");
  t(true, "foo:?q#f", "path-empty with query and fragment");

  // path-abempty
  t(true, "foo://example.com", "URI with authority and empty path");
  t(true, "foo://example.com/", "URI with authority and path starting with /");
  t(true, "foo://example.com/a", "path-abempty with segment");
  t(true, "foo://example.com/segment//segment/", "path-abempty with segments");
  t(true, "foo://example.com/", "path-abempty segment empty pchar");
  t(false, "foo://example.com/^", `path-abempty segment bad "^"`);
  t(
    false,
    "foo://example.com/\x1F",
    "path-abempty segment-nz bad control character",
  );
  t(false, "foo://example.com/%x", "path-abempty segment bad pct-encoded");
  t(
    true,
    "foo://example.com/%61%20%23",
    "path-abempty segment pct-encoded ASCII",
  );
  t(true, "foo://example.com/%c3%96", "path-abempty segment pct-encoded UTF-8");
  t(
    true,
    "foo://example.com/%c3x%96",
    "path-abempty segment pct-encoded invalid UTF-8",
  );
  t(
    true,
    "foo://example.com/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
    "path-abempty exhaust segment",
  );
  t(true, "foo://example.com?q#f", "path-abempty with query and fragment");

  // §3.4 Query
  t(true, "https://example.com?baz=quux", "basic query");
  t(true, "https://example.com?%61%20%23", `query pct-encoded ASCII`);
  t(true, "https://example.com?%c3%96%c3", "query pct-encoded UTF-8");
  t(false, "https://example.com?%2x", "query bad pct-encoded");
  t(
    true,
    "https://example.com?!$&'()*+,=",
    "query sub-delims except semicolon",
  );
  t(
    true,
    "https://example.com?;",
    "semicolon in query is valid, unlike Go's net/url",
  );
  t(true, "https://example.com?:@", "query pchar extra");
  t(true, "https://example.com?/?", "query extra");
  t(
    true,
    "https://example.com?a=b&c&&=1&==",
    "query with unusual key-value structure",
  );
  t(false, "https://example.com?^", `query bad "^"`);
  t(false, "https://example.com?%x", "query bad pct-encoded");
  t(false, "https://example.com?\x1F", "query bad control character");
  t(
    true,
    "https://example.com?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
    "exhaust query",
  );

  // §3.5 Fragment
  t(true, "https://example.com?#frag", "basic fragment");
  t(true, "https://example.com#%61%20%23", `fragment pct-encoded ASCII`);
  t(true, "https://example.com#%c3%96", "fragment pct-encoded UTF-8");
  t(true, "https://example.com#%c3x%96", "fragment pct-encoded invalid UTF-8");
  t(false, "https://example.com#%2x", "fragment bad pct-encoded");
  t(true, "https://example.com#!$&'()*+,;=", "fragment sub-delims");
  t(true, "https://example.com#:@", "fragment pchar extra");
  t(true, "https://example.com#/?", "fragment extra");
  t(false, "https://example.com##", `fragment bad "#"`);
  t(false, "https://example.com#^", `fragment bad "^"`);
  t(false, "https://example.com#\x1F", `fragment bad control character`);
  t(false, "https://example.com#%", "fragment bad pct-encoding");
  t(
    true,
    "https://example.com/#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
    "exhaust fragment",
  );

  function t(expect: boolean, str: string, comment = "") {
    void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
      assert.strictEqual(isUri(str), expect);
      if (expect) {
        // All URIs must also be URI References
        assert.strictEqual(isUriRef(str), expect);
      }
    });
  }
});

void suite("isUriRef", () => {
  // simple examples
  t(true, "./foo", "path-noscheme with segment");
  t(
    true,
    "./foo/bar?baz=quux#frag",
    "path-noscheme with segment, query and fragment",
  );
  t(true, "//host", "host");
  t(true, "//host/foo?baz=quux#frag", "host with segment, query, and fragment");
  t(false, "1foo://example.com", "URI with bad scheme is not a URI Reference");
  t(false, ":", "bad relative-part");

  // extreme examples
  let extreme = "//";
  extreme +=
    "userinfo0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::" +
    "@";
  extreme +=
    "host!$&'()*+,;=._~0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  extreme += ":0123456789";
  extreme +=
    "/path0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20//foo/";
  extreme +=
    "?query0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?";
  extreme +=
    "#fragment0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/";
  t(true, extreme);

  // "//" authority path-abempty
  t(true, "//host", "path-abempty");
  t(true, "//host/", "path-abempty segment empty pchar");
  t(false, "//host/\x1F", "path-abempty segment bad control character");
  t(false, "//host/^", `path-abempty segment bad "^"`);
  t(false, "//host/\x1F", "path-abempty segment bad control character");
  t(false, "//host/%x", "path-abempty segment bad pct-encoded");
  t(true, "//host/%61%20%23", "path-abempty segment pct-encoded ASCII");
  t(true, "//host/%c3%96", "path-abempty segment pct-encoded UTF-8");
  t(true, "//host/%c3x%96", "path-abempty segment pct-encoded invalid UTF-8");
  t(
    true,
    "//host/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&()*+,;=:@",
    "path-abempty exhaust segment",
  );
  t(true, "//host//", "path-abempty multiple segments");
  t(true, "//host/a/b/c", "path-abempty multiple segments");
  t(true, "//host/a/b/c/", "path-abempty multiple segments");
  t(true, "//host?baz=quux", "path-abempty with query");
  t(true, "//host/foo/bar?baz=quux", "path-abempty with query");
  t(true, "//host#frag", "path-abempty with fragment");
  t(true, "//host/foo/bar#frag", "path-abempty with fragment");
  t(
    true,
    "//host#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
    "path-abempty exhaust fragment",
  );
  t(false, "//host##", `path-abempty fragment bad "#"`);
  t(false, "//host#^", `path-abempty fragment bad "^"`);
  t(false, "//host#\x1F", `path-abempty fragment bad control character`);
  t(false, "//host#%", "path-abempty fragment bad pct-encoding");
  t(
    true,
    "//host?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
    "path-abempty exhaust query",
  );
  t(false, "//host?^", `path-abempty query bad "^"`);
  t(false, "//host?%", "path-abempty query bad pct-encoded");
  t(false, "//host?\x1F", "path-abempty query bad control character");
  t(
    true,
    "//0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~!$&'()*+,;=::@example.com",
    "path-abempty exhaust userinfo",
  );
  t(true, "//host:8080", "path-abempty port");
  t(true, "//127.0.0.1", "path-abempty IPv4");
  t(true, "//[::1]", "path-abempty IPv6");

  // path-absolute
  t(true, "/", "path-absolute");
  t(true, "/nz", "path-absolute segment-nz");
  t(true, "/:", `path-absolute segment-nz matches ":"`);
  t(false, "/^", `path-absolute segment-nz bad "^"`);
  t(false, "/\x1F", "path-absolute segment-nz bad control character");
  t(false, "/%x", "path-absolute segment-nz bad pct-encoded");
  t(true, "/%61%20%23", "path-absolute segment-nz pct-encoded ASCII");
  t(true, "/%c3%96", "path-absolute segment-nz pct-encoded UTF-8");
  t(true, "/%c3x%96", "path-absolute segment-nz pct-encoded invalid UTF-8");
  t(
    true,
    "/@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~:",
    "path-absolute exhaust segment-nz",
  );
  t(true, "/nz/", "path-absolute segment empty pchar");
  t(false, "/nz/^", `path-absolute segment bad "^"`);
  t(false, "/nz/\x1F", "path-absolute segment-nz bad control character");
  t(false, "/nz/%x", "path-absolute segment bad pct-encoded");
  t(true, "/nz/%61%20%23", "path-absolute segment pct-encoded ASCII");
  t(true, "/nz/%c3%96", "path-absolute segment pct-encoded UTF-8");
  t(true, "/nz/%c3x%96", "path-absolute segment pct-encoded invalid UTF-8");
  t(
    true,
    "/nz/0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&()*+,;=:@",
    "path-absolute exhaust segment",
  );
  t(true, "/?baz=quux", "path-absolute with query");
  t(true, "/foo/bar?baz=quux", "path-absolute with query");
  t(true, "/#frag", "path-absolute with fragment");
  t(true, "/foo/bar#frag", "path-absolute with fragment");
  t(false, "/foo/\x1F", "path-absolute bad control character");
  t(
    true,
    "/#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
    "path-absolute exhaust fragment",
  );
  t(false, "/##", `path-absolute fragment bad "#"`);
  t(false, "/#^", `path-absolute fragment bad "^"`);
  t(false, "/#\x1F", `path-absolute fragment bad control character`);
  t(false, "/#%", "path-absolute fragment bad pct-encoding");
  t(
    true,
    "/?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
    "path-absolute exhaust query",
  );
  t(false, "/?^", `path-absolute query bad "^"`);
  t(false, "/?%", "path-absolute query bad pct-encoded");
  t(false, "/?\x1F", "path-absolute query bad control character");

  // path-noscheme
  t(true, "./foo/bar", "path-noscheme");
  t(true, "*", "path-noscheme");
  t(false, ":", `path-noscheme segment-nz bad ":"`);
  t(false, "^", `path-noscheme segment-nz bad "^"`);
  t(false, "\x1F", "path-noscheme segment-nz bad control character");
  t(false, "%x", "path-noscheme segment-nz bad pct-encoded");
  t(true, "%61%20%23", "path-noscheme segment-nz pct-encoded ASCII");
  t(true, "%c3%96", "path-noscheme segment-nz pct-encoded UTF-8");
  t(true, "%c3x%96", "path-noscheme segment-nz pct-encoded invalid UTF-8");
  t(
    true,
    "@%20!$&()*+,;=0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~",
    "path-noscheme exhaust segment-nz-nc",
  );
  t(true, "./", "path-noscheme segment empty pchar");
  t(false, "./^", `path-noscheme segment bad "^"`);
  t(false, "./\x1F", "path-noscheme segment-nz bad control character");
  t(false, "./%x", "path-noscheme segment bad pct-encoded");
  t(true, "./%61%20%23", "path-noscheme segment pct-encoded ASCII");
  t(true, "./%c3%96", "path-noscheme segment pct-encoded UTF-8");
  t(true, "./%c3x%96", "path-noscheme segment pct-encoded invalid UTF-8");
  t(
    true,
    "./0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ%20!$&'()*+,;=:@%20",
    "path-noscheme exhaust segment",
  );
  t(true, ".///", "path-noscheme multiple segments");
  t(true, "./a/b/c", "path-noscheme multiple segments");
  t(true, "./a/b/c/", "path-noscheme multiple segments");
  t(true, ".?baz=quux", "path-noscheme with query");
  t(true, "./foo/bar?baz=quux", "path-noscheme with query");
  t(true, ".#frag", "path-noscheme with fragment");
  t(true, "./foo/bar#frag", "path-noscheme with fragment");
  t(false, "./foo/\x1F", "path-noscheme bad control character");
  t(
    true,
    ".#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
    "path-noscheme exhaust fragment",
  );
  t(false, ".##", `path-noscheme fragment bad "#"`);
  t(false, ".#^", `path-noscheme fragment bad "^"`);
  t(false, ".#\x1F", "path-noscheme fragment bad control character");
  t(false, ".#%", "path-noscheme fragment bad pct-encoded");
  t(
    true,
    ".?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
    "path-noscheme exhaust query",
  );
  t(false, ".?^", `path-noscheme query bad "^"`);
  t(false, ".?%", "path-noscheme query bad pct-encoded");
  t(false, ".?\x1F", "path-noscheme query bad control character");

  // path-empty
  t(true, "", "path-empty");
  t(
    true,
    "#0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?/",
    "path-empty exhaust fragment",
  );
  t(false, "##", `path-empty fragment bad "#"`);
  t(false, "#^", `path-empty fragment bad "^"`);
  t(false, "#\x1F", "path-noscheme fragment bad control character");
  t(false, "#%", "path-empty fragment bad pct-encoded");
  t(
    true,
    "?0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-._~%20!$&'()*+,=;:@?",
    "path-empty exhaust query",
  );
  t(false, "?^", `path-empty query bad "^"`);
  t(false, "?%", "path-empty query bad pct-encoded");
  t(false, "?\x1F", "path-empty query bad control character");

  function t(expect: boolean, str: string, comment = "") {
    void test(`\`${str}\` ${expect}${comment.length ? `, ${comment}` : ""}`, () => {
      assert.strictEqual(isUriRef(str), expect);
    });
  }
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
