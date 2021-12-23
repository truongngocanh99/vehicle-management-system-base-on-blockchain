import { Router, Request, Response } from 'express';
import { User, registerUser, getUserByPhoneNumber, getPoliceByPhoneNumber, getId } from '../fabric/user/User.fabric';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import * as jwt from 'jsonwebtoken';
import { FABRIC_ERROR_CODE } from '../constant';
import {authentication} from '../middleware/auth.middleware';
const nodemailer = require("nodemailer");
import { mail_registry_citizen } from "./mail.api";
import { queryCars, getCity, getDistrict,getObject,getNameCity,getNameDistrict } from '../fabric/car/Car.fabric';
const router = Router();

const jwt_secret = process.env.JWT_SECRET || "blockchain";




router.post('/registry/citizen',async (req: Request, res: Response) => {
    try {
        const citizen: User = {
            id: 'U' + nanoid().toUpperCase(),
            fullName: req.body.fullName,
            phoneNumber: req.body.phoneNumber,
            dateOfBirth: req.body.dateOfBirth,
            password: bcrypt.hashSync(req.body.password, 5),
            identityCardNumber: req.body.identityCardNumber,
            role: "citizen",
            address:req.body.address,
            city: req.body.city,
            district:req.body.district,
            placeOfIdentity: req.body.placeOfIdentity,
            dateOfIdentity: req.body.dateOfIdentity,
            email: req.body.email,
            docType: 'user',
            verifyPolice: req.body.verifyPolice,
        }
        citizen.city = await getCity(req.body.city);
        citizen.district = await getDistrict(req.body.district);
        const city_name = await getNameCity(req.body.city);
        const district_name = await getNameDistrict(req.body.district);
        citizen.address=citizen.address + "," +district_name+","+ city_name;
        await registerUser(citizen);
        await mail_registry_citizen({
            email:citizen.email,
            fullname: citizen.fullName,
            url:'http://localhost:3000/users/activeAccount/' +citizen.id,
        });
        return res.status(201).json({
            success: true,
            message: `Dang ky thanh cong ${req.body.fullName} co ID: ${citizen.id}`
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send("error while register user");
    }

})


router.post('/registry/police', authentication, async (req: Request, res: Response) => {
    try {
        const citizen: User = {
            id: 'U' + nanoid().toUpperCase(),
            fullName: req.body.fullName,
            phoneNumber:req.body.phoneNumber,
            dateOfBirth: req.body.dateOfBirth,
            password: bcrypt.hashSync(req.body.password, 5),
            identityCardNumber: req.body.identityCardNumber,
            role: "police",
            address:req.body.address,
            city: req.body.city,
            district:req.body.district,
            placeOfIdentity: req.body.placeOfIdentity,
            dateOfIdentity: req.body.dateOfIdentity,
            email: req.body.email,
            verifyPolice: 'admin',
            verified: true,
            docType: 'user',
        }
        citizen.city = await getCity(req.body.city);
        citizen.district = await getDistrict(req.body.district);
        const city_name = await getNameCity(req.body.city);
        const district_name = await getNameDistrict(req.body.district);
        citizen.address=citizen.address + "," + district_name +","+ city_name;
        await registerUser(citizen);
        return res.status(201).json({
            success: true,
            message: `Dang ky thanh cong ${req.body.fullName}`
        })
    } catch (error) {
        console.log(error);
        return res.status(400).send("error while register user");
    }

});

router.post('/login-police', async (req: Request, res: Response) => {
    try {
        const user = await getPoliceByPhoneNumber(req.body.phoneNumber);
        if(typeof user === 'undefined') return res.send({ success: false, message: "Số điện thoại hoặc mật khẩu không đúng" });
        const isCorrectPassword = await bcrypt.compare(req.body.password, user.Record.password);
        if(!isCorrectPassword) {
            const rs = {
                success: false,
                message: "Incorrect identity card or password"
            };
            return res.status(401).send(rs);
        }
        delete user.Record.password;
        const token = jwt.sign(user.Record, jwt_secret)
        const rs = {
            success: true,
            data: {
                user: user.Record,
                token: token
            }
        }
        res.status(200).json(rs);
    } catch (error) {
        console.log(error);
        if (error === FABRIC_ERROR_CODE.IDENTITY_NOT_FOUND_IN_WALLET)
            return res.status(403).send({
                success: false,
                message: "Incorrect identity card or password"
            })
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const user = await getUserByPhoneNumber(req.body.phoneNumber);
        if(typeof user === 'undefined') return res.send({ success: false, message: "Tài khoản không tồn tại" });
        if(user.Record.status == false) return res.send({success : false , message: "Tài khoản chưa được kích hoạt"})
        const isCorrectPassword = await bcrypt.compare(req.body.password, user.Record.password);
        if(!isCorrectPassword) {
            const rs = {
                success: false,
                message: "Số điện thoại hoặc mật khẩu không đúng"
            };
            return res.status(401).send(rs);
        }
        delete user.Record.password;
        const token = jwt.sign(user.Record, jwt_secret)
        const rs = {
            success: true,
            data: {
                user: user.Record,
                token: token
            }
        }
        res.status(200).json(rs);
    } catch (error) {
        console.log(error);
        if (error === FABRIC_ERROR_CODE.IDENTITY_NOT_FOUND_IN_WALLET)
            return res.status(403).send({
                success: false,
                message: "Incorrect identity card or password"
            })
    }
});



export default router;
