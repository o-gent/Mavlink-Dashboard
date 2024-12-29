# Mavlink Grafana Telemetry Dashboard

This project links together a few tools to diplay live mavlink data in Grafana which is an enterprise data visualisation tool. Grafana allows extremely flexible data display & transformations, rapidly! 

How it works:
- mavlink2influx module reads in MAVLINK data and converts it to an influxDB submission
- InfluxDB stores the data in a database
- Grafana reads in the data from InfluxDB

Although this is slighly resource intensive, it is extremely flexible and leverages powerful industry standard tools.


## Useage

1. Installer docker

2. Set Mavlink settings in mavlink2influx/dockerfile (MAVLINK_ADDRESS & MAVLINK_PORT)

3. Run compose
```
docker compose up
```

4. Open "localhost:3000"
