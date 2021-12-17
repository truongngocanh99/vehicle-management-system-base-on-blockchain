/*
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserContract } from "./User/UserContract";
export { UserContract } from "./User/UserContract";

import { CarContract } from './Car/CarContract';
export { CarContract } from './Car/CarContract';

export const contracts: any[] = [ CarContract,UserContract ];