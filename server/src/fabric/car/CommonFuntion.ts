import * as path from 'path';
import * as fs from 'fs';
import { Wallets, X509Identity, Wallet, Gateway, Contract } from 'fabric-network';

export function getCcp(): any {
    const ccpPath = path.resolve(__dirname, '..', '..', '..','..','test-network','organizations','peerOrganizations','org1.example.com', 'connection-org1.json');
    return JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
}

export async function getWallet(): Promise<Wallet> {
    const walletPath = path.join(process.cwd() ,'wallet');
    return await Wallets.newFileSystemWallet(walletPath);
}

export async function getCarContract(phoneNumber: any): Promise<Contract> {
    const ccp = getCcp();
    const wallet = await getWallet();
    const identity = await wallet.get(phoneNumber);
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
    const contract = channel.getContract('CRChaincode', 'car');
    return contract;
}