import { Router, Request, Response, query } from 'express';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import moment from 'moment';
require('dotenv').config();
import {
    addSchedule,
    updateSchedule,
    updateOrdinalNumber,
    addBooking,
    deleteBooking,
    updateBooking,
    getSchedule,
    reduceOrdinalNumber,
    queryCars,
    get_Booking,
    IsExistSchedule,
    getID_Schedule,
    Schedule,
    Booking,
    finishBooking,
  
} from '../fabric/car/Car.fabric';
import {
    queryUser
} from '../fabric/user/User.fabric';
const router = Router();

// API them 1 to chuc dang ky xe
// route add a schedule < khong su dung trong web>
router.post('/', authentication, async (request: Request, response: Response) => {
    try {
        const schedule : Schedule= {
            id : "S"+ nanoid().toUpperCase(),
            date: request.body.date,
            cityId: request.body.cityId,
        }
       await addSchedule(request.user.id,schedule);
       return response.status(201).json({
        success: true,
        message: `Dang ky thanh cong doi tuong ${request.body.date}`
    })
    } catch (error) {
        response.send({success: false});
    }
})
// lấy tất cả lịch biểu đăng ký - ok
router.get('/search_all', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'schedule',
            cityId: request.user.city.id,
            ...request.query
        }
        if(request.query.date) {
            queryString.selector.date = request.query.date;
        }
        if(request.query.id) {
            delete queryString.selector.id;
            queryString.selector.$not = {
                id: request.query.id
            }
        }
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map((schedule: { Record: any; }) => {
            const s = schedule.Record;
            return s;
        }))
        return response.send(resultResponse);
    } catch (error) {
        console.log(error);
    }
})
const getCar = async (id: any) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        id: id
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}

// api chinh sua thong tin lich - ok
router.put('/:id', authentication, async (request: Request, response: Response) => {
    try {
        const schedule = request.body;
        schedule.id = request.params.id;
        const results = await updateSchedule(request.user.id, schedule);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})

// api update sô thứ tự trong booking  < khong su dung trong web>
router.put('/update_ordinalNumber/:id', authentication, async (request: Request, response: Response) => {
    try {
        const id = request.params.id;
        const results = await updateOrdinalNumber(request.user.id, id);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})

// api search schedule by date for police 
router.get('/search/',authentication, async ( req:Request , res: Response) =>{
    try {
        if(req.user.role !== 'police') return res.status(403);
        const queryResult: any = {}
        queryResult.selector = {
        docType: 'schedule',
        date: req.body.date,
        cityId: req.user.city.id,
    }
    const result = await queryUser(req.user.id, JSON.stringify(queryResult));
    res.json(result[0]);
        
    } catch (error) {
        console.log("error");
        
    }  

})

// Api them 1 lich hen <MAU></MAU>
router.post('/add', authentication, async (request: Request, response: Response) => {
    try {
        const userId= request.user.id;
        const date = request.body.date;
        const cityId = request.user.city.id;
        const timeType = request.body.timeType;
        var booking : Booking = {
            id :"B"+ nanoid().toUpperCase(),
            date: request.body.date,
            cityId :request.user.city.id,
            timeType:request.body.timeType,
            carId:"Test Xe 144",
            userId: "Text user 145",
        }
        const ExistSchedule = await IsExistSchedule(userId,date,cityId);
        switch (ExistSchedule.result.isOwner){
            case 1: 
                const sheduleId = await getID_Schedule(userId,date,cityId);
                const schedule = await getSchedule(userId,sheduleId );
                booking.ordinalNumber=schedule.currentNumber+1;
                booking.scheduleId=sheduleId;
                const results = await addBooking(userId, booking);
                const update_ordinalNumber = await updateOrdinalNumber(userId, sheduleId);
                break;
            case 0:
                const sche : Schedule ={
                    id : "S"+ nanoid().toUpperCase(),
                    date: date,
                    cityId:cityId,
                }
        
                const add_sche = await addSchedule(userId,sche);
                booking.ordinalNumber= 1 ;
                booking.scheduleId=sche.id;
                const add_booking = await addBooking(userId, booking);
                const update_ordinal= await updateOrdinalNumber(userId, sche.id);
                break;
        }
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})

// api lay lịch hẹn theo ngày
router.get('/:date/booking', authentication, async (req: Request, res: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'booking',
            date: req.params.date,
            cityId: req.user.city.id,
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map(async (booking: { Record: any; }) =>{
            const book = booking.Record;
            const car= await  getCar(book.carId);
            book.carId=car;
            return book;
        }))
        return res.send(resultResponse);
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
})

// route huy lich hen
router.delete('/deleteBooking/:id', authentication, async (request: Request, response: Response) => {
    try {
        const id = request.params.id;
        const a = await get_Booking(request.user.id,id);
        const shedule_id= a.scheduleId;
        const reduce_ordi = await reduceOrdinalNumber(request.user.id,shedule_id);
        const results = await deleteBooking(request.user.id,id );
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
// route huy lich hen
router.put('/finishBooking/:id', authentication, async (request: Request, response: Response) => {
    try {
        const id = request.params.id;
        const results = await finishBooking(request.user.id,id );
        response.send({success: true});
    } catch (error) {
        console.log(error);
        response.send({success: false});
    }
})

// Cập  nhật lịch hẹn
router.put('/update/:id', authentication, async (request: Request, response: Response) => {
    try {
        const booking = request.body;
        booking.id = request.params.id;
        const results = await updateBooking(request.user.id, booking);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})



router.get('/getEventCalendar', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const id = req.user.id;
    const queryString: any = {};
        queryString.selector = {
            docType: 'schedule',
            cityId: req.user.city.id,
        }
    const cars = await queryCars(id, JSON.stringify(queryString));
    if(!cars|| cars.length === 0) return res.json(0);
    let result: any = await Promise.all(cars.map(async (state: { Record: any; }) => {
        const shedule = state.Record;
        return {title : `${shedule.currentNumber } hồ sơ`,
                // date  : moment(shedule.date,"YYYY-MM-DD").toDate().toISOString().slice(0,10)
                 date  : new Date(shedule.date).toISOString().slice(0,10)
        };
    }));
    res.json(result);
});
export default router;