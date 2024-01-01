import { MavLinkPacketSplitter, MavLinkPacketParser, int64_t } from 'node-mavlink'
import { connect } from 'net'
import {
    MavLinkPacketRegistry,
    minimal, common, ardupilotmega
} from 'node-mavlink'
import { InfluxDB, Point, ClientOptions } from '@influxdata/influxdb-client'

import { parse } from 'ts-command-line-args';

interface ICopyFilesArguments {
    mavlink_address: string;
    mavlink_port: number;
    influxdb_string: string;
    influxdb_token: string;
}

// args typed as ICopyFilesArguments
export const args = parse<ICopyFilesArguments>({
    mavlink_address: String,
    mavlink_port: Number,
    influxdb_string: String,
    influxdb_token: String,
});

// substitute /dev/ttyACM0 with your serial port!
let port = connect({ host: args['mavlink_address'], port: args['mavlink_port'] })

// constructing a reader that will emit each packet separately
const reader = port
    .pipe(new MavLinkPacketSplitter())
    .pipe(new MavLinkPacketParser())

// create a registry of mappings between a message id and a data class
const REGISTRY: MavLinkPacketRegistry = {
    ...minimal.REGISTRY,
    ...common.REGISTRY,
    ...ardupilotmega.REGISTRY,
}

const influx_connect: ClientOptions = {
    url: args["influxdb_string"],
    token: args["influxdb_token"]
}

const influxDB = new InfluxDB(influx_connect)
const writeApi = influxDB.getWriteApi("Earth Keeper", "mavlink2")

reader.on('data', packet => {
    const clazz = REGISTRY[packet.header.msgid]
    if (clazz) {
        const data = packet.protocol.data(packet.payload, clazz)
        //console.log('Received packet:', data)
        try {
            var point = new Point(clazz.name)
                .tag('AC', '1');
            Object.keys(data).forEach(element => {
                point.floatField(element, data[element]);
            });
            writeApi.writePoint(point);
            writeApi.flush();
        } catch (error) {
            console.error(`Error processing data:`, error);
        }
    }
})
