'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const {nanoid, random} = require('nanoid');

class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        const car = {
            id: "U" + nanoid(),
            registrationNumber: "65A-65246",
            brand: "Nissan",
            model: "Maxima",
            color: "Puce",
            engineNumber: "U" + nanoid(),
            chassisNumber: "U" + nanoid(),
            owner: "U" + nanoid(),
            year: 2002,
            capacity: 4124
        }
        for (let i = 0; i < this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating asset ${assetID}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'createRegistration',
                invokerIdentity: 'User1',
                contractArguments: [assetID, car.engineNumber, car.chassisNumber, car.brand, car.model, car.color, car.year, car.capacity, car.owner],
                readOnly: false
            };
            await this.sutAdapter.sendRequests(request);
        }
    }
    
    async submitTransaction() {
        // NOOP

        try {
            const randomId = Math.floor(Math.random()*this.roundArguments.assets);
            const myArgs = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'queryCarById',
                invokerIdentity: 'User1',
                contractArguments: [`${this.workerIndex}_${randomId}`],
                readOnly: true
            };
    
            await this.sutAdapter.sendRequests(myArgs);
        } catch (error) {
            
        }
    }
    
    async cleanupWorkloadModule() {
        for (let i=0; i<this.roundArguments.assets; i++) {
            const assetID = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Deleting asset ${assetID}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'deleteCar',
                invokerIdentity: 'User1',
                contractArguments: [assetID],
                readOnly: false
            };

            await this.sutAdapter.sendRequests(request);
        }
    }
}

function createWorkloadModule() {
    return new MyWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;