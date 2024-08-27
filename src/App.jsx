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
import { setupBitteWallet } from "@near-wallet-selector/bitte-wallet";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import copy from "copy-to-clipboard";

import './App.css'
import {generateCallbackUrl} from "./utils.js";


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
        setupBitteWallet({
            networkId: "mainnet",
            walletUrl: "https://wallet.mintbase.xyz",
            callbackUrl: "https://www.mywebsite.com",
            deprecated: false,
        }),
    ],
});

const signMessage = async (walletName, queryParams, remoteLogin) => {
    const {message, recipient, callbackUrl} = queryParams;
    const nonce = Buffer.from(queryParams.nonce);

    let wallet = await selector.wallet(walletName);

    const signedMessage = await wallet.signMessage({
        message,
        nonce,
        recipient,
        callbackUrl
    });

    if (remoteLogin) {
        return {
            signature: signedMessage.signature,
            accountId: signedMessage.accountId,
            publicKey: signedMessage.publicKey,
            message,
            nonce,
            recipient,
            callbackUrl
        }
    }
    else {
        // injected wallets auth
        return respondSignatureData(callbackUrl, signedMessage.accountId, signedMessage.signature, signedMessage.publicKey);
    }
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

    return {};
}

const forwardTo = (downloadUrl) => {
    window.location.replace(downloadUrl);
}

const padWithZeros = (input) => {
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
    /// no callbackUrl, but we show NearAI command how to login
    const [remoteLogin, setRemoteLogin] = useState(false);
    const [remoteLoginData, setRemoteLoginData] = useState({});

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);

        setQueryParams({
            message: searchParams.get("message"),
            recipient: searchParams.get("recipient"),
            nonce: searchParams.get("nonce"),
            callbackUrl: searchParams.get("callbackUrl"),

            type: searchParams.get("type"),

            accountId: searchParams.get("accountId"),
            publicKey: searchParams.get("publicKey"),
            signature: searchParams.get("signature"),
        });
    }, []);

    useEffect(() => {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        params.forEach((value, key) => {
            queryParams[key] = value;
        });

        const {message, recipient, nonce, callbackUrl, accountId, publicKey, signature, type} = queryParams;

        if (nonce) {
            queryParams.nonce = padWithZeros(queryParams.nonce);
        }

        if (message && recipient && nonce) {
            if (!callbackUrl) {
                setRemoteLogin(true);
                queryParams.callbackUrl =  generateCallbackUrl(queryParams);
            }

            queryParams.nonce = padWithZeros(queryParams.nonce);
            // enough data to sign the message
            validDataProvided.current = true;
        }

        if (accountId && publicKey && signature) {
            if (type === "remote") {
                setRemoteLoginData ({
                    signature,
                    accountId,
                    publicKey,
                    message,
                    recipient,
                    nonce,
                    callbackUrl: generateCallbackUrl(queryParams)
                })

                const cleanUrl = window.location.origin;
                window.history.replaceState({}, document.title, cleanUrl);
            }
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

    const displayRemoteLoginData = !!Object.keys(remoteLoginData).length;

    const getSignInCli = () => {
        return `nearai login save --accountId=${remoteLoginData.accountId} --signature=${remoteLoginData.signature} --publicKey=${remoteLoginData.publicKey} --nonce=${remoteLoginData.nonce} --callbackUrl='${remoteLoginData.callbackUrl}'`
    }

    const copyToClipboard = () => {
        let isCopy = copy(getSignInCli());
        if (isCopy) {
            toast.success("Copied to Clipboard");
        }
    };

    const filteredQueryParams = Object.fromEntries(
        Object.entries(queryParams).filter(([, value]) => value !== null)
    );

    return (
        <div>
            <ToastContainer
                position="bottom-center"
                autoClose={500}
                hideProgressBar
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />

            {displayRemoteLoginData && <div>
                <h2>Successfully Signed with NEAR</h2>
                <p>To complete your login, please return to the console and enter the following command:</p>
                <div className="container scroll-container container-remote-login">
                    <pre>{getSignInCli()}</pre>
                    <button onClick={copyToClipboard}>Copy To Clipboard</button>
                </div>
            </div>}
            {!displayRemoteLoginData && <><h1>Login with NEAR</h1>
            <div className="container">
                {(data ?? [])
                    .filter(item => !item.metadata.deprecated)
                    .map((item, index) => (
                    <div key={index} className="row">

                        <div className="column"><img className={"logo"} src={`${item.id}.png`} /></div>
                        <div className="column name">{item.metadata.name}</div>
                        <div className="column action">
                            { validDataProvided.current ?
                                <>{ item.metadata.available ?
                                <button onClick={async () => {
                                    const data = await signMessage(item.id, queryParams, remoteLogin);
                                    setRemoteLoginData(data);
                                }} className="sign-in">Login</button> :
                                <button onClick={()=>forwardTo(item.metadata.downloadUrl)}>Install</button>
                            }</> : <button disabled={true}>No&nbsp;data</button>}
                        </div>
                    </div>
                ))}
            </div>
            <div className="container scroll-container">
            <div className={`expandable ${expanded ? 'expanded' : ''}`} onClick={()=>setExpanded(!expanded)}>Message details</div>
                {expanded && <pre>{JSON.stringify(filteredQueryParams, null, 4)}</pre>}
            </div>
            </>}
        </div>
    );
}

export default App
