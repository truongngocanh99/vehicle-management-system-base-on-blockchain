import { getCarContract } from './CommonFuntion';
import { Booking, Car, carType, City, District, Object, Schedule } from './CarInterface';
import { nanoid } from 'nanoid';
export { Car, City, District,carType, Object, Schedule, Booking } from './CarInterface';

//  FABRIC CAR
export async function registryCar(car: Car, phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const params: Array<any> = [
            car.id,
            car.engineNumber,
            car.chassisNumber,
            car.brand,
            car.model,
            car.color,
            car.year,
            car.capacity,
            car.owner,
            car.registeredCity,
            car.registeredDistrict,
            car.carType,
        ]
        const result = await contract.submitTransaction('createRegistration', ...params);
        return { success: true, result: JSON.parse(result.toString()) };
    } catch (error) {
        return { success: false, result: { error: error } };
    }
}


export async function updateRegistration(userId: string, carId: string, payload: any) {
    try {
        const contract = await getCarContract(userId);
        const result = await contract.submitTransaction('updateRegistration', carId, JSON.stringify(payload));
        return JSON.parse(result.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export async function acceptCarRegistration(carId: string, registrationNumber: string, phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const TxID = await contract.submitTransaction('acceptRegistration', carId, registrationNumber);
        if (TxID.toString().length !== 0) {
            return { success: true, result: { TxID: TxID.toString() }};
        }
        else {
            throw new Error("Không thể hoàn thành đăng ký");
        }
    } catch (error) {
        return { success: false, result: { msg: error }};
    }
}

export async function rejectCarRegistration(carId: string, phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const TxID = await contract.submitTransaction('rejectRegistration', carId);
        if (TxID.toString().length !== 0) {
            return { success: true, result: { TxID: TxID.toString() }};
        }
        else {
            throw new Error("Không thể hoàn thành đăng ký");
        }
    } catch (error) {
        return { success: false, result: { msg: error }};
    }
}
export async function confirmRegistration(userId: string,carId: string){
    try {
        const contract = await getCarContract(userId);
        const result = await contract.submitTransaction('confirmRegistration',carId);
        if(result.toString() === "PERMISSION DENIED") throw new Error(result.toString());
        return result.toString();
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function getAllCars(phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const carsAsBuffer = await contract.evaluateTransaction('queryAllCars');
        const cars = JSON.parse(carsAsBuffer.toString());
        return { success: true, result: { cars } };
    } catch (error) {
        return { success: false, result: { error: error } }
    }
}


export async function getCarById(phoneNumber: string, carId: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const carsAsBuffer = await contract.evaluateTransaction('queryCarById', carId);
        const car = JSON.parse(carsAsBuffer.toString());
        return car;
    } catch (error) {
        console.log(error);
        return null
    }
}


export async function getProcesscingCars(phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const processingCarsAsBuffer = await contract.evaluateTransaction('queryAllProcessingCar');
        const processingCars = JSON.parse(processingCarsAsBuffer.toString());
        if (processingCars.length > 0) {
            return { success: true, result: { processingCars } };
        }
        else {
            throw new Error("Không có xe đang xử lí");
        }
    } catch (error) {
        return { success: false, result: { msg: error } };
    }
}


export async function isOwnerOfCar(carId: string, userId: string): Promise<any> {
    try {
        const contract = await getCarContract(userId);
        const queryString: any = {};
        queryString.selector = {
            docType: 'car',
            id: carId,
            owner: userId
        }
        const resultByte = await contract.evaluateTransaction('queryResult', JSON.stringify(queryString));
        const result = JSON.parse(resultByte.toString());
        if(result.length > 0){
            return { success: true, result: { isOwner: true } }
        }
        return { success: true, result: { isOwner: false } }
    } catch (error) {
        return { success: false, result: { msg: error }}
    }
}
export async function deleteCar(phoneNumber: string, carId: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const carsAsBuffer = await contract.submitTransaction('deleteCar', carId);
        return { success: true};
    } catch (error) {
        console.log(error);
        return null
    }
}

// FABRIC TRANSFER
export async function requestChangeOwner(carId: string,  newOwner: string, currentOwner: string) {
    try {
        const contract = await getCarContract(currentOwner);
        const dealId = 'D' + nanoid().toUpperCase();
        const TxIDByte = await contract.submitTransaction('createTransferOffer', dealId, carId, currentOwner, newOwner);
        const TxID = TxIDByte.toString();
        if( TxID !== "" || TxID.length !== 0) {
            return { success: true, result: { TxID: TxID } }
        }
        else {
            throw new Error("Có lỗi khi gọi transaction");
        }
    } catch (error) {
        console.log(error);
        return { success: false, result: { msg: error } }
    }
}

export async function approveTransferDeal(userId: string, dealId: string){
    try {
        const contract = await getCarContract(userId);
        const TxID = await contract.submitTransaction('approveTransfer', dealId);
        if(TxID.toString() === "PERMISSION DENIED") throw new Error(TxID.toString());
        return TxID.toString();
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function confirmTransferDeal(userId: string, dealId: string){
    try {
        const contract = await getCarContract(userId);
        const TxID = await contract.submitTransaction('confirmTransfer', dealId);
        if(TxID.toString() === "PERMISSION DENIED") throw new Error(TxID.toString());
        return TxID.toString();
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function rejectTransferDeal(userId: string, dealId: string){
    try {
        const contract = await getCarContract(userId);
        const TxID = await contract.submitTransaction('rejectTransfer', dealId);
        if(TxID.toString() === "PERMISSION DENIED") throw new Error(TxID.toString());
        return TxID.toString();
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function queryCars(userId: string, queryString: string): Promise<any> {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.evaluateTransaction('queryResult', queryString);
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        throw error;
    }
}

export async function getHistoryOfCar(phoneNumber: string, carId: string): Promise<any> {
    try {
        const contract = await getCarContract(phoneNumber);
        const resultsBuffer = await contract.evaluateTransaction('getHistory', carId);
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        throw error;
    }
}
//                                          FARIC CITY
// tao city
export async function addCity(userId: string, city: City) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addCity', JSON.stringify(city));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
//cap nhat thong tin city
export async function updateCity(userId: string, city: City) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateCity', JSON.stringify(city));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
// cap nhat so dang ky dia phuong
export async function switchNumber(id: string, cityId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('updateNumber',cityId);
    }catch (error) {
        console.log(error);
        throw error;
    } 
}

export async function getCity(cityId: string) {
    const queryString = {
        selector: {
            id: cityId,
            docType: "city"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}
// lay thong tin city
export async function getNameCity(cityId: string) {
    const queryString = {
        selector: {
            id: cityId,
            docType: "city"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record.name;
}

// lay thong tin city
export async function getUser(id: string) {
    const queryString = {
        selector: {
            id: id,
            docType: "user"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}
// cap nhat so luong bien so da  dang ky 
export async function updateNumberofPlate(id: string, cityId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('updateNumberofPlate',cityId)
    }catch (error) {
        console.log(error);
        throw error;
    } 
}
// cap nhat 3 so  dau thu tu dang ky
export async function update3fn(id: string, cityId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('update3fn',cityId)
    }catch (error) {
        console.log(error);
        throw error;
    } 
}
//                      FABRIC DISTRICT
// them quan/huyen
export async function addDistrict(userId: string, district: District){
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addDistrict', JSON.stringify(district));
        console.log(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
    }
}

export async function updateDistrict(userId: string, district: District){
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateDistrict', JSON.stringify(district));
        console.log(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
    }
}

export async function getDistrict(districtId: string) {
    const queryString = {
        selector: {
            id: districtId,
            docType: "district"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}
export async function getNameDistrict(districtId: string) {
    const queryString = {
        selector: {
            id: districtId,
            docType: "district"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record.districtName;
}

//                      FABRIC OBJECT 
// them thong tin to chuc
export async function addObject(userId: string, ob: Object) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addObject',JSON.stringify(ob));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
//cap nhat thong tin city
export async function updateObject(userId: string, ob: Object) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateObject', JSON.stringify(ob));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
// cap nhat so dang ky dia phuong tuan tu 
export async function switchSeri(id: string, objectId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('updateSeri',objectId)
    }catch (error) {
        console.log(error);
        throw error;
    } 
}
// cap nhat so dang ky dia phuong tuy y
export async function changeSeri(id: string, objectId : any,serIndex:any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('changeSeri',objectId,serIndex);
    }catch (error) {
        console.log(error);
        throw error;
    } 
}
export async function countSeri(id: string, objectId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('countSeri',objectId);
    }catch (error) {
        console.log(error);
        throw error;
    } 
}
export async function InitCount(id: string, objectId : any,lengthSeri:any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('InitCount',objectId, lengthSeri);
    }catch (error) {
        console.log(error);
        throw error;
    } 
}

export async function addNewSeri(id: string, objectId : any,newSeri:string) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('addNewSeri',objectId,newSeri);
    }catch (error) {
        console.log(error);
        throw error;
    } 
}
// lay thong tin to chuc dang ky xe
export async function getObject(objectId: string) {
    const queryString = {
        selector: {
            id: objectId,
            docType: "object"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    console.log(result);
    return result[0].Record;
}
// lay thong tin to chuc dang ky xe
export async function getOb(carType: string,city:string) {
    const queryString = {
        selector: {
            carType: carType,
            city:city,
            docType: "object"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    console.log(result);
    return result[0].Record;
}
    // FABRIC CARTYPE
// them thong tin loai xe
export async function addCarType(userId: string, carType: carType) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addCarType',JSON.stringify(carType));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
// Cap nhat thong tin loai xe
export async function updateCarType(userId: string, carType: carType) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateCarType',JSON.stringify(carType));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export async function getCarType(carTypeId: string) {
    const queryString = {
        selector: {
            id: carTypeId,
            docType: "carType"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}
export async function getCT(carTypeId: string) {
    const queryString = {
        selector: {
            id: carTypeId,
            docType: "carType"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0];
}
//                                          FABRIC SCHEDULE
// them thong tin thoi bieu
export async function addSchedule(userId: string, schedule: Schedule) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addSchedule',JSON.stringify(schedule)) ;
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
//cap nhat thong tin lich bieu
export async function updateSchedule(userId: string, ob: Schedule) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateSchedule', JSON.stringify(ob));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
// cap nhat thu tu dang ky
export async function updateOrdinalNumber(id: string, scheduleId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('updateOrdinalNumber',scheduleId)
    }catch (error) {
        console.log(error);
        throw error;
    } 
}
// Giam so luong  ho so dang dang ky 
export async function reduceOrdinalNumber(id: string, scheduleId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('reduceOrdinalNumber',scheduleId)
    }catch (error) {
        console.log(error);
        throw error;
    } 
}

export async function IsExistSchedule( userId: string, date: string, cityId:string): Promise<any> {
    try{
        const contract = await getCarContract(userId);
        const queryString: any = {};
        queryString.selector = {
            docType: 'schedule',
            cityId: cityId,
            date: date
        }
        const resultByte = await contract.evaluateTransaction('queryResult', JSON.stringify(queryString));
        const result = JSON.parse(resultByte.toString());
        if(result.length > 0 && result[0].Record.currentNumber< result[0].Record.maxNumber){
            return { success: true, result: { isOwner: 1 } }
        }else if(result.length > 0 && result[0].Record.currentNumber >= result[0].Record.maxNumber){
            return { success: true, result: { isOwner: 2 } }
        } 
        return { success: true, result: { isOwner: 0 } }

    }catch (error) {
        console.log(error);
        throw error;
    } 

        
}
export async function getBooking_ID(carID: string) {
    const queryString = {
        selector: {
            carId: carID,
            docType: "booking"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}
export async function getID_Schedule(userId: string , date: string ,cityId: string) {
    const queryString = {
        selector: {
            cityId: cityId,
            date: date,
            docType: "schedule"
        }
    }
    const result = await queryCars(userId, JSON.stringify(queryString));
    console.log(result);
    return result[0].Record.id;
}

export async function getSchedule(userId: string , id: string) {
    const queryString = {
        selector: {
            id : id,
            docType: "schedule"
        }
    }
    const result = await queryCars(userId, JSON.stringify(queryString));
    return result[0].Record;
}


//                                          FABRIC BOOKING
// them thong tin lich hen
export async function addBooking(userId: string, book: Booking) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addBooking', JSON.stringify(book));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
// Huy lich hen
export async function deleteBooking( phoneNumber: string, Id: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const TxID = await contract.submitTransaction('deleteBooking', Id);
        if (TxID.toString().length !== 0) {
            return { success: true, result: { TxID: TxID.toString() }};
        }
        else {
            throw new Error("Không thể hoàn thành đăng ký");
        }
    } catch (error) {
        return { success: false, result: { msg: error }};
    }
}

// cap nhat thu tu  lịch hẹn
export async function updateBooking(userId: string, ob: Booking) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateSchedule', JSON.stringify(ob));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}
export async function finishBooking(id: string, bookingId : any) {
    try{
        const contract = await getCarContract(id);
        const rs = await contract.submitTransaction('finishBooking',bookingId);
        if (rs.toString().length !== 0) {
            return { success: true, result: { TxID: rs.toString() }};
        }
        else {
            throw new Error("Không thể hoàn thành đăng ký");
        }
    }catch (error) {
        console.log(error);
        throw error;
    } 
}

// lay bookig
export async function get_Booking(userId: string , id: string ) {
    const queryString = {
        selector: {
            id: id,
            docType: "booking"
        }
    }
    const result = await queryCars(userId, JSON.stringify(queryString));
    console.log(result);
    return result[0].Record;
}
