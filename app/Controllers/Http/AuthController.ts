import hash from '@adonisjs/core/services/hash'

export default class AuthController {
  async register({ request, response }: any) {
    try {
      const { email, password } = request.only(['email', 'password'])
      
      const UserModel = (await import('../../Models/User.js')).UserModel
      const existingUser = await UserModel.findByEmail(email)
      
      if (existingUser) {
        return response.conflict({ message: 'User already exists' })
      }

      const hashedPassword = await hash.make(password)
      const user = await UserModel.create({
        email,
        password: hashedPassword
      })

      return response.created({
        message: 'User registered successfully',
        user: { id: user._id.toString(), email: user.email }
      })
    } catch (error) {
      console.error('Registration error:', error)
      return response.internalServerError({ 
        message: 'Registration failed' 
      })
    }
  }

  async login({ request, response }: any) {
    try {
      const { email, password } = request.only(['email', 'password'])
   
      const UserModel = (await import('../../Models/User.js')).UserModel
      const user = await UserModel.findByEmail(email)
      
      if (!user) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }

      const passwordValid = await hash.verify(user.password, password)
      if (!passwordValid) {
        return response.unauthorized({ message: 'Invalid credentials' })
      }

      const token = await UserModel.generateToken(user._id.toString())

      return response.ok({
        type: 'bearer',
        token: token,
        user: { 
          id: user._id.toString(), 
          email: user.email 
        }
      })
    } catch (error) {
      console.error('Login error:', error)
      return response.internalServerError({ 
        message: 'Login failed' 
      })
    }
  }
}