import { useState, useRef, useEffect } from 'react'

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
    console.log("walletName", walletName)
    const {message, recipient} = queryParams;
    const nonce = queryParams.nonce ? Buffer.from(queryParams.nonce) : Buffer.from(crypto.getRandomValues(new Uint8Array(32)));

    const fullUrl = window.location.href;
    const urlObj = new URL(fullUrl);
    const callbackUrl = `${urlObj.origin}${urlObj.pathname}`;

    let wallet = await selector.wallet(walletName);

    localStorage.setItem("signMessageParams", JSON.stringify({
        message,
        nonce: [...nonce],
        recipient,
        callbackUrl
    }));

    const signedMessage = await wallet.signMessage({
        message,
        nonce,
        recipient,
        callbackUrl
    });

    // injected wallets auth
    auth(signedMessage.accountId, signedMessage.signature, signedMessage.publicKey);
}

const auth = (accountId, signature, publicKey) => {
    const serverCallbackUrl = localStorage.getItem("serverCallbackUrl");
    const signMessageParams = localStorage.getItem("signMessageParams") ?? "{}";
    if (serverCallbackUrl) {
        const urlParams = new URLSearchParams({
            signMessageParams,
            accountId,
            signature,
            publicKey
        });
        forwardTo(`${serverCallbackUrl}?${urlParams.toString()}`);
    }
    else {
        console.error("Illegal data");
    }
}

const forwardTo = (downloadUrl) => {
    window.location.replace(downloadUrl);
}

function App() {
    const validDataProvided = useRef(false);
    const initWallets = useRef(false);
    const [data, setData] = useState([]);
    const [queryParams, setQueryParams] = useState({});

    useEffect(() => {
        if (initWallets.current) return;
        initWallets.current = true;

        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const paramsObj = {};
        params.forEach((value, key) => {
            paramsObj[key] = value;
            localStorage.setItem(key, value);
        });
        setQueryParams(paramsObj);

        const {accountId, signature, publicKey, serverCallbackUrl, message, recipient} = paramsObj;

        if (serverCallbackUrl && message && recipient) {
            // enough data to sign message
            validDataProvided.current = true;
        }

        if (accountId && signature && publicKey) {
            // web wallets auth
            auth(accountId, signature, publicKey);
        }

        const fetchWalletsData = async () => {
            try {
                const state = await selector.store.getState();
                setData(state.modules);
            } catch (error) {
                console.error("Error fetching state:", error);
            }
        };

        fetchWalletsData();
    }, []);

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
                                <button onClick={()=>signMessage(item.id, queryParams)} className="sign-in">Sign In</button> :
                                <button onClick={()=>forwardTo(item.metadata.downloadUrl)}>Install</button>
                            }</> : <button disabled={true}>No&nbsp;data</button>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App
