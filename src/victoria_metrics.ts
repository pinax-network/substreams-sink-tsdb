import { PrometheusOperations, Clock } from "substreams";
import {
    DEFAULT_USERNAME,
    DEFAULT_PASSWORD,
    DEFAULT_ADDRESS,
    DEFAULT_PORT,
    DEFAULT_SCRAPE_INTERVAL,
} from "../index";
//import { register } from "./server";
//import { logger } from "../index";
import { handleOperation, fetchMetrics } from "./prom";

export class VictoriaMetrics {
    private readonly username: string = DEFAULT_USERNAME;
    private readonly password: string = DEFAULT_PASSWORD;
    private readonly address: string = DEFAULT_ADDRESS;
    private readonly port: number = DEFAULT_PORT;
    private readonly scrapeInterval = DEFAULT_SCRAPE_INTERVAL;

    private connection?: any;
    private nextPush = 0;
    private pushUrl: string

    constructor(username?: string, password?: string, address?: string, port?: number, scapeInterval?: number) {
        if ( username ) this.username = username;
        if ( password ) this.password = password;
        if ( address ) this.address = address;
        if ( port ) this.port = port;
        if ( scapeInterval ) this.scrapeInterval = this.scrapeInterval;
        this.pushUrl = `http://${address}:${port}/api/v1/import/prometheus`
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
        console.log("******", message, headers);
        const epoch = headers.clock.timestamp? Number(headers.clock.timestamp?.seconds) : 0
        for(let i=0; i<message.operations.length; i++){
            let op = message.operations[i]
         //  console.log(op)
            handleOperation(op)
        }
                
        if (epoch >= this.nextPush) {
            const data = await fetchMetrics(epoch)
            console.log(data)
            await fetch(this.pushUrl, {
                method: 'POST', 
                body: data
            });
            this.nextPush = epoch + this.scrapeInterval
        }
    }
}

