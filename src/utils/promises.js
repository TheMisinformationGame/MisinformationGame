

export function createWaitPromise(durationMS) {
    return new Promise(resolve => setTimeout(resolve, durationMS));
}


export function retryPromiseOperation(operation, delay, retries) {
    return new Promise((resolve, reject) => {
        return operation()
            .then(resolve)
            .catch((reason) => {
                console.log("Error when running retry-looped operation:", reason);
                if (retries > 0) {
                    return createWaitPromise(delay)
                        .then(retryPromiseOperation.bind(null, operation, delay, retries - 1))
                        .then(resolve)
                        .catch(reject);
                }
                return reject(reason);
            });
    });
}
