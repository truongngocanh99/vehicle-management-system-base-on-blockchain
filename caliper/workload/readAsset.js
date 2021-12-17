'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const nanoid = require('nanoid');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
            const request = {
              contractId: this.roundArguments.contractId,
              contractFunction: "createUser",
              invokerIdentity: "User1",
              contractArguments: [
                JSON.stringify({
                  id: assetID,
                  fullName: "Hồ Gia Huy",
                  address: "Ninh Kieu",
                  dateOfBirth: new Date("10/01/1998").toString(),
                  identityCardNumber: "385752739",
                  role: "citizen",
                  password: "password",
                  phoneNumber: "0952070334",
                  docType: "user",
                }),
              ],
              readOnly: false,
            };

            await this.sutAdapter.sendRequests(request);

    }
    
    async submitTransaction() {
        // NOOP
        const randomId = Math.floor(Math.random()*this.roundArguments.assets);
        const myArgs = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'readUserByUID',
            invokerIdentity: 'User1',
            contractArguments: [`${this.workerIndex}_${randomId}`],
            readOnly: true
        };

        await this.sutAdapter.sendRequests(myArgs);
    }
    
    async cleanupWorkloadModule() {
        // NOOP
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;