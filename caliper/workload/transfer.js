'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const {nanoid, random} = require('nanoid');

const carId = "R" + nanoid();
class MyWorkload extends WorkloadModuleBase {
    constructor() {
        super();
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        const car = {
            registrationNumber: "65A-000.99",
            engineNumber: "E" + nanoid(),
            chassisNumber: "C" + nanoid(),
            brand: "Mercedes",
            model: "BenZ",
            color: "Red",
            year: 2020,
            owner: "U" + nanoid(),
            capacity: 4124,
            owner: "U" + nanoid(),
            registeredCity:"cantho",
            registeredDistrict:"ninhkieu",
            carType:"carType3",
        }
        for (let i = 0; i < this.roundArguments.assets; i++) {
            // const carId = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Creating Car ${carId}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'createRegistration',
                invokerIdentity: 'User1',
                contractArguments: [
                    carId, 
                    car.engineNumber,
                        car.chassisNumber,
                        car.brand, 
                        car.model, 
                        car.color, 
                        car.year, 
                        car.capacity, 
                        car.owner,
                        car.registeredCity,
                        car.registeredDistrict,
                        car.carType
                ],
                readOnly: false
            };
            await this.sutAdapter.sendRequests(request);
        }
    }
    
    async submitTransaction() {
        // NOOP
        const transfer = {
            id : "T" + nanoid(),
            currentOwner:"CO" + nanoid(),
            newOwner: "NO" + nanoid(),
            carId: "R" + nanoid(),
            state:0,
            rejectUser: "Trương Ngọc Ánh",
        }
        try {
            const randomId = Math.floor(Math.random()*this.roundArguments.assets);
            const myArgs = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'createTransferOffer',
                invokerIdentity: 'User1',
                contractArguments: [ transfer.id,carId, transfer.currentOwner, transfer.newOwner],
                readOnly: true
            };
    
            await this.sutAdapter.sendRequests(myArgs);
        } catch (error) {
            
        }
    }
    
    async cleanupWorkloadModule() {
    
        for (let i=0; i<this.roundArguments.assets; i++) {
            // const carId = `${this.workerIndex}_${i}`;
            console.log(`Worker ${this.workerIndex}: Deleting Car ${carId}`);
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'deleteCar',
                invokerIdentity: 'User1',
                contractArguments: [carId],
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