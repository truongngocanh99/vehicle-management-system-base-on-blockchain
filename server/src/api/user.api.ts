
import { Router, Request, Response } from 'express';
import { User, queryUser, modifyUser, verifyUser, changePassword, getUserById, activeAccount } from '../fabric/user/User.fabric';
import { authentication } from '../middleware/auth.middleware';
import { queryCars, getCity, getDistrict,getObject,getNameCity, getCarType } from '../fabric/car/Car.fabric';
import * as bcrypt from 'bcrypt';
import { parse } from 'dotenv/types';
var path = require('path');
const router = Router();

const jwt_secret = process.env.JWT_SECRET || "blockchain";
const uidLen = 8;

router.get('/', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police' && req.user.role !== 'admin') return res.status(403);
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
    }
    if(req.user.role === 'police') queryString.selector.role = 'citizen';
    else queryString.selector.$or = [
        {role: 'citizen'},
        {role: 'police'}
    ]
    try {
        const users = await queryUser(req.user.id, JSON.stringify(queryString));
        const response = await Promise.all(users.map(async (user: { Record: any; }) => {
            if (user.Record.role === 'citizen' && user.Record.verified) {
                const verifyPolice = await getUserById(user.Record.verifyPolice);
                user.Record.verifyPolice = verifyPolice;
            }
            return user.Record;
        }));
        return res.send(response);
    } catch (error) {
        console.log(error)
        res.sendStatus(404);
    }
})
//Nguoi dung trong tinh
router.get('/by_city', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police') return res.status(403);
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
        role:'citizen',
        city:req.user.city,
    }
    try {
        const users = await queryUser(req.user.id, JSON.stringify(queryString));
        const response = await Promise.all(users.map(async (user: { Record: any; }) => {
            if (user.Record.role === 'citizen' && user.Record.verified) {
                const verifyPolice = await getUserById(user.Record.verifyPolice);
                user.Record.verifyPolice = verifyPolice;
            }
            return user.Record;
        }));
        return res.send(response);
    } catch (error) {
        console.log(error)
        res.sendStatus(404);
    }
})
// GET USER by cityandmonth
router.get('/CityAndMonth', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police' && req.user.role !== 'admin') return res.status(403);
    const queryString: any = {};
    // const month=req.body.month
    queryString.selector = {
        docType: 'user',
        role:'citizen',
        city:req.user.city,
    }
    try {
        const users = await queryUser(req.user.id, JSON.stringify(queryString));
        // const filter_user = users.filter(users.createTime.getMonth()== new Date().getMonth()+1);
        const response = await Promise.all(users.map(async (user: { Record: any; }) => {
            if (user.Record.role === 'citizen' && user.Record.verified) {
                const verifyPolice = await getUserById(user.Record.verifyPolice);
                user.Record.verifyPolice = verifyPolice;
            }
            return user.Record;
        }));
        const filter_user = response.filter((rs :any) => new Date(rs.createTime).getMonth()==new Date().getMonth());
        // const filter_user = response.filter((rs :any) => new Date(rs.createTime).getMonth() +1 == month);
        return res.send(filter_user);
    } catch (error) {
        console.log(error)
        res.sendStatus(404);
    }
})
router.get('/me', authentication, async (req: Request, res: Response) => {
    res.send(req.user);
});

router.put('/me/changePassword', authentication, async (req: Request, res: Response) => {
    try {
        const data = req.body;
        const result = await changePassword(req.user.id, bcrypt.hashSync(req.body.newPassword, 5));
        if(result.TxID) return res.send({success: true, messeage: "success"});
    } catch (error) {
        console.log(error);
        return res.send({success: false})
    }
})

router.get('/validateChangeOwner', authentication, async (req: Request, res: Response) => {
    const newOnwerId = req.query.id;
    if (typeof newOnwerId === 'undefined') return res.sendStatus(403);
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
        id: newOnwerId,
    }
    try {
        const result = await queryUser(req.user.id, JSON.stringify(queryString));
        if(result.length > 0) return res.json({valid: true, newOwnerId: result[0].Record.id});
        else return res.json({valid: false});
    } catch (error) {
        console.log(error);
        return res.status(403);
    }
});

router.get('/validate/', async (req: Request, res: Response) => {
    const {field, value} = req.query;
    if (typeof field === 'undefined' && typeof value === 'undefined') return res.send({valid: false});
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
        role: 'citizen'
    }
    queryString.selector[field?field.toString():''] = value;
    try{
        const result = await queryUser('admin', JSON.stringify(queryString));
        if (result.length === 0) return res.send({valid: true});
        return res.send({valid: false});
    } catch(error) {
        return res.send({valid: false});
    }
});

router.get('/validatePolice/', async (req: Request, res: Response) => {
    const {field, value} = req.query;
    if (typeof field === 'undefined' && typeof value === 'undefined') return res.send({valid: false});
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
        role: 'police'
    }
    queryString.selector[field?field.toString():''] = value;
    try{
        const result = await queryUser('admin', JSON.stringify(queryString));
        if (result.length === 0) return res.send({valid: true});
        return res.send({valid: false});
    } catch(error) {
        return res.send({valid: false});
    }
});

router.get('/:id', authentication, async (req: Request, res: Response) => {
    const queryResult: any = {}
    queryResult.selector = {
        docType: 'user',
        id: req.params.id
    }
    const result = await queryUser(req.user.id, JSON.stringify(queryResult));
    res.json(result[0]);
});

router.put('/:id', authentication, async (req: Request, res: Response) => {
    const user = req.body;
    user.id = req.params.id;
    const result = await modifyUser(req.user.id, user);
    if(result.TxID) return res.send({success: true});
    return res.send({success: false});
})



router.put('/:id/verify', authentication, async (req: Request, res: Response) => {
    try{
        //if (req.user.role !== 'police' || req.user.role !== 'admin') return res.sendStatus(403); 
        const result = await verifyUser(req.user.id, req.params.id);
        if(result.TxID) return res.send({success: true});
        return res.send({success: false});
    }catch(error){
        console.log(error);
    }
    
})
router.get('/activeAccount/:id', async (req: Request, res: Response) => {
    try{
        //if (req.user.role !== 'police' || req.user.role !== 'admin') return res.sendStatus(403); 
        const result = await activeAccount(req.params.id);
        if(result) 
            return res.sendFile( path.join(__dirname+'/activePage.html'));
        return  res.send("<html><script>alert('Kích hoạt tài khoản thất bại');</script></html>") ;
        return res.send({success: false});
    }catch(error){
        console.log(error);
    }
    
})

router.get('/:id/transferRequest', authentication, async (req: Request, res: Response) => {
    const queryResult: any = {}
    queryResult.selector = {
        docType: "transfer",
        newOwner: req.user.id,
        $or: [
            { state: 0 },
            { state: 1 },
        ],
    };
    const result = await queryCars(req.user.id, JSON.stringify(queryResult));
    res.json(result);
})

router.get('/:id/cars/pending', authentication, async (req: Request, res: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'car',
            owner: req.user.id,
            registrationState: 'pending'
        }
        const queryResult = await queryCars(req.user.id, JSON.stringify(queryString));
        // console.log("Car pending:",queryResult );
        const car = queryResult[0].Record;
        car.registeredCity = await getCity(car.registeredCity);
        car.registeredDistrict = await getDistrict(car.registeredDistrict);
        car.carType= await getCarType(car.carType)
        res.json(car);
    } catch (error) {
        console.log(error);
        res.send({error});
    }
})

router.get('/:id/cars/registered', authentication, async (req: Request, res: Response) => {
    try {
        // if (req.user.id !== req.params.id){
        //     res.sendStatus(403);
        // }
        const queryString: any = {};
        queryString.selector = {
            docType: 'car',
            owner: req.user.id,
            $or: [
                {registrationState: 'registered'},
                {registrationState: 'transferring_ownership'}
            ]
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        // console.log("Ket qua xe da dang ky: ",result);
        const response = await Promise.all(result.map(async (car: { Record: any; }) => {
                const city = await getCity(car.Record.registeredCity);
                car.Record.registeredCity= city;
                const carType = await getCarType(car.Record.carType);
                car.Record.carType= carType;
            return car.Record;
        }));
        return res.send(response);
        // res.json(result);
    } catch (error) {
        console.log(error);
        res.json({error});
    }
})


router.get('/:id/cars/transferring', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police' && req.user.id !== req.params.id){
            res.sendStatus(403);
        }
        const queryString: any = {};
        queryString.selector = {
            docType: 'transfer',
            currentOwner: req.params.id,
            state: 0
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        if (result.length > 0) {
            const userQuery: any = {};
            userQuery.selector = {
                docType: 'user',
                id: result[0].Record.newOwner
            }
            const newOwner = await queryUser(req.user.id, JSON.stringify(userQuery));
            if (newOwner.length > 0) {
                delete newOwner[0].Record.password;
                result[0].Record.newOwner = newOwner[0].Record;
                // result[0].Record.newOwner.address=result[0].Record.newOwner.address.toString()+", "+ result[0].Record.newOwner.district.districtName.toString()+", "+result[0].Record.newOwner.city.name.toString();
            }
        }
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({error});
    }
})




export default router; 









