import request from "sync-request";

export async function discover(call: any, callback: any) {
    let { serviceName } = call.request;
    let configHost = process.env.NODE_ENV === "local" ? "localhost" : "config-service";
    let configUrl = `http://${configHost}:31070/configs/${serviceName}`;
    let resp = request("GET", configUrl);
    if (resp.isError()) {
        throw new Error("Cannot load the configurations for " + serviceName);
    }
    let configs = JSON.parse(resp.getBody("utf-8")).data;

    return {
        host: configs.server.host,
        port: configs.server.port,
    }
}
