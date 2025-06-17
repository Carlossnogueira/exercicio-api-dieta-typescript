import fastify from 'fastify'
import { env } from './env'
import { userRoutes } from './routes/user.routes'
import cookie from '@fastify/cookie'


const app = fastify()

app.register(cookie)

app.register(userRoutes,{
    prefix: '/user'
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('HTTP server running on http://localhost:' + env.PORT)
})

