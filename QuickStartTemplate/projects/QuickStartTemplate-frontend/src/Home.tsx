// Home.tsx
// Redesigned landing UI with modern Web3 aesthetics using TailwindCSS.
// Logic for wallet and modals remains unchanged.

import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import { AiOutlineDeploymentUnit, AiOutlineSend, AiOutlineStar, AiOutlineWallet } from 'react-icons/ai'
import { BsArrowUpRightCircle, BsWallet2 } from 'react-icons/bs'
import './styles/cyberpunk.css'

// Frontend modals
import ConnectWallet from './components/ConnectWallet'
import NFTmint from './components/NFTmint'
import Tokenmint from './components/Tokenmint'
import Transact from './components/Transact'

// Smart contract demo modal (backend app calls)
import AppCalls from './components/AppCalls'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [openPaymentModal, setOpenPaymentModal] = useState<boolean>(false)
  const [openMintModal, setOpenMintModal] = useState<boolean>(false)
  const [openTokenModal, setOpenTokenModal] = useState<boolean>(false)
  const [openAppCallsModal, setOpenAppCallsModal] = useState<boolean>(false)

  const { activeAddress } = useWallet()

  return (
    <div className="min-h-screen cyberpunk-bg text-gray-100 flex flex-col font-inter relative">
      {/* Navbar */}
      <nav className="w-full fixed top-0 z-50 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold neon-title z-20">AfriMesh</h1>

        <div className="z-20">
          <button
            onClick={() => setOpenWalletModal(true)}
            className="neon-button ghost flex items-center gap-3"
            title={activeAddress ? 'Wallet Connected' : 'Connect Wallet'}
          >
            <BsWallet2 className="icon-neon" />
            <span className="text-sm font-semibold">{activeAddress ? 'Connected' : 'Connect'}</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-28 pb-12 relative text-center overflow-hidden">
        <div className="hero-grid" />
        <div className="relative z-10 max-w-4xl mx-auto px-6">
          <h2 className="neon-title text-4xl sm:text-5xl leading-tight">AfriMesh — Neon Mesh for the Next Web</h2>
          <p className="neon-sub mt-4 text-lg max-w-2xl mx-auto">
            A cyberpunk demo of Algorand-powered mesh networks. Connect your wallet and explore payments,
            NFTs, tokens and smart contracts in a neon-lit playground.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => setOpenWalletModal(true)}
              className="neon-button primary"
            >
              {activeAddress ? 'Explore Features' : 'Connect Wallet'}
            </button>

            <button
              onClick={() => setOpenAppCallsModal(true)}
              className="neon-button ghost"
            >
              <AiOutlineWallet />
              DApp Calls
            </button>
          </div>
        </div>
      </header>

      {/* Features */}
      <main className="flex-1 px-6 pb-20 mt-4 relative z-10">
        {activeAddress ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="group p-6 glass-card rounded-2xl">
              <AiOutlineSend className="text-4xl mb-3 text-cyan-300 icon-neon" />
              <h3 className="text-lg font-semibold mb-2">Send Payment</h3>
              <p className="text-sm text-gray-300 mb-4">
                Send ALGO across the network. Quick, transparent, and neon-fast.
              </p>
              <button
                className="neon-button primary w-full justify-center"
                onClick={() => setOpenPaymentModal(true)}
              >
                Open
              </button>
            </div>

            <div className="group p-6 glass-card rounded-2xl">
              <AiOutlineStar className="text-4xl mb-3 text-pink-300 icon-neon" />
              <h3 className="text-lg font-semibold mb-2">Mint NFT</h3>
              <p className="text-sm text-gray-300 mb-4">Upload and mint art to the Algorand ledger with IPFS metadata.</p>
              <button
                className="neon-button primary w-full justify-center"
                onClick={() => setOpenMintModal(true)}
              >
                Open
              </button>
            </div>

            <div className="group p-6 glass-card rounded-2xl">
              <BsArrowUpRightCircle className="text-4xl mb-3 text-purple-300 icon-neon" />
              <h3 className="text-lg font-semibold mb-2">Create Token (ASA)</h3>
              <p className="text-sm text-gray-300 mb-4">Spin up a test token to experiment and learn.</p>
              <button
                className="neon-button primary w-full justify-center"
                onClick={() => setOpenTokenModal(true)}
              >
                Open
              </button>
            </div>

            <div className="group p-6 glass-card rounded-2xl">
              <AiOutlineDeploymentUnit className="text-4xl mb-3 text-amber-300 icon-neon" />
              <h3 className="text-lg font-semibold mb-2">Contract Interactions</h3>
              <p className="text-sm text-gray-300 mb-4">Interact with on-chain logic to see decentralized flows in action.</p>
              <button
                className="neon-button primary w-full justify-center"
                onClick={() => setOpenAppCallsModal(true)}
              >
                Open
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-12">
            <p>⚡ Connect your wallet to unlock the neon playground.</p>
          </div>
        )}
      </main>

      {/* Modals (same logic) */}
      <ConnectWallet openModal={openWalletModal} closeModal={() => setOpenWalletModal(false)} />
      <Transact openModal={openPaymentModal} setModalState={setOpenPaymentModal} />
      <NFTmint openModal={openMintModal} setModalState={setOpenMintModal} />
      <Tokenmint openModal={openTokenModal} setModalState={setOpenTokenModal} />
      <AppCalls openModal={openAppCallsModal} setModalState={setOpenAppCallsModal} />
    </div>
  )
}

export default Home
