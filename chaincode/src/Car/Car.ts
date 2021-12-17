export class Car{
    public id: string;
    public registrationNumber?: string;// bien so xe
    public brand: string;// nhan hieu xe
    public model: string;// so loai  xe
    public color: string;// màu xe
    public engineNumber: string;// so may
    public chassisNumber: string;// so khung
    public capacity: string; // dung tich cc
    public assetType?: string; // loai tai san(o to hoac xe gan may)
    public carType?: string;// loai xe ( ôto con romoc ,somi ro moc)
    public owner?: string;//chu xe
    public year: string;// nam san xuat
    public registeredCity?: string;//tinh thanh dang ky
    public registeredDistrict?: string;// quan/huyen dang ky
    public seatNumber?: Number;// so ghế
    public createTime?: string;
    public modifyTime?: string;
    public modifyType?: Number;// trang thai chinh sua(dang ky,hoan thanh dang ky,huy dang ky,chuyen chu so huu)
    public modifyUser?: string;
    public registrationTime?: string;// thoi diem dang ky
    public registrationState: string;// trang thai dang ky(cho duyet, da dang ky...)
    public processedPolice?: string;
    public docType: string;
}

export class TransferOffer{
    public id: string;
    public carId: string;
    public currentOwner: string;
    public newOwner: string;
    public state: Number;
    public createTime?: string;
    public modifyTime?: string;
    public acceptTime?: string;
    public rejectTime?: string;
    public rejectUser?: string;
    public docType: string;
}
export class assetType{
    public id: string;
    public name: string;
    public description: string;
    public docType: string;
}
