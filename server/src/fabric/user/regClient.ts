import  { registerUser } from './RegisterUser';
import { User } from './UserInterface'

const client: User = {
    fullName: 'Client',
    identityCardNumber: 'Client',
    id: 'Client',
    phoneNumber: 'Client',
    dateOfBirth: '19/12/2012',
    role: 'citizen',
    password: 'client',
    docType: 'user',
} 

try {
    registerUser(client);
} catch (error) {
    
}