import 'knex'


declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      id: string;
      session_id: string;
    };
  }
}


declare module 'knex/types/tables' {
    export interface Tables {
        users:{
            id: string
            session_id: string
            name: string
            email: string
        }

        meals:{
            id: string
            user_id: string
            name: string
            description: string
            is_on_diet: boolean
            date: string
            created_at: string
            updated_at: string
            isOnDiet: bolean
        }
    }
}