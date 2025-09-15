param name string
param location string = resourceGroup().location
param tags object = {}
param appServicePlanId string
param appSettings object = {}

resource web 'Microsoft.Web/sites@2022-03-01' = {
  name: name
  location: location
  tags: union(tags, { 'azd-service-name': 'web' })
  properties: {
    serverFarmId: appServicePlanId
    siteConfig: {
      linuxFxVersion: 'NODE|18-lts'
      alwaysOn: true
      ftpsState: 'FtpsOnly'
      minTlsVersion: '1.2'
      appSettings: [for key in items(appSettings): {
        name: key.key
        value: key.value
      }]
      nodeVersion: '18-lts'
    }
    httpsOnly: true
  }
}

output id string = web.id
output name string = web.name
output uri string = 'https://${web.properties.defaultHostName}'