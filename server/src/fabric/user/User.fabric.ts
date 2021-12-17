import { getUserContract } from './CommonFuntion';
export { registerUser } from './RegisterUser';
export { User } from './UserInterface';


export async function getUserByPhoneNumber(phoneNumber: any): Promise<any> {
    try {
        const contract = await getUserContract('admin');
        const queryString: any = {};
        queryString.selector = {
            phoneNumber: phoneNumber,
            docType: 'user',
            role: 'citizen'
        }
        const rs = await contract.evaluateTransaction('getQueryResultForQueryString', JSON.stringify(queryString));
        const users = JSON.parse(rs.toString());
        // console.log(users);
        if(users.length === 0) return undefined;
        return users[0];
    } catch (error) {
        throw error;
    }
}

export async function getPoliceByPhoneNumber(phoneNumber: any): Promise<any> {
    try {
        const contract = await getUserContract('admin');
        const queryString: any = {};
        queryString.selector = {
            phoneNumber: phoneNumber,
            docType: 'user',
            $or: [
                {role: 'police'},
                {role: 'admin'}
            ]
        }
        const rs = await contract.evaluateTransaction('getQueryResultForQueryString', JSON.stringify(queryString));
        const users = JSON.parse(rs.toString());
        if(users.length === 0) return undefined;
        return users[0];
    } catch (error) {
        throw error;
    }
}

export async function getId(phoneNumber: any): Promise<any> {
    try {
        const contract = await getUserContract(phoneNumber);
        const rs = await contract.evaluateTransaction('getUserId');
        return rs.toString();
    } catch (error) {
        throw new Error("error");
    }
}

export async function getUserById(userId: string): Promise<any> {
    try {
        const contract = await getUserContract('admin');
        const queryString: any = {}
        queryString.selector = {
            docType: 'user',
            id: userId,
        }
        const queryResultBuffer = await contract.evaluateTransaction('getQueryResultForQueryString', JSON.stringify(queryString));
        const queryResult = JSON.parse(queryResultBuffer.toString());
        if(queryResult.length > 0) {
            return queryResult[0].Record;
        }
    } catch (error) {
        return null
    }
}

export async function queryUser(userId: string, queryString: string): Promise<any> {
    try {
        const contract = await getUserContract(userId);
        const queryResult = await contract.evaluateTransaction('getQueryResultForQueryString', queryString);
        return JSON.parse(queryResult.toString());
    } catch (err) {
        throw err
    }
}

export async function modifyUser(userId: string, user: any) {
    try {
        const contract = await getUserContract(userId);
        const result = await contract.submitTransaction('updateUser', JSON.stringify(user));
        return {TxID: result.toString()};
    } catch (error) {
        return {TxID: null}
    }
}

export async function verifyUser(userId: string, verifyUserId: string) {
    try {
        const contract = await getUserContract(userId);
        const result = await contract.submitTransaction('verifyUser', verifyUserId);
        return {TxID: result.toString()};
    } catch (error) {
        return {TxID: null}
    }
}

export async function changePassword(userId: string, newPassword: string) {
    try {
        const contract = await getUserContract(userId);
        const result = await contract.submitTransaction('changePassword', userId, newPassword);
        return {TxID: result.toString()}
    } catch (error) {
        return {TxID: null}
    }
}