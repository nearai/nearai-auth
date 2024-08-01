export function generateCallbackUrl(queryParams) {
    const urlParams = new URLSearchParams({
        message: queryParams.message,
        recipient: queryParams.recipient,
        nonce: queryParams.nonce,
        type: "remote"
    });

    return `${window.location.origin}?${urlParams.toString()}`
}