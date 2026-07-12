Support Software: RTL_433: https://github.com/merbanan/rtl_433/releases#release-25.12
AVOID msvc. Application made IN Windows format, long term planning for Linux

Local Telemetry Ingestion
To initialize the live data feed from the Vevor-7in1 weather station: Open PowerShell in rtl_433 binary directory.

Execute the ingestion stream:
.\rtl_433.exe -F json -f 915M | Out-File -FilePath "..\public\sensor_data.json" -Append

Verify: Ensure the public/sensor_data.json file is being populated in  the VANE project directory.

Application: The useSensorData hook will automatically ingest this JSON stream and map it to the Core Dashboard components.

Command Startup Commands:
Frontend: npm run dev
Backend: PENDING

Deploy Process:
1. open console from /bin
2. enter .\ingest.ps1
3. open 2nd console from src
4. enter npm run dev