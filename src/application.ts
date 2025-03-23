const grpc = require('@grpc/grpc-js');
import { backendProto, ConfigHelper } from 'common-utils';

import * as rpcImplementations from 'rpc';

ConfigHelper.load();

function start() {
    const PORT = ConfigHelper.read("server.port");

    const server = new grpc.Server();
    server.addService(backendProto.discovery_service.DiscoveryService.service, rpcImplementations);
    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err: any, port: any) => {
        if (err != null) {
            return console.error(err);
        }
        console.info(`gRPC listening on ${port}`);
    });
}

start();
