/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Contract, Context } from "fabric-contract-api";
import { User } from "./User";
// const bcrypt = require('bcrypt');
import { Object } from "../Car/object";
import { City , District} from "../Car/city";
import {carType} from "../Car/carType";
import { assetType } from "../Car/Car";

export class UserContract extends Contract {

    constructor(){
        super('User');
    }

    // 0: UID, 1: password, 2:fullName, 3: phoneNumber, 4: dateOfBirth, 5: ward, 6: identityCardNumber, 7: role
    public async createUser(ctx: Context, userAsString: string) {
        console.log('START========CREATE-USER===========');
        const user: User = JSON.parse(userAsString);
        user.verified = user.verifyPolice ? true : false;
        user.createTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        user.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        user.status = false;
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        console.log("END========CREATE-USER===========");
    }

    public async verifyUser(ctx: Context, userId: string) {
        const policeId = this.getUserId(ctx);
        const userAsBytes = await ctx.stub.getState(userId);
        const user: User = JSON.parse(userAsBytes.toString());
        user.verified = true;
        user.verifyPolice = policeId;
        user.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        return ctx.stub.getTxID();
    }
    public async activeAccount(ctx: Context, userId: string) {
        const userAsBytes = await ctx.stub.getState(userId);
        const user: User = JSON.parse(userAsBytes.toString());
        user.status = true;
        await ctx.stub.putState(userId, Buffer.from(JSON.stringify(user)));
        return userId;
    }
    public async changePassword(ctx: Context, userId: string, newPassword: string) {
        const userAsBytes = await ctx.stub.getState(userId);
        const user: User = JSON.parse(userAsBytes.toString());
        user.password = newPassword;
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        return ctx.stub.getTxID();
    }

    public async updateUser(ctx: Context, userAsString: string){
        console.log("======START=UPDATE=USER=======");
        const payload: User = JSON.parse(userAsString);
        const userAsBytes: Uint8Array= await ctx.stub.getState(payload.id);
        if (!userAsBytes || userAsBytes.length === 0){
            throw new Error('wrong UID');
        }
        const currentUser: User = JSON.parse(userAsBytes.toString());
        const modifyUser: User = {...currentUser, ...payload};
        modifyUser.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(modifyUser.id, Buffer.from(JSON.stringify(modifyUser)));
        return ctx.stub.getTxID();
    }


    public async readUserByUID(ctx: Context, key: string): Promise<string> {
        const userAsBytes = await ctx.stub.getState(key);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`Cannot find any user has ${key} key`);
        }
        return userAsBytes.toString();
    }


    public async queryUserByPhoneNumber(ctx: Context, phoneNumber: string): Promise<string>{
        const queryString: any = {};
        queryString.selector = {};
        queryString.selector.phoneNumber = phoneNumber;
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));   
        return queryResult;
    }

    private getUserId(ctx: Context): string {
        const rs = ctx.clientIdentity.getID();
        const find = rs.match(/[A-Za-z0-9_-]{22}/);
        if(find === null) return 'admin';
        return find![0];
    }

    public async getQueryResultForQueryString(ctx: Context, queryString: string): Promise<string> {

		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this.getAllResults(resultsIterator, false);

		return JSON.stringify(results);
	}


    public async getAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes: any = {};
				console.log(res.value.value.toString('utf8'));
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


    public async readHistoryOfUser(ctx: Context, userId: string) {
        const history = await ctx.stub.getHistoryForKey(userId);
    }


    public paramsToUser(params: string[]): User{
        return {
            id: params[0],
            password: params[1],
            fullName: params[2],
            phoneNumber: params[3],
            dateOfBirth: params[4],
            address: params[5],
            city: params[6],
            district:params[7],
            identityCardNumber: params[8],
            role: params[9],
            docType: 'user',
        }
    } 


    public async initLedger(ctx: Context) {
        const carType1: carType = {
            id: "carType1",
            name : "Xe r?? mo??c, s??mi r??mo??c",
            description: "C???p cho xe r?? mo??c, s??mi r??mo??c",
            docType:'carType'
        };
        const carType2: carType = {
            id: "carType2",
            name : "Xe con d?????i 9 ch???",
            description: "C???p cho xe ?? t?? con d?????i 9 ch??? ng???i",
            docType:'carType'
        };
        const carType3: carType = {
            id: "carType3",
            name : "Xe kh??ch",
            description: "C???p cho xe ch??? kh??ch c??? trung v?? xe t??? 9 ch??? ng???i tr??? l??n",
            docType:'carType'
        };
        const carType4: carType = {
            id: "carType4",
            name : "Xe t???i",
            description: "C???p cho xe t???i,xe b??n t???i",
            docType:'carType'
        };
        const carType5: carType = {
            id: "carType5",
            name : "Xe van",
            description: "C???p cho xe van",
            docType:'carType'
        };

        const carType6: carType = {
            id: "carType6",
            name : "Xe li??n doanh",
            description: "C???p cho xe c???a c??c doanh nghi???p c?? v???n n?????c ngo??i, xe thu?? c???a n?????c ngo??i, xe c???a C??ng ty n?????c ngo??i tr??ng th???u t???i ?????a ph????ng",
            docType:'carType'
        };
        const carType7: carType = {
            id: "carType7",
            name : "Xe c???a doanh nghi???p qu??n ?????i",
            description: "C???p cho xe c???a doanh nghi???p qu??n ?????i, theo ????? ngh??? c???a C???c Xe - m??y, B??? Qu???c ph??ng.",
            docType:'carType'
        };
        const carType8: carType = {
            id: "carType8",
            name : "Xe M??y k??o",
            description: "C???p cho xe m??y k??o t???i ?????a ph????ng",
            docType:'carType'
        };
        const carType9: carType = {
            id: "carType9",
            name : "Xe ????ng k?? t???m th???i",
            description: "C???p cho xe ????ng k?? t???m th??i t???i ?????a ph????ng",
            docType:'carType'
        };
        const carType10: carType = {
            id: "carType10",
            name : "Xe ho???t ?????ng th?? ??i???m",
            description: "C???p cho xe c?? gi???i s???n xu???t, l???p r??p trong n?????c, ???????c Th??? t?????ng,Ch??nh ph??? cho ph??p tri???n khai th?? ??i???m .",
            docType:'carType'
        };
        const carType11: carType = {
            id: "carType11",
            name : "Xe taxi",
            description: "C???p cho xe taxi",
            docType:'carType'
        };
        const carType12: carType = {
            id: "carType12",
            name : "Xe kh??ch d???ch v???",
            description: "C???p cho xe kh??ch d???ch v???",
            docType:'carType'
        };
        const carType13: carType = {
            id: "carType13",
            name : "Xe van d???ch v???",
            description: "C???p cho xe van d???ch v???",
            docType:'carType'
        };
        const carType14: carType = {
            id: "carType14",
            name : "Xe t???i d???ch v???",
            description: "C???p cho xe t???i d???ch v???",
            docType:'carType'
        };
        const carType15: carType = {
            id: "carType15",
            name : "Xe c???u th????ng",
            description: "C???p cho xe c???u th????ng",
            docType:'carType'
        };
        const carType16: carType = {
            id: "carType16",
            name : "Xe c???a Ban qu???n l?? d??? ??n do n?????c ngo??i th???u",
            description: "C???p cho xe c???a Ban qu???n l?? d??? ??n do n?????c ngo??i th???u.",
            docType:'carType'
        };

        const org1: Object = {
            id : "org1",
            carType:"carType1",
            city:"cantho",
            seri : ["R"],
            // seri : "R",
            currentseri_Index: 0,
            count:[0],
            docType: 'object',
        };
        const org2: Object = {
            id : "org2",
            carType:"carType2",
            city:"cantho",
            seri : ["A"],
            // seri : "A",
            count:[0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org3: Object = {
            id : "org3",
            carType:"carType3",
            city:"cantho",
            seri : ["B"],
            // seri : "B",
            count:[0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org4: Object = {
            id : "org4",
            carType:"carType4",
            city:"cantho",
            seri : ["C"],
            count: [0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org5: Object = {
            id : "org5",
            carType:"carType5",
            city:"cantho",
            seri : ["D"],
            // seri : "T??",
            count: [0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org6: Object = {
            id : "org6",
            carType:"carType6",
            city:"cantho",
            seri : ["LD"],
            // seri : "KT",
            count: [0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org7: Object = {
            id : "org7",
            carType:"carType11",
            city:"cantho",
            seri : ["E"],
            // seri : "D",
            count: [0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org8: Object = {
            id : "org8",
            carType:"carType12",
            city:"cantho",
            seri : ["F"],
            // seri : "LD",
            count: [0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org9: Object = {
            id : "org9",
            carType:"carType13",
            city:"cantho",
            seri : ["G"],
            // seri : "MK",
            count: [0],
            currentseri_Index: 0,
            docType: 'object',
        };
        const org10: Object = {
            id : "org10",
            carType:"carType14",
            city:"cantho",
            seri : ["H"],
            // seri : "T",
            count: [0],
            currentseri_Index: 0,
            docType: 'object',
        };

        const cantho: City ={
            id : "cantho",
            name: "C???n th??",
            number: ["65"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT ???????ng b??? - ???????ng s???t TP C???n Th??",
            departmentAddress: "S??? 6, V?? Nguy??n Gi??p,KV1,H??ng Th???nh, C??i R??ng",
            departmentEmail: "csgt65@gmail.com",
            departmentPhone: "0594567354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const hcm: City ={
            id : "hcm",
            name: "TP H??? Ch?? Minh",
            number: ["41","50","51","52","53","54","55","56","57","58","59" ],
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT ???????ng b??? - ???????ng s???t TP H??? Ch?? Minh",
            departmentAddress: "1500,Nguy???n ???nh Th???,P. Trung M??? T??y,Q.12",
            departmentEmail: "csgthcm@gmail.com",
            departmentPhone: "0693113113",
            threefirstNumber: 0,
            number_of_license_plates:0,
            docType: "city",

        };
        const ccsgt: City ={
            id : "ccsgt",
            name: "C???c C???nh S??t Giao Th??ng",
            number: ["80"],
            // number:"80",
            current_numberIndex:0,
            departmentName: "C???c C???nh s??t giao th??ng",
            departmentAddress: "S??? 112, L?? Du???n, Ho??n Ki???m, H?? N???i",
            departmentEmail: "cuccsgt@gmail.com",
            departmentPhone: "0693241111",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const camau: City ={
            id : "camau",
            name: "C?? Mau",
            number: ["69"],
            // number: "69",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT c??ng an t???nh C?? Mau",
            departmentAddress: "S??? 6, Phan Ng???c Hi???n, P6, Tp C?? Mau",
            departmentEmail: "csgt69camau@gmail.com",
            departmentPhone: "0274567890",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const baclieu: City ={
            id : "baclieu",
            name: "B???c Li??u",
            number: ["94"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh B???c Li??u",
            departmentAddress: "S??? 6, Tr???n Ph??,Kh??m I,Ph?????ng 7,TP B???c Li??u",
            departmentEmail: "csgt94@gmail.com",
            departmentPhone: "0291567354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const soctrang: City ={
            id : "soctrang",
            name: "S??c Tr??ng",
            number: ["83"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh S??c Tr??ng",
            departmentAddress: "444 L?? Du???n - Kh??m 4 - P.9 - TP. S??c Tr??ng",
            departmentEmail: "csgt83@gmail.com",
            departmentPhone: "0299367354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const haugiang: City ={
            id : "haugiang",
            name: "H???u Giang",
            number: ["95"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh H???u Giang",
            departmentAddress: "S??? 6, ??i???n Bi??n Ph???,KV4, P.5, TP. V??? Thanh, H???u Giang",
            departmentEmail: "csgt95@gmail.com",
            departmentPhone: "0294567354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const vinhlong: City ={
            id : "vinhlong",
            name: "V??nh Long",
            number: ["64"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh V??nh Long",
            departmentAddress: "11A/2 ???p T??n B??nh, x?? T??n H???nh, Long H???, V??nh Long",
            departmentEmail: "csgt64@gmail.com",
            departmentPhone: "0270367354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const angiang: City ={
            id : "angiang",
            name: "An Giang",
            number: ["67"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh An Giang",
            departmentAddress: "S??? 39, Nguy???n Th??? Minh Khai, M??? Long, TP. Long Xuy??n",
            departmentEmail: "csgt64@gmail.com",
            departmentPhone: "0296367354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const kiengiang: City ={
            id : "kiengiang",
            name: "Ki??n Giang",
            number: ["68"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh Ki??n Giang",
            departmentAddress: "S??? 888A, Nguy???n Trung Tr???c, An H??a, TP. R???nh Gi??",
            departmentEmail: "csgt68@gmail.com",
            departmentPhone: "0288867354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const dongthap: City ={
            id : "dongthap",
            name: "?????ng Th??p",
            number: ["66"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh ?????ng Th??p",
            departmentAddress: "S??? 222, L?? ?????i H??nh, M??? Ph??, TP. Cao L??nh",
            departmentEmail: "csgt66@gmail.com",
            departmentPhone: "0277367354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const tiengiang: City ={
            id : "tiengiang",
            name: "Ti???n Giang",
            number: ["63"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh Ti???n Giang",
            departmentAddress: "152C Th??i Sanh H???nh, P.9 , TP. M??? Tho",
            departmentEmail: "csgt63@gmail.com",
            departmentPhone: "0694567354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
        const longan: City ={
            id : "longan",
            name: "Long An",
            number: ["62"],
            // number: "65",
            current_numberIndex:0,
            departmentName: "Ph??ng CSGT C??ng an t???nh Long An",
            departmentAddress: "S??? 16 QL1, P.5, TP.T??n An",
            departmentEmail: "csgt62@gmail.com",
            departmentPhone: "0272267354",
            threefirstNumber: 0,
            number_of_license_plates: 0,
            docType: "city",

        };
// Can tho

        const ninhkieu : District = {
            id: "ninhkieu",
            districtName: "Ninh Ki???u",
            city: "cantho",
            docType: "district",
        };
        const binhthuy : District = {
            id: "binhthuy",
            districtName: "B??nh Th???y",
            city: "cantho",
            docType: "district",
        };
        const cairang : District = {
            id: "cairang",
            districtName: "C??i R??ng",
            city: "cantho",
            docType: "district",
        }
        const omon : District = {
            id: "omon",
            districtName: "?? M??n",
            city: "cantho",
            docType: "district",
        }
        const thotnot : District = {
            id: "thotnot",
            districtName: "Th???t N???t",
            city: "cantho",
            docType: "district",
        }
        const phongdien : District = {
            id: "phongdien",
            districtName: "Phong ??i???n",
            city: "cantho",
            docType: "district",
        }
        const codo : District = {
            id: "codo",
            districtName: "C??? ?????",
            city: "cantho",
            docType: "district",
        }
        const vinhthanh : District = {
            id: "vinhthanh",
            districtName: "V??nh Th???nh",
            city: "cantho",
            docType: "district",
        }
        const thoilai : District = {
            id: "thoilai",
            districtName: "Th???i Lai",
            city: "cantho",
            docType: "district",
        }

// Sai gon
        const q1 : District = {
            id: "q1",
            districtName: "Qu???n 1",
            city: "hcm",
            docType: "district",
        };
        const q2 : District = {
            id: "q2",
            districtName: "Qu???n 2",
            city: "hcm",
            docType: "district",
        };
        const q3 : District = {
            id: "q3",
            districtName: "Qu???n 3",
            city: "hcm",
            docType: "district",
        };
        const q4 : District = {
            id: "q4",
            districtName: "Qu???n 4",
            city: "hcm",
            docType: "district",
        };
        const q5 : District = {
            id: "q5",
            districtName: "Qu???n 5",
            city: "hcm",
            docType: "district",
        };
        const q8 : District = {
            id: "q8",
            districtName: "Qu???n 8",
            city: "hcm",
            docType: "district",
        };
        const q12 : District = {
            id: "q12",
            districtName: "Qu???n 12",
            city: "hcm",
            docType: "district",
        };
        const binhchanh : District = {
            id: "binhchanh",
            districtName: "B??nh Ch??nh",
            city: "hcm",
            docType: "district",
        };
        const thuduc : District = {
            id: "thuduc",
            districtName: "Th??? ?????c",
            city: "hcm",
            docType: "district",
        };
        const cuuchi : District = {
            id: "cuuchi",
            districtName: "C???u Chi",
            city: "hcm",
            docType: "district",
        };


        const tvt : District = {
            id: "tvt",
            districtName: "Tr???n V??n Th???i",
            city: "camau",
            docType: "district",
        };
        const namcan : District = {
            id: "namcan",
            districtName: "N??m C??n",
            city: "camau",
            docType: "district",
        };
        const cainuoc : District = {
            id: "cainuoc",
            districtName: "C??i N?????c",
            city: "camau",
            docType: "district",
        };
        const damdoi : District = {
            id: "damdoi",
            districtName: "?????m D??i",
            city: "camau",
            docType: "district",
        };
        const uminh : District = {
            id: "uminh",
            districtName: "U Minh",
            city: "camau",
            docType: "district",
        };
        const thoibinh : District = {
            id: "thoibinh",
            districtName: "Th???i B??nh",
            city: "camau",
            docType: "district",
        };
        const phutan : District = {
            id: "phutan",
            districtName: "Ph?? T??n",
            city: "camau",
            docType: "district",
        };
        const nh : District = {
            id: "nh",
            districtName: "Ng???c Hi???n",
            city: "camau",
            docType: "district",
        };

        const car : assetType = {
            id: "car",
            name: "?? t??",
            description: "?? t??",
            docType: "assetType",
        };
        const moto : assetType = {
            id: "moto",
            name: "Xe g???n m??y",
            description: "M?? t??, xe g???n m??y, xe m??y ??i???n v?? c??c lo???i xe c?? k???t c???u t????ng t???",
            docType: "assetType",
        };
        // INIT CARTYPE
        await ctx.stub.putState(carType1.id, Buffer.from(JSON.stringify(carType1)));
        await ctx.stub.putState(carType2.id, Buffer.from(JSON.stringify(carType2)));
        await ctx.stub.putState(carType3.id, Buffer.from(JSON.stringify(carType3)));
        await ctx.stub.putState(carType4.id, Buffer.from(JSON.stringify(carType4)));
        await ctx.stub.putState(carType5.id, Buffer.from(JSON.stringify(carType5)));
        await ctx.stub.putState(carType6.id, Buffer.from(JSON.stringify(carType6)));
        await ctx.stub.putState(carType7.id, Buffer.from(JSON.stringify(carType7)));
        await ctx.stub.putState(carType8.id, Buffer.from(JSON.stringify(carType8)));
        await ctx.stub.putState(carType9.id, Buffer.from(JSON.stringify(carType9)));
        await ctx.stub.putState(carType10.id, Buffer.from(JSON.stringify(carType10)));
        await ctx.stub.putState(carType11.id, Buffer.from(JSON.stringify(carType11)));
        await ctx.stub.putState(carType12.id, Buffer.from(JSON.stringify(carType12)));
        await ctx.stub.putState(carType13.id, Buffer.from(JSON.stringify(carType13)));
        await ctx.stub.putState(carType14.id, Buffer.from(JSON.stringify(carType14)));
        await ctx.stub.putState(carType15.id, Buffer.from(JSON.stringify(carType15)));
        await ctx.stub.putState(carType16.id, Buffer.from(JSON.stringify(carType16)));
        
        // INIT ORG
        await ctx.stub.putState(org1.id, Buffer.from(JSON.stringify(org1)));
        await ctx.stub.putState(org2.id, Buffer.from(JSON.stringify(org2)));
        await ctx.stub.putState(org3.id, Buffer.from(JSON.stringify(org3)));
        await ctx.stub.putState(org4.id, Buffer.from(JSON.stringify(org4)));
        await ctx.stub.putState(org5.id, Buffer.from(JSON.stringify(org5)));
        await ctx.stub.putState(org6.id, Buffer.from(JSON.stringify(org6)));
        await ctx.stub.putState(org7.id, Buffer.from(JSON.stringify(org7)));
        await ctx.stub.putState(org8.id, Buffer.from(JSON.stringify(org8)));
        await ctx.stub.putState(org9.id, Buffer.from(JSON.stringify(org9)));
        await ctx.stub.putState(org10.id, Buffer.from(JSON.stringify(org10)));
        // INIT CITY
        await ctx.stub.putState(cantho.id, Buffer.from(JSON.stringify(cantho)));
        await ctx.stub.putState(camau.id, Buffer.from(JSON.stringify(camau)));
        await ctx.stub.putState(ccsgt.id, Buffer.from(JSON.stringify(ccsgt)));
        await ctx.stub.putState(hcm.id, Buffer.from(JSON.stringify(hcm)));
        await ctx.stub.putState(baclieu.id, Buffer.from(JSON.stringify(baclieu)));
        await ctx.stub.putState(soctrang.id, Buffer.from(JSON.stringify(soctrang)));
        await ctx.stub.putState(haugiang.id, Buffer.from(JSON.stringify(haugiang)));
        await ctx.stub.putState(angiang.id, Buffer.from(JSON.stringify(angiang)));
        await ctx.stub.putState(kiengiang.id, Buffer.from(JSON.stringify(kiengiang)));
        await ctx.stub.putState(vinhlong.id, Buffer.from(JSON.stringify(vinhlong)));
        await ctx.stub.putState(dongthap.id, Buffer.from(JSON.stringify(dongthap)));
        await ctx.stub.putState(tiengiang.id, Buffer.from(JSON.stringify(tiengiang)));
        await ctx.stub.putState(longan.id, Buffer.from(JSON.stringify(longan)));
        //INIT DISTRICT
        await ctx.stub.putState(ninhkieu.id, Buffer.from(JSON.stringify(ninhkieu)));
        await ctx.stub.putState(cairang.id, Buffer.from(JSON.stringify(cairang)));
        await ctx.stub.putState(binhthuy.id, Buffer.from(JSON.stringify(binhthuy)));
        await ctx.stub.putState(omon.id, Buffer.from(JSON.stringify(omon)));
        await ctx.stub.putState(phongdien.id, Buffer.from(JSON.stringify(phongdien)));
        await ctx.stub.putState(thotnot.id, Buffer.from(JSON.stringify(thotnot)));
        await ctx.stub.putState(thoilai.id, Buffer.from(JSON.stringify(thoilai)));
        await ctx.stub.putState(vinhthanh.id, Buffer.from(JSON.stringify(vinhthanh)));
        await ctx.stub.putState(codo.id, Buffer.from(JSON.stringify(codo)));


        await ctx.stub.putState(q1.id, Buffer.from(JSON.stringify(q1)));
        await ctx.stub.putState(q2.id, Buffer.from(JSON.stringify(q2)));
        await ctx.stub.putState(q3.id, Buffer.from(JSON.stringify(q3)));
        await ctx.stub.putState(q4.id, Buffer.from(JSON.stringify(q4)));
        await ctx.stub.putState(q5.id, Buffer.from(JSON.stringify(q5)));
        await ctx.stub.putState(q8.id, Buffer.from(JSON.stringify(q8)));
        await ctx.stub.putState(q12.id, Buffer.from(JSON.stringify(q12)));
        await ctx.stub.putState(cuuchi.id, Buffer.from(JSON.stringify(cuuchi)));
        await ctx.stub.putState(binhchanh.id, Buffer.from(JSON.stringify(binhchanh)));
        await ctx.stub.putState(thuduc.id, Buffer.from(JSON.stringify(thuduc)));


        await ctx.stub.putState(uminh.id, Buffer.from(JSON.stringify(uminh)));
        await ctx.stub.putState(namcan.id, Buffer.from(JSON.stringify(namcan)));
        await ctx.stub.putState(damdoi.id, Buffer.from(JSON.stringify(damdoi)));
        await ctx.stub.putState(cainuoc.id, Buffer.from(JSON.stringify(cainuoc)));
        await ctx.stub.putState(tvt.id, Buffer.from(JSON.stringify(tvt)));
        await ctx.stub.putState(nh.id, Buffer.from(JSON.stringify(nh)));
        await ctx.stub.putState(thoibinh.id, Buffer.from(JSON.stringify(thoibinh)));
        await ctx.stub.putState(phutan.id, Buffer.from(JSON.stringify(phutan)));
        // INIT ASSET TYPE
        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        await ctx.stub.putState(moto.id, Buffer.from(JSON.stringify(moto)));

    }


}
