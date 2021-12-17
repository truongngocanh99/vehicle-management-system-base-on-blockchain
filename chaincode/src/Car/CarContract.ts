import { Contract ,Context } from 'fabric-contract-api';
import { assetType, Car, TransferOffer} from './Car';
import { User } from '../User/User';
import { Object } from './object';
import { City, District } from './city';
import { Booking, Schedule } from './booking';
import { stringify } from 'querystring';
import { nanoid } from 'nanoid';
import { carType } from './carType';


const DOCTYPE = 'car';
const ASSET_TYPE= 'car';
const PENDING_REGISTRATION_NUMBER = 'none';
const REGISTRATION_STATE = {
    PENDING: 'pending',
    REGISTERED: 'registered',
    REJECTED: 'rejected',
    TRANSFERRING_OWNERSHIP: 'transferring_ownership',
}
const CHANGE_OWNER_STATE = {
    PENDING: 0,
    APPROVED: 1,
    CONFIRMED: 2,
    REJECTED: 3,
}

const MODIFY_TYPE = {
    REGISTRY: 0,
    COMPLETE_REGISTRATION: 1,
    CANCEL_REGISTRATION: 2,
    CHANGE_OWNER: 3,
    UPDATE_CAR: 4,
    CONFIRM_TRANSFER: 5,
    APPROVED_TRANSFER: 6,
    CANCEL_TRANSFER: 7,
    CONFIRM_REGISTRATION:8
}

const CONTRACT_NAME = 'car';
const BOOLEAN_STRING = {
    true: 'true',
    false: 'false',
}
const STATUS = {
    NEW: 0,
    DONE: 1,
    CANCEL: 2,
}
export class CarContract extends Contract {

    constructor(){
        super(CONTRACT_NAME);
    }
    //CHAINCODE REGISTRATION
    public async createRegistration(ctx: Context, ...params: string[]): Promise<string>{
        try {
            const car: Car = {
                id: params[0],
                registrationNumber: PENDING_REGISTRATION_NUMBER,
                engineNumber: params[1],
                chassisNumber: params[2],
                brand: params[3],
                model: params[4],
                color: params[5],
                year: params[6],
                capacity: params[7],
                owner: params[8], 
                registeredCity: params[9],
                registeredDistrict: params[10],
                carType:params[11],
                assetType: ASSET_TYPE,
                registrationState: REGISTRATION_STATE.PENDING,
                createTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
                modifyTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
                modifyType: 0,
                modifyUser: this.getUserId(ctx),
                docType: DOCTYPE,
            };
            await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
            return JSON.stringify({
                TxID: ctx.stub.getTxID(),
                regId: car.id,
            })
        } catch (error) {
            console.log(error);
            return "";
        }
    }

    public async updateRegistration(ctx: Context, carId: string, payload: string){
        try {
            const carAsBytes = await ctx.stub.getState(carId);
            const newInfo = JSON.parse(payload);
            const car = JSON.parse(carAsBytes.toString());
            const updateCar: Car = {...car, ...newInfo};
            updateCar.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
            updateCar.modifyType = MODIFY_TYPE.UPDATE_CAR;
            updateCar.modifyUser = this.getUserId(ctx);
            await ctx.stub.putState(updateCar.id, Buffer.from(JSON.stringify(updateCar)));
            return {error: null};
        } catch (error) {
            return {error: error}
        }
    }


    public async acceptRegistration(ctx: Context,  carId: string, registrationNumber: string): Promise<string> {
        const carAsBytes = await ctx.stub.getState(carId);
        let car: Car;
        try {
            car = JSON.parse(carAsBytes.toString());
        } catch (error) {
            return "";
        }
        car.processedPolice = this.getUserId(ctx);
        car.registrationNumber = registrationNumber;
        car.registrationState = REGISTRATION_STATE.REGISTERED;
        car.registrationTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyType = MODIFY_TYPE.COMPLETE_REGISTRATION;
        car.modifyUser = this.getUserId(ctx);
        await ctx.stub.putState(carId, Buffer.from(JSON.stringify(car)));
        return ctx.stub.getTxID();
    }

    public async rejectRegistration(ctx: Context,  carId: string): Promise<string> {
        const carAsBytes = await ctx.stub.getState(carId);
        let car: Car;
        try {
            car = JSON.parse(carAsBytes.toString());
        } catch (error) {
            return "";
        }
        car.processedPolice = this.getUserId(ctx);
        car.registrationState = REGISTRATION_STATE.REJECTED;
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyUser = this.getUserId(ctx);
        car.modifyType = MODIFY_TYPE.CANCEL_REGISTRATION;
        await ctx.stub.putState(carId, Buffer.from(JSON.stringify(car)));
        return ctx.stub.getTxID();
    }

    public async confirmRegistration(ctx: Context, carId: string): Promise<string> {
        const userAsByte = await ctx.stub.getState(this.getUserId(ctx));
        const user: User = JSON.parse(userAsByte.toString());
        if(user.role !== 'police') return "PERMISSION DENIED";
        const carAsBytes = await ctx.stub.getState(carId);
        const car: Car = JSON.parse(carAsBytes.toString());
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyType = MODIFY_TYPE.CONFIRM_REGISTRATION;
        car.modifyUser = this.getUserId(ctx);
        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        return ctx.stub.getTxID();
    }

    public async deleteCar(ctx: Context, carId) {
        await ctx.stub.deleteState(carId)
    }

    public async queryAllCars(ctx: Context) {
        const queryString: any = { };
        queryString.selector = {
            docType: DOCTYPE,
        };
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async queryCarById(ctx: Context, carId: string) {
        try {
            const queryString: any = { };
            queryString.selector = {
                docType: DOCTYPE,
                id: carId
            };
            queryString.use_index = ['_design/indexIdDoc', 'indexId']
            const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
            return JSON.parse(queryResult)[0];
        } catch (error) {
            console.log(error);
            return false;
        }
    }


    public async queryCarByRegistrationNumber(ctx: Context, registrationNumber: string): Promise<string>{
        const queryString: any = {}
        queryString.selector = {
            registrationNumber: registrationNumber,
        }
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult)[0];
    }


    public async queryPendingCarByOwnerPhoneNumber(ctx: Context, phoneNumber: string): Promise<string>{
        const queryString: any = {}
        queryString.selector = {
            owner: phoneNumber,
            registrationState: REGISTRATION_STATE.PENDING,
        }
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async queryAllProcessingCar(ctx: Context): Promise<string>{
        const queryString: any = {}
        queryString.selector = {
            registrationState: REGISTRATION_STATE.PENDING,
        }
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async getQueryResultForQueryString(ctx: Context, queryString: string): Promise<string> {
		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this.getAllResults(resultsIterator, false);
		return JSON.stringify(results);
	}


    public async queryResult(ctx: Context, queryString: string): Promise<any> {
		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this.getAllResults(resultsIterator, false);
		return results;
	}


    public async getAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes: any = {};
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.tx_id;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}


    private getUserId(ctx: Context): string {
        const rs = ctx.clientIdentity.getID();
        const find = rs.match(/[A-Za-z0-9_-]{22}/);
        if(find === null) return 'admin';
        return find![0];
    }
    //CHAINCODE TRANSFER
    public async createTransferOffer(ctx: Context,requestId: string, carId: string, currentOwner: string, newOwner: string): Promise<string> {
        const carAsBytes = await ctx.stub.getState(carId);
        const car: Car = JSON.parse(carAsBytes.toString())
        car.modifyType = MODIFY_TYPE.CHANGE_OWNER;
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyUser = currentOwner;
        car.registrationState = REGISTRATION_STATE.TRANSFERRING_OWNERSHIP;
        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        const request: TransferOffer = {
            id: requestId,
            currentOwner: currentOwner,
            newOwner: newOwner,
            carId: carId,
            state: CHANGE_OWNER_STATE.PENDING,
            createTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            modifyTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            docType: 'transfer'
        }
        await ctx.stub.putState(request.id, Buffer.from(JSON.stringify(request)));
        return ctx.stub.getTxID();
    }

    
    public async queryChangeOwnerRequest(ctx: Context, newOwner: string){
        const queryString: any = {};
        queryString.selector = {
            newOwner: newOwner,
            state: CHANGE_OWNER_STATE.PENDING,
            docType: DOCTYPE
        };
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async approveTransfer(ctx: Context, TransferOfferId: string): Promise<string> {
        const dealAsByte = await ctx.stub.getState(TransferOfferId);
        const deal: TransferOffer = JSON.parse(dealAsByte.toString());
        if(deal.newOwner !== this.getUserId(ctx)) return "PERMISSION DENIED";

        deal.state = CHANGE_OWNER_STATE.APPROVED;
        deal.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        
        const carAsBytes = await ctx.stub.getState(deal.carId);

        const car: Car = JSON.parse(carAsBytes.toString());

        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyType = MODIFY_TYPE.APPROVED_TRANSFER;
        car.modifyUser = this.getUserId(ctx);

        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        await ctx.stub.putState(deal.id, Buffer.from(JSON.stringify(deal)));

        return ctx.stub.getTxID();
    }


    public async confirmTransfer(ctx: Context, transferRequestId: string): Promise<string> {
        const userAsByte = await ctx.stub.getState(this.getUserId(ctx));
        const user: User = JSON.parse(userAsByte.toString());
        if(user.role !== 'police') return "PERMISSION DENIED";

        const dealAsByte = await ctx.stub.getState(transferRequestId);
        const deal: TransferOffer = JSON.parse(dealAsByte.toString());

        deal.state = CHANGE_OWNER_STATE.CONFIRMED;
        deal.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();

        await ctx.stub.putState(deal.id, Buffer.from(JSON.stringify(deal)));
        
        const carAsBytes = await ctx.stub.getState(deal.carId);

        const car: Car = JSON.parse(carAsBytes.toString());

        car.owner = deal.newOwner;
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyType = MODIFY_TYPE.CONFIRM_TRANSFER;
        car.modifyUser = this.getUserId(ctx);
        car.registrationState = REGISTRATION_STATE.REGISTERED

        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        
        return ctx.stub.getTxID();
    }

    public async rejectTransfer(ctx: Context, transferId: string) {
        const userAsByte = await ctx.stub.getState(this.getUserId(ctx));
        const user: User = JSON.parse(userAsByte.toString());
        const dealAsByte = await ctx.stub.getState(transferId);
        const deal: TransferOffer = JSON.parse(dealAsByte.toString());
        const carAsBytes = await ctx.stub.getState(deal.carId);
        const car: Car = JSON.parse(carAsBytes.toString());
        if ([deal.newOwner, deal.currentOwner].includes(user.id) || user.role ==='police'){
            deal.state = CHANGE_OWNER_STATE.REJECTED,
            deal.rejectUser = user.id;
            await ctx.stub.putState(deal.id, Buffer.from(JSON.stringify(deal)));
            car.modifyType = MODIFY_TYPE.CANCEL_TRANSFER;
            car.modifyUser = user.id;
            car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
            car.registrationState = REGISTRATION_STATE.REGISTERED
            await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
            return ctx.stub.getTxID();
        }
        else return "PERMISSION DENIED"
    }



    public async isOwnerOfCar(ctx: Context, carId: string, userId: string): Promise<string>{
        const queryString: any = {};
        queryString.selector = {
            id: carId,
            owner: userId,
            docType: DOCTYPE,
        }
        const queryResult = await this.queryResult(ctx, JSON.stringify(queryString));
        if(queryResult.length === 0) {
            return BOOLEAN_STRING.false
        }
        return BOOLEAN_STRING.true;
    }

    public async getHistory(ctx: Context, id: string) {
        const history = await ctx.stub.getHistoryForKey(id);
        const result = await this.getAllResults(history, true);
        return result;
    }

    //              CHAINCODE   CITY
// them tinh thanh/diem dang ky
public async addCity(ctx: Context, payload: string) {
    try {
        const city: City = JSON.parse(payload);
        city.docType = "city";
        city.current_numberIndex = 0;
        city.number_of_license_plates = 0;
        city.threefirstNumber = 0;
        await ctx.stub.putState(city.id, Buffer.from(JSON.stringify(city)));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
// cap nhat tinh thanh/diem dang ky(them quan/huyen thuoc tinh)
public async updateCity(ctx: Context, payload: string) {
    try {
        const city: District = JSON.parse(payload);
        await ctx.stub.putState(city.id, Buffer.from(JSON.stringify(city)));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

// cap nhat ki hieu dia phuong dang ky 
public async updateNumber(ctx: Context, cityId: string){
    try {
        const cityAsBytes = await ctx.stub.getState(cityId);//get city from chaincode state
        //kiem tra su ton tai car
        if (!cityAsBytes || cityAsBytes.length === 0) {
            throw new Error(`${cityId} does not exist`);
        }
        const city = JSON.parse(cityAsBytes.toString());
        city.current_numberIndex++;
        await ctx.stub.putState(city.id, Buffer.from(JSON.stringify(city)));
        return {error: null};
    } catch (error) {
        return {error: error}
    }
}    
    // cap nhat 3 so dau tien dia phuong dang ky 
    public async update3fn(ctx: Context, id: string){
        try {
            const obAsBytes = await ctx.stub.getState(id);
            //kiem tra su ton tai car
            if (!obAsBytes || obAsBytes.length === 0) {
                throw new Error(`${id} does not exist`);
            }
            const city = JSON.parse(obAsBytes.toString());
            city.threefirstNumber++;
            await ctx.stub.putState(city.id, Buffer.from(JSON.stringify(city)));
            return {error: null};
        } catch (error) {
            return {error: error}
        }
    }
      // cap nhat so luong bien so da cap
      public async updateNumberofPlate(ctx: Context, cityid: string){
        try {
            const obAsBytes = await ctx.stub.getState(cityid);//get object from chaincode state
            //kiem tra su ton tai car
            if (!obAsBytes || obAsBytes.length === 0) {
                throw new Error(`${cityid} does not exist`);
            }
            const city = JSON.parse(obAsBytes.toString());
            city.number_of_license_plates++;
            await ctx.stub.putState(city.id, Buffer.from(JSON.stringify(city)));
            return {error: null};
        } catch (error) {
            return {error: error}
        }
    }
        //          CHAINCODE DISTRICT
// them quan /huyen 
public async addDistrict(ctx: Context, payload: string) {
    try {
        const district: District = JSON.parse(payload);
        district.docType = 'district';
        await ctx.stub.putState(district.id, Buffer.from(JSON.stringify(district)));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
// sua 1 quan/huyen
    public async updateDistrict(ctx: Context, payload: string) {
        try {
            const district: District = JSON.parse(payload);
            await ctx.stub.putState(district.id, Buffer.from(JSON.stringify(district)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    //              CHAINCODE   OBJECT 
    // them doi tuong dang ky xe
    public async addObject(ctx: Context, payload: string){
        try{
            const object: Object = JSON.parse(payload);
            object.docType = "object";
            object.currentseri_Index = 0;
            await ctx.stub.putState(object.id, Buffer.from(JSON.stringify(object)));
            return JSON.stringify({
                TxID: ctx.stub.getTxID(),
                ObId: object.id,
            })
        }catch (error) {
            console.log(error);
            return false;
        }
    }
    // cap nhat doi tuong dang ky xe
    public async updateObject(ctx: Context, payload: string) {
        try {
            const object: Object = JSON.parse(payload);
            const objectAsBytes: Uint8Array= await ctx.stub.getState(object.id);
            const currentOb: Object = JSON.parse(objectAsBytes.toString());
            const newOb: Object = { ...currentOb, ...object};
            await ctx.stub.putState(newOb.id, Buffer.from(JSON.stringify(newOb)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // Khoi tao count cho object
    public async InitCount(ctx: Context, objectId: string,lengthSeri: number) {
        try {
            
            const objectAsBytes = await ctx.stub.getState(objectId);
            if (!objectAsBytes || objectAsBytes.length === 0) {
                throw new Error(`${objectId} does not exist`);
            }
            const ob = JSON.parse(objectAsBytes.toString());
            ob.count = [];
            let test_count = [];
            for(let i = 0; i< Number(lengthSeri); i++){
                test_count.push(0);  
            }
            ob.count = test_count;
            await ctx.stub.putState(ob.id, Buffer.from(JSON.stringify(ob)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // cap nhat ki hieu dia phuong dang ky tuan tu
    public async updateSeri(ctx: Context, objectId: string){
        try {
            const obAsBytes = await ctx.stub.getState(objectId);//get object from chaincode state
            //kiem tra su ton tai object 
            if (!obAsBytes || obAsBytes.length === 0) {
                throw new Error(`${objectId} does not exist`);
            }
            const object = JSON.parse(obAsBytes.toString());
            object.currentseri_Index++;
            await ctx.stub.putState(object.id, Buffer.from(JSON.stringify(object)));
            return {error: null};
        } catch (error) {
            return {error: error}
        }
    }
    // Chuyen ki hieu seri dang ki dia phuong tuy y
    public async changeSeri(ctx: Context,objectId:string ,seriIndex:number ){
        try{
            const obAsBytes = await ctx.stub.getState(objectId);
            if (!obAsBytes || obAsBytes.length === 0) {
                throw new Error(`${objectId} does not exist`);
            }
            const object = JSON.parse(obAsBytes.toString());
            object.currentseri_Index = seriIndex;
            await ctx.stub.putState(object.id, Buffer.from(JSON.stringify(object)));
            return {error: null};
            
        }catch (error) {
            console.log(error);
            return false;
        }

    }
    public async countSeri(ctx: Context,objectId:string ){
        try{
            const obAsBytes = await ctx.stub.getState(objectId);
            if (!obAsBytes || obAsBytes.length === 0) {
                throw new Error(`${objectId} does not exist`);
            }
            const object = JSON.parse(obAsBytes.toString());
            object.count[object.currentseri_Index]++;
            await ctx.stub.putState(object.id, Buffer.from(JSON.stringify(object)));
            return {error: null};
            
        }catch (error) {
            console.log(error);
            return false;
        }

    }

    public async addNewSeri(ctx: Context, objectId:string,newSeri:string){
        try {
            const obAsBytes = await ctx.stub.getState(objectId);
        if (!obAsBytes || obAsBytes.length === 0) {
            throw new Error(`${objectId} does not exist`);
        }
        const object = JSON.parse(obAsBytes.toString());
        object.seri.push(newSeri);
        object.count.push(0);
        await ctx.stub.putState(object.id, Buffer.from(JSON.stringify(object)));
        return true;
            
        } catch (error) {
            console.log(error);
            return false;
            
        }
    }
    //      CHAINCODE CARTYPE
    public async addCarType(ctx: Context, payload: string){
        try{
            const carType: carType = JSON.parse(payload);
            carType.docType = "carType";
            await ctx.stub.putState(carType.id, Buffer.from(JSON.stringify(carType)));
            return true;
        }catch (error) {
            console.log(error);
            return false;
        }
    }

    public async updateCarType(ctx: Context, payload: string) {
        try {
            const object: carType = JSON.parse(payload);
            const objectAsBytes: Uint8Array= await ctx.stub.getState(object.id);
            const currentOb: carType = JSON.parse(objectAsBytes.toString());
            const newOb: carType = { ...currentOb, ...object};
            await ctx.stub.putState(newOb.id, Buffer.from(JSON.stringify(newOb)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

//      CHAINCODE SHEDULE
//KHOI TAO THOI BIEU XU LY HO SO
    public async addSchedule(ctx: Context, payload: string) {
        try {
            const schedule : Schedule = JSON.parse(payload);
            schedule.docType = "schedule";
            schedule.currentNumber = 0;
            schedule.maxNumber = 10;
            await ctx.stub.putState(schedule.id, Buffer.from(JSON.stringify(schedule)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
// CHINH SUA THOI BIEU   
public async updateSchedule(ctx: Context, payload: string) {
    try {
        const schedule: Schedule = JSON.parse(payload);
        const scheduleAsBytes: Uint8Array= await ctx.stub.getState(schedule.id);
        const currentSc: Object = JSON.parse(scheduleAsBytes.toString());
        const newSc: Object = { ...currentSc, ...schedule};
        await ctx.stub.putState(newSc.id, Buffer.from(JSON.stringify(newSc)));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
// update tang so luong ho so theo id 
public async updateOrdinalNumber(ctx: Context, id: any){
    try {
        const obAsBytes = await ctx.stub.getState(id);//get object from chaincode state
        //kiem tra su ton tai car
        if (!obAsBytes || obAsBytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }
        const schedule = JSON.parse(obAsBytes.toString());
        schedule.currentNumber++;
        await ctx.stub.putState(schedule.id, Buffer.from(JSON.stringify(schedule)));
        return {error: null};
    } catch (error) {
        return {error: error}
    }
}


//          CHAINCODE   BOOKING
//KHOI TAO LICH HEN
    // them tinh thanh/diem dang ky
    public async addBooking(ctx: Context, payload: string) {
        try {
            const booking: Booking = JSON.parse(payload);
            booking.docType = "booking";
            booking.status= STATUS.NEW;
            await ctx.stub.putState(booking.id, Buffer.from(JSON.stringify(booking)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }
//  HUY BO LICH HEN
//tu choi dang ky
public async deleteBooking(ctx: Context,  Id: string): Promise<string> {
    const bookingAsBytes = await ctx.stub.getState(Id);
    if (!bookingAsBytes || bookingAsBytes.length === 0) {
        throw new Error(`${Id} does not exist`);
    }
    try {
        const booking :Booking= JSON.parse(bookingAsBytes.toString());
        booking.status=STATUS.CANCEL
        await ctx.stub.putState(booking.id, Buffer.from(JSON.stringify(booking)));
        return ctx.stub.getTxID();
    } catch (error) {
        return "";
    }
    
}
// update booking
public async updateBooking(ctx: Context, payload: string) {
    try {
        const booking: Booking = JSON.parse(payload);
        const bookingAsBytes: Uint8Array= await ctx.stub.getState(booking.id);
        const currentSc: Object = JSON.parse(bookingAsBytes.toString());
        const newSc: Object = { ...currentSc, ...booking};
        await ctx.stub.putState(newSc.id, Buffer.from(JSON.stringify(newSc)));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
//Hoan thanh Booking 
public async finishBooking(ctx: Context, bookingId: string):Promise<string>  {
    const bookingAsBytes = await ctx.stub.getState(bookingId);
    if (!bookingAsBytes || bookingAsBytes.length === 0) {
        throw new Error(`${bookingId} does not exist`);
    }
    try { 
        const booking : Booking= JSON.parse(bookingAsBytes.toString());
        booking.status= STATUS.DONE;
        await ctx.stub.putState(booking.id, Buffer.from(JSON.stringify(booking)));
        return ctx.stub.getTxID();
    } catch (error) {
        console.log(error);
        return "";
    }
}

// Giảm so lượng đăng kí khi lịch bị hủy 
public async reduceOrdinalNumber(ctx: Context, scheduleId: string){
    try {
        const scheduleAsBytes = await ctx.stub.getState(scheduleId);//get city from chaincode state
        //kiem tra su ton tai car
        if (!scheduleAsBytes || scheduleAsBytes.length === 0) {
            throw new Error(`${scheduleId} does not exist`);
        }
        const schedule = JSON.parse(scheduleAsBytes.toString());
        schedule.currentNumber--
        await ctx.stub.putState(schedule.id, Buffer.from(JSON.stringify(schedule)));
        return {error: null};
    } catch (error) {
        return {error: error}
    }
}

//                  CHAINCODE ASSETTYPE
public async addAssetType(ctx: Context, payload: string){
    try{
        const asset: assetType = JSON.parse(payload);
        asset.docType = "assetType";
        await ctx.stub.putState(asset.id, Buffer.from(JSON.stringify(asset)));
        return JSON.stringify({
            TxID: ctx.stub.getTxID(),
            AssetID: asset.id,
        })
    }catch (error) {
        console.log(error);
        return false;
    }
}
// cap nhat doi tuong dang ky xe
public async updateAssetType(ctx: Context, payload: string) {
    try {
        const asset: assetType = JSON.parse(payload);
        const assetAsBytes: Uint8Array= await ctx.stub.getState(asset.id);
        const currentAT: assetType = JSON.parse(assetAsBytes.toString());
        const newAT: assetType = { ...currentAT, ...asset};
        await ctx.stub.putState(newAT.id, Buffer.from(JSON.stringify(newAT)));
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

}