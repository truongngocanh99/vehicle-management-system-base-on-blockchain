import { Router, Request, Response, query } from 'express';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import {
    queryCars,
    addCarType,
    updateCarType,
    deleteCar,
    carType,
} from '../fabric/car/Car.fabric';

const router = Router();
// API them 1 loai xe
router.post('/', authentication, async (request: Request, response: Response) => {
    try {
        const cType: carType ={
            id :"T"+ nanoid().toUpperCase(),
            name:request.body.name,
            description:request.body.description,
        }
        
         await addCarType(request.user.id, cType);
         return response.status(201).json({
            success: true,
            message: `Dang ky thanh cong doi tuong ${request.body.name}`
        })
    } catch (error) {
        response.send({success: false});
    }
})
// API chinh sua loai xe dang ky
router.put('/:id', authentication, async (request: Request, response: Response) => {
    try {
        const carType= request.body;
        carType.id=request.params.id;
        const results = await updateCarType(request.user.id, carType);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
// truy van thong tin loai xe dang ky
router.get('/', async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'carType',
            ...request.query
        }
        if(request.query.id) {
            delete queryString.selector.id;
            queryString.selector.$not = {
                id: request.query.id
            }
        }
        const result = await queryCars('admin', JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map((carType: { Record: any; }) => carType.Record))
        //console.log(resultResponse);
        return response.send(resultResponse);
    } catch (error) {
        console.log(error);
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

export default router;