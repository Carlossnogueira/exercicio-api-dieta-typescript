import fastify from 'fastify'
import { env } from './env'
import { userRoutes } from './routes/user.route'
import cookie from '@fastify/cookie'
import { mealRoutes } from './routes/meals.route'


const app = fastify()

app.register(cookie)

app.register(userRoutes,{
    prefix: '/user'
})

app.register(mealRoutes,{
    prefix: '/meal'
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('HTTP server running on http://localhost:' + env.PORT)
})

