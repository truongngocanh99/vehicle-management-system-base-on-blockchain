import { Router, Request, Response, query } from 'express';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import {
    addCity,
    addDistrict,
    queryCars,
    updateCity,
    updateDistrict,
    switchNumber,
    updateNumberofPlate,
    update3fn,
    deleteCar,
    getCity,
    getNameCity,
    getNameDistrict
} from '../fabric/car/Car.fabric';

const router = Router();

// route add a city
router.post('/', authentication, async (request: Request, response: Response) => {
    try {
        const {city, districts} = request.body;
       // const city = request.body;
        city.id = "C"+ nanoid().toUpperCase();
        const results = await addCity(request.user.id, city);
        // console.log(results);
        for (let i = 0; i < districts.length; i++) {
            districts[i].id = "D" + nanoid().toUpperCase();
            districts[i].city = city.id;
            await addDistrict(request.user.id, districts[i]);
        }
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
// route update a city
router.put('/', authentication, async (request: Request, response: Response) => {
    try {
        const {city, districts} = request.body;
        const results = await updateCity(request.user.id, city);
        for (let i = 0; i < districts.length; i++) {
            if (typeof districts[i].id === 'undefined') {
                districts[i].id = "D" + nanoid();
                districts[i].city = city.id;
                districts[i].docType = 'district'
            }

            await updateDistrict(request.user.id, districts[i]);
        }
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
// get city
router.get('/', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'city',
            ...request.query
        }
        if(request.query.number) {
            queryString.selector.number = {
                $elemMatch: {
                    $eq: request.query.number
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
        const resultResponse = await Promise.all(result.map((city: { Record: any; }) => city.Record))
        return response.send(resultResponse);
    } catch (error) {
        console.log(error);
    }
})
// xoa city
router.delete('/:id',authentication, async (req: Request, res: Response)=>{
    try{
        const id = req.params.id;
        const rs = await deleteCar(req.user.id,id);
        res.send({suscess: true});
    }catch (error) {
        res.send({success: false});
    }
})
// get city
router.get('/all', async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'city',
            ...request.query
        }
        if(request.query.number) {
            queryString.selector.number = {
                $elemMatch: {
                    $eq: request.query.number
                }
            };
        }
        if(request.query.id) {
            delete queryString.selector.id;
            queryString.selector.$not = {
                id: request.query.id
            }
        }
        const result = await queryCars('admin', JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map((city: { Record: any; }) => city.Record))
        return response.send(resultResponse);
    } catch (error) {
        console.log(error);
    }
})
// route get list district of a city
router.get('/:cityId/district', authentication, async (req: Request, res: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'district',
            city: req.params.cityId,
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map((district: { Record: any; }) => district.Record))
        return res.send(resultResponse);
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
})
// route get list district of a city
router.get('/:cityId/districts', async (req: Request, res: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'district',
            city: req.params.cityId,
        }
        const result = await queryCars('admin', JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map((district: { Record: any; }) => district.Record))
        return res.send(resultResponse);
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
})
// chuyen ki hieu dia phuong dang ky 
router.put('/:cityid/switchNumber', authentication, async (request: Request, response: Response) => {
    try {
        const cityid= request.params.cityid;
        const results = await switchNumber(request.user.id, cityid);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
router.put('/:cityid/updateNumberofPlate', authentication, async (request: Request, response: Response) => {
    try {
        const cityid= request.params.cityid;
        const results = await updateNumberofPlate(request.user.id, cityid);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
router.put('/:cityid/update3fn', authentication, async (request: Request, response: Response) => {
    try {
        const cityid= request.params.cityid;
        const results = await update3fn(request.user.id, cityid);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})
//Get name of  city by id
router.get('/:id', authentication, async (req: Request, res: Response) => {
    try{
        const queryResult: any = {}
        queryResult.selector = {
        docType: 'city',
        id: req.params.id
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryResult));
        res.json(result[0].Record.name);
        return result[0].Record.name
       // return result[0].Record
        

    }catch (error) {
        res.send({success: false});
    }
    
});



export default router;