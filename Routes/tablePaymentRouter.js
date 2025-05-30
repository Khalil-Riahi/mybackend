const express=require('express')
const bookingRoute=express.Router()
const bookingController=require('../Controllers/tablepaymentContoller')

bookingRoute
    .post('/',bookingController.addBooking)
    .get('/',bookingController.getall)
    .post('/payment',bookingController.getCheckoutSession)
    .get('/verify/:id',bookingController.verify)
    .get('/BookingHistory/:id',bookingController.getHistory)
    .get('/getReservation',bookingController.getReservations)
    .get('/getReservationPrivateOffice',bookingController.getReservationsprivateOffice)
    .get('/checkAvailability' , bookingController.checkAvailability)
    .get('/getReservationById/:iduser',bookingController.getReservationByUserId)
    .put('/cancel/:id',bookingController.cancel)


module.exports=bookingRoute