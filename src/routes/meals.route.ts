import { FastifyInstance } from "fastify"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from "crypto"

export async function mealRoutes(app: FastifyInstance) {
    // create meal route
    app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies;

        const mealValidationSchema = z.object({
            name: z.string(),
            description: z.string(),
            isOnDiet: z.boolean(),
            date: z.coerce.date(),
        });

        const [userId] = await knex('users')
            .where({ session_id: sessionId })
            .pluck('id');


        if (!userId || !sessionId) {
            return reply.code(401).send({ error: 'Unauthorized - Invalid session' });
        }

        let { name, description, isOnDiet, date } = mealValidationSchema.parse(request.body);


        const formattedDate = date.toISOString().split('T')[0];

        try {
            await knex('meals').insert({
                id: randomUUID(),
                user_id: userId,
                name,
                description,
                is_on_diet: isOnDiet,
                date: formattedDate,
                created_at: knex.fn.now(),
                updated_at: knex.fn.now()
            });

            return reply.code(201).send({ message: 'Meal registered successfully' });
        } catch (error) {
            console.error('Database error:', error);
            return reply.code(500).send({ error: 'Failed to register meal' });
        }

    })

    // delete meal route
    app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const { sessionId } = request.cookies;

        const mealDeleteSchema = z.object({
            id: z.string(),
        })

        const { id } = mealDeleteSchema.parse(request.params);
        const userId = await knex('users').where({ session_id: sessionId }).pluck('id')

        if (!userId || !sessionId) {
            return response.code(401).send({ error: 'Unauthorized - Invalid session' })
        }

        await knex('meals')
            .where({ id })
            .del()

        return response.code(200).send({ message: 'Meal deleted successfully' })
    })

    // edit meal route
    app.put('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const { sessionId } = request.cookies;

        
        const mealEditSchema = z.object({
            id: z.string(),
        })

        const { id } = mealEditSchema.parse(request.params);
        const userId = await knex('users').where({ session_id: sessionId }).pluck('id')


        if (!userId || !sessionId) {
            return response.code(401).send({ error: 'Unauthorized - Invalid session' })
        }

        const mealUpdateSchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.coerce.date(),
            isOnDiet: z.boolean()
        })

        const { name, description, isOnDiet, date } = mealUpdateSchema.parse(request.body)

        const formattedDate = date.toISOString().split('T')[0];

        await knex('meals')
            .where({ id })
            .update({
                name: name,
                description: description,
                date: formattedDate,
                updated_at: knex.fn.now(),
                is_on_diet: isOnDiet
            })

        return response.code(200).send({ message: 'Meal updated successfully' })
    })

    // list one meal route
    app.get('/:id', {preHandler: [checkSessionIdExists]}, async (request, response) =>{
        const { sessionId } = request.cookies;

        const mealEditSchema = z.object({
            id: z.string(),
        })

        const {id} = mealEditSchema.parse(request.params);
        const userId = await (await knex('users').where({ session_id: sessionId }).pluck('id')).toString()

        if (!userId || !sessionId) {
            return response.code(401).send({ error: 'Unauthorized - Invalid session' })
        }

        const meal = await knex('meals').where({id: id,user_id: userId}).first() 

        if (!meal) {
            return response.code(404).send({ error: 'Meal not found' });
        }

        return response.code(200).send(meal);
    })
}