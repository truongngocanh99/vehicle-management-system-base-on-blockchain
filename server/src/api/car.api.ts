import { Router, Request, Response, request, json } from 'express';
import moment from 'moment';
require('dotenv').config();
const nodemailer = require("nodemailer");
import { mail_registry_car,
    mail_registered_car ,
    mail_edit_confirmRegistration,
    mail_confirmRegistration,
    mail_tranfer_car,
    mail_rejectRegistration,
    mail_rejectTransfer,
    mail_approveTransfer,
    mail_comfirmTransfer
} from "./mail.api";
import {registryCar,
        getAllCars,
        getProcesscingCars,
        acceptCarRegistration,
        updateRegistration,
        rejectCarRegistration,
        getCarById,
        isOwnerOfCar, 
        requestChangeOwner,
        queryCars,
        getHistoryOfCar,
        approveTransferDeal,
        confirmTransferDeal,
        rejectTransferDeal,
        Car,
        getCity,
        getDistrict,
        getObject,
        countSeri,
        getOb,
        switchNumber,
        switchSeri,
        updateNumberofPlate,
        update3fn,
        getUser,
        IsExistSchedule,
        getID_Schedule,
        getSchedule,
        updateOrdinalNumber,
        addBooking,
        addSchedule,
        confirmRegistration,
        getCarType,
        finishBooking,
        Booking,
        Schedule,
        getBooking_ID,
        reduceOrdinalNumber,
        deleteBooking
} from '../fabric/car/Car.fabric';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import { getUserById } from '../fabric/user/User.fabric';
import randomstring from 'randomstring';

const router = Router();

// route dang ky xe
router.post('/', authentication, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const car: Car = {
            id: 'R' + nanoid().toUpperCase(),
            brand: req.body.brand,
            color: req.body.color,
            model: req.body.model,
            year: req.body.year,
            owner: req.user.id,
            chassisNumber: req.body.chassisNumber,
            engineNumber: req.body.engineNumber,
            capacity: req.body.capacity,
            registeredCity: req.body.registeredCity,
            registeredDistrict: req.body.registeredDistrict,
            carType: req.body.carType,
        }
        const date = moment(new Date(),"YYYY-MM-DD").format("DD-MM-YYYY hh:mm:ss");
        const city = await getCity(req.body.registeredCity);
        const registryResult = await registryCar(car, userId);
        const date_detail = new Date();
        if(registryResult.success == true){
            await  mail_registry_car({
                //departmentEmail:"csgt65@gmail.com",
                email:req.user.email,
                departmentEmail:city.departmentEmail,
                date:date,
                day: date_detail.getDate(),
                month: date_detail.getMonth()+1,
                year: date_detail.getFullYear(),
                id: car.id,
                fullName: req.user.fullName,
                profile_name: "Đăng ký, cấp biển số  xe",
                departmentName:city.departmentName,
                departmentAddress:city.departmentAddress ,
                departmentPhone:city.departmentPhone,
    
            });
        }
        
        return res.json({ ...registryResult });
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
    
})

router.get('/', authentication, async (req: Request, res: Response) => {
    const id = req.user.id;
    const queryString: any = {};
    queryString.selector = {
        docType: "car",
    }
    if(req.query.id) {
        queryString.selector.id = {
            $regex: req.query.id
        }
    }
    if(req.query.registrationNumber) {
        queryString.selector.registrationNumber = {
            $regex: req.query.registrationNumber
        }
    }
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.sendStatus(404)
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        const user = await getUserById(car.owner);
        delete user.password
        car.owner = user;
        return car;
    }));
    if (req.query.ownerName){
        result = result.filter((ele: any) => {
            return ele.owner.fullName.includes(req.query.ownerName);
        })
    }
    res.json(result);
});

// Lay   dang ky theo tinh thanh
router.get('/by_city', authentication, async (req: Request, res: Response) => {
    const id = req.user.id;
    const queryString: any = {};
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
    }
    if(req.query.id) {
        queryString.selector.id = {
            $regex: req.query.id
        }
    }
    if(req.query.registrationNumber) {
        queryString.selector.registrationNumber = {
            $regex: req.query.registrationNumber
        }
    }
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.sendStatus(404)
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        const user = await getUserById(car.owner);
        delete user.password
        car.owner = user;
        return car;
    }));
    if (req.query.ownerName){
        result = result.filter((ele: any) => {
            return ele.owner.fullName.includes(req.query.ownerName);
        })
    }
    res.json(result);
});


router.get('/CityAndMonth', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.sendStatus(404)
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth()==new Date().getMonth());
    res.json(filter_car);
});

router.get('/totalCar/:month', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    const  month_string= req.params.month;
    const month = parseInt(month_string);
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.json({
        "name" : "Tổng đăng ký xe theo tháng",
        "month" : month.toString(),
        "value" : 0,
    });
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth()+1==month);
    res.json({
        "name" : "Tổng ĐK xe theo tháng",
        "month" : month.toString(),
        "value" : filter_car.length,
    });
});
router.get('/CityAndMonth_Pending', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"pending"
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.sendStatus(404)
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth()==new Date().getMonth());
    res.json(filter_car);
});
router.get('/carPending_month/:month', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    const  month_string= req.params.month;
    const month = parseInt(month_string);
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"pending",
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.json({
        "name" : "ĐK xe đang đợi xử lí",
        "month" : month.toString(),
        "value" : 0,
    });
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth() +1== month);
    res.json({
        "name" : "ĐK xe đang đợi xử lí",
        "month" : month.toString(),
        "value" : filter_car.length,
    });
});
router.get('/CityAndMonth_Registered', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"registered"
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.ength === 0) return res.sendStatus(404)
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth()==new Date().getMonth());
    res.json(filter_car);
});
router.get('/carRegistered_month/:month', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    const  month_string= req.params.month;
    const month = parseInt(month_string);
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"registered"
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.json({
        "name" : "ĐK xe đã hoàn thành",
        "month" : month.toString(),
        "value" : 0,
    });
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth() +1== month);
    res.json({
        "name" : "ĐK xe đã hoàn thành",
        "month" : month.toString(),
        "value" : filter_car.length,
    });
});
router.get('/CityAndMonth_Rejected', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"rejected"
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.ength === 0) return res.sendStatus(404)
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth()==new Date().getMonth());
    res.json(filter_car);
});
router.get('/carRejected_month/:month', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    const  month_string= req.params.month;
    const month = parseInt(month_string);
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"rejected"
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.json({
        "name" : "ĐK xe đã bị hủy",
        "month" : month.toString(),
        "value" : 0,
    });
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth() +1== month);
    res.json({
        "name" : "ĐK xe đã bị hủy",
        "month" : month.toString(),
        "value" : filter_car.length,
    });
});
router.get('/CityAndMonth_Transfer', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"transferring_ownership"
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.ength === 0) return res.sendStatus(404)
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth()==new Date().getMonth());
    res.json(filter_car);
});

router.get('/transfer_month/:month', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
    const  month_string= req.params.month;
    const month = parseInt(month_string);
    queryString.selector = {
        docType: "car",
        registeredCity:req.user.city.id,
        registrationState:"transferring_ownership"
    }
    
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return  res.json({
        "name" : "Chuyển sở hữu xe",
        "month" : month.toString(),
        "value" : 0,
    });
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        return car;
    }));
    const filter_car = result.filter((rs :any) => new Date(rs.createTime).getMonth() +1== month);
    res.json({
        "name" : "Chuyển sở hữu xe",
        "month" : month.toString(),
        "value" : filter_car.length,
    });
});
router.get('/search', async (req: Request, res: Response) => {
    const registrationNumber = req.query.registrationNumber;
    const queryString = {
        selector: {
            registrationNumber,
            docType: 'car'
        }
    }
    try {
        const results = await queryCars("admin", JSON.stringify(queryString));
       // console.log(results)
        if (results.length === 0) {
            return res.sendStatus(404);
        }
        else {
            const result = results[0].Record;
            result.registeredCity = await getCity(result.registeredCity);
            return res.send(result);
        }
    } catch (error) {
        console.log(error);
        return res.send( { valid: false });
    }
})

router.get('/checkEngineNumber', authentication, async (req: Request, res: Response) => {
    const engineNumber = req.query.en;
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        engineNumber,
        $not: {
            registrationState: 'rejected'
        }
    }
    try {
        const results = await queryCars(req.user.id, JSON.stringify(queryString));
        if (results.length === 0) {
            return res.send({ valid: true});
        }
        else return res.send({ valid: false });
    } catch (error) {
        console.log(error);
        return res.send( { valid: false });
    }
})


router.get('/checkChassisNumber', authentication, async (req: Request, res: Response) => {
    const chassisNumber = req.query.cn;
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        chassisNumber: chassisNumber,
        $not: {
            registrationState: 'rejected',
        }
    }
    try {
        const results = await queryCars(req.user.id, JSON.stringify(queryString));
        if (results.length === 0) {
            return res.send({ valid: true});
        }
        else return res.send({ valid: false });
    } catch (error) {
        console.log(error);
        return res.send( { valid: false });
    }
});

router.get('/pending', authentication, async (req: Request, res: Response) => {
    if (req.user.role !== "police") {
        return res.sendStatus(401);
    }
    const identityCardNumber = req.user.identityCardNumber;
    const queryResult = await getProcesscingCars(identityCardNumber);
    if (!queryResult.success) {
        return res.status(404);
    }
    return res.json(queryResult.result);
});


router.get('/:id', authentication, async (req: Request, res: Response) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        id: req.params.id
    }
    const result = await queryCars(req.user.id, JSON.stringify(queryString));
    const city = await getCity(result[0].Record.registeredCity);
    const district =  await getDistrict(result[0].Record.registeredDistrict);
    const carType = await getCarType(result[0].Record.carType)
    result[0].Record.registeredCity = city;
    result[0].Record.registeredDistrict = district;
    result[0].Record.carType = carType;
    res.json(result[0]);
});

const getCar = async (id: any) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        id: id
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}
const getTransfer = async (id: any) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'transfer',
        id: id
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}
router.get('/:id/transferDeal', authentication, async (req: Request, res: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'transfer',
            carId: req.params.id,
            $or: [
                { state: 0 },
                { state: 1 },
            ],
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        const deal = result[0].Record;
        const currentOwner = await getUserById(deal.currentOwner);
        const newOwner = await getUserById(deal.newOwner);
        const car = await getCarById(req.user.id,deal.carId);
        if(car){
            const city = await getCity(car.Record.registeredCity);
            const dis = await getDistrict(car.Record.registeredDistrict);
            const carT = await getCarType(car.Record.carType);
            car.Record.registeredCity=city;
            car.Record.registeredDistrict= dis;
            car.Record.carType= carT;
        }
        
        deal.currentOwner = currentOwner;
        deal.newOwner = newOwner;
        deal.car = car.Record;
        return res.send(deal);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
});


router.put('/:id', authentication, async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const result  = await updateRegistration(req.user.id, req.params.id, payload);
        if (!result.error) return res.send({success: true});
        else return res.send({success: false, error: result.error});
    } catch (error) {
        return res.send({success: false, error: 'Fabric error'});
    }
})


router.get(
    "/:id/history",
    authentication,
    async (req: Request, res: Response) => {
        try {
            const id = req.user.id;
            const carHistory = await getHistoryOfCar(id, req.params.id);
            const result = await Promise.all(
                carHistory.map(async (state: any) => {
                    const queryString: any = {};
                    queryString.selector = {
                        docType: "user",
                        id: state.Value.modifyUser,
                    };
                    const modifyUser = await queryCars(
                        id,
                        JSON.stringify(queryString)
                    );
                    queryString.selector = {
                        docType: "user",
                        id: state.Value.owner,
                    };
                    const owner = await queryCars(
                        id,
                        JSON.stringify(queryString)
                    );
                    queryString.selector = {
                        docType: "district",
                        id: state.Value.registeredDistrict,
                    };
                    const district = await queryCars(
                        id,
                        JSON.stringify(queryString)
                    );
                    queryString.selector = {
                        docType: "city",
                        id: state.Value.registeredCity,
                    };
                    const city = await queryCars(
                        id,
                        JSON.stringify(queryString)
                    );
                    state.Value.modifyUser = modifyUser[0].Record;
                    state.Value.owner = owner[0].Record;
                    state.Value.registeredCity = city[0].Record;
                    state.Value.registeredDistrict = district[0].Record;
                    return state;
                })
            );
            res.send(result);
        } catch {
            res.sendStatus(404);
        }
    }
);

router.put('/:id/acceptRegistration/', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police') {
            return res.sendStatus(401);
        }
        console.log("------------------ START ACCEPT REGISTRATION ---------------------------");
        const id = req.user.id;
        let registrationNumber = "";
        let car = await getCar(req.params.id);
        const user_id=car.owner;
        const object = await getOb(car.carType,car.registeredCity);
        const city = await getCity(car.registeredCity);
        const number = city.number[city.current_numberIndex];
        console.log("So hieu bien so hien tai", number);
        const seri = object.seri[object.currentseri_Index];
        console.log("Seri hien tai:",seri);
        let count_number = city.number_of_license_plates;
        var threefirstNumber;
        if(city.threefirstNumber.toString().length == 1){
            threefirstNumber ="00"+city.threefirstNumber;
        } else if(city.threefirstNumber.toString().length == 2){
            threefirstNumber ="0"+city.threefirstNumber;
        } else {
            threefirstNumber = city.threefirstNumber;
        }
        const prefix = number + seri + '-' + threefirstNumber +".";
        if (count_number != 0 && (count_number % 99) == 0) {
            // console.log(" Up date 3Number dang chay");
            await update3fn(id, city.id);
        }
        if (count_number != 0 && (count_number % 99999) == 0) {
            // console.log("Seri dang chay");
            const b = await switchSeri(id, object.id);
        }
        if ( count_number == 99999 * object.seri.length) {
            // console.log("Number dang chay");
          const c =   await switchNumber(id, city.id); 
        }
        let validNumber = false;
        while (!validNumber){
            registrationNumber = randomstring.generate({
                length: 2,
                charset: 'numeric'
            });
            const queryString: any = {}
            queryString.selector = {
                docType: 'car',
                registrationNumber: prefix + registrationNumber
            }
            const result = await queryCars(id, JSON.stringify(queryString));
            if(result.length === 0)  validNumber = true;
        }
        console.log("BIEN SO XE :",prefix + registrationNumber);
        const acceptRegistrationResult = await acceptCarRegistration(req.params.id, prefix + registrationNumber, id);
        var owner = await getUser(user_id);
        var district = await getDistrict(car.registeredDistrict);
        var today= new Date();
        if (!acceptRegistrationResult.result.TxID) {
            return res.sendStatus(403);
        }
        else {
            await mail_registered_car({
                send:city.departmentEmail,
                email:owner.email,
                city_name:city.name,
                departmentName: city.departmentName,
                registionName: "Đăng ký, cấp biển số xe ",
                registration_number:prefix + registrationNumber,
                brand:car.brand,
                model:car.model,
                engineNumber:car.engineNumber,
                chassisNumber:car.chassisNumber,
                district_name:district.districtName,
                departmentAddress:city.departmentAddress,
                date: today.getDate(),
                month:today.getMonth()+1,
                year:today.getFullYear(),
            });
            await updateNumberofPlate(req.user.id, city.id);  
             await countSeri(req.user.id,object.id);
            const booking = await getBooking_ID(req.params.id);
            if(booking){
                await finishBooking(req.user.id,booking.id);
            }
            return res.json({ TxID: acceptRegistrationResult.result.TxID, error: false });
            
        }
    } catch (error) {
        console.log(error);
        res.send({error});
    }
});

router.put('/:id/confirmRegistration/', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police') {
            return res.sendStatus(401);
        }
        const  confirm = await confirmRegistration(req.user.id,req.params.id);
        let car = await getCar(req.params.id);
        var owner = await getUser(car.owner);
        var today= new Date();
        var district = await getDistrict(car.registeredDistrict);
        //lay tinh thah dang ky de lay ki hieu dang ki dia phuong
        var city = await getCity(car.registeredCity);
        const userId = req.user.id;
        const date = req.body.date;
        const cityId = req.user.city.id;
        const timeType = req.body.timeType;
        
        var booking : Booking = {
            id :"B"+ nanoid().toUpperCase(),
            date: date,
            cityId :cityId,
            timeType:timeType,
            carId:car.id,
            userId: owner.fullName,
        }
        const ExistSchedule = await IsExistSchedule(userId,date,cityId);
        switch (ExistSchedule.result.isOwner){
            case 1: 
                const sheduleId = await getID_Schedule(userId,date,cityId);
                const schedule = await getSchedule(userId,sheduleId);
                booking.ordinalNumber=schedule.currentNumber+1;
                booking.scheduleId=sheduleId;
                await addBooking(userId, booking);
                await updateOrdinalNumber(userId, sheduleId);
                await mail_confirmRegistration({
                    send:city.departmentEmail,
                    email:owner.email,
                    user:owner.fullName,
                    city_name:city.name,
                    departmentName: city.departmentName,
                    district_name: district.districtName,
                    time:timeType,
                    booking_date:moment(new Date(date),"YYYY-MM-DD").format("DD-MM-YYYY"),
                    departmentAddress: city.departmentAddress,
                    number:booking.ordinalNumber,
                    id:car.id,
                    date: today.getDate(),
                    month:today.getMonth()+1,
                    year:today.getFullYear(),
    
                }); 
                return res.json( {result : "success"});
                break;
            case 0:
                let sche : Schedule ={
                    id : "S"+ nanoid().toUpperCase(),
                    date: date,
                    cityId:cityId,
                }
                const add_sche = await addSchedule(userId,sche);
                const sheduleId1 = await getID_Schedule(userId,date,cityId);
                const schedule1 = await getSchedule(userId,sheduleId1);
                booking.ordinalNumber=schedule1.currentNumber+1;
                booking.scheduleId=sheduleId1;
                await addBooking(userId, booking);
                await updateOrdinalNumber(userId, sheduleId1);
                await mail_confirmRegistration({
                    send:city.departmentEmail,
                    email:owner.email,
                    user:owner.fullName,
                    city_name:city.name,
                    departmentName: city.departmentName,
                    district_name: district.districtName,
                    time:booking.timeType,
                    booking_date:booking.date,
                    departmentAddress: city.departmentAddress,
                    number:booking.ordinalNumber,
                    id:car.id,
                    date: today.getDate(),
                    month:today.getMonth()+1,
                    year:today.getFullYear(),
    
                }); 
                return res.json( {result : "success"});
                break;
            case 2:
                return res.json( {result : "overload"});
                break;
        }      
    } catch (error) {
        console.log(error);
        return res.send({result: "false"});
    }
});
router.put('/:id/confirmRegistration_edit/', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police') {
            return res.sendStatus(401);
        }
        let car = await getCar(req.params.id);
        //lay tinh thah dang ky de lay ki hieu dang ki dia phuong
        var city = await getCity(car.registeredCity);
        var owner = await getUser(car.owner);
        var today= new Date();
        await mail_edit_confirmRegistration({
                send:city.departmentEmail,
                email:owner.email,
                user:owner.fullName,
                city_name:city.name,
                departmentName: city.departmentName,
                registionName: "Đăng ký, cấp biển số xe ",
                content:req.body.content,
                date: today.getDate(),
                month:today.getMonth()+1,
                year:today.getFullYear(),

            });       
            return res.json( 200);
    } catch (error) {
        console.log(error);
        res.send({error});
    }
});
router.put('/:carId/rejectRegistration/', authentication, async (req: Request, res: Response) => {
    const id = req.user.id;
    let car = await getCar(req.params.carId);
    const city = await getCity(car.registeredCity);
    const  owner = await getUser(car.owner);
    const date_detail = new Date();
    const acceptRegistrationResult = await rejectCarRegistration(req.params.carId, id);
    if (!acceptRegistrationResult.success) {
        return res.sendStatus(403);
    }
    else {
        try {
            const result = await getBooking_ID(req.params.carId);
            if(result){
                await deleteBooking(id,result.id);
                await reduceOrdinalNumber(id,result.scheduleId);
            }
        return res.json({ TxID: acceptRegistrationResult.result.TxID });
        } catch (error) {
            
        }
        await mail_rejectRegistration ({
            departmentEmail:city.departmentEmail,
            email:owner.email,
            fullName:owner.fullName,
            date: date_detail.getDate(),
            month: date_detail.getMonth()+1,
            year: date_detail.getFullYear(),
            id:req.params.carId,
            
        })
        return res.json({ TxID: acceptRegistrationResult.result.TxID });
    }
});



router.post('/:carId/transferOwnership', authentication, async (req: Request, res: Response) =>{
    try{
        const carId = req.params.carId;
        const userId = req.user.id;
        const newOwner = req.body.newOwner;
        const isOwnerCar = await isOwnerOfCar(req.params.carId, req.user.id);
        if (!isOwnerCar.result.isOwner) return res.sendStatus(401);
        const requestResult = await requestChangeOwner(carId, newOwner, userId);
        const new_Owner = await getUser(newOwner);
        const current_Owner = await getUser(userId);
        const car= await getCar(carId);
        const city = await getCity(car.city);
        const today = new Date();
        await mail_tranfer_car({
            currentOwner_email:current_Owner.email,
            newOwner_email:new_Owner.email,
            departmentMail:city.departmentEmail,
            date: today.getDate(),
            month:today.getMonth()+1,
            year:today.getFullYear(),
            profile_name:"Đăng ký sang tên, di chuyển xe",
            currentOwner_name:current_Owner.fullName,
            current_district:current_Owner.district.districtName,
            current_city:current_Owner.city.name,
            current_phonenumber:current_Owner.phoneNumber,
            brand:car.brand,
            model:car.model,
            color:car.color,
            chassisNumber:car.chassisNumber,
            engineNumber:car.engineNumber,
            regNumber:car.registrationNumber,
            newOwner_name:new_Owner.fullName,
            new_district:new_Owner.district.districtName,
            new_city:new_Owner.city.name
        });
        if (requestResult.success) return res.send(requestResult.result)
        else return res.sendStatus(403);

    }catch(error){
        console.log(error);
    }
    
});

router.get('/transfers', authentication, async (req: Request, res: Response) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'transfer',
    }
    const result = await queryCars(req.user.id, JSON.stringify(queryString));
    //console.log(result);
    res.json(result);
});
// chap nhan  hop dong chuyen so huu

router.post('/transfer/:dealId/approveTransfer/', authentication, async (req: Request, res: Response) => {
    try {
        const TxID = await approveTransferDeal(req.user.id, req.params.dealId);
        const transfer = await getTransfer(req.params.dealId);
        const currentOwner = await getUser(transfer.currentOwner);
        const newOwner = await getUser(transfer.newOwner);
        const detail_date = new Date();
        await mail_approveTransfer({
            currentOwner:currentOwner.email,
            date:detail_date.getDate(),
            month:detail_date.getMonth()+1,
            year:detail_date.getFullYear(),
            id:req.params.dealId,
            currentOwnerName:currentOwner.fullName,
            newOwnerName:newOwner.fullName,
        })
        if(typeof TxID === 'undefined') return res.send({ success: false })
        else return res.send({ success: true, TxID})
    } catch (error) {
        console.log(error);
        return res.send({ success: false });
    }
})

router.post('/transfer/:dealId/confirmTransfer/', authentication, async (req: Request, res: Response) => {
    try {
        const TxID = await confirmTransferDeal(req.user.id, req.params.dealId);
        const transfer = await getTransfer(req.params.dealId);
        const currentOwner = await getUser(transfer.currentOwner);
        const newOwner = await getUser(transfer.newOwner);
        const detail_date = new Date();
        const car = await getCar(transfer.carId);
        await mail_comfirmTransfer({
            currentOwner_email: currentOwner.email,
            newOwner_email: newOwner.email,
            date:detail_date.getDate(),
            month:detail_date.getMonth()+1,
            year:detail_date.getFullYear(),
            id:req.params.dealId,
            currentOwnerName:currentOwner.fullName,
            newOwnerName:newOwner.fullName,
            regNumber:car.registrationNumber,
            brand: car.brand,
            model:car.model,
            color:car.color,
            chassisNumber:car.chassisNumber,
            engineNumber: car.engineNumber
        })
        if(typeof TxID === 'undefined') return res.send({ success: false })
        else return res.send({ success: true, TxID})
    } catch (error) {
        console.log(error);
        return res.send({ success: false });
    }
})

router.post('/transfer/:dealId/rejectTransfer', authentication, async (req: Request, res:Response) => {
    try {
        const TxID = await rejectTransferDeal(req.user.id, req.params.dealId);
        const transfer = await getTransfer(req.params.dealId);
        const currentOwner = await getUser(transfer.currentOwner);
        const car = await getCar(transfer.carId);
        const city = await getCity(car.registeredCity);
        const newOwner = await getUser(transfer.newOwner);
        const date = new Date();
        if (typeof TxID === 'undefined') return res.send({ success: false })
        await mail_rejectTransfer({
            currentOwner:currentOwner.email,
            newOwner:newOwner.email,
            departmentEmail:city.departmentEmail,
            date:date.getDate(),
            month: date.getMonth() +1,
            year: date.getFullYear(),
            id:req.params.dealId,
            currentOwnerName:currentOwner.fullName,
            newOwnerName:newOwner.fullName,
        })
        return res.send({ success: true, TxID})
    } catch (error) {
        console.log(error);
        return res.send({ success: false });
    }
})




export default router;
