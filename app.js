
const express = require('express');
const User=require('./Models/User')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express();
const session = require('express-session')
app.use(cookieParser());
const passport = require('passport')
app.use(passport.initialize())
const {setupPassport} = require('./Controllers/googleController')
const multer=require('multer')
const path=require('path')

app.use(cors(
  {
    // origin: ['http://localhost:3000','http://localhost:3001' , 'http://localhost:55124' , 'http://192.168.1.34'],
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:59974',
      'http://localhost:65309',
      'http://localhost:61384',
      'http://localhost:59477',
      'http://localhost:56717',
      'http://localhost:52266',
      'http://localhost:51608',
      'http://localhost:57944',
      'http://localhost:59151',
      'http://localhost:52200',
      // 'http://localhost:55927'.
      'http://localhost:52651',
      // 'http://localhost:57944'
      'http://localhost:64484',
      // 'http://localhost:57944',
      'http://localhost:61791',
      'http://localhost:57944',
      'http://localhost:59045',
      'http://localhost:53593',
      'http://localhost:60077',
      'http://localhost:61318',
      'http://localhost:51644',
      'http://localhost:55859',
      'http://localhost:57960',
      'http://localhost:52756',
      'http://localhost:62461',
      'http://localhost:56656',
      'http://localhost:51788',
      'http://localhost:56712',
      'http://localhost:58354',
      'http://localhost:64262',
      'http://localhost:49682',
      'http://localhost:50671',
      'http://localhost:52260',
      'http://localhost:54343',
      // 'http://localhost:53593',
      'http://localhost:61985',
      'http://localhost:65089',
      // 'http://localhost:50333'
      'http://localhost:51376',
      'http://localhost:51901',
      // 'http://localhost:56248'  ,
      'http://localhost:56248',
      'http://localhost:51662',
      'http://localhost:52078',
      'http://localhost:56219',
      'http://localhost:57590',
      'http://localhost:63737',
      'http://localhost:49896',
      'http://localhost:62985',
      'http://localhost:52526',
      'http://localhost:53149',
      'http://localhost:63842',
      'http://localhost:59278',
      'http://localhost:62841',
      'http://localhost:56840',
      'http://localhost:64301',
      'http://localhost:51431',
      'http://localhost:57051',
      'http://localhost:60571',
      'http://localhost:62408',
      'http://localhost:49735',
      'http://localhost:53962',
      'http://localhost:63314',
      'http://localhost:60815',
      'http://localhost:64559',
      'http://localhost:50808',
      'http://localhost:54456',
      'http://localhost:51449',
      'http://localhost:52390',
      'http://localhost:57669',
      'http://localhost:60726',
      'http://localhost:65493',
      'http://localhost:51000',
      'http://localhost:59836',
      'http://localhost:50767',
      'http://localhost:64672',
      'http://localhost:53155',
      'http://localhost:64393',
      'http://localhost:59147',
      'http://localhost:65204',
      'http://localhost:51215',
      'http://localhost:52523',
      'http://localhost:54918',
      'http://localhost:60641',
      'http://localhost:63336',
      'http://localhost:51556',
      'http://localhost:51556',
      'http://localhost:62065',
      'http://localhost:61576',
      'http://localhost:57134',
      'http://localhost:58004',
      'http://localhost:65305',
      'http://localhost:49836',
      'http://localhost:61765',
      'http://localhost:62774'


      // 'http://localhost:50092'.
      // 'http://localhost:64535'
      // 'http://localhost:65080/',
      // 'http://localhost:62641'
      // 'http:// localhost:64350/'
      // 'http://localhost:64350/'
      // 'http://localhost:60389/',
      // 'http://localhost:60389/',
      // 'http://192.168.1.34'
      // 'http://localhost:56207/'
      // 'http://192.168.1.34',
      // 'http://192.168.1.34:3000',
      // 'http://192.168.1.34:3001',
      // 'http://192.168.1.34:44436',
      // 'http://0.0.0.0'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization']
  }
));

app.use(express.static('public'))
app.use(
  session({
      secret: "secret",
      resave: false,
      saveUninitialized: false,
  })
)



const storage = multer.diskStorage({
  destination: (req , file , cb) => {
    cb(null , 'public/images')
  },
  filename: (req , file , cb) => {
    cb(null , file.fieldname + "_" + Date.now() + path.extname(file.originalname))
  }
  
})

const upload = multer({
  storage: storage
})

app.patch('/uplaod/:id', upload.single('file') , async (req , res) =>{
  console.log(req.file)
  try{
    const user = await User.findByIdAndUpdate(req.params.id , {photo: req.file.filename} , {
      new: true,
      runValidators: true
    })
    // User
    res.json({
      status: "success",
      userImage : user.photo
    })

  }catch(err){
    res.status(450).json({
      status: "fail",
      message: err
    })
  }
})

app.use(express.json())
setupPassport(passport)
const subscriptionRouter = require('./Routes/subscriptionRoute');
const userRouter = require('./Routes/userRoute');
const userSubscription = require('./Routes/userSubscriptionRoute');
const bookingRouter = require('./Routes/tablePaymentRouter');
const tableRouter = require('./Routes/tableRoute');
const googleRouter =require("./Routes/googleRoute")
const contact=require("./Routes/contactRoute")
const notificationRouter = require('./Routes/notificationRoute')

app.use('/' , googleRouter)
app.use('/ELACO/contact',contact)
app.use('/ELACO/subcription', subscriptionRouter);
app.use('/ELACO', userRouter);
app.use('/ELACO/userSubscription', userSubscription);
app.use('/ELACO/booking', bookingRouter);
app.use('/ELACO/table', tableRouter);
app.use('/ELACO/notification' , notificationRouter)

module.exports = app;