import { FastifyInstance } from "fastify"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from "crypto"


export async function mealRoutes(app: FastifyInstance) {
    // Create meal route
    app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const { sessionId } = request.cookies;

        const mealRegisterSchema = z.object({
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

        const { name, description, isOnDiet, date } = mealRegisterSchema.parse(request.body);


        const formattedDate = date.toISOString().split('T')[0];

        try {
            await knex('meals').insert({
                id: randomUUID(),
                user_id: userId,
                name,
                description,
                is_on_diet: isOnDiet,
                // TODO Fix date type
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
}