import { MongoClient, Db } from 'mongodb'

class MongoDBService {
  private client: MongoClient | null = null
  private db: Db | null = null
  private isConnected = false

  async connect() {
    if (this.isConnected) {
      return this.db
    }

    try {
      const uri = process.env.MONGODB_URI
      if (!uri) {
        throw new Error('MONGODB_URI is not defined in .env file')
      }

      this.client = new MongoClient(uri)
      await this.client.connect()
      this.db = this.client.db()
      this.isConnected = true
      
      console.log('✅ Connected to MongoDB Atlas successfully')
      return this.db
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB Atlas:', error)
      throw error
    }
  }

  getDatabase(): Db {
    if (!this.db || !this.isConnected) {
      throw new Error('Database not initialized. Call connect() first.')
    }
    return this.db
  }

  getCollection(collectionName: string) {
    return this.getDatabase().collection(collectionName)
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      this.isConnected = false
      console.log('✅ Disconnected from MongoDB Atlas')
    }
  }
}

export default new MongoDBService()