import { Clock, PrometheusOperations } from "substreams";
import {
    DEFAULT_USERNAME,
    DEFAULT_PASSWORD,
    DEFAULT_ADDRESS,
    DEFAULT_PORT,
} from "../index";

export class VictoriaMetrics {
    private readonly username: string = DEFAULT_USERNAME;
    private readonly password: string = DEFAULT_PASSWORD;
    private readonly address: string = DEFAULT_ADDRESS;
    private readonly port: number = DEFAULT_PORT;

    private connection?: any;

    constructor(username?: string, password?: string, address?: string, port?: number) {
        if ( username ) this.username = username;
        if ( password ) this.password = password;
        if ( address ) this.address = address;
        if ( port ) this.port = port;
    }

    // TO-DO
    async connect() {
        this.connection = true;
    }

    // TO-DO
    async init() {
        console.log("TO-DO");
    }

    // TO-DO
    async sendToQueue(message: PrometheusOperations, headers: { hash: string, typeName: string, clock: Clock}) {
        console.log(message, headers);
    }
}
