import router from '@adonisjs/core/services/router'

async function initializeMongoDB() {
  try {
    const MongoDBService = (await import('../app/Services/MongoDBService.js')).default
    await MongoDBService.connect()
    console.log('✅ MongoDB initialized in routes')
  } catch (error) {
    console.error('❌ MongoDB initialization failed:', error)
  }
}

initializeMongoDB()

router.get('/', async () => {
  return {
    message: 'Assignment Management API is running!',
    endpoints: {
      auth: {
        register: 'POST /register',
        login: 'POST /login'
      },
      assignments: {
        list: 'GET /assignments',
        create: 'POST /assignments',
        get: 'GET /assignments/:id',
        update: 'PUT/PATCH /assignments/:id',
        delete: 'DELETE /assignments/:id'
      }
    }
  }
})

router.post('/register', async (ctx) => {
  const AuthController = (await import('../app/Controllers/Http/AuthController.js')).default
  return new AuthController().register(ctx)
})

router.post('/login', async (ctx) => {
  const AuthController = (await import('../app/Controllers/Http/AuthController.js')).default
  return new AuthController().login(ctx)
})

router.get('/assignments', async (ctx) => {
  const AssignmentsController = (await import('../app/Controllers/Http/AssignmentsController.js')).default
  return new AssignmentsController().index(ctx)
})

router.post('/assignments', async (ctx) => {
  const AssignmentsController = (await import('../app/Controllers/Http/AssignmentsController.js')).default
  return new AssignmentsController().store(ctx)
})

router.get('/assignments/:id', async (ctx) => {
  const AssignmentsController = (await import('../app/Controllers/Http/AssignmentsController.js')).default
  return new AssignmentsController().show(ctx)
})

router.put('/assignments/:id', async (ctx) => {
  const AssignmentsController = (await import('../app/Controllers/Http/AssignmentsController.js')).default
  return new AssignmentsController().update(ctx)
})

router.patch('/assignments/:id', async (ctx) => {
  const AssignmentsController = (await import('../app/Controllers/Http/AssignmentsController.js')).default
  return new AssignmentsController().update(ctx)
})

router.delete('/assignments/:id', async (ctx) => {
  const AssignmentsController = (await import('../app/Controllers/Http/AssignmentsController.js')).default
  return new AssignmentsController().destroy(ctx)
})