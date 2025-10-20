import { randomBytes } from 'crypto'

export interface User {
  _id?: any
  email: string
  password: string
  createdAt?: Date
  updatedAt?: Date
}

export class UserModel {
  static async create(user: Omit<User, '_id' | 'createdAt' | 'updatedAt'>) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    
    const newUser = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await MongoDBService.getCollection('users').insertOne(newUser)
    return { _id: result.insertedId, ...newUser }
  }

  static async findByEmail(email: string) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    const collection = MongoDBService.getCollection('users')
    return collection.findOne({ email })
  }

  static async findById(id: string) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    const collection = MongoDBService.getCollection('users')
    const { ObjectId } = await import('mongodb')
    
    try {
      return await collection.findOne({ 
        _id: new ObjectId(id)
      })
    } catch (error) {
      return null
    }
  }

  static async generateToken(userId: string) {
    const randomString = randomBytes(32).toString('hex')
    return `token_${randomString}_${userId}`
  }

  static async verifyToken(token: string) {
    if (!token.startsWith('token_')) {
      return null
    }

    const parts = token.split('_')
    if (parts.length !== 3) {
      return null
    }

    const userId = parts[2]
    
    try {
      const user = await this.findById(userId)
      return user
    } catch (error) {
      return null
    }
  }
}