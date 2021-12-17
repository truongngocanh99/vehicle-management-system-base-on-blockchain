import express, { Application, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import userRouter from './api/user.api';
import carRouter from './api/car.api';
import authRouter from './api/auth.api';
import cityRouter from './api/city.api';
import objectRouter from './api/object.api';
import bookingRouter from './api/booking.api';
import carTypeRouter from './api/carType.api';
import * as dotenv from 'dotenv';
import cors from 'cors';
import { Schedule } from "./fabric/car/CarInterface";
// import { authentication } from './middleware/auth.middleware'

declare global {
    namespace Express {
      interface Request {
        user?: any
      }
    }
}


const app: Application = express();

dotenv.config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
// app.use(authentication);
app.use('/users', userRouter);
app.use('/cars', carRouter);
app.use('/auth', authRouter);
app.use('/city', cityRouter)
app.use('/object', objectRouter);
app.use('/booking' , bookingRouter);
app.use('/carType' , carTypeRouter);
app.listen(3000, () =>{
    console.log("Started CR server")
});