export interface Assignment {
  _id?: any
  title: string
  description?: string
  dueDate?: Date
  isCompleted: boolean
  userId: string
  createdAt?: Date
  updatedAt?: Date
}

export class AssignmentModel {
  static async create(assignment: Omit<Assignment, '_id' | 'createdAt' | 'updatedAt'>) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    
    const newAssignment = {
      ...assignment,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await MongoDBService.getCollection('assignments').insertOne(newAssignment)
    return { _id: result.insertedId, ...newAssignment }
  }

  static async findByUserId(userId: string) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    const collection = MongoDBService.getCollection('assignments')
    return collection.find({ userId }).sort({ createdAt: -1 }).toArray()
  }

  static async findByIdAndUser(id: string, userId: string) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    const collection = MongoDBService.getCollection('assignments')
    const { ObjectId } = await import('mongodb')
    
    try {
      return await collection.findOne({ 
        _id: new ObjectId(id), 
        userId 
      })
    } catch (error) {
      return null
    }
  }

  static async updateById(id: string, userId: string, updates: Partial<Assignment>) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    const collection = MongoDBService.getCollection('assignments')
    const { ObjectId } = await import('mongodb')
    
    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(id), userId },
        { 
          $set: { 
            ...updates, 
            updatedAt: new Date() 
          } 
        },
        { returnDocument: 'after' }
      )
      
      return result
    } catch (error) {
      return null
    }
  }

  static async deleteById(id: string, userId: string) {
    const MongoDBService = (await import('../Services/MongoDBService.js')).default
    const collection = MongoDBService.getCollection('assignments')
    const { ObjectId } = await import('mongodb')
    
    try {
      return await collection.deleteOne({ 
        _id: new ObjectId(id), 
        userId 
      })
    } catch (error) {
      return { deletedCount: 0 }
    }
  }
}