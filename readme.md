Support Software: RTL_433: https://github.com/merbanan/rtl_433/releases#release-25.12
AVOID msvc. Application made IN Windows format, long term planning for Linux

1. Set up a bin folder at the top application level.
2. Place the rtl_433 application folder in bin
3. Create a file named ingest.ps1 in bin and add the following code:
------
# Simple log rotator
$targetFile = "$PSScriptRoot\public\sensor_data.json"

# If file doesn't exist yet, create an empty one to prevent errors
if (!(Test-Path $targetFile)) {
    New-Item -ItemType File -Path $targetFile -Force | Out-Null
}

# If file exceeds 1MB, move it to an archive and start fresh
if ((Get-Item $targetFile).Length -gt 1MB) {
    Move-Item $targetFile ("$targetFile." + (Get-Date -Format "yyyyMMddHHmmss") + ".log")
}

# Pipe the radio data
& "$PSCriptRoot\bin\rtl_433-win-x64-25.12\rtl_433.exe" -F json -f 915M | Out-File -FilePath $targetFile -Append
------

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