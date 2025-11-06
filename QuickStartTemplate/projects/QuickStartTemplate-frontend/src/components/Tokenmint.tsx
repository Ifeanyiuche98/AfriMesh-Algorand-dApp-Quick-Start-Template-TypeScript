// Tokenmint.tsx
// Professional Token Creation Form for Loyalty Rewards dApp on Algorand
// Clean startup dashboard look with TailwindCSS styling
// ⚠️ All minting and wallet logic preserved exactly as-is.

import { AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useMemo, useState } from 'react'
import { AiOutlineLoading3Quarters, AiOutlineInfoCircle } from 'react-icons/ai'
import { BsCoin } from 'react-icons/bs'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TokenMintProps {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Tokenmint = ({ openModal, setModalState }: TokenMintProps) => {
  const LORA = 'https://lora.algokit.io/testnet'

  // --- Learner-friendly default values ---
  const [assetName, setAssetName] = useState<string>('MasterPass Token')
  const [unitName, setUnitName] = useState<string>('MPT')
  const [total, setTotal] = useState<string>('1000')
  const [decimals, setDecimals] = useState<string>('0')
  const [loading, setLoading] = useState<boolean>(false)

  const { transactionSigner, activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = useMemo(() => AlgorandClient.fromConfig({ algodConfig }), [algodConfig])

  // ------------------------------
  // Handle Token Creation (logic unchanged)
  // ------------------------------
  const handleMintToken = async () => {
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect your wallet first.', { variant: 'warning' })
      return
    }

    if (!assetName || !unitName) {
      enqueueSnackbar('Please enter an asset name and unit name.', { variant: 'warning' })
      return
    }
    if (!/^\d+$/.test(total)) {
      enqueueSnackbar('Total supply must be a whole number.', { variant: 'warning' })
      return
    }
    if (!/^\d+$/.test(decimals)) {
      enqueueSnackbar('Decimals must be a whole number.', { variant: 'warning' })
      return
    }

    try {
      setLoading(true)
      enqueueSnackbar('Creating token...', { variant: 'info' })

      const totalBig = BigInt(total)
      const decimalsBig = BigInt(decimals)
      const onChainTotal = totalBig * 10n ** decimalsBig

      const createResult = await algorand.send.assetCreate({
        sender: activeAddress,
        signer: transactionSigner,
        total: onChainTotal,
        decimals: Number(decimalsBig),
        assetName,
        unitName,
        defaultFrozen: false,
      })

      const id = createResult

      enqueueSnackbar(`✅ Success! Asset ID: ${id.assetId}`, {
        variant: 'success',
        action: () =>
          id ? (
            <a
              href={`${LORA}/asset/${id.assetId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', marginLeft: 8 }}
            >
              View on Lora ↗
            </a>
          ) : null,
      })

      setAssetName('MasterPass Token')
      setUnitName('MPT')
      setTotal('1000')
      setDecimals('0')
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Failed to create token', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // ------------------------------
  // UI — Startup Dashboard Design
  // ------------------------------
  return (
    <dialog
      id="token_modal"
      className={`modal modal-bottom sm:modal-middle ${openModal ? 'modal-open' : ''}`}
    >
      <div
        className="
          modal-box max-w-lg rounded-2xl border border-gray-200
          bg-white p-8 shadow-xl text-gray-900 transition-all
        "
      >
        {/* Loading Bar */}
        {loading && (
          <div className="relative h-1 w-full -mt-3 mb-5 overflow-hidden rounded bg-gray-100">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[progress_1.2s_ease-in-out_infinite] bg-blue-600" />
            <style>{`
              @keyframes progress {
                0% { transform: translateX(-120%); }
                50% { transform: translateX(60%); }
                100% { transform: translateX(220%); }
              }
            `}</style>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <BsCoin className="text-2xl text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold">Create Loyalty Token</h3>
              <p className="text-sm text-gray-500">Mint your brand’s reward token on Algorand TestNet.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setModalState(false)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ✕ Close
          </button>
        </div>

        {/* Form */}
        <div className={`space-y-4 ${loading ? 'opacity-70' : ''}`}>
          {/* Token Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token Name</label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="e.g. MasterPass Token"
            />
          </div>

          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
            <input
              type="text"
              value={unitName}
              onChange={(e) => setUnitName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
              placeholder="e.g. MPT"
            />
          </div>

          {/* Grid for Total Supply & Decimals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Total Supply */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Supply</label>
              <input
                type="number"
                min={1}
                value={total}
                onChange={(e) => setTotal(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="e.g. 1000"
              />
            </div>

            {/* Decimals */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Decimals</label>
              <input
                type="number"
                min={0}
                max={19}
                value={decimals}
                onChange={(e) => setDecimals(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                placeholder="0 for whole tokens"
              />
              <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                <AiOutlineInfoCircle />
                <p>
                  On-chain total = <code>total × 10^decimals</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row-reverse gap-3">
          <button
            type="button"
            onClick={handleMintToken}
            disabled={loading || !assetName || !unitName || !total}
            className={`w-full sm:w-auto rounded-lg px-6 py-2.5 font-semibold text-sm transition-all
              ${assetName && unitName && total
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'}
            `}
          >
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <AiOutlineLoading3Quarters className="animate-spin" />
                Minting…
              </span>
            ) : (
              'Mint Token'
            )}
          </button>

          <button
            type="button"
            onClick={() => setModalState(false)}
            className="w-full sm:w-auto rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default Tokenmint
