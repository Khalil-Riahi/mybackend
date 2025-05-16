const express=require('express')
const subscriptionController=require('./../Controllers/subscriptionController')
const subscriptionRouter=express.Router()

subscriptionRouter.route('/gg/:roomType').get(subscriptionController.getMe)

subscriptionRouter
    .route('/')
    .get(subscriptionController.getAllSubscription)
    .post(subscriptionController.addSubscription)

subscriptionRouter
    .route('/:id')
    .get(subscriptionController.getSubscriptionById)
    .patch(subscriptionController.updateSubecription)
    .delete(subscriptionController.deleteSubscription)
subscriptionRouter
    .post('/payment',subscriptionController.getCheckoutSession)
    .get('/verify/:paymentId',subscriptionController.verify)

    subscriptionRouter
    .route('/get/:roomType')
    .get(subscriptionController.getSubscriptionByType)
module.exports =subscriptionRouter;