import { Request, Response } from 'express'
import knex from '../database/connection'

class PointsController {
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

    const trx = await knex.transaction()

    const [pointId] = await trx('points').insert({
      image: 'fake-image',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    })

    const pointItems = items.map((item: number) => ({
      point_id: pointId,
      item_id: item,
    }))

    await trx('point_items').insert(pointItems)

    return res.json({ success: true })
  }
}

export default PointsController
