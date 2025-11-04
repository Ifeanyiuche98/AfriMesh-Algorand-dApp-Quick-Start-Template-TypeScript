// Home.tsx - Modern Web3 Redesign
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import { AiOutlineDeploymentUnit, AiOutlineSend, AiOutlineStar } from 'react-icons/ai'
import { BsArrowUpRightCircle, BsWallet2 } from 'react-icons/bs'

// Frontend modals
import AppCalls from './components/AppCalls'
import ConnectWallet from './components/ConnectWallet'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'
import Transact from './components/Transact'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false)
  const [openMintModal, setOpenMintModal] = useState<boolean>(false)
  const [openTokenModal, setOpenTokenModal] = useState<boolean>(false)
  const [openAppCallsModal, setOpenAppCallsModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <header className="w-full border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 flex items-center justify-center rounded bg-gray-100 text-gray-800 font-bold">A</div>
            <div>
              <div className="text-sm font-semibold">Algorand</div>
              <div className="text-xs text-gray-500">QuickStart Template</div>
            </div>
          </div>

          <div>
            <button
              className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded text-sm text-gray-700 hover:bg-gray-50"
              onClick={() => setOpenWalletModal(true)}
            >
              <BsWallet2 />
              <span>{activeAddress ? 'Wallet' : 'Connect'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Build on Algorand</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            A minimal interface to mint NFTs, create tokens, send transactions, and call smart contracts. Clean, focused and fast.
          </p>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setOpenWalletModal(true)}
              className="px-5 py-2 rounded border border-gray-200 text-sm bg-gray-50 hover:bg-gray-100"
            >
              {activeAddress ? 'Manage Wallet' : 'Connect Wallet'}
            </button>
            <a href="#features" className="px-5 py-2 rounded text-sm text-gray-600 hover:underline">Features</a>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 pb-20">
          {activeAddress ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                className="p-4 border border-gray-100 rounded text-left hover:shadow-sm"
                onClick={() => setOpenPaymentModal(true)}
              >
                <div className="flex items-center gap-3">
                  <AiOutlineSend className="text-2xl" />
                  <div>
                    <div className="font-semibold">Send</div>
                    <div className="text-xs text-gray-500">Send payments quickly</div>
                  </div>
                </div>
              </button>

              <button
                className="p-4 border border-gray-100 rounded text-left hover:shadow-sm"
                onClick={() => setOpenMintModal(true)}
              >
                <div className="flex items-center gap-3">
                  <AiOutlineStar className="text-2xl" />
                  <div>
                    <div className="font-semibold">Mint NFT</div>
                    <div className="text-xs text-gray-500">Create on-chain NFTs</div>
                  </div>
                </div>
              </button>

              <button
                className="p-4 border border-gray-100 rounded text-left hover:shadow-sm"
                onClick={() => setOpenTokenModal(true)}
              >
                <div className="flex items-center gap-3">
                  <BsArrowUpRightCircle className="text-2xl" />
                  <div>
                    <div className="font-semibold">Create Token</div>
                    <div className="text-xs text-gray-500">Issue a new asset</div>
                  </div>
                </div>
              </button>

              <button
                className="p-4 border border-gray-100 rounded text-left hover:shadow-sm"
                onClick={() => setOpenAppCallsModal(true)}
              >
                <div className="flex items-center gap-3">
                  <AiOutlineDeploymentUnit className="text-2xl" />
                  <div>
                    <div className="font-semibold">Smart Contract</div>
                    <div className="text-xs text-gray-500">Interact with contracts</div>
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Connect your wallet to access features.</p>
              <button
                className="px-4 py-2 rounded border border-gray-200 bg-gray-50"
                onClick={() => setOpenWalletModal(true)}
              >
                Connect Wallet
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500">© {new Date().getFullYear()} Algorand QuickStart</div>
      </footer>

      {/* Modals - preserved unchanged */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
      <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
      <NFTmint openModal={openMintModal} setModalState={setOpenMintModal} />
      <Tokenmint openModal={openTokenModal} setModalState={setOpenTokenModal} />
      <AppCalls openModal={openAppCallsModal} setModalState={setOpenAppCallsModal} />
    </div>
  )
}

export default Home
