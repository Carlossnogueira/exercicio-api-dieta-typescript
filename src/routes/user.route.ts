import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knex } from '../database'

export async function userRoutes(app: FastifyInstance) {

    // register route
    app.post('/', async (request, reply) => {

        const userRegisterSchema = z.object({
            name: z.string(),
            email: z.string().email(),
        })

        let sessionId = request.cookies.sessionId
        if(!sessionId){
            sessionId = crypto.randomUUID()
            reply.setCookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7, // 7 days
            })
        }

        const { name, email } = userRegisterSchema.parse(request.body)
        
        await knex('users').insert({
            id: crypto.randomUUID(),
            name,
            email,
            session_id: sessionId
        })
        
        reply.status(201).send({message: 'User registered successfully'})

    })

    // login route
    app.post('/login', async (request,reply) =>{

        const userLoginSchema = z.object({
            id: z.string(),
            name: z.string(),
            email: z.string().email(),
        })

        const { id, name, email } = userLoginSchema.parse(request.body)

        const user = await knex('users').where({ id }).first()

        if(!user){
            return reply.status(404).send({message: 'User not found'})
        }

        reply.setCookie('sessionId', user.session_id, {
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        })

        reply.status(200).send({message: 'User logged in successfully'})
    })

    // logout route
    app.get('/logout', async (request,reply) =>{

        if(!request.cookies.sessionId){
            return reply.status(401).send({message: 'User not logged in'})
        }

        reply.clearCookie('sessionId', {path: '/'})
        reply.status(200).send({message: 'User logged out successfully'})
    })

}