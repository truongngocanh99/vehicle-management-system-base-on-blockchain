import * as path from 'path';
import * as fs from 'fs';
import { Wallets, Wallet, Gateway, Contract } from 'fabric-network';
import { FABRIC_ERROR_CODE } from '../../constant';
// import { User } from './userInterface';

export function getCcp(): any {
    const ccpPath = path.resolve(__dirname, '..', '..', '..','..','test-network','organizations','peerOrganizations','org1.example.com', 'connection-org1.json');
    return JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
}

export async function getWallet(): Promise<Wallet> {
    const walletPath = path.join(process.cwd() ,'wallet');
    return await Wallets.newFileSystemWallet(walletPath);
}

export async function getUserContract(phoneNumber: any): Promise<Contract> {
    const ccp = getCcp();
    const wallet = await getWallet();
    const identity = await wallet.get(phoneNumber);
    if (typeof identity === 'undefined') {
        throw FABRIC_ERROR_CODE.IDENTITY_NOT_FOUND_IN_WALLET;
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: phoneNumber,
        discovery: {
            asLocalhost: true,
            enabled: true,
        },
    });
    const channel = await gateway.getNetwork('mychannel');
    const contract = channel.getContract('CRChaincode', 'User');
    return contract;
}