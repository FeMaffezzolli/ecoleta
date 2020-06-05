export async function up(knex: any): Promise<any> {
  return knex.schema.createTable('points', (table: any) => {
    table.increments('id').primary()
  })
}

export async function down(knex: any): Promise<any> {
  return knex.schema.dropTable('points')
}
