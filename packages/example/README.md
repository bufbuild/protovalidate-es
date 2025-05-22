# protovalidate example

This directory contains an example that uses protovalidate to validate a money
transfer. 

The transfer is defined as a Protobuf message in [money_transfer.proto](./proto/banking/v1/money_transfer.proto). It uses annotations to set up protovalidate rules on the message.

After generating code for the Protobuf message, it can be validated with 
`createValidator()` from `@bufbuild/protovalidate`. [src/index.ts](./src/index.ts)
creates a money transfer, validates it, and prints the results on the terminal.


### Run the example

You need [Node](https://nodejs.org/en/download/) version 20 or later installed. Download the example project
and install its dependencies:

```shell
curl -L https://github.com/bufbuild/protovalidate-es/archive/refs/heads/main.zip > protovalidate-es-main.zip
unzip protovalidate-es-main.zip 'protovalidate-es-main/packages/example/*'

cd protovalidate-es-main/packages/example
npm install
```

Run the example:

```shell
npm start
```

This prints the following result:

> Transfer is valid!

Modify the transfer in [src/index.ts](./src/index.ts) and re-run the example to see different results.


### Generate code

If you want to use the [Buf CLI](https://github.com/bufbuild/buf) to generate the code,
simply run `npx buf generate` in this directory. [`buf.gen.yaml`](./buf.gen.yaml)
contains the plugin configuration.


### Valid types

Protovalidate rules can modify TypeScript types. A message field annotated with protovalidate's [`required` rule](https://buf.build/docs/reference/protovalidate/rules/field_rules/#required) becomes a required property.

See [order.proto](./proto/store/v1/order.proto) and [src/valid-types.ts](./src/valid-types.ts) for an example,
and take a look at the [Valid types](https://github.com/bufbuild/protobuf-es/blob/v2.5.0/MANUAL.md#valid-types)
section in the Protobuf-ES manual.
