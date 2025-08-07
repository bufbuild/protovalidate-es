# Protovalidate examples

This package contains examples for using `@bufbuild/protovalidate`.

### Requirements

You need [Node.js](https://nodejs.org/en/download/) version 20 or later installed. Download the example project
and install its dependencies:

```shell
curl -L https://github.com/bufbuild/protovalidate-es/archive/refs/heads/main.zip > protovalidate-es-main.zip
unzip protovalidate-es-main.zip 'protovalidate-es-main/packages/example/*'

cd protovalidate-es-main/packages/example
npm install
```

### Basic example

This example shows basic usage. We're validating a money transfer, defined as a Protobuf message in [money_transfer.proto](./proto/banking/v1/money_transfer.proto).

Run the example:

```shell
npm start
```

This prints the following result:

> Transfer is valid!

Modify the transfer in [src/basic.ts](./src/index.ts) and re-run the example to see different results.


### Valid types

Protovalidate rules can modify TypeScript types. A message field annotated with Protovalidate's [`required` rule](https://protovalidate.com/reference/rules/field_rules/#required) becomes a required property.

See [order.proto](./proto/store/v1/order.proto) and [src/valid-types.ts](./src/valid-types.ts) for an example,
and take a look at the [Valid types](https://github.com/bufbuild/protobuf-es/blob/v2.6.1/MANUAL.md#valid-types)
section in the Protobuf-ES manual.


### Standard Schema v1

Protovalidate-ES supports [Standard Schema v1](https://github.com/standard-schema/standard-schema). See [src/standard-schema](./src/standard-schema.ts) for an example.


### Generate code

If you modify the rules of one of the Protobuf messages, make sure to re-generate the code. 

With the [Buf CLI](https://github.com/bufbuild/buf), simply run `npx buf generate` in this directory. [`buf.gen.yaml`](./buf.gen.yaml)
contains the plugin configuration.

