import { useState, useRef, useEffect } from 'react'

import { Buffer } from "buffer";

import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupBitgetWallet } from "@near-wallet-selector/bitget-wallet";
import { setupMyNearWallet } from "@near-wallet-selector/my-near-wallet";
import { setupSender } from "@near-wallet-selector/sender";
import { setupHereWallet } from "@near-wallet-selector/here-wallet";
import { setupMathWallet } from "@near-wallet-selector/math-wallet";
import { setupNightly } from "@near-wallet-selector/nightly";
import { setupMeteorWallet } from "@near-wallet-selector/meteor-wallet";
import { setupNarwallets } from "@near-wallet-selector/narwallets";
import { setupWelldoneWallet } from "@near-wallet-selector/welldone-wallet";
import { setupWalletConnect } from "@near-wallet-selector/wallet-connect";
import { setupNearFi } from "@near-wallet-selector/nearfi";
import { setupCoin98Wallet } from "@near-wallet-selector/coin98-wallet";
import { setupXDEFI } from "@near-wallet-selector/xdefi";
import { setupNearMobileWallet } from "@near-wallet-selector/near-mobile-wallet";
import { setupMintbaseWallet } from "@near-wallet-selector/mintbase-wallet";

import './App.css'


const selector = await setupWalletSelector({
    network: "mainnet",
    modules: [
        setupBitgetWallet(),
        setupMyNearWallet(),
        setupSender(),
        setupHereWallet(),
        setupMathWallet(),
        setupNightly(),
        setupMeteorWallet(),
        // setupOkxWallet(),
        setupNarwallets(),
        setupWelldoneWallet(),
        setupNearFi(),
        setupCoin98Wallet(),
        setupXDEFI(),
        setupWalletConnect({
            projectId: "c4f79cc...",
            metadata: {
                name: "NEAR Wallet Selector",
                description: "Example dApp used by NEAR Wallet Selector",
                url: "https://github.com/near/wallet-selector",
                icons: ["https://avatars.githubusercontent.com/u/37784886"],
            },
        }),
        setupNearMobileWallet(),
        setupMintbaseWallet({
            networkId: "mainnet",
            walletUrl: "https://wallet.mintbase.xyz",
            callbackUrl: "https://www.mywebsite.com",
            deprecated: false,
        }),
    ],
});

const signMessage = async (walletName, queryParams) => {
    const {message, recipient, callbackUrl} = queryParams;
    const nonce = Buffer.from(queryParams.nonce);

    let wallet = await selector.wallet(walletName);

    const signedMessage = await wallet.signMessage({
        message,
        nonce,
        recipient,
        callbackUrl
    });

    // injected wallets auth
    respondSignatureData(callbackUrl, signedMessage.accountId, signedMessage.signature, signedMessage.publicKey);
}

const respondSignatureData = (callbackUrl, accountId, signature, publicKey) => {
    if (callbackUrl) {
        const urlParams = new URLSearchParams({
            accountId,
            signature,
            publicKey
        });
        forwardTo(`${callbackUrl}#${urlParams.toString()}`);
    }
    else {
        console.error("Illegal data");
    }
}

const forwardTo = (downloadUrl) => {
    window.location.replace(downloadUrl);
}

const padWithZeros = (input) => {
    console.log(input)
    if (/^\d+$/.test(input)) {
        while (input.length < 32) {
            input = '0' + input;
        }
        return input;
    } else {
        throw new Error("Nonce contains non-numeric characters");
    }
}

function App() {
    const validDataProvided = useRef(false);
    const initWallets = useRef(false);
    const [data, setData] = useState([]);
    const [queryParams, setQueryParams] = useState({});
    const [expanded, setExpanded] = useState(false);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        setQueryParams({
            message: searchParams.get("message"),
            recipient: searchParams.get("recipient"),
            nonce: searchParams.get("nonce"),
            callbackUrl: searchParams.get("callbackUrl"),
        });
    }, []);

    useEffect(() => {
        const {message, recipient, nonce, callbackUrl} = queryParams;

        if (callbackUrl && message && recipient && nonce) {
            queryParams.nonce = padWithZeros(queryParams.nonce);
            console.log(queryParams.nonce)
            // enough data to sign the message
            validDataProvided.current = true;
        }

        if (initWallets.current) return;
        initWallets.current = true;

        const fetchWalletsData = async () => {
            try {
                const state = await selector.store.getState();
                setData(state.modules);
            } catch (error) {
                console.error("Error fetching state:", error);
            }
        };

        fetchWalletsData();
    }, [queryParams]);

    return (
        <div>
            <h1>Login with NEAR</h1>
            <div className="container">
                {(data ?? [])
                    .filter(item => !item.metadata.deprecated)
                    .map((item, index) => (
                    <div key={index} className="row">
                        <div className="column"><img className={"logo"} src={item.metadata.iconUrl} /></div>
                        <div className="column name">{item.metadata.name}</div>
                        <div className="column action">
                            { validDataProvided.current ?
                                <>{ item.metadata.available ?
                                <button onClick={()=>signMessage(item.id, queryParams)} className="sign-in">Login</button> :
                                <button onClick={()=>forwardTo(item.metadata.downloadUrl)}>Install</button>
                            }</> : <button disabled={true}>No&nbsp;data</button>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="container scroll-container">
            <div className={`expandable ${expanded ? 'expanded' : ''}`} onClick={()=>setExpanded(!expanded)}>Message details</div>

                {expanded && <pre>{JSON.stringify(queryParams, null, 4)}</pre>}
            </div>
        </div>
    );
}

export default App
