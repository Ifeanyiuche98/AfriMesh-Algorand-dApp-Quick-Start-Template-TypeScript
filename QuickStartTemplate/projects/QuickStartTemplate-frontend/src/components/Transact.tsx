// Transact.tsx
// Professional-themed payment modal: send 1 ALGO or 1 USDC (TestNet).
// Clean, modern design with smooth layout and solid color theme.

import { algo, AlgorandClient } from '@algorandfoundation/algokit-utils'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import { AiOutlineLoading3Quarters, AiOutlineSend } from 'react-icons/ai'
import { getAlgodConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'

interface TransactInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
}

const Transact = ({ openModal, setModalState }: TransactInterface) => {
  const LORA = 'https://lora.algokit.io/testnet'

  const [loading, setLoading] = useState<boolean>(false)
  const [receiverAddress, setReceiverAddress] = useState<string>('')
  const [assetType, setAssetType] = useState<'ALGO' | 'USDC'>('ALGO')

  const [groupLoading, setGroupLoading] = useState<boolean>(false)
  const [groupReceiverAddress, setGroupReceiverAddress] = useState<string>('')

  const [optInLoading, setOptInLoading] = useState<boolean>(false)
  const [alreadyOpted, setAlreadyOpted] = useState<boolean>(false)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({ algodConfig })

  const { enqueueSnackbar } = useSnackbar()
  const { transactionSigner, activeAddress } = useWallet()

  const usdcAssetId = 10458941n
  const usdcDecimals = 6

  useEffect(() => {
    const checkOptIn = async () => {
      try {
        if (!openModal || !activeAddress) {
          setAlreadyOpted(false)
          return
        }
        const acctInfo: any = await algorand.client.algod.accountInformation(activeAddress).do()
        const assets: any[] = Array.isArray(acctInfo?.assets) ? acctInfo.assets : []
        const opted = assets.some((a: any) => {
          const rawId = a?.['asset-id'] ?? a?.assetId ?? a?.asset?.id
          if (rawId === undefined || rawId === null) return false
          try {
            return BigInt(rawId) === usdcAssetId
          } catch {
            return false
          }
        })
        setAlreadyOpted(opted)
      } catch (e) {
        console.error('Opt-in precheck failed:', e)
      }
    }
    checkOptIn()
  }, [openModal, activeAddress])

  const handleSubmit = async () => {
    setLoading(true)
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setLoading(false)
      return
    }

    try {
      enqueueSnackbar(`Sending ${assetType} transaction...`, { variant: 'info' })
      let txResult
      let msg

      if (assetType === 'ALGO') {
        txResult = await algorand.send.payment({
          signer: transactionSigner,
          sender: activeAddress,
          receiver: receiverAddress,
          amount: algo(1),
        })
        msg = '✅ 1 ALGO sent!'
      } else {
        const usdcAmount = 1n * 10n ** BigInt(usdcDecimals)
        txResult = await algorand.send.assetTransfer({
          signer: transactionSigner,
          sender: activeAddress,
          receiver: receiverAddress,
          assetId: usdcAssetId,
          amount: usdcAmount,
        })
        msg = '✅ 1 USDC sent!'
      }

      const txId = txResult?.txIds?.[0]

      enqueueSnackbar(`${msg} TxID: ${txId}`, {
        variant: 'success',
        action: () =>
          txId ? (
            <a
              href={`${LORA}/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', marginLeft: 8 }}
            >
              View on Lora ↗
            </a>
          ) : null,
      })

      setReceiverAddress('')
    } catch (e) {
      console.error(e)
      enqueueSnackbar(`Failed to send ${assetType}`, { variant: 'error' })
    }

    setLoading(false)
  }

  const handleOptInUSDC = async () => {
    setOptInLoading(true)
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setOptInLoading(false)
      return
    }

    try {
      const acctInfo: any = await algorand.client.algod.accountInformation(activeAddress).do()
      const assets: any[] = Array.isArray(acctInfo?.assets) ? acctInfo.assets : []
      const alreadyOptedNow = assets.some((a: any) => {
        const rawId = a?.['asset-id'] ?? a?.assetId ?? a?.asset?.id
        if (rawId === undefined || rawId === null) return false
        try {
          return BigInt(rawId) === usdcAssetId
        } catch {
          return false
        }
      })
      setAlreadyOpted(alreadyOptedNow)

      if (alreadyOptedNow) {
        enqueueSnackbar('Your wallet is already opted in to USDC.', { variant: 'info' })
        setOptInLoading(false)
        return
      }

      const res = await algorand.send.assetOptIn({
        signer: transactionSigner,
        sender: activeAddress,
        assetId: usdcAssetId,
      })
      const txId = res?.txIds?.[0]
      enqueueSnackbar(`✅ Opt-in complete for USDC. TxID: ${txId}`, {
        variant: 'success',
        action: () =>
          txId ? (
            <a
              href={`${LORA}/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', marginLeft: 8 }}
            >
              View on Lora ↗
            </a>
          ) : null,
      })
      setAlreadyOpted(true)
    } catch (e) {
      console.error(e)
      enqueueSnackbar('USDC opt-in failed (maybe already opted in).', { variant: 'error' })
    }

    setOptInLoading(false)
  }

  const handleAtomicGroup = async () => {
    setGroupLoading(true)
    if (!transactionSigner || !activeAddress) {
      enqueueSnackbar('Please connect wallet first', { variant: 'warning' })
      setGroupLoading(false)
      return
    }
    if (groupReceiverAddress.length !== 58) {
      enqueueSnackbar('Enter a valid Algorand address (58 chars).', { variant: 'warning' })
      setGroupLoading(false)
      return
    }

    try {
      enqueueSnackbar('Sending atomic transfer: 1 ALGO + 1 USDC...', { variant: 'info' })
      const group = algorand.newGroup()

      group.addPayment({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: groupReceiverAddress,
        amount: algo(1),
      })

      const oneUSDC = 1n * 10n ** BigInt(usdcDecimals)
      group.addAssetTransfer({
        signer: transactionSigner,
        sender: activeAddress,
        receiver: groupReceiverAddress,
        assetId: usdcAssetId,
        amount: oneUSDC,
      })

      const result = await group.send()
      const firstTx = result?.txIds?.[0]

      enqueueSnackbar(`✅ Atomic transfer complete! (1 ALGO + 1 USDC)`, {
        variant: 'success',
        action: () =>
          firstTx ? (
            <a
              href={`${LORA}/transaction/${firstTx}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'underline', marginLeft: 8 }}
            >
              View on Lora ↗
            </a>
          ) : null,
      })

      setGroupReceiverAddress('')
    } catch (e) {
      console.error(e)
      enqueueSnackbar('Atomic transfer failed. Make sure the receiver is opted into USDC (10458941).', {
        variant: 'error',
      })
    }

    setGroupLoading(false)
  }

  return (
    <dialog id="transact_modal" className={`modal modal-bottom sm:modal-middle ${openModal ? 'modal-open' : ''}`}>
      <div
        className={`
          modal-box max-w-xl rounded-2xl border border-gray-700
          bg-[#121212] text-gray-100 shadow-xl p-6 transition-all duration-300
        `}
      >
        {(loading || groupLoading || optInLoading) && (
          <div className="relative h-1 w-full mb-4 overflow-hidden rounded bg-gray-800">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-[progress_1.2s_linear_infinite] bg-blue-500" />
            <style>{`
              @keyframes progress {
                0% { transform: translateX(-120%); }
                50% { transform: translateX(60%); }
                100% { transform: translateX(220%); }
              }
            `}</style>
          </div>
        )}

        <h3 className="flex items-center gap-3 text-xl sm:text-2xl font-semibold text-white">
          <AiOutlineSend className="text-2xl text-blue-400" />
          Transaction Console
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          Send <b>1 {assetType}</b> securely on the Algorand TestNet.
        </p>

        <div className="form-control mt-5">
          <label className="label py-1">
            <span className="label-text text-gray-200 font-medium">Receiver&apos;s Address</span>
          </label>
          <input
            type="text"
            data-test-id="receiver-address"
            className="input input-bordered w-full rounded-lg bg-gray-900 text-gray-100 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
            placeholder="e.g., KPLX..."
            value={receiverAddress}
            onChange={(e) => setReceiverAddress(e.target.value)}
          />
          <div className="flex justify-between items-center text-xs mt-2 text-gray-400">
            <span>Amount: 1 {assetType}</span>
            <span className={`font-mono ${receiverAddress.length === 58 ? 'text-green-400' : 'text-red-400'}`}>
              {receiverAddress.length}/58
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold border ${
              assetType === 'ALGO'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
            onClick={() => setAssetType('ALGO')}
          >
            ALGO
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-lg font-semibold border ${
              assetType === 'USDC'
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-gray-800 text-gray-300 border-gray-700 hover:bg-gray-700'
            }`}
            onClick={() => setAssetType('USDC')}
          >
            USDC
          </button>
        </div>

        <div className="modal-action mt-6 flex flex-col-reverse sm:flex-row-reverse gap-3">
          <button
            data-test-id="send"
            type="button"
            className={`btn w-full sm:w-auto rounded-lg font-semibold ${
              receiverAddress.length === 58
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleSubmit}
            disabled={loading || receiverAddress.length !== 58}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <AiOutlineLoading3Quarters className="animate-spin text-blue-300" />
                Sending…
              </span>
            ) : (
              `Send 1 ${assetType}`
            )}
          </button>
          <button
            type="button"
            className="btn w-full sm:w-auto rounded-lg border border-gray-600 bg-gray-900 text-gray-300 hover:bg-gray-800"
            onClick={() => setModalState(false)}
          >
            Close
          </button>
        </div>

        <div className="mt-8 p-4 rounded-xl border border-gray-700 bg-gray-900">
          <h4 className="text-lg font-semibold mb-1 text-white">Atomic Transfer</h4>
          <p className="text-sm text-gray-400 mb-3">
            Send <b>1 ALGO</b> + <b>1 USDC</b> in one atomic transaction. Receiver must be opted into USDC (ID:
            10458941).
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              type="button"
              className={`btn rounded-lg w-full sm:w-auto font-semibold ${
                alreadyOpted
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
              onClick={handleOptInUSDC}
              disabled={optInLoading || !activeAddress || alreadyOpted}
            >
              {optInLoading ? (
                <span className="flex items-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin text-white" />
                  Opting in…
                </span>
              ) : alreadyOpted ? (
                '✔ Already Opted In'
              ) : (
                'Opt in USDC'
              )}
            </button>
          </div>

          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-gray-200 font-medium">Receiver&apos;s Address</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full rounded-lg bg-gray-900 text-gray-100 border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition"
              placeholder="e.g., KPLX..."
              value={groupReceiverAddress}
              onChange={(e) => setGroupReceiverAddress(e.target.value)}
            />
            <div className="flex justify-between items-center text-xs mt-2 text-gray-400">
              <span>Bundle: 1 ALGO + 1 USDC</span>
              <span
                className={`font-mono ${
                  groupReceiverAddress.length === 58 ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {groupReceiverAddress.length}/58
              </span>
            </div>
          </div>

          <button
            type="button"
            className={`mt-4 btn w-full sm:w-auto rounded-lg font-semibold ${
              groupReceiverAddress.length === 58
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
            onClick={handleAtomicGroup}
            disabled={groupLoading || groupReceiverAddress.length !== 58}
          >
            {groupLoading ? (
              <span className="flex items-center gap-2">
                <AiOutlineLoading3Quarters className="animate-spin text-white" />
                Sending Atomic…
              </span>
            ) : (
              'Send Atomic: 1 ALGO + 1 USDC'
            )}
          </button>
        </div>
      </div>
    </dialog>
  )
}

export default Transact
