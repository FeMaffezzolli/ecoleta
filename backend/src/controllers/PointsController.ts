import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
  async index(req: Request, res: Response) {
    const { uf, city, items } = req.query

    const parsedItems = String(items)
      .split(',')
      .map((item) => Number(item.trim()))

    const points = await knex('points')
      .join('point_items', 'points.id', '=', 'point_items.point_id')
      .whereIn('point_items.item_id', parsedItems)
      .where('city', String(city))
      .where('uf', String(uf))
      .distinct()

    return res.json(points)
  }

  async show(req: Request, res: Response) {
    const { id } = req.params

    const pointId = Number(id)

    const point = await knex('points').where('id', pointId).first()

    if (!point) {
      return res.status(404).send({ error: { message: 'Not found' } })
    }

    const items = await knex('items')
      .join('point_items', 'items.id', '=', 'point_items.item_id')
      .where('point_items.point_id', pointId)
      .select('items.title')

    return res.json({ point, items })
  }

  async store(req: Request, res: Response) {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = req.body

    const point = {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      image:
        'https://images.unsplash.com/photo-1558267748-a210b34249c9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
    }

    const trx = await knex.transaction()

    const [pointId] = await trx('points').insert(point)

    const pointItems = items.map((item: number) => ({
      point_id: pointId,
      item_id: item,
    }))

    await trx('point_items').insert(pointItems)

    await trx.commit()

    return res.json({ ...point, id: pointId })
  }
}

export default PointsController
