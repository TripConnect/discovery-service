const grpc = require('@grpc/grpc-js');
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import request from "sync-request";
import { backendDefinition } from 'common-utils';

export async function discover(
    call: ServerUnaryCall<backendDefinition.discovery_service.DiscoveryRequest, backendDefinition.discovery_service.ServiceInstance>,
    callback: sendUnaryData<backendDefinition.discovery_service.ServiceInstance>) {
    try {
        let configHost = process.env.NODE_ENV === "local" ? "localhost" : "config-service";
        let { serviceName } = call.request;

        let resp = request("GET", `http://${configHost}:31070/configs/${serviceName}`);
        if (resp.isError()) {
            throw new Error("Cannot load the configurations for " + serviceName);
        }
        let configs = JSON.parse(resp.getBody("utf-8")).data;

        callback(null, new backendDefinition.discovery_service.ServiceInstance({
            host: process.env.NODE_ENV === "local" ? "localhost" : serviceName,
            port: configs.server.port,
        }));
    } catch (error: any) {
        callback({
            code: grpc.status.NOT_FOUND,
            message: "Service not found"
        });
    }
}
