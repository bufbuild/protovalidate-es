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

import { compileFile } from "@bufbuild/protocompile";
import {
  createRegistry,
  type DescMessage,
  type Registry,
} from "@bufbuild/protobuf";
import type { Path } from "@bufbuild/protobuf/reflect";

export function getTestDataForPaths(): {
  schema: DescMessage;
  string: string;
  goldenString: string;
  golden: Path;
  registry?: Registry;
}[] {
  const file = compileFile(`
    syntax="proto2";
    message User {
      optional string first_name = 1;
      optional User manager = 4;
      repeated string locations = 5;
      map<string, string> projects = 6;
      oneof scalar {
        int32 value = 11;
      }
      repeated User peers = 12;
      extensions 1000;
    }
    extend User {
      optional bool foo = 1000;
    }
  `);
  const registry = createRegistry(file);
  const schema = file.messages[0];
  const ext = file.extensions[0];
  return [
    {
      schema,
      string: "scalar",
      goldenString: "scalar",
      golden: [schema.oneofs[0]],
    },
    {
      schema,
      string: "first_name",
      goldenString: "first_name",
      golden: [schema.field.firstName],
    },
    {
      schema,
      string: "[ foo ]",
      goldenString: "[foo]",
      golden: [ext],
      registry,
    },
    {
      schema,
      string: "manager[foo]",
      goldenString: "manager[foo]",
      golden: [schema.field.manager, ext],
      registry,
    },
    {
      schema,
      string: "locations[ 0]",
      goldenString: "locations[0]",
      golden: [schema.field.locations, { kind: "list_sub", index: 0 }],
    },
    {
      schema,
      string: `projects["abc" ]`,
      goldenString: `projects["abc"]`,
      golden: [schema.field.projects, { kind: "map_sub", key: "abc" }],
    },
    {
      schema,
      string: `projects["a\\"bc"]`,
      goldenString: `projects["a\\"bc"]`,
      golden: [schema.field.projects, { kind: "map_sub", key: `a"bc` }],
    },
    {
      schema,
      string: `projects[""]`,
      goldenString: `projects[""]`,
      golden: [schema.field.projects, { kind: "map_sub", key: "" }],
    },
    {
      schema,
      string: `peers`,
      goldenString: `peers`,
      golden: [schema.field.peers],
    },
    {
      schema,
      string: `peers[77].first_name`,
      goldenString: `peers[77].first_name`,
      golden: [
        schema.field.peers,
        { kind: "list_sub", index: 77 },
        schema.field.firstName,
      ],
    },
  ];
}
