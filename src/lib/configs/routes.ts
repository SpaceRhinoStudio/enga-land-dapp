import DashboardIcon from '../../assets/icons/dapp-dashboard.svg'
import StakingIcon from '../../assets/icons/dapp-staking.svg'
import ExchangeIcon from '../../assets/icons/dapp-token.svg'
import DaoIcon from '../../assets/icons/dapp-federation.svg'
import AuctionIcon from '../../assets/icons/dapp-auction.svg'
import TicketsIcon from '../../assets/icons/dapp-ticket.svg'
import HomeIcon from '../../assets/icons/home-sidebar.svg'
import AboutUsIcon from '../../assets/icons/about-us-sidebar.svg'
import MarketPlaceIcon from '../../assets/icons/marketplace-sidebar.svg'
import DappIcon from '../../assets/icons/dapp-sidebar.svg'
import HelpIcon from '../../assets/icons/help-sidebar.svg'
import TelegramIcon from '../../assets/icons/footer-telegram.svg'
import TwitterIcon from '../../assets/icons/footer-twitter.svg'
import DiscordIcon from '../../assets/icons/footer-discord.svg'
import RedditIcon from '../../assets/icons/footer-reddit.svg'
import TokenomicsIcon from '../../assets/icons/vuesax-linear-trend-up.svg'
import GitHubIcon from '../../assets/icons/github-icon.svg'
import CommunityIcon from '../../assets/icons/vuesax-linear-people.svg'
import DocsIcon from '../../assets/icons/vuesax-linear-document-code.svg'
import MPEndroIcon from '../../assets/icons/marketplace-endro.svg'
import MPOpifexOffIcon from '../../assets/icons/marketplace-opifexOff.svg'
import MPOpifexIndexedIcon from '../../assets/icons/marketplace-opifexIndexed.svg'
import MPCosmeticsIcon from '../../assets/icons/marketplace-cosmetics.svg'
import MPChipsetIcon from '../../assets/icons/marketplace-chipset.svg'
import MPConsumableIcon from '../../assets/icons/marketplace-consumable.svg'
import MPAccoutrementsIcon from '../../assets/icons/marketplace-accoutrements.svg'
import MPTicketsIcon from '../../assets/icons/marketplace-tickets.svg'
import MPListingsIcon from '../../assets/icons/marketplace-listings.svg'
import MPSalesIcon from '../../assets/icons/marketplace-sales.svg'
import MPPurchasesIcon from '../../assets/icons/marketplace-purchases.svg'
import MPSkinsIcon from '../../assets/icons/vuesax-linear-magic-star.svg'

export enum Routes {
  'home' = 'home',
  'dapp' = 'dapp',
  'marketplace' = 'marketplace',
  'help' = 'help',
  'aboutUs' = 'aboutUs',
  'dashboard' = 'dashboard',
  'staking' = 'staking',
  'exchange' = 'exchange',
  'dao' = 'dao',
  'auction' = 'auction',
  'tickets' = 'tickets',
  'telegram' = 'telegram',
  'twitter' = 'twitter',
  'discord' = 'discord',
  'reddit' = 'reddit',
  'tokenomics' = 'tokenomics',
  'github' = 'github',
  'community' = 'community',
  'docs' = 'docs',
  'mpEndro' = 'marketplaceEndro',
  'mpEndroSingle' = 'marketplaceEndroSingle',
  'mpOpifexOff' = 'mpOpifexOff',
  'mpOpifexIndexed' = 'mpOpifexIndexed',
  'mpCosmetics' = 'mpCosmetics',
  'mpChipset' = 'mpChipset',
  'mpConsumable' = 'mpConsumable',
  'mpAccoutrements' = 'mpAccoutrements',
  'mpSkins' = 'mpSkins',
  'mpTickets' = 'mpTickets',
  'mpListings' = 'mpListings',
  'mpSales' = 'mpSales',
  'mpPurchases' = 'mpPurchases',
}

export type RouteConfig = {
  href: string | RegExp
  id: Routes
  icon: any
  subRoutes?: Routes[]
  disabled: boolean
  preview?: boolean
}

export const routeConfig: {
  [key in Routes]: RouteConfig
} = {
  [Routes.home]: {
    id: Routes.home,
    href: 'https://enga.land/',
    icon: HomeIcon,
    disabled: false,
  },
  [Routes.dapp]: {
    id: Routes.dapp,
    href: '/',
    icon: DappIcon,
    disabled: false,
    subRoutes: [
      Routes.dashboard,
      Routes.staking,
      Routes.exchange,
      Routes.dao,
      Routes.auction,
      Routes.tickets,
    ],
  },
  [Routes.marketplace]: {
    id: Routes.marketplace,
    href: '/marketplace',
    icon: MarketPlaceIcon,
    disabled: true,
    preview: true,
  },
  [Routes.help]: {
    id: Routes.help,
    href: 'https://enga.land/help',
    icon: HelpIcon,
    disabled: true,
  },
  [Routes.aboutUs]: {
    id: Routes.aboutUs,
    href: 'https://docs.enga.land/about-us',
    icon: AboutUsIcon,
    disabled: false,
  },
  [Routes.dashboard]: {
    id: Routes.dashboard,
    href: '/dashboard',
    icon: DashboardIcon,
    disabled: true,
    preview: true,
  },
  [Routes.staking]: {
    id: Routes.staking,
    href: '/staking',
    icon: StakingIcon,
    disabled: true,
    preview: true,
  },
  [Routes.exchange]: {
    id: Routes.exchange,
    href: '/swap',
    icon: ExchangeIcon,
    disabled: false,
  },
  [Routes.dao]: {
    id: Routes.dao,
    href: '/dao',
    icon: DaoIcon,
    disabled: true,
  },
  [Routes.auction]: {
    id: Routes.auction,
    href: '/auction',
    icon: AuctionIcon,
    disabled: true,
  },
  [Routes.tickets]: {
    id: Routes.tickets,
    href: '/tickets',
    icon: TicketsIcon,
    disabled: true,
  },
  [Routes.telegram]: {
    id: Routes.telegram,
    href: 'https://telegram.org',
    icon: TelegramIcon,
    disabled: true,
  },
  [Routes.twitter]: {
    id: Routes.twitter,
    href: 'https://twitter.com',
    icon: TwitterIcon,
    disabled: true,
  },
  [Routes.discord]: {
    id: Routes.discord,
    href: 'https://discord.com',
    icon: DiscordIcon,
    disabled: true,
  },
  [Routes.reddit]: {
    id: Routes.reddit,
    href: 'https://reddit.com',
    icon: RedditIcon,
    disabled: true,
  },
  [Routes.tokenomics]: {
    id: Routes.tokenomics,
    href: 'https://docs.enga.land/tokenomic-land/tokenomics',
    icon: TokenomicsIcon,
    disabled: false,
  },
  [Routes.github]: {
    id: Routes.github,
    href: 'https://github.com/',
    icon: GitHubIcon,
    disabled: true,
  },
  [Routes.community]: {
    id: Routes.community,
    href: 'https://discord.com',
    icon: CommunityIcon,
    disabled: true,
  },
  [Routes.docs]: {
    id: Routes.docs,
    href: 'https://docs.enga.land',
    icon: DocsIcon,
    disabled: false,
  },
  [Routes.mpEndro]: {
    id: Routes.mpEndro,
    href: '/marketplace/endro',
    icon: MPEndroIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpOpifexOff]: {
    id: Routes.mpOpifexOff,
    href: '/marketplace/opifexOff',
    icon: MPOpifexOffIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpOpifexIndexed]: {
    id: Routes.mpOpifexIndexed,
    href: '/marketplace/opifexIndexed',
    icon: MPOpifexIndexedIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpCosmetics]: {
    id: Routes.mpCosmetics,
    href: '/marketplace/cosmetics',
    icon: MPCosmeticsIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpChipset]: {
    id: Routes.mpChipset,
    href: '/marketplace/chipset',
    icon: MPChipsetIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpConsumable]: {
    id: Routes.mpConsumable,
    href: '/marketplace/consumable',
    icon: MPConsumableIcon,
    disabled: true,
    preview: true,
  },
  [Routes.mpAccoutrements]: {
    id: Routes.mpAccoutrements,
    href: '/marketplace/accoutrements',
    icon: MPAccoutrementsIcon,
    disabled: true,
    preview: true,
  },
  [Routes.mpSkins]: {
    id: Routes.mpSkins,
    href: '/marketplace/skins',
    icon: MPSkinsIcon,
    disabled: true,
    preview: true,
  },
  [Routes.mpTickets]: {
    id: Routes.mpTickets,
    href: '/marketplace/tickets',
    icon: MPTicketsIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpListings]: {
    id: Routes.mpListings,
    href: '/marketplace/listings',
    icon: MPListingsIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpSales]: {
    id: Routes.mpSales,
    href: '/marketplace/sales',
    icon: MPSalesIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpPurchases]: {
    id: Routes.mpPurchases,
    href: '/marketplace/purchases',
    icon: MPPurchasesIcon,
    disabled: false,
    preview: true,
  },
  [Routes.mpEndroSingle]: {
    id: Routes.mpEndroSingle,
    href: /\/endro\/[A-z0-9#]*/,
    preview: true,
    disabled: false,
    icon: undefined,
  },
}
