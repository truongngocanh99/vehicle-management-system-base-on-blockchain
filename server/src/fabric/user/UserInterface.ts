export interface User {  
    id: string;
    fullName: string;
    dateOfBirth: string;
    identityCardNumber: string;
    placeOfIdentity?: string;
    dateOfIdentity?:string;
    phoneNumber: string;
    role: string;
    password: string;
    address?: string;
    city?: string;
    district?: string,
    createTime?: string;
    updateTime?: string;
    email?: string
    docType: string;    
    verifyPolice?: string;
    verified?: boolean;
}