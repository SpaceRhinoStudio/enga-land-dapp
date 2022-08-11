import '../../index'
import { web3Config } from './web3'
import { config as sharedConfig } from '../shared/configs'

export const config = {
  ...web3Config,
  ...sharedConfig,
}
