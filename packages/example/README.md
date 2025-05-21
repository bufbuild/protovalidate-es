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
