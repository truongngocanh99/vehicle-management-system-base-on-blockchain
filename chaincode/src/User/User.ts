/*
 * SPDX-License-Identifier: Apache-2.0
 */

export class User {
    public id: string;
    public fullName: string;
    public dateOfBirth: string;
    public identityCardNumber: string;
    public placeOfIdentity?: string;
    public dateOfIdentity?:string;
    public phoneNumber: string;
    public role: string;
    public password: string;
    public address?: string;// số nhà. đường, phường / xã
    public city?: string;// tinh thanh o hien tai
    public district?:string;// quan noi o va cong tac hien tai
    public createTime?: string;
    public updateTime?: string;
    public email?: string
    public docType: string;
    public verifyPolice?: string;
    public verified?: boolean;
    public status? : boolean;
}