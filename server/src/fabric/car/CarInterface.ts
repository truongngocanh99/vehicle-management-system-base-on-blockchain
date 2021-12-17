
export interface Car {
    id:string;
    registrationNumber?: string;// bien so xe
    brand: string;// nhan hieu xe
    model: string;// mẫu  xe
    color: string;// màu xe
    chassisNumber: string;// so khung
    engineNumber: string;// so may
    capacity: string; // dung tich cc
    year: string;// nam san xuat
    owner?: string;//chu xe
    createTime?: string;
    modifyTime?: string;
    registrationState?: string;// trang thai dang ky(cho duyet, da dang ky...)
    registeredCity?: string;//tinh thanh dang ky
    registeredDistrict?: string;// quan/huyen dang ky
    processedPolice?: string;
    assetType?: string; // loai tai san(o to hoac xe gan may)
    carType?: string;// loai xe ( ôto con romoc ,somi ro moc)
    docType?: string;
}

export class City {
    public id?: string;
    public name?: string;// ten diem dang ky/tinh thanh
    public number?: string | string[];// ky hieu dia phuong dang ky
    public current_numberIndex?: Number;// so hieu dang ky dia phuong dang dung
    public departmentName?: string;// Ten phong canh sat giao thong theo tung diem dang ky
    public departmentEmail?: string;// Email phong canh sat giao thong 
    public departmentPhone?: string;// So dien thoai phong canh sat giao thong 
    public departmentAddress?: string;// Dia chi phong canh sat giao thong 
    public threefirstNumber?: Number;
    public number_of_license_plates?: Number;
    public docType?: string;
}
export class District{
    public id?: string;
    public districtName?: string;
    public city?: string;
    public departmentName?: string;// Ten phong canh sat giao thong theo tung diem dang ky
    public departmentEmail?: string;// Email phong canh sat giao thong 
    public departmentPhone?: string;// So dien thoai phong canh sat giao thong 
    public departmentAddress?: string;// Dia chi phong canh sat giao thong 
    public seriMoto?: string|string[];// seri dang ky cap cho xe moto,xe gan may
    public current_seriIndex?: string;// seri kha dung dang ky cho xe may
    public docType?: string;
}
export class Object{
    public id?: string;
    // public name?: string;// ten diem dang ky/tinh thanh
    public carType?: string;// Loai xe dang ky
    public city?: string;// mo ta 
    public seri?:string | string[] ;// seri dang ky
    public currentseri_Index?: Number;// seri dang ki kha dung hien tai
    public count?:Number| Number[]; 
    // public description?: string;// mo ta
    public docType?: string;
}
export class Schedule{
    public id?: string;
    public currentNumber?: number;// so luong ho so dang yeu cau xu li hien tai
    public maxNumber?: number;// so luong max ho so dc xu ly trong ngay
    public cityId?: string;// id thanh pho
    public date?: string;//ngay dat lich
    public docType?: string;
}
export class Booking{
    public id?: string;
    public status?: number;//trang thai cua lich hen ( new / done / cancel)
    public carId?: string;
    public userId?: string; // id nguoi dat lich
    public cityId?: string;// seri dang ki kha dung hien tai
    public timeType?: string;
    public date?: string;// ngay dat lich
    public ordinalNumber?: number ;// so thu tu 
    public scheduleId?: string;
    public docType?: string;
}
export class carType{
    public id?: string;
    public name?: string;// ten loai xe
    public description?: string;// mo ta 
    public docType?: string;
}