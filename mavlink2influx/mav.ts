import { MavLinkPacketSplitter, MavLinkPacketParser, int64_t } from 'node-mavlink'
import { connect } from 'net'
import {
    MavLinkPacketRegistry,
    minimal, common, ardupilotmega
} from 'node-mavlink'
import { InfluxDB, Point, ClientOptions, WriteOptions, WriteApi} from '@influxdata/influxdb-client'

const mavlinkAddress = String(process.env.MAVLINK_ADDRESS); 
const mavlinkPort = Number(process.env.MAVLINK_PORT);
const influxdbString = String(process.env.INFLUXDB_STRING); 
const influxdbToken = String(process.env.INFLUXDB_TOKEN);

// substitute /dev/ttyACM0 with your serial port!
let port = connect({ host: mavlinkAddress, port: mavlinkPort})

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
    url: influxdbString,
    token: influxdbToken
}

const influxDB = new InfluxDB(influx_connect)

const writeOptions: WriteOptions = {
    batchSize: 500,
    flushInterval: 200,
    maxBatchBytes: 100000,
    writeFailed: function (this: WriteApi, error: Error, lines: Array<string>, attempt: number, expires: number): Promise<void> | void {
        // throw new Error('Function not implemented.');
    },
    writeSuccess: function (this: WriteApi, lines: Array<string>): void {
        // throw new Error('Function not implemented.');
    },
    writeRetrySkipped: function (entry: { lines: Array<string>; expires: number; }): void {
        // throw new Error('Function not implemented.');
    },
    maxRetries: 0,
    maxRetryTime: 100,
    maxBufferLines: 0,
    retryJitter: 0,
    minRetryDelay: 10,
    maxRetryDelay: 100,
    exponentialBase: 0,
    randomRetry: false
}

const writeApi = influxDB.getWriteApi("uav", "default", "ms", writeOptions)

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
        } catch (error) {
            console.error(`Error processing data:`, error);
        }
    }
})
