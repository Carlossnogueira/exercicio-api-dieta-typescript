import fastify from 'fastify'
import { env } from './env'

console.log(env.DATABASE_URL, env.PORT, env.NODE_ENV)


const app = fastify()

app.get('/', () => {
    return 'Hello World'
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('HTTP server running on http://localhost:' + env.PORT)
})

