import { FastifyInstance } from "fastify"
import { checkSessionIdExists } from "../middlewares/check-session-id-exists"
import { z } from 'zod'
import { knex } from '../database'
import { randomUUID } from "crypto"

export async function mealRoutes(app: FastifyInstance) {
    // create meal route
    app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
        const mealValidationSchema = z.object({
            name: z.string(),
            description: z.string(),
            isOnDiet: z.boolean(),
            date: z.coerce.date(),
        });

        const { name, description, isOnDiet, date } = mealValidationSchema.parse(request.body);
        const formattedDate = date.toISOString().split('T')[0];

        try {
            await knex('meals').insert({
                id: randomUUID(),
                user_id: request.user!.id,
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
    });

    // delete meal route
    app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const mealDeleteSchema = z.object({
            id: z.string(),
        });

        const { id } = mealDeleteSchema.parse(request.params);

        await knex('meals')
            .where({ id, user_id: request.user!.id })
            .del();

        return response.code(200).send({ message: 'Meal deleted successfully' });
    });

    // edit meal route
    app.put('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const mealEditSchema = z.object({
            id: z.string(),
        });

        const { id } = mealEditSchema.parse(request.params);

        const mealUpdateSchema = z.object({
            name: z.string(),
            description: z.string(),
            date: z.coerce.date(),
            isOnDiet: z.boolean()
        });

        const { name, description, isOnDiet, date } = mealUpdateSchema.parse(request.body);
        const formattedDate = date.toISOString().split('T')[0];

        await knex('meals')
            .where({ id, user_id: request.user!.id })
            .update({
                name,
                description,
                date: formattedDate,
                updated_at: knex.fn.now(),
                is_on_diet: isOnDiet
            });

        return response.code(200).send({ message: 'Meal updated successfully' });
    });

    // list one meal route
    app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const mealEditSchema = z.object({
            id: z.string(),
        });

        const { id } = mealEditSchema.parse(request.params);

        const meal = await knex('meals')
            .where({ id, user_id: request.user!.id })
            .first();

        if (!meal) {
            return response.code(404).send({ error: 'Meal not found' });
        }

        return response.code(200).send(meal);
    });

    // list all meals
    app.get('/', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        const meals = await knex('meals')
            .where({ user_id: request.user!.id })
            .select('name', 'description', 'is_on_diet', 'date');

        return response.code(200).send({ meals });
    });

    //TODO : add delete meal route
    app.get('/metrics', { preHandler: [checkSessionIdExists] }, async (request, response) => {
        
    });
}
