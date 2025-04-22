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

import { type CelResult, CelUint } from "@bufbuild/cel";
import { scalarEquals } from "@bufbuild/protobuf/reflect";
import { ScalarType } from "@bufbuild/protobuf";

/**
 * Returns true if the value is infinite, optionally limit to positive or
 * negative infinity.
 */
export function isInf(val: number, sign?: number | bigint): boolean {
  sign ??= 0;
  return (
    (sign >= 0 && val === Number.POSITIVE_INFINITY) ||
    (sign <= 0 && val === Number.NEGATIVE_INFINITY)
  );
}

/**
 * Returns true if the string is an IPv4 or IPv6 address, optionally limited to
 * a specific version.
 *
 * Version 0 means either 4 or 6. Passing a version other than 0, 4, or 6 always
 * returns false.
 *
 * IPv4 addresses are expected in the dotted decimal format, for example "192.168.5.21".
 * IPv6 addresses are expected in their text representation, for example "::1",
 * or "2001:0DB8:ABCD:0012::0".
 *
 * Both formats are well-defined in the internet standard RFC 3986. Zone
 * identifiers for IPv6 addresses (for example "fe80::a%en1") are supported.
 */
export function isIp(str: string, version?: number | bigint): boolean {
  if (version == 6) {
    return new Ipv6(str).address();
  }
  if (version == 4) {
    return new Ipv4(str).address();
  }
  if (version === undefined || version == 0) {
    return new Ipv4(str).address() || new Ipv6(str).address();
  }
  return false;
}

/**
 * Returns true if the string is a valid IP with prefix length, optionally
 * limited to a specific version (v4 or v6), and optionally requiring the host
 * portion to be all zeros.
 *
 * An address prefix divides an IP address into a network portion, and a host
 * portion. The prefix length specifies how many bits the network portion has.
 * For example, the IPv6 prefix "2001:db8:abcd:0012::0/64" designates the
 * left-most 64 bits as the network prefix. The range of the network is 2**64
 * addresses, from 2001:db8:abcd:0012::0 to 2001:db8:abcd:0012:ffff:ffff:ffff:ffff.
 *
 * An address prefix may include a specific host address, for example
 * "2001:db8:abcd:0012::1f/64". With strict = true, this is not permitted. The
 * host portion must be all zeros, as in "2001:db8:abcd:0012::0/64".
 *
 * The same principle applies to IPv4 addresses. "192.168.1.0/24" designates
 * the first 24 bits of the 32-bit IPv4 as the network prefix.
 */
export function isIpPrefix(
  str: string,
  version?: number | bigint,
  strict = false,
): boolean {
  if (version == 6) {
    const ip = new Ipv6(str);
    return ip.addressPrefix() && (!strict || ip.isPrefixOnly());
  }
  if (version == 4) {
    const ip = new Ipv4(str);
    return ip.addressPrefix() && (!strict || ip.isPrefixOnly());
  }
  if (version === undefined || version == 0) {
    return isIpPrefix(str, 6, strict) || isIpPrefix(str, 4, strict);
  }
  return false;
}

export class Ipv4 {
  readonly str: string;
  i: number = 0;
  readonly l: number;
  readonly octets: number[] = [];
  prefixLen = 0;

  constructor(str: string) {
    this.str = str;
    this.l = str.length;
  }

  // Return the 32-bit value of an address parsed through address() or addressPrefix().
  // Return 0 if no address was parsed successfully.
  getBits(): number {
    if (this.octets.length != 4) {
      return 0;
    }
    return (
      ((this.octets[0] << 24) |
        (this.octets[1] << 16) |
        (this.octets[2] << 8) |
        this.octets[3]) >>>
      0
    );
  }

  // Return true if all bits to the right of the prefix-length are all zeros.
  // Behavior is undefined if addressPrefix() has not been called before, or has
  // returned false.
  isPrefixOnly(): boolean {
    const bits = this.getBits();
    const mask =
      this.prefixLen == 32
        ? 0xffffffff
        : ~(0xffffffff >>> this.prefixLen) >>> 0;
    const masked = (bits & mask) >>> 0;
    return bits == masked;
  }

  // Parse IPv4 Address in dotted decimal notation.
  address(): boolean {
    return this.addressPart() && this.i == this.l;
  }

  // Parse IPv4 Address prefix.
  addressPrefix(): boolean {
    return (
      this.addressPart() &&
      this.take("/") &&
      this.prefixLength() &&
      this.i == this.l
    );
  }

  // Stores value in `prefixLen`
  prefixLength(): boolean {
    const start = this.i;
    while (this.digit()) {
      if (this.i - start > 2) {
        // max prefix-length is 32 bits, so anything more than 2 digits is invalid
        return false;
      }
    }
    const str = this.str.substring(start, this.i);
    if (str.length == 0) {
      // too short
      return false;
    }
    if (str.length > 1 && str[0] == "0") {
      // bad leading 0
      return false;
    }
    const value = parseInt(str);
    if (value > 32) {
      // max 32 bits
      return false;
    }
    this.prefixLen = value;
    return true;
  }

  addressPart(): boolean {
    const start = this.i;
    if (
      this.decOctet() &&
      this.take(".") &&
      this.decOctet() &&
      this.take(".") &&
      this.decOctet() &&
      this.take(".") &&
      this.decOctet()
    ) {
      return true;
    }
    this.i = start;
    return false;
  }

  decOctet(): boolean {
    const start = this.i;
    while (this.digit()) {
      if (this.i - start > 3) {
        // decimal octet can be three characters at most
        return false;
      }
    }
    const str = this.str.substring(start, this.i);
    if (str.length == 0) {
      // too short
      return false;
    }
    if (str.length > 1 && str[0] == "0") {
      // bad leading 0
      return false;
    }
    const value = parseInt(str, 10);
    if (value > 255) {
      return false;
    }
    this.octets.push(value);
    return true;
  }

  // DIGIT = %x30-39  ; 0-9
  digit(): boolean {
    const c = this.str[this.i];
    if ("0" <= c && c <= "9") {
      this.i++;
      return true;
    }
    return false;
  }

  take(char: string): boolean {
    if (this.str[this.i] == char) {
      this.i++;
      return true;
    }
    return false;
  }
}

export class Ipv6 {
  readonly str: string;
  i: number = 0;
  readonly l: number;
  readonly pieces: number[] = []; // 16-bit pieces found
  doubleColonAt: number = -1; // number of 16-bit pieces found when double colon was found
  doubleColonSeen = false;
  dottedRaw = ""; // dotted notation for right-most 32 bits
  dottedAddr: Ipv4 | undefined; // dotted notation successfully parsed as IPv4
  zoneIdFound = false;
  prefixLen = 0; // 0 - 128

  constructor(str: string) {
    this.str = str;
    this.l = str.length;
  }

  // Return the 128-bit value of an address parsed through address() or addressPrefix(),
  // as a 4-tuple of 32-bit values.
  // Return [0,0,0,0] if no address was parsed successfully.
  getBits(): [number, number, number, number] {
    const p16 = this.pieces;
    // handle dotted decimal, add to p16
    if (this.dottedAddr !== undefined) {
      const dotted32 = this.dottedAddr.getBits(); // right-most 32 bits
      p16.push(dotted32 >>> 16); // high 16 bits
      p16.push(dotted32 & (0xffff >>> 0)); // low 16 bits
    }
    // handle double colon, fill pieces with 0
    if (this.doubleColonSeen) {
      while (p16.length < 8) {
        // delete 0 entries at pos, insert a 0
        p16.splice(this.doubleColonAt, 0, 0x00000000);
      }
    }
    if (p16.length != 8) {
      return [0, 0, 0, 0];
    }
    return [
      ((p16[0] << 16) | p16[1]) >>> 0,
      ((p16[2] << 16) | p16[3]) >>> 0,
      ((p16[4] << 16) | p16[5]) >>> 0,
      ((p16[6] << 16) | p16[7]) >>> 0,
    ];
  }

  // Return true if all bits to the right of the prefix-length are all zeros.
  // Behavior is undefined if addressPrefix() has not been called before, or has
  // returned false.
  isPrefixOnly(): boolean {
    // For each 32-bit piece of the address, require that values to the right of the prefix are zero
    for (const [i, p32] of this.getBits().entries()) {
      const len = this.prefixLen - 32 * i;
      const mask =
        len >= 32
          ? 0xffffffff
          : len < 0
            ? 0x00000000
            : ~(0xffffffff >>> len) >>> 0;
      const masked = (p32 & mask) >>> 0;
      if (p32 !== masked) {
        return false;
      }
    }
    return true;
  }

  // Parse IPv6 Address following RFC 4291, with optional zone id following RFC 4007.
  address() {
    return this.addressPart() && this.i == this.l;
  }

  // Parse IPv6 Address Prefix following RFC 4291. Zone id is not permitted.
  addressPrefix(): boolean {
    return (
      this.addressPart() &&
      !this.zoneIdFound &&
      this.take("/") &&
      this.prefixLength() &&
      this.i == this.l
    );
  }

  // Stores value in `prefixLen`
  prefixLength(): boolean {
    const start = this.i;
    while (this.digit()) {
      if (this.i - start > 3) {
        return false;
      }
    }
    const str = this.str.substring(start, this.i);
    if (str.length == 0) {
      // too short
      return false;
    }
    if (str.length > 1 && str[0] == "0") {
      // bad leading 0
      return false;
    }
    const value = parseInt(str, 10);
    if (value > 128) {
      // max 128 bits
      return false;
    }
    this.prefixLen = value;
    return true;
  }

  // Stores dotted notation for right-most 32 bits in `dottedRaw` / `dottedAddr` if found.
  addressPart(): boolean {
    for (; this.i < this.l; ) {
      // dotted notation for right-most 32 bits, e.g. 0:0:0:0:0:ffff:192.1.56.10
      if ((this.doubleColonSeen || this.pieces.length == 6) && this.dotted()) {
        const dotted = new Ipv4(this.dottedRaw);
        if (dotted.address()) {
          this.dottedAddr = dotted;
          return true;
        }
        return false;
      }

      const result = this.h16();
      if (result === "error") {
        return false;
      }
      if (result) {
        continue;
      }
      if (this.take(":")) {
        if (this.take(":")) {
          if (this.doubleColonSeen) {
            return false;
          }
          this.doubleColonSeen = true;
          this.doubleColonAt = this.pieces.length;
          if (this.take(":")) {
            return false;
          }
        } else {
          if (this.i === 1 || this.i === this.str.length) {
            // invalid - string cannot start or end on single colon
            return false;
          }
        }
        continue;
      }
      if (this.str[this.i] == "%" && !this.zoneId()) {
        return false;
      }
      break;
    }
    if (this.doubleColonSeen) {
      return this.pieces.length < 8;
    }
    return this.pieces.length == 8;
  }

  // Parses the rule from RFC 6874:
  //
  //     RFC 6874: ZoneID = 1*( unreserved / pct-encoded )
  //
  // There is no definition for the character set allowed in the zone
  // identifier. RFC 4007 permits basically any non-null string.
  zoneId() {
    const start = this.i;
    if (this.take("%")) {
      if (this.l - this.i > 0) {
        // permit any non-null string
        this.i = this.l;
        this.zoneIdFound = true;
        return true;
      }
    }
    this.i = start;
    this.zoneIdFound = false;
    return false;
  }

  // Parses the rule:
  //
  //     1*3DIGIT "." 1*3DIGIT "." 1*3DIGIT "." 1*3DIGIT
  //
  // Stores match in `dottedRaw`.
  dotted(): boolean {
    const start = this.i;
    this.dottedRaw = "";
    for (;;) {
      if (this.digit() || this.take(".")) {
        continue;
      }
      break;
    }
    if (this.i - start >= 7) {
      this.dottedRaw = this.str.substring(start, this.i);
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     h16 = 1*4HEXDIG
  //
  // If 1-4 hex digits are found, the parsed 16-bit unsigned integer is stored in `pieces` and true is returned.
  // If 0 hex digits are found, returns false.
  // If more than 4 hex digits are found, "error" is returned.
  //
  h16(): boolean | "error" {
    const start = this.i;
    while (this.hexdig()) {
      // continue
    }
    const str = this.str.substring(start, this.i);
    if (str.length == 0) {
      // too short
      // this is not an error condition, it just means we didn't find any
      // hex digits at the current position.
      return false;
    }
    if (str.length > 4) {
      // too long
      // this is an error condition, it means we found a string of more than
      // four valid hex digits, which is invalid in ipv6 addresses.
      return "error";
    }
    this.pieces.push(parseInt(str, 16));
    return true;
  }

  // Parses the rule:
  //
  //     HEXDIG =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
  hexdig(): boolean {
    const c = this.str[this.i];
    if (
      ("0" <= c && c <= "9") ||
      ("a" <= c && c <= "f") ||
      ("A" <= c && c <= "F") ||
      ("0" <= c && c <= "9")
    ) {
      this.i++;
      return true;
    }
    return false;
  }

  // Parses the rule:
  //
  //     DIGIT = %x30-39  ; 0-9
  digit(): boolean {
    const c = this.str[this.i];
    if ("0" <= c && c <= "9") {
      this.i++;
      return true;
    }
    return false;
  }

  take(char: string): boolean {
    if (this.str[this.i] == char) {
      this.i++;
      return true;
    }
    return false;
  }
}

/**
 * Returns true if the string is a valid hostname, for example "foo.example.com".
 *
 * A valid hostname follows the rules below:
 * - The name consists of one or more labels, separated by a dot (".").
 * - Each label can be 1 to 63 alphanumeric characters.
 * - A label can contain hyphens ("-"), but must not start or end with a hyphen.
 * - The right-most label must not be digits only.
 * - The name can have a trailing dot, for example "foo.example.com.".
 * - The name can be 253 characters at most, excluding the optional trailing dot.
 */
export function isHostname(str: string): boolean {
  if (str.length > 253) {
    return false;
  }
  const s = str.endsWith(".") ? str.substring(0, str.length - 1) : str;
  let allDigits = false;
  // split hostname on '.' and validate each part
  for (const part of s.split(".")) {
    allDigits = true;
    // if part is empty, longer than 63 chars, or starts/ends with '-', it is invalid
    const l = part.length;
    if (l == 0 || l > 63 || part.startsWith("-") || part.endsWith("-")) {
      return false;
    }
    // for each character in part
    for (const ch of part.split("")) {
      // if the character is not a-z, A-Z, 0-9, or '-', it is invalid
      if (
        (ch < "a" || ch > "z") &&
        (ch < "A" || ch > "Z") &&
        (ch < "0" || ch > "9") &&
        ch != "-"
      ) {
        return false;
      }
      allDigits = allDigits && ch >= "0" && ch <= "9";
    }
  }
  // the last part cannot be all numbers
  return !allDigits;
}

/**
 * Returns true if the string is a valid host/port pair, for example "example.com:8080".
 *
 * If the argument `portRequired` is true, the port is required. If the argument
 * is false, the port is optional.
 *
 * The host can be one of:
 * - An IPv4 address in dotted decimal format, for example "192.168.0.1".
 * - An IPv6 address enclosed in square brackets, for example "[::1]".
 * - A hostname, for example "example.com".
 *
 * The port is separated by a colon. It must be non-empty, with a decimal number
 * in the range of 0-65535, inclusive.
 */
export function isHostAndPort(str: string, portRequired: boolean): boolean {
  if (str.length == 0) {
    return false;
  }
  const splitIdx = str.lastIndexOf(":");
  if (str[0] == "[") {
    const end = str.lastIndexOf("]");
    switch (end + 1) {
      case str.length: // no port
        return !portRequired && isIp(str.substring(1, end), 6);
      case splitIdx: // port
        return (
          isIp(str.substring(1, end), 6) && isPort(str.substring(splitIdx + 1))
        );
      default: // malformed
        return false;
    }
  }
  if (splitIdx < 0) {
    return !portRequired && (isHostname(str) || isIp(str, 4));
  }
  const host = str.substring(0, splitIdx);
  const port = str.substring(splitIdx + 1);
  return (isHostname(host) || isIp(host, 4)) && isPort(port);
}

function isPort(str: string): boolean {
  if (str.length == 0) {
    return false;
  }
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if ("0" <= c && c <= "9") {
      continue;
    }
    return false;
  }
  if (str.length > 1 && str[0] === "0") {
    return false;
  }
  return parseInt(str) <= 65535;
}

/**
 * Returns true if the string is an email address, for example "foo@example.com".
 *
 * Conforms to the definition for a valid email address from the HTML standard.
 * Note that this standard willfully deviates from RFC 5322, which allows many
 * unexpected forms of email addresses and will easily match a typographical
 * error.
 */
export function isEmail(str: string): boolean {
  // See https://html.spec.whatwg.org/multipage/input.html#valid-e-mail-address
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
    str,
  );
}

/**
 * Returns true if the string is a URI, for example "https://example.com/foo/bar?baz=quux#frag".
 *
 * URI is defined in the internet standard RFC 3986.
 * Zone Identifiers in IPv6 address literals are supported (RFC 6874).
 */
export function isUri(str: string): boolean {
  return new Uri(str).uri();
}

/**
 * Returns true if the string is a URI Reference - a URI such as "https://example.com/foo/bar?baz=quux#frag",
 * or a Relative Reference such as "./foo/bar?query".
 *
 * URI, URI Reference, and Relative Reference are defined in the internet
 * standard RFC 3986. Zone Identifiers in IPv6 address literals are supported
 * (RFC 6874).
 */
export function isUriRef(str: string): boolean {
  return new Uri(str).uriReference();
}

class Uri {
  readonly str: string;
  i: number = 0;
  readonly l: number;
  pctEncodedFound = false;

  constructor(str: string) {
    this.str = str;
    this.l = str.length;
  }

  // Parses the rule:
  //
  //     URI = scheme ":" hier-part [ "?" query ] [ "#" fragment ]
  uri(): boolean {
    const start = this.i;
    if (!(this.scheme() && this.take(":") && this.hierPart())) {
      this.i = start;
      return false;
    }
    if (this.take("?") && !this.query()) {
      return false;
    }
    if (this.take("#") && !this.fragment()) {
      return false;
    }
    if (this.i != this.l) {
      this.i = start;
      return false;
    }
    return true;
  }

  /// Parses the rule:
  //
  //     hier-part = "//" authority path-abempty
  //               / path-absolute
  //               / path-rootless
  //               / path-empty
  hierPart(): boolean {
    const start = this.i;
    if (
      this.take("/") &&
      this.take("/") &&
      this.authority() &&
      this.pathAbempty()
    ) {
      return true;
    }
    this.i = start;
    return this.pathAbsolute() || this.pathRootless() || this.pathEmpty();
  }

  // Parses the rule:
  //
  //     URI-reference = URI / relative-ref
  uriReference(): boolean {
    return this.uri() || this.relativeRef();
  }

  // Parses the rule:
  //
  //     relative-ref = relative-part [ "?" query ] [ "#" fragment ]
  relativeRef(): boolean {
    const start = this.i;
    if (!this.relativePart()) {
      return false;
    }
    if (this.take("?") && !this.query()) {
      this.i = start;
      return false;
    }
    if (this.take("#") && !this.fragment()) {
      this.i = start;
      return false;
    }
    if (this.i != this.l) {
      this.i = start;
      return false;
    }
    return true;
  }

  // Parses the rule:
  //
  //     relative-part = "//" authority path-abempty
  //                   / path-absolute
  //                   / path-noscheme
  //                   / path-empty
  relativePart(): boolean {
    const start = this.i;
    if (
      this.take("/") &&
      this.take("/") &&
      this.authority() &&
      this.pathAbempty()
    ) {
      return true;
    }
    this.i = start;
    return this.pathAbsolute() || this.pathNoscheme() || this.pathEmpty();
  }

  // Parses the rule:
  //
  //     scheme = ALPHA *( ALPHA / DIGIT / "+" / "-" / "." )
  //
  // Terminated by ":".
  scheme(): boolean {
    const start = this.i;
    if (this.alpha()) {
      while (
        this.alpha() ||
        this.digit() ||
        this.take("+") ||
        this.take("-") ||
        this.take(".")
      ) {
        // continue
      }
      if (this.str[this.i] == ":") {
        return true;
      }
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     authority = [ userinfo "@" ] host [ ":" port ]
  //
  // Lead by double slash ("") and terminated by "/", "?", "#", or end of URI.
  authority(): boolean {
    const start = this.i;
    if (this.userinfo()) {
      if (!this.take("@")) {
        this.i = start;
        return false;
      }
    }
    if (!this.host()) {
      this.i = start;
      return false;
    }
    if (this.take(":")) {
      if (!this.port()) {
        this.i = start;
        return false;
      }
    }
    if (!this.isAuthorityEnd()) {
      this.i = start;
      return false;
    }
    return true;
  }

  // > The authority component [...] is terminated by the next slash ("/"),
  // > question mark ("?"), or number sign ("#") character, or by the
  // > end of the URI.
  isAuthorityEnd(): boolean {
    return (
      this.str[this.i] == "?" ||
      this.str[this.i] == "#" ||
      this.str[this.i] == "/" ||
      this.i >= this.l
    );
  }

  // Parses the rule:
  //
  //     userinfo = *( unreserved / pct-encoded / sub-delims / ":" )
  //
  // Terminated by "@" in authority.
  userinfo(): boolean {
    const start = this.i;
    for (;;) {
      if (
        this.unreserved() ||
        this.pctEncoded() ||
        this.subDelims() ||
        this.take(":")
      ) {
        continue;
      }
      if (this.str[this.i] == "@") {
        return true;
      }
      this.i = start;
      return false;
    }
  }

  // Parses the rule:
  //
  //     host = IP-literal / IPv4address / reg-name
  host(): boolean {
    const start = this.i;
    this.pctEncodedFound = false;
    // Note: IPv4address is a subset of reg-name
    if ((this.str[this.i] == "[" && this.ipLiteral()) || this.regName()) {
      if (this.pctEncodedFound) {
        const rawHost = this.str.substring(start, this.i);
        // RFC 3986:
        // > URI producing applications must not use percent-encoding in host
        // > unless it is used to represent a UTF-8 character sequence.
        try {
          // decodeURIComponent() throws an error if a pct-encoded escape
          // sequence does not encode a valid UTF-8 character.
          // Other implementations may have to implement this check themselves.
          // For example:
          // - Decode pct-encoded rawHost
          //   - Allocate an octet array
          //   - For every octet in rawHost
          //     - For "%", percent-decode the following two hex digits to an
          //       octet, add it to the octet array
          //     - For every other octet, add it to the octet array
          // - Check that the octet array is valid UTF-8
          decodeURIComponent(rawHost);
        } catch (_) {
          return false;
        }
      }
      return true;
    }
    return false;
  }

  // Parses the rule:
  //
  //     port = *DIGIT
  //
  // Terminated by end of authority.
  port(): boolean {
    const start = this.i;
    for (;;) {
      if (this.digit()) {
        continue;
      }
      if (this.isAuthorityEnd()) {
        return true;
      }
      this.i = start;
      return false;
    }
  }

  // Parses the rule from RFC 6874:
  //
  //     IP-literal = "[" ( IPv6address / IPv6addrz / IPvFuture  ) "]"
  ipLiteral(): boolean {
    const start = this.i;
    if (this.take("[")) {
      const j = this.i;
      if (this.ipv6Address() && this.take("]")) {
        return true;
      }
      this.i = j;
      if (this.ipv6addrz() && this.take("]")) {
        return true;
      }
      this.i = j;
      if (this.ipvFuture() && this.take("]")) {
        return true;
      }
    }
    this.i = start;
    return false;
  }

  // Parses the rule "IPv6address".
  // Relies on the implementation of isIp().
  ipv6Address(): boolean {
    const start = this.i;
    while (this.hexdig() || this.take(":")) {
      // continue
    }
    if (isIp(this.str.substring(start, this.i), 6)) {
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule from RFC 6874:
  //
  //     IPv6addrz = IPv6address "%25" ZoneID
  ipv6addrz(): boolean {
    const start = this.i;
    if (
      this.ipv6Address() &&
      this.take("%") &&
      this.take("2") &&
      this.take("5") &&
      this.zoneId()
    ) {
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule from RFC 6874:
  //
  //     ZoneID = 1*( unreserved / pct-encoded )
  zoneId(): boolean {
    const start = this.i;
    while (this.unreserved() || this.pctEncoded()) {
      // continue
    }
    if (this.i - start > 0) {
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     IPvFuture  = "v" 1*HEXDIG "." 1*( unreserved / sub-delims / ":" )
  ipvFuture(): boolean {
    const start = this.i;
    if (this.take("v") && this.hexdig()) {
      while (this.hexdig()) {
        // continue
      }
      if (this.take(".")) {
        let j = 0;
        while (this.unreserved() || this.subDelims() || this.take(":")) {
          j++;
        }
        if (j >= 1) {
          return true;
        }
      }
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     reg-name = *( unreserved / pct-encoded / sub-delims )
  //
  // Terminates on start of port (":") or end of authority.
  regName(): boolean {
    const start = this.i;
    for (;;) {
      if (this.unreserved() || this.pctEncoded() || this.subDelims()) {
        continue;
      }
      if (this.str[this.i] == ":") {
        return true;
      }
      if (this.isAuthorityEnd()) {
        // End of authority
        return true;
      }
      this.i = start;
      return false;
    }
  }

  // > The path is terminated by the first question mark ("?") or
  // > number sign ("#") character, or by the end of the URI.
  isPathEnd(): boolean {
    return (
      this.str[this.i] == "?" || this.str[this.i] == "#" || this.i >= this.l
    );
  }

  // Parses the rule:
  //
  //     path-abempty = *( "/" segment )
  //
  // Terminated by end of path: "?", "#", or end of URI.
  pathAbempty(): boolean {
    const start = this.i;
    while (this.take("/") && this.segment()) {
      // continue
    }
    if (this.isPathEnd()) {
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     path-absolute = "/" [ segment-nz *( "/" segment ) ]
  //
  // Terminated by end of path: "?", "#", or end of URI.
  pathAbsolute(): boolean {
    const start = this.i;
    if (this.take("/")) {
      if (this.segmentNz()) {
        while (this.take("/") && this.segment()) {
          // continue
        }
      }
      if (this.isPathEnd()) {
        return true;
      }
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     path-noscheme = segment-nz-nc *( "/" segment )
  //
  // Terminated by end of path: "?", "#", or end of URI.
  pathNoscheme(): boolean {
    const start = this.i;
    if (this.segmentNzNc()) {
      while (this.take("/") && this.segment()) {
        // continue
      }
      if (this.isPathEnd()) {
        return true;
      }
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     path-rootless = segment-nz *( "/" segment )
  //
  // Terminated by end of path: "?", "#", or end of URI.
  pathRootless(): boolean {
    const start = this.i;
    if (this.segmentNz()) {
      while (this.take("/") && this.segment()) {
        // continue
      }
      if (this.isPathEnd()) {
        return true;
      }
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     path-empty = 0<pchar>
  //
  // Terminated by end of path: "?", "#", or end of URI.
  pathEmpty(): boolean {
    return this.isPathEnd();
  }

  // Parses the rule:
  //
  //     segment = *pchar
  segment(): boolean {
    while (this.pchar()) {
      // continue
    }
    return true;
  }

  // Parses the rule:
  //
  //     segment-nz = 1*pchar
  segmentNz(): boolean {
    const start = this.i;
    if (this.pchar()) {
      while (this.pchar()) {
        // continue
      }
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     segment-nz-nc = 1*( unreserved / pct-encoded / sub-delims / "@" )
  //                   ; non-zero-length segment without any colon ":"
  segmentNzNc(): boolean {
    const start = this.i;
    while (
      this.unreserved() ||
      this.pctEncoded() ||
      this.subDelims() ||
      this.take("@")
    ) {
      // continue
    }
    if (this.i - start > 0) {
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     pchar = unreserved / pct-encoded / sub-delims / ":" / "@"
  pchar(): boolean {
    return (
      this.unreserved() ||
      this.pctEncoded() ||
      this.subDelims() ||
      this.take(":") ||
      this.take("@")
    );
  }

  // Parses the rule:
  //
  //     query = *( pchar / "/" / "?" )
  //
  // Terminated by "#" or end of URI.
  query(): boolean {
    const start = this.i;
    for (;;) {
      if (this.pchar() || this.take("/") || this.take("?")) {
        continue;
      }
      if (this.str[this.i] == "#" || this.i == this.l) {
        return true;
      }
      this.i = start;
      return false;
    }
  }

  // Parses the rule:
  //
  //     fragment = *( pchar / "/" / "?" )
  //
  // Terminated by end of URI.
  fragment(): boolean {
    const start = this.i;
    for (;;) {
      if (this.pchar() || this.take("/") || this.take("?")) {
        continue;
      }
      if (this.i == this.l) {
        return true;
      }
      this.i = start;
      return false;
    }
  }

  // Parses the rule:
  //
  //     pct-encoded = "%" HEXDIG HEXDIG
  //
  // Sets `pctEncodedFound` to true if a valid triplet was found
  pctEncoded(): boolean {
    const start = this.i;
    if (this.take("%") && this.hexdig() && this.hexdig()) {
      this.pctEncodedFound = true;
      return true;
    }
    this.i = start;
    return false;
  }

  // Parses the rule:
  //
  //     unreserved = ALPHA / DIGIT / "-" / "." / "_" / "~"
  unreserved(): boolean {
    return (
      this.alpha() ||
      this.digit() ||
      this.take("-") ||
      this.take("_") ||
      this.take(".") ||
      this.take("~")
    );
  }

  // Parses the rule:
  //
  //     sub-delims  = "!" / "$" / "&" / "'" / "(" / ")"
  //                 / "*" / "+" / "," / ";" / "="
  subDelims(): boolean {
    return (
      this.take("!") ||
      this.take("$") ||
      this.take("&") ||
      this.take("'") ||
      this.take("(") ||
      this.take(")") ||
      this.take("*") ||
      this.take("+") ||
      this.take(",") ||
      this.take(";") ||
      this.take("=")
    );
  }

  // Parses the rule:
  //
  //     ALPHA =  %x41-5A / %x61-7A ; A-Z / a-z
  alpha(): boolean {
    const c = this.str[this.i];
    if (("A" <= c && c <= "Z") || ("a" <= c && c <= "z")) {
      this.i++;
      return true;
    }
    return false;
  }

  // Parses the rule:
  //
  //     DIGIT = %x30-39  ; 0-9
  digit(): boolean {
    const c = this.str[this.i];
    if ("0" <= c && c <= "9") {
      this.i++;
      return true;
    }
    return false;
  }

  // Parses the rule:
  //
  //     HEXDIG =  DIGIT / "A" / "B" / "C" / "D" / "E" / "F"
  hexdig(): boolean {
    const c = this.str[this.i];
    if (
      ("0" <= c && c <= "9") ||
      ("a" <= c && c <= "f") ||
      ("A" <= c && c <= "F") ||
      ("0" <= c && c <= "9")
    ) {
      this.i++;
      return true;
    }
    return false;
  }

  take(char: string): boolean {
    if (this.str[this.i] == char) {
      this.i++;
      return true;
    }
    return false;
  }
}

/**
 * Returns true if the array only contains values that are distinct from each
 * other by strict comparison.
 */
export function unique(list: { getItems(): CelResult[] }): boolean {
  return list.getItems().every((a, index, arr) => {
    if (a instanceof CelUint) {
      for (let i = 0; i < arr.length; i++) {
        if (i == index) {
          continue;
        }
        const b = arr[i];
        if (b instanceof CelUint && b.value === a.value) {
          return false;
        }
      }
      return true;
    }
    if (a instanceof Uint8Array) {
      for (let i = 0; i < arr.length; i++) {
        if (i == index) {
          continue;
        }
        const b = arr[i];
        if (b instanceof Uint8Array && scalarEquals(ScalarType.BYTES, b, a)) {
          return false;
        }
      }
      return true;
    }
    return arr.indexOf(a) === index;
  });
}
