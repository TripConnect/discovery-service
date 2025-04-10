const grpc = require('@grpc/grpc-js');
import { sendUnaryData, ServerUnaryCall } from "@grpc/grpc-js";
import request from "sync-request";
import { DiscoveryRequest, ServiceInstance } from 'common-utils/protos/defs/discovery_service_pb';

export async function discover(
    call: ServerUnaryCall<DiscoveryRequest.AsObject, ServiceInstance.AsObject>,
    callback: sendUnaryData<ServiceInstance.AsObject>) {
    try {
        let configHost = process.env.NODE_ENV === "local" ? "localhost" : "config-service";

        let { serviceName } = call.request;

        let resp = request("GET", `http://${configHost}:31070/configs/${serviceName}`);
        if (resp.isError()) {
            throw new Error("Cannot load the configurations for " + serviceName);
        }
        let configs = JSON.parse(resp.getBody("utf-8")).data;

        let serviceInstance = new ServiceInstance()
            .setHost(process.env.NODE_ENV === "local" ? "localhost" : serviceName)
            .setPort(configs.server.port);
        callback(null, serviceInstance.toObject());
    } catch (error: any) {
        console.log(error);
        callback({
            code: grpc.status.NOT_FOUND,
            message: "Service not found"
        });
    }
}
