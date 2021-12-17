export class City {
    public id: string;
    public name: string;// ten diem dang ky/tinh thanh
    //public number?: number | number[];// ky hieu dia phuong dang ky
    public number?: string | string[];// ky hieu dia phuong dang ky
    public current_numberIndex?: Number;// so hieu dang ky dia phuong dang dung
    public departmentName?: string;// Ten phong canh sat giao thong theo tung diem dang ky
    public departmentEmail?: string;// Email phong canh sat giao thong 
    public departmentPhone?: string;// So dien thoai phong canh sat giao thong 
    public departmentAddress?: string;// Dia chi phong canh sat giao thong 
    public threefirstNumber?: Number;// 3 so dang ky dau tien cua tinh ,thanh pho truc thuoc tw
    public number_of_license_plates?: Number;// quan ly so luong bien so cua tinh ,thanh pho truc thuoc tw
    public docType?: string;
}

export class District{
    public id: string;
    public districtName: string;
    public city: string;
    public departmentName?: string;// Ten phong canh sat giao thong theo tung diem dang ky
    public departmentEmail?: string;// Email phong canh sat giao thong 
    public departmentPhone?: string;// So dien thoai phong canh sat giao thong 
    public departmentAddress?: string;// Dia chi phong canh sat giao thong 
    public seriMoto?: string|string[];// seri dang ky cap cho xe moto,xe gan may
    public current_seriIndex?: string;// seri kha dung dang ky cho xe may
    public docType?: string;
}