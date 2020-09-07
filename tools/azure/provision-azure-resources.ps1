$computerName = $env:COMPUTERNAME
$resourceGroup = "elodin-dev"

az login
az account set --subscription Elodin

# Logging variables
$namespace = "elodintrace"
$kustoDatabaseName = "$computerName-dev"
$dataConnectionName = "$computerName-dev-connection"

# Create logging database (Kusto)
Write-Host "Creating Kusto DB $kustoDatabaseName"
$kustoDb = az kusto database create --resource-group $resourceGroup --cluster-name $namespace --database-name $kustoDatabaseName --read-write-database soft-delete-period="P7D" hot-cache-period="P1D" | ConvertFrom-Json

# TODO: Create Kusto Trace Table
# TODO: Create Trace mapping

# Create logging event hub
Write-Host "Creating Logging Event Hub $computerName"
$eventHubResult = az eventhubs eventhub create --resource-group $resourceGroup --namespace-name $namespace --name $computerName --message-retention 1 | ConvertFrom-Json
$eventHubId = $eventHubResult.id

$authorizationRule = az eventhubs eventhub authorization-rule create --resource-group $resourceGroup --namespace-name $namespace --eventhub-name $computerName --name "admin" --rights Manage Send Listen | ConvertFrom-Json
$authorizationKeys = az eventhubs eventhub authorization-rule keys list --resource-group $resourceGroup --namespace-name $namespace --eventhub-name $computerName --name "admin"
Write-Host "$authorizationKeys" # TODO: Create environment file

# Link event hub to kusto
Write-Host "Linking EventHub $computerName to $kustoDatabaseName"
$dataConnection = az kusto data-connection event-hub create --resource-group $resourceGroup --cluster-name $namespace `
    --database-name $kustoDatabaseName --data-connection-name $dataConnectionName `
    --table-name Trace --consumer-group '$Default' --event-hub-resource-id $eventHubId --mapping-rule-name "TraceMapping" --data-format JSON | ConvertFrom-Json