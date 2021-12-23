import { Router, Request, Response, query } from 'express';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import {
    queryCars,
    addObject,
    updateObject,
    switchSeri,
    deleteCar,
    changeSeri,
    countSeri,
    getObject,
    InitCount,
    addNewSeri,
    getOb,
    getCT,
    getCarType,

} from '../fabric/car/Car.fabric';
import {
    queryUser
} from '../fabric/user/User.fabric';
const router = Router();
// API them 1 to chuc dang ky xe
router.post('/', authentication, async (request: Request, response: Response) => {
    try {
        const object: Object ={
            id :"O"+ nanoid().toUpperCase(),
            carType:request.body.carType,
            city: request.body.city,
            seri: request.body.seri,
        }
        
         const ob = await addObject(request.user.id, object);
         const rs_ob = await getObject(ob.ObId);
         await InitCount(request.user.id,ob.ObId,rs_ob.seri.length);
         return response.status(201).json({
            success: true,
            message: `Dang ky  doi tuong thanh cong`
        })
    } catch (error) {
        response.send({success: false});
    }
})
// API chinh sua to chuc dang ky xe
router.put('/:id', authentication, async (request: Request, response: Response) => {
    try {
        const object= request.body;
        object.id=request.params.id;
        const results = await updateObject(request.user.id, object);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
// truy van thong tin to chuc dang ky xe
router.get('/:city', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'object',
            city:request.params.city,
            ...request.query
        }
        if(request.query.seri) {
            queryString.selector.seri = {
                $elemMatch: {
                    $eq: request.query.seri
                }
            };
        }
        if(request.query.id) {
            delete queryString.selector.id;
            queryString.selector.$not = {
                id: request.query.id
            }
        }
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        // console.log("Thong tin Ob ne: ",request.params.city +",",result);
        const resultResponse = await Promise.all(result.map(async(object: { Record: any; }) => {
            const detail_carType = await getCT(object.Record.carType);
            object.Record.carType=detail_carType;
            return object.Record
        }
            
        ))
        return response.send(resultResponse);
    } catch (error) {
        console.log(error);
    }
})
// chuyen seri tuan tu
router.put('/swicthSeri/:objectId', authentication, async (request: Request, response: Response) => {
    try {
        const id = request.params.objectId;
        const results = await switchSeri(request.user.id, id);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
router.put('/addNewSeri/:objectId', authentication, async (request: Request, response: Response) => {
    try {
        const id = request.params.objectId;
        const newSeri=request.body.newSeri;
        const results = await addNewSeri(request.user.id, id,newSeri);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
// Doi seri tuy y
router.put('/changeSeri/:objectId', authentication, async (request: Request, response: Response) => {
    try {
        const id = request.params.objectId;
        const seriIndex = request.body.seriIndex;
        const results = await changeSeri(request.user.id, id,seriIndex);
        response.send({success: true});
       
        
    } catch (error) {
        response.send({success: false});
    }
})
router.put('/countSeri/:objectId', authentication, async (request: Request, response: Response) => {
    try {
        const id = request.params.objectId;
        const results = await countSeri(request.user.id,id);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
router.delete('/:id',authentication, async (req: Request, res: Response)=>{
    try{
        const id = req.params.id;
        const rs = await deleteCar(req.user.id,id);
        res.send({suscess: true});
    }catch (error) {
        res.send({success: false});
    }
})
router.get('/getSeri/:objectId', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'object',
            id:request.params.objectId,
        }
        
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        // console.log("Thong tin Ob ne: ",request.params.objectId +",",result);
        return response.send(result[0].Record.seri);
    } catch (error) {
        console.log(error);
    }
})
router.get('/isExist/:city', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'object',
            city:request.params.city,
        }
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        console.log(result);
        let result_map: any = await Promise.all(result.map(async (state: { Record: any; }) => {
            const object = state.Record.carType;
            return object;
        }));
        return response.send(result_map);
    } catch (error) {
        console.log(error);
    }
})
router.get('/getSeriObject/', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'object',
            ...request.query,
        }
        if(request.query.carType){
            queryString.selector.carType=request.query.carType;
        }
        if(request.query.city){
            queryString.selector.city=request.query.city;
        }
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        console.log("Thong tin Ob ne: ", result);
        return response.send(result.seri);
    } catch (error) {
        console.log(error);
    }
})
router.get('/carTypeAndCity/:objectId', authentication, async (req: Request, res: Response) => {
    const objectId = req.params.objectId;
    const result = await getObject(objectId);
    res.json(result);
});
router.get('/carTypeAndCity', authentication, async (req: Request, res: Response) => {
    const carType = req.body.carType;
    const city = req.body.city;
    const result = await getOb(carType,city);
    res.json(result);
});
router.get('/getCity/:city', async (req: Request, res: Response) => {
    const city = req.body.city;
    const result = await getCT(city);
    res.json(result);
});
router.get('/getSeriCity/:city', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'object',
            city : request.params.city
        }
        let seri_array= new Array();
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        if(result.length > 0){
            let seri: any = await Promise.all(result.map(async (state: { Record: any; }) => {
                const object = state.Record.seri;
                seri_array = seri_array.concat(object);
                return seri_array;
            }));
            return response.json(seri[seri.length-1]);
        }else return response.json(seri_array);         
    } catch (error) {
        console.log(error);
    }
})
export default router;