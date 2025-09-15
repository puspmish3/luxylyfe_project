targetScope = 'subscription'

@minLength(1)
@maxLength(64)
@description('Name of the environment that can be used as part of naming resource convention')
param environmentName string

@minLength(1)
@description('Primary location for all resources')
param location string

@description('Id of the user or app to assign application roles')
param principalId string = ''

// Optional parameters to override the default azd resource naming conventions.
// Add the following to main.parameters.json to provide values:
// "resourceGroupName": {
//      "value": "myGroupName"
// }
param resourceGroupName string = ''
param appServicePlanName string = ''
param appServiceName string = ''

@description('Cosmos DB account name')
param cosmosAccountName string = ''

@description('Cosmos DB database name')
param cosmosDatabaseName string = 'luxylyfe'

@secure()
@description('JWT Secret for authentication')
param jwtSecret string

@secure()
@description('NextAuth Secret')
param nextAuthSecret string

var abbrs = loadJsonContent('./abbreviations.json')
var resourceToken = toLower(uniqueString(subscription().id, environmentName, location))
var tags = { 'azd-env-name': environmentName }

// Organize resources in a resource group
resource rg 'Microsoft.Resources/resourceGroups@2021-04-01' = {
  name: !empty(resourceGroupName) ? resourceGroupName : '${abbrs.resourcesResourceGroups}${environmentName}'
  location: location
  tags: tags
}

// The application frontend
module web './app/web.bicep' = {
  name: 'web'
  scope: rg
  params: {
    name: !empty(appServiceName) ? appServiceName : '${abbrs.webSitesAppService}web-${resourceToken}'
    location: location
    tags: tags
    appServicePlanId: appServicePlan.outputs.id
    appSettings: {
      JWT_SECRET: jwtSecret
      NEXTAUTH_SECRET: nextAuthSecret
      NEXTAUTH_URL: 'https://${!empty(appServiceName) ? appServiceName : '${abbrs.webSitesAppService}web-${resourceToken}'}.azurewebsites.net'
      DATABASE_MODE: 'cosmos_primary'
      COSMOS_DB_ENDPOINT: cosmos.outputs.endpoint
      COSMOS_DB_KEY: cosmos.outputs.primaryKey
      COSMOS_DB_DATABASE_NAME: cosmosDatabaseName
    }
  }
}

// Create an App Service Plan to group applications under the same payment plan and SKU
module appServicePlan './core/host/appserviceplan.bicep' = {
  name: 'appserviceplan'
  scope: rg
  params: {
    name: !empty(appServicePlanName) ? appServicePlanName : '${abbrs.webServerFarms}${resourceToken}'
    location: location
    tags: tags
    sku: {
      name: 'B1'
      capacity: 1
    }
  }
}

// Cosmos DB account (only if not provided)
module cosmos './core/database/cosmos/sql/cosmos-sql-account.bicep' = if (empty(cosmosAccountName)) {
  name: 'cosmos'
  scope: rg
  params: {
    name: '${abbrs.documentDBDatabaseAccounts}${resourceToken}'
    location: location
    tags: tags
    databaseName: cosmosDatabaseName
  }
}

// Use existing Cosmos DB if provided
resource existingCosmos 'Microsoft.DocumentDB/databaseAccounts@2022-08-15' existing = if (!empty(cosmosAccountName)) {
  name: cosmosAccountName
  scope: rg
}

// Outputs
output AZURE_LOCATION string = location
output AZURE_TENANT_ID string = tenant().tenantId
output WEB_URI string = web.outputs.uri
output COSMOS_ENDPOINT string = empty(cosmosAccountName) ? cosmos.outputs.endpoint : existingCosmos.properties.documentEndpoint