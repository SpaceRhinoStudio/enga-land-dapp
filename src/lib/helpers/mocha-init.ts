import chai from 'chai'
import chaiShallowDeepEqual from 'chai-shallow-deep-equal'
import chaiAsPromised from 'chai-as-promised'

chai.use(chaiShallowDeepEqual)
chai.use(chaiAsPromised)
const projectDir = process.cwd()
