export class Schedule{
    public id: string;
    public currentNumber?: number;// so luong ho so dang yeu cau xu li hien tai
    public maxNumber?: number;// so luong max ho so dc xu ly trong ngay
    public cityId?: string;// id thanh pho
    public date?: string;//ngay dat lich
    public docType?: string;
}
export class Booking{
    public id: string;
    public status?: number;//trang thai cua lich hen ( new / done / cancel)
    public carId?: string;
    public userId?: string; // id nguoi dat lich
    public cityId?: string;// seri dang ki kha dung hien tai
    public timeType?: string;
    public date?: string;// ngay dat lich
    public ordinalNumber?: number ;// so thu tu 
    public scheduleId ?:string;
    public docType?: string;
}
