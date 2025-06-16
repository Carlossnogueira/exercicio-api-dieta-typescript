import fastify from 'fastify'
import { env } from './env'
import { knex } from './database'

const app = fastify()

app.get('/', async () => {
    const test = await knex('sqlite_schema').select('*')
    return test
})

app.listen({
    port: env.PORT,
}).then(() => {
    console.log('HTTP server running on http://localhost:' + env.PORT)
})

