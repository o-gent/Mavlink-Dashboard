# Mavlink to InfluxDB

Some code to convert mavlink packets to influxDB datapoints!

## Useage

Docker build . -t mavlink2influx

docker run --rm mavlink2influx --mavlink_address='host.docker.internal' --mavlink_port=5763 --influxdb_string='http://host.docker.internal:8086' --influxdb_token=$env:INFLUXDB_TOKEN

ts-node ./mav.ts  --mavlink_address='host.docker.internal' --mavlink_port=5763 --influxdb_string='http://host.docker.internal:8086' --influxdb_token=$env:INFLUXDB_TOKEN