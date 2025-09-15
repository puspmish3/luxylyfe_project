import crypto from 'crypto'

// Generate secure secrets for Azure deployment
console.log('🔐 Generating secure secrets for Azure deployment...\n')

const jwtSecret = crypto.randomBytes(32).toString('hex')
const nextAuthSecret = crypto.randomBytes(32).toString('hex')

console.log('Add these to your Azure App Service Configuration:')
console.log('=' .repeat(60))
console.log(`JWT_SECRET=${jwtSecret}`)
console.log(`NEXTAUTH_SECRET=${nextAuthSecret}`)
console.log('=' .repeat(60))

console.log('\n📝 Additional environment variables needed:')
console.log('COSMOS_DB_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/')
console.log('COSMOS_DB_KEY=your-cosmos-primary-key')
console.log('COSMOS_DB_DATABASE_NAME=luxylyfe')
console.log('DATABASE_MODE=cosmos_primary')
console.log('NEXTAUTH_URL=https://your-app-name.azurewebsites.net')

console.log('\n✅ Copy these values and add them to your Azure App Service Configuration.')
console.log('💡 Keep these secrets secure and never commit them to source control.')