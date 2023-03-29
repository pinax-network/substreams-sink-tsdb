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

    constructor(options: {username?: string, password?: string, address?: string, port?: number}) {
        if ( options.username ) this.username = options.username;
        if ( options.password ) this.password = options.password;
        if ( options.address ) this.address = options.address;
        if ( options.port ) this.port = options.port;
    }

    // TO-DO
    async connect() {
        this.connection = true;
    }

    // TO-DO
    async push(message: any) {
        console.log(message);
    }
}
