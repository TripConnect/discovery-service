const grpc = require('@grpc/grpc-js');
import request from "sync-request";

export async function discover(call: any, callback: any) {
    try {
        let configHost = process.env.NODE_ENV === "local" ? "localhost" : "config-service";
        let { serviceName } = call.request;

        let resp = request("GET", `http://${configHost}:31070/configs/${serviceName}`);
        if (resp.isError()) {
            throw new Error("Cannot load the configurations for " + serviceName);
        }
        let configs = JSON.parse(resp.getBody("utf-8")).data;

        callback(null, {
            host: process.env.NODE_ENV === "local" ? "localhost" : serviceName,
            port: configs.server.port,
        });
    } catch (error: any) {
        callback({
            code: grpc.status.NOT_FOUND,
            message: 'Authorization failed'
        });
    }
}
