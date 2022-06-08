import rawFundraisingContractAddresses from 'engaland_fundraising_app/deploy/contract-addresses.json'
import rawFundraisingContractABIs from 'engaland_fundraising_app/deploy/contract-abis.json'
import type { Network } from './web3'
export const fundraisingContractAddresses =
  rawFundraisingContractAddresses as FundraisingContractAddresses
export const fundraisingContractABIs = rawFundraisingContractABIs as FundraisingContractABIs

export type FundraisingContractNames =
  | 'ERC20'
  | 'CoreMultisig'
  | 'EngaToken'
  | 'TokenManager'
  | 'BeneficiaryVault'
  | 'TreasuryVault'
  | 'ReserveVault'
  | 'StakeHolderVault'
  | 'SeedSale'
  | 'PreSale'
  | 'BancorFormula'
  | 'MarketMaker'
  | 'Tap'
  | 'KycAuthorization'
  | 'Controller'

export type FundraisingContractAddresses = {
  [key in Network]?: {
    [key in FundraisingContractNames]?: {
      address: string
      blockNumber: number
      blockHash: string
    }
  }
}

export type FundraisingContractABIs = {
  [key in Network]?: {
    [key in FundraisingContractNames]?: string
  }
}
