const StellarSdk = require('stellar-sdk')
const $ = require('jquery')
import StellarAccounts from './StellarAccounts.js'
import StellarServer from './StellarServer.js'

export default class StellarUtils {
  constructor() {
    this.s = new StellarServer()
  }

  server() {
    return this.s.server()
  }

  friendBotServer() {
    return this.s.friendBotServer()
  }

  lumins() {
    return StellarSdk.Asset.native()
  }

  assetFromObject(object) {
    if (!object.asset_issuer) {
      return StellarSdk.Asset.native()
    }

    return new StellarSdk.Asset(object.asset_code, object.asset_issuer)
  }

  toStr(object) {
    if (object instanceof Error) {
      const json = JSON.stringify(object, null, '  ')

      // seems to return {} when it fails?
      const obj = JSON.parse(json)
      if (Object.keys(obj).length > 0) {
        return json
      }

      return object.toString()
    } else if (typeof object === 'string') {
      return object
    } else if (typeof object === 'object') {
      return JSON.stringify(object, null, '  ')
    }

    return typeof object
  }

  log(object) {
    console.log(this.toStr(object))
  }

  api() {
    return this.s.serverAPI()
  }

  horizonMetrics() {
    return this.api().horizonMetrics()
  }

  accountInfo(publicKey) {
    return this.api().accountInfo(publicKey)
  }

  balances(publicKey) {
    return this.api().balances(publicKey)
  }

  mergeAccount(sourceSecret, destKey) {
    return this.api().mergeAccount(sourceSecret, destKey)
  }

  manageOffer(sourceSecret, buying, selling, amount, price, offerID = 0) {
    return this.api().manageOffer(sourceSecret, buying, selling, amount, price, offerID)
  }

  changeTrust(sourceSecret, asset, amount) {
    return this.api().changeTrust(sourceSecret, asset, amount)
  }

  allowTrust(sourceSecret, trustor, asset, authorize) {
    return this.api().allowTrust(sourceSecret, trustor, asset, authorize)
  }

  setDomain(sourceSecret, domain) {
    return this.api().setDomain(sourceSecret, domain)
  }

  makeMultiSig(sourceSecret, publicKey) {
    return this.api().makeMultiSig(sourceSecret, publicKey)
  }

  sendAsset(sourceSecret, destKey, amount, asset = null, memo = null, additionalSigners = null) {
    return this.api().sendAsset(sourceSecret, destKey, amount, asset, memo, additionalSigners)
  }

  buyTokens(sourceSecret, sendAsset, destAsset, sendMax, destAmount) {
    return this.api().buyTokens(sourceSecret, sendAsset, destAsset, sendMax, destAmount)
  }

  lockAccount(sourceSecret) {
    return this.api().lockAccount(sourceSecret)
  }

  createAccount(sourceSecret, destinationKey, startingBalance) {
    return this.api().createAccount(sourceSecret, destinationKey, startingBalance)
  }

  setOptions(sourceSecret, options) {
    return this.api().setOptions(sourceSecret, options)
  }

  setFlags(sourceSecret, flags) {
    return this.api().setFlags(sourceSecret, flags)
  }

  clearFlags(sourceSecret, flags) {
    return this.api().clearFlags(sourceSecret, flags)
  }

  setInflationDestination(sourceSecret, inflationDest) {
    return this.api().setInflationDestination(sourceSecret, inflationDest)
  }

  createTestAccount(name = null, page = null) {
    return new Promise((resolve, reject) => {
      const keyPair = StellarSdk.Keypair.random()

      const url = 'https://horizon-testnet.stellar.org/friendbot' + '?addr=' + keyPair.publicKey()

      $.get(url, (data) => {
        // user setup by friendbot won't be on our server until it syncs, so just use stellars testnet
        this.friendBotServer().loadAccount(keyPair.publicKey())
          .then((account) => {
            const balances = {}

            account.balances.forEach((balance) => {
              if (balance.asset_type === 'native') {
                balances.XLM = balance.balance
              } else {
                balances[balance.asset_code] = balance.balance
              }
            })

            resolve(StellarAccounts.addAccount(keyPair, balances, name, page))
          })
          .catch((error) => {
            this.log(data)
            reject(error)
          })
      }, 'json').fail((err) => {
        reject(err)
      })
    })
  }

  updateBalances(callback = null) {
    for (let i = 0; i < StellarAccounts.accounts().length; i++) {
      const publicKey = StellarAccounts.publicKey(i)

      this.balances(publicKey)
        .then((balanceObject) => {
          for (const key in balanceObject) {
            StellarAccounts.updateBalance(i, key, balanceObject[key])
          }

          if (callback) {
            callback('Success: ' + publicKey)
          }
        })
        .catch((err) => {
          StellarAccounts.updateBalance(i, 'XLM', 'ERROR')

          if (callback) {
            callback('Error: ' + publicKey)
            callback(err)
          }
        })
    }
  }
}
