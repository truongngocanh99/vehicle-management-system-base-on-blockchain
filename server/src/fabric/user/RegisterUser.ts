/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { Wallets, X509Identity, Wallet, Gateway } from 'fabric-network';
import * as FabricCAServices from 'fabric-ca-client';
import * as path from 'path';
import * as fs from 'fs';
import { User } from './UserInterface';

export async function registerUser(user: User): Promise<boolean>{
    try {
        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', '..','..','test-network','organizations','peerOrganizations','org1.example.com', 'connection-org1.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
        const ca = new FabricCAServices.default(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd() ,'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get(user.id);
        if (userIdentity) {
            const messeage = `Số điện thoại ${user.id} đã đăng ký`;
            throw new Error(messeage)
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            const message = 'An identity for the admin user "admin" does not exist in the wallet, Run the enrollAdmin.ts application before retrying';
            throw new Error(message)
        }

        // build a user object for authenticating with the CA
       const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
       const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: user.id, role: 'client'}, adminUser);
        const enrollment = await ca.enroll({ enrollmentID: user.id, enrollmentSecret: secret });
        const x509Identity: X509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(user.id, x509Identity);
        const isRegisted = await createUser(user, wallet, ccp);
        return isRegisted;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export async function createUser(user: User, wallet: Wallet, ccp: any): Promise<boolean>{
    try {
        const identity = await wallet.get(user.id);
        if (!identity) {
            throw new Error("Cannot find Identity in wallet!");
        }

        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet: wallet,
            identity: user.id,
            discovery: {
                enabled: true,
                asLocalhost: true
            }
        });

        const network = await gateway.getNetwork('mychannel');
        const contract = await network.getContract("CRChaincode", "User");

        const transaction = await contract.submitTransaction("createUser", JSON.stringify(user));
        console.log(`User ${user.id} (${user.fullName}) has been registed`);
        const transaction1 = await contract.submitTransaction("initLedger");
        return true
    } catch (error) {
        console.log(error);
        return false;
    }
}