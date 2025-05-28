const express=require('express')
const fs=require('fs')
const TablePaiement=require('../Models/Reservation')
const Table=require('./../Models/Table')
const moment = require('moment'); 
const User=require('./../Models/User')

// exports.addBooking = async (req, res) => {
//     try {
                 
       
//         const table = await Table.findOne({ numTable: req.body.numTable ,status:"available"});
//         if(!table){
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'Table is already reserved'
//             });
//         }
//         const t = await Table.findOneAndUpdate(
//             { numTable: req.body.numTable }, 
//             { status: "occupied" }, 
//             { new: true } 
//         );
//         const tablepaiement = await TablePaiement.create({
//             check_in: req.body.check_in,
//             check_out: req.body.check_out,
//             date: new Date(),
//             id_user: req.body.id_user,
//             numTable: req.body.numTable,
//             price: req.body.price,
//             paymentMethod:req.body.paymentMethod
//         });

//         console.log(tablepaiement);

//         res.status(201).json({
//             status: 'success',
//             message: 'Booking added successfully',
//             table: t,
//             booking: tablepaiement
//         });

//     } catch (error) {
//         res.status(500).json({
//             status: 'error',
//             message: error.message || 'An error occurred'
//         });
//     }
// };
exports.getall=async(req,res)=>{
    try{
        const tablepaiements= await TablePaiement.find()
        res.status(200).json({
            status:'success',
            data:tablepaiements
        })

    }catch(error){
        res.status(404).json(
            {
                status:'error',
                message:"error uuuu "
                })
    }
}

exports.addBooking = async (req, res) => {
    try {
        console.log(req.body)
        const { numTable, check_in, check_out, id_user, price, paymentMethod, date } = req.body;

        if (
            numTable === undefined || check_in === undefined || check_out === undefined ||
            id_user === undefined || price === undefined || paymentMethod === undefined || date === undefined
                 )         {
            return res.status(400).json({
                status: 'fail',
                message: 'Missing required booking information'
            });
        }
        // if(paymentMethod=="points"){
        //     const user = await User.findByIdAndUpdate( req.params.id , req.body.points , {
        //         new: true,
        //         runValidators: true
        //     })

        // }
        if (paymentMethod == "points") {
            const user = await User.findByIdAndUpdate(
                id_user,
                { points: req.body.points },
                {
                    new: true,
                    runValidators: true
                }
            );
        }
        // Normalize the booking date to only compare by date part
        const bookingDate = new Date(date);
        const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

        // Check for existing reservation for the same table and same date with time overlap
        const existingReservation = await TablePaiement.findOne({
            numTable,
            date: { $gte: startOfDay, $lt: endOfDay },
            $or: [
                {
                    check_in: { $lt: check_out },
                    check_out: { $gt: check_in }
                }
            ]
        });

        if (existingReservation) {
            return res.status(409).json({
                status: 'fail',
                message: 'Table is already reserved on this date and time'
            });
        }

        // Optional: you can skip this check, or just ensure the table exists
        const table = await Table.findOne({ numTable });

        if (!table) {
            return res.status(404).json({
                status: 'fail',
                message: 'Table not found'
            });
        }

        // Create the booking
        const booking = await TablePaiement.create({
            check_in, // keep as string "HH:mm"
            check_out,
            date: new Date(date),
            id_user,
            numTable,
            price,
            paymentMethod
        });

        // Optionally mark the table as occupied if you want
        await Table.findOneAndUpdate(
            { numTable },
            { status: 'occupied' }
        );

        res.status(201).json({
            status: 'success',
            message: 'Booking added successfully',
            booking
        });

    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({
            status: 'error',
            message: error
        });
    }
};

// exports.addBooking = async (req, res) => {
//     try {
//         const { numTable, check_in, check_out, id_user, price, paymentMethod, date, points } = req.body;
//         let status = "confirmed";

//         // Validate required fields
//         if (
//             numTable === undefined || check_in === undefined || check_out === undefined ||
//             id_user === undefined || price === undefined || paymentMethod === undefined || date === undefined
//         ) {
//             return res.status(400).json({
//                 status: 'fail',
//                 message: 'Missing required booking information'
//             });
//         }

//         // Prevent double booking for the same date/time/table
//         const bookingDate = new Date(date);
//         const startOfDay = new Date(bookingDate.setHours(0, 0, 0, 0));
//         const endOfDay = new Date(bookingDate.setHours(23, 59, 59, 999));

//         const existingReservation = await TablePaiement.findOne({
//             numTable,
//             date: { $gte: startOfDay, $lt: endOfDay },
//             $or: [
//                 {
//                     check_in: { $lt: check_out },
//                     check_out: { $gt: check_in }
//                 }
//             ]
//         });

//         if (existingReservation) {
//             return res.status(409).json({
//                 status: 'fail',
//                 message: 'Table is already reserved on this date and time'
//             });
//         }

//         // Ensure table exists
//         const table = await Table.findOne({ numTable });
//         if (!table) {
//             return res.status(404).json({
//                 status: 'fail',
//                 message: 'Table not found'
//             });
//         }

//         // Handle CASH booking
//         if (paymentMethod === "cash") {
//             status = "pending";

//             const admins = await User.find({ role: "admin" });
//             if (admins.length === 0) {
//                 return res.status(404).json({
//                     status: 'fail',
//                     message: 'No admins found to notify'
//                 });
//             }

//             const booking = await TablePaiement.create({
//                 check_in,
//                 check_out,
//                 date: new Date(date),
//                 id_user,
//                 numTable,
//                 price,
//                 paymentMethod,
//                 status
//             });

//             await Table.findOneAndUpdate(
//                 { numTable },
//                 { status: 'occupied' }
//             );

//             const bookingDetails = {
//                 check_in,
//                 check_out,
//                 date,
//                 id_user,
//                 numTable,
//                 price,
//                 paymentMethod
//             };

//             // const notifications = admins.map(admin => ({
//             //     title: Nouvelle réservation en espèces,
//             //     content: Réservation pour la table ${numTable} de ${check_in} à ${check_out} le ${date}, prix : ${price} DA.,
//             //     user_id: admin._id,
//             //     sender_id: id_user,
//             //     status: 'pending',
//             //     booking_id: booking._id,
//             //     bookingDetails, // ✅ Include booking details for admin approval
//             //     sentDate: new Date(),
//             //     sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//             // }));

//             const notifications = admins.map(admin => ({
//     title: 'Nouvelle réservation en espèces',
//     content: `Réservation pour la table ${numTable} de ${check_in} à ${check_out} le ${date}, prix : ${price} DA.`,
//     user_id: admin._id,
//     sender_id: id_user,
//     status: 'pending',
//     booking_id: booking._id,
//     bookingDetails, // ✅ Include booking details for admin approval
//     sentDate: new Date(),
//     sentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
// }));

//             await Notification.insertMany(notifications);

//             return res.status(201).json({
//                 status: 'success',
//                 message: 'Cash booking added and notification sent to admins',
//                 booking
//             });
//         }

//         // Handle ONLINE booking
//         if (paymentMethod === "online") {
//             status = "confirmed";
//             const pointsfidelite = Math.round(price / 1500);
//             await User.findByIdAndUpdate(
//                 id_user,
//                 { $inc: { Loyaltypoints: pointsfidelite } },
//                 { runValidators: false }
//             );
//         }

//         // Handle POINTS booking
//         if (paymentMethod === "points") {
//             status = "confirmed";
//             await User.findByIdAndUpdate(
//                 id_user,
//                 { points }, // New points after deduction
//                 { new: true, runValidators: true }
//             );
//         }

//         // Create booking for online and points payment
//         const booking = await TablePaiement.create({
//             check_in,
//             check_out,
//             date: new Date(date),
//             id_user,
//             numTable,
//             price,
//             paymentMethod,
//             status
//         });

//         await Table.findOneAndUpdate(
//             { numTable },
//             { status: 'occupied' }
//         );

//         res.status(201).json({
//             status: 'success',
//             message: 'Booking added successfully',
//             booking
//         });

//     } catch (error) {
//         console.error('Booking error:', error);
//         res.status(500).json({
//             status: 'error',
//             message: error.message || 'Internal server error'
//         });
//     }
// };


// exports.getCheckoutSession = async(req , res) => {
//     try{
//         console.log("nnn")
//         const url = "https://api.sandbox.konnect.network/api/v2/payments/init-payment"
//         const payload =  {
//             receiverWalletId: process.env.WALLET_ID,
//             amount : req.body.amount,
//             description: req.body.description,
//             acceptedPaymentMethods: ["e-DINAR"],
//             successUrl: `http://localhost:51114/#/payment?start_time=${req.query.start_time}&end_time=${req.query.end_time}&numTable=${req.query.numTable}&date=${req.query.date}`,
//             failUrl: `http://localhost:51114/#/payment?start_time=${req.query.start_time}&end_time=${req.query.end_time}&numTable=${req.query.numTable}`,
//         }

//         const response = await fetch(url , {
//             method: "POST",
//             body: JSON.stringify(payload),
//             headers:{
//                 'Content-Type': 'application/json',
//                 'x-api-key': process.env.API_KEY_KONNECT
//             }
//         })

//         const resData = await response.json()

//         res.json({
//             status: 'success',
//             result: resData
//         })
//     }catch(err){
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }

exports.getCheckoutSession = async(req , res) => {
    try{
        console.log("nnn")
        const url = "https://api.sandbox.konnect.network/api/v2/payments/init-payment"
        const payload =  {
            receiverWalletId: process.env.WALLET_ID,
            amount : req.body.amount,
            description: req.body.description,
            acceptedPaymentMethods: ["e-DINAR"],
            successUrl: `http://localhost:3000/payment?start_time=${req.query.start_time}&end_time=${req.query.end_time}&numTable=${req.query.numTable}&date=${req.query.date}`,
            failUrl: `http://localhost:3000/#/payment?start_time=${req.query.start_time}&end_time=${req.query.end_time}&numTable=${req.query.numTable}`,
        }

        const response = await fetch(url , {
            method: "POST",
            body: JSON.stringify(payload),
            headers:{
                'Content-Type': 'application/json',
                'x-api-key': process.env.API_KEY_KONNECT
            }
        })

        const resData = await response.json()

        res.json({
            status: 'success',
            result: resData
        })
    }catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getReservationByUserId = async (req, res) => {
    try {
        const reservations = await TablePaiement.find({ id_user: req.params.iduser });

        res.status(200).json({ success: "success", data: reservations });

    } catch (error) {
        res.status(404).json({
            status: "fail",
            error
        });
    }
};

// exports.verify = async (req , res) => {

//     try{
//         const id_payment = req.params.id
//         // const url = https://api.sandbox.konnect.network/api/v2/payments/${id_payment}

//         const response = await fetch(`https://api.sandbox.konnect.network/api/v2/payments/${id_payment}`)

//         const resData = await response.json()

//         res.json({
//             // status: 'success', 
//             resData
//         })
//     }catch(err){
//         res.json(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }

// exports.verify = async (req , res) => {

//     try{
//         const id_payment = req.params.id
//         const { userId, start_time , end_time , numTable , date } = req.query;
//     const  paymentId=req.params.id
//         // const url = https://api.sandbox.konnect.network/api/v2/payments/${id_payment}

//         const response = await fetch(`https://api.sandbox.konnect.network/api/v2/payments/${id_payment}`)

//         const resData = await response.json()

//         if (resData.payment.transactions[0].status === "success") {
              
        
//               const reservation = {
//                 id_user: userId,
//                 check_in: start_time,
//                 check_out: end_time,
//                 numTable: numTable,
//                 date: date,
//               };
        
//               const newRes = await UserSubscription.create(reservation);
        
//               res.status(200).json({
//                 status: 'success',
//                 newRes
//             });
//         }

//     }catch(err){
//          res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }

exports.verify = async (req, res) => {
  try {
    const paymentId = req.params.id;               // :id in the URL
    const { userId, start_time, end_time, numTable, date } = req.query;

    // ---- sanity-checks ----------------------------------------------------
    if (!userId || !start_time || !end_time || !numTable || !date) {
      return res.status(400).json({
        status : 'fail',
        message: 'Missing query parameters'
      });
    }
    // ----------------------------------------------------------------------

    // Ask Konnect for the transaction status
    const konnectRes   = await fetch(`https://api.sandbox.konnect.network/api/v2/payments/${paymentId}`);
    const konnectData  = await konnectRes.json();

    const trxStatus =
      konnectData?.payment?.transactions?.[0]?.status ?? 'unknown';

    if (trxStatus !== 'success') {
      return res.status(400).json({
        status : 'fail',
        message: `Payment not successful (status = ${trxStatus})`
      });
    }

    // Create the booking
    const reservation = {
      id_user  : userId,
      check_in : start_time,
      check_out: end_time,
      numTable ,
      date,
      price: (konnectData?.payment?.transactions?.[0]?.amount) /1000
    };

    const newBooking = await TablePaiement.create(reservation);

    return res.status(200).json({
      status: 'success',
      booking: newBooking
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      status : 'error',
      message: err.message || 'Internal server error'
    });
  }
};

exports.getHistory=async(req,res)=>{
    try{
        const history= await TablePaiement.find({id_user:req.params.id})

        if(!hist){
            res.json(404).json({
                status:'fail',
                message:'no booking Histroy find'
            })
        }
        res.status(200).json({
            status:'success',
            history:history
        })
    }catch(error){
        res.status(400).json({
            status:'fail',
            message:error
        })

    }

}
exports.getHistory = async (req, res) => {
    try {
        const history = await TablePaiement.find({ id_user: req.params.id });
        console.log("hhhhh"+history)
        console.log("ffffffff")
        if (!history || history.length === 0) {
            return res.status(404).json({
                status: 'fail',
                message: 'No payment history found for this user'
            });
        }
        
        res.status(200).json({
            status: 'success',
            data: {
                history: history
            }
        });
    } catch (error) {
        res.status(400).json({
            status: 'fail',
            message: error.message // It's better to send error.message rather than the whole error object
        });
    }
};

// exports.getReservations = async (req, res) => {
//     try {
//       const reservations1 = await reservation.find({
//         date: new Date(date),
//         numTable: 34,
//       }).select('check_in check_out');
//     console.log("reservations"+reservations1)
  
//       res.status(200).json({
//         success: true,
//         data: reservations1
//       });
//     } catch (error) {
//       res.status(500).json({
//         success: false,
//         message: "Failed to fetch reservations",
//         error: error
//       });
//     }
//   };
exports.getReservations = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reservations1 = await TablePaiement.find({
            numTable: 34,
            date: { $gte: today } 
        })
        .select('check_in check_out date')
        .sort({ date: 1, check_in: 1 });


        const reservations2 = await TablePaiement.find({
            numTable: 33,
            date: { $gte: today } 
        })
        .select('check_in check_out date')
        .sort({ date: 1, check_in: 1 }); 

        console.log(`Reservations for table 34 from ${today.toISOString()}:`, reservations1);

        res.status(200).json({
            success: true,
            data:[
                reservations1,
                reservations2
            ]
        });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reservations",
            error: error.message
        });
    }
};
exports.getReservationsprivateOffice= async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const private = await TablePaiement.find({
            numTable: 31,
            date: { $gte: today } 
        })
        .select('check_in check_out date')
        .sort({ date: 1, check_in: 1 });


        const premuim = await TablePaiement.find({
            numTable: 32,
            date: { $gte: today } 
        })
        .select('check_in check_out date')
        .sort({ date: 1, check_in: 1 }); 


        res.status(200).json({
            success: true,
            data:[
                private,
                premuim
            ]
        });
    } catch (error) {
        console.error("Error fetching reservations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reservations",
            error: error.message
        });
    }
};

// exports.checkAvailability = async (req , res) => {

    
//     try{
//         const now = new Date();

//         const options = { timeZone: 'Africa/Tunis', hour12: false };
//         const tunisTimeString = now.toLocaleString('en-GB', options);
    
//         // Split into date and time
//         const [datePart, timePart] = tunisTimeString.split(', ');
    
//         // Remove seconds from time
//         const timeWithoutSeconds = timePart.slice(0, 5); 
    
//         console.log('Date:', datePart); // "27/04/2025"
//         console.log('Time:', timeWithoutSeconds); // "13:39"
    
//         const reservations = await TablePaiement.find().where('date').equals(datePart)
        
    
        
    
//         res.json({
//             stutus: 'succes',
//             reservations
//         })
//     }catch(err){
//         res.json({
//             status: "error",
//             message: err
//         })
//     }
    
// }

const { DateTime } = require('luxon'); // install luxon if not already: npm install luxon

// exports.checkAvailability = async (req, res) => {
//   try {
//     const now = DateTime.now().setZone('Africa/Tunis');

//     const todayStart = now.startOf('day').toJSDate(); 
//     const todayEnd = now.endOf('day').toJSDate(); 

//     console.log('Today Start:', todayStart);
//     console.log('Today End:', todayEnd);

//     const reservations = await TablePaiement.find({
//       date: {
//         $gte: todayStart,
//         $lte: todayEnd
//       }
//     });

//     res.json({
//       status: 'success',
//       reservations
//     });

//   } catch (err) {
//     console.error(err);
//     res.json({
//       status: "error",
//       message: err.message
//     });
//   }
// }

exports.checkAvailability = async (req, res) => {
  try {
    // Get current Tunisia time
    const selectedDate = req.query.date
    const now = DateTime.now().setZone('Africa/Tunis');

    // Get today's midnight and end
    const todayStart = now.startOf('day').toJSDate();
    const todayEnd = now.endOf('day').toJSDate();

    // Get current time in HH:mm format
    const currentTime = now.toFormat('HH:mm');
    console.log('Current Tunisia Time:', currentTime);

    // Query the database
    const reservations = await TablePaiement.find({
      date: selectedDate,
      check_in: { $lte: currentTime },   // check_in <= now
      check_out: { $gte: currentTime }   // check_out >= now
    });

    res.json({
      status: 'success',
      reservations
    });

  } catch (err) {
    console.error(err);
    res.json({
      status: "error",
      message: err.message
    });
  }
}

exports.cancel=async(req,res)=>{
    try{
        console.log(req.params.id)
        await TablePaiement.findByIdAndUpdate(req.params.id, { status: 'canceled' });
        res.status(200).json({
            status:"success"
        })

    }catch(error){
        res.status(404).json({
            status:"error",
            error
        })
    
    }
}