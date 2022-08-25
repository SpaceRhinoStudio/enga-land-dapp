import rawFundraisingContractAddresses from 'engaland_fundraising_app/deploy/contract-addresses.json'
import rawFundraisingContractABIs from 'engaland_fundraising_app/deploy/contract-abis.json'
import { Network } from '$lib/types'

export const contractAddresses = rawFundraisingContractAddresses as ContractAddresses
export const contractABIs = rawFundraisingContractABIs as ContractABIs

export type ContractNames =
  | 'ERC20'
  | 'CoreMultisig'
  | 'EngaToken'
  | 'TokenManager'
  | 'TreasuryVault'
  | 'ReserveVault'
  | 'SeedSale'
  | 'PreSale'
  | 'BancorFormula'
  | 'MarketMaker'
  | 'Tap'
  | 'KycAuthorization'
  | 'Controller'

export type ContractAddresses = {
  [key in Network]?: {
    [key in ContractNames]?: {
      address: string
      blockNumber: number
      blockHash: string
    }
  }
}

export type ContractABIs = {
  [key in Network]?: {
    [key in ContractNames]?: string
  }
}
