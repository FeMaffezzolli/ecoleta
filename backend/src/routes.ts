import express from 'express'

// constroller
import ItemsController from './controllers/ItemsController'
import PointsController from './controllers/PointsController'

const routes = express.Router()

const itemsController = new ItemsController()
const pointsController = new PointsController()

routes.get('/items', itemsController.index)
routes.post('/points', pointsController.store)
routes.get('/points', pointsController.index)
routes.get('/points/:id', pointsController.show)

export default routes
