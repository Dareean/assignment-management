export default class AssignmentsController {
  private async authenticate(request: any) {
    const token = request.header('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      throw new Error('No token provided')
    }

    if (!token.startsWith('token_')) {
      throw new Error('Invalid token format')
    }

    const parts = token.split('_')
    if (parts.length !== 3) {
      throw new Error('Invalid token')
    }

    const userId = parts[2]

    const UserModel = (await import('../../Models/User.js')).UserModel
    const user = await UserModel.findById(userId)

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }

  async index({ request, response }: any) {
    try {
      const user = await this.authenticate(request)
      const AssignmentModel = (await import('../../Models/Assignment.js')).AssignmentModel
      const assignments = await AssignmentModel.findByUserId(user._id.toString())
      return response.ok(assignments)
    } catch (error: any) {
      return response.unauthorized({ message: error.message })
    }
  }

  async store({ request, response }: any) {
    try {
      const user = await this.authenticate(request)
      const payload = request.only(['title', 'description', 'dueDate'])
      
      const AssignmentModel = (await import('../../Models/Assignment.js')).AssignmentModel
      const assignment = await AssignmentModel.create({
        ...payload,
        isCompleted: false,
        userId: user._id.toString()
      })
      
      return response.created(assignment)
    } catch (error: any) {
      return response.unauthorized({ message: error.message })
    }
  }

  async show({ request, params, response }: any) {
    try {
      const user = await this.authenticate(request)
      const AssignmentModel = (await import('../../Models/Assignment.js')).AssignmentModel
      const assignment = await AssignmentModel.findByIdAndUser(params.id, user._id.toString())
      
      if (!assignment) {
        return response.notFound({ message: 'Assignment not found' })
      }
      
      return response.ok(assignment)
    } catch (error: any) {
      return response.unauthorized({ message: error.message })
    }
  }

  async update({ request, params, response }: any) {
    try {
      const user = await this.authenticate(request)
      const payload = request.only(['title', 'description', 'dueDate', 'isCompleted'])
      
      const AssignmentModel = (await import('../../Models/Assignment.js')).AssignmentModel
      const result = await AssignmentModel.updateById(params.id, user._id.toString(), payload)
      
      if (!result) {
        return response.notFound({ message: 'Assignment not found' })
      }
      
      return response.ok(result)
    } catch (error: any) {
      return response.unauthorized({ message: error.message })
    }
  }

  async destroy({ request, params, response }: any) {
    try {
      const user = await this.authenticate(request)
      const AssignmentModel = (await import('../../Models/Assignment.js')).AssignmentModel
      const result = await AssignmentModel.deleteById(params.id, user._id.toString())
      
      if (result.deletedCount === 0) {
        return response.notFound({ message: 'Assignment not found' })
      }
      
      return response.noContent()
    } catch (error: any) {
      return response.unauthorized({ message: error.message })
    }
  }
}