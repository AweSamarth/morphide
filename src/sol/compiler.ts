interface AbiIO {
    indexed?: boolean;
    internalType: string;
    name: string;
    type: string;
}

interface Abi {
    input: AbiIO[];
    output: AbiIO[];
    name: string;
    stateMutability: string;
    type: string;
    anonymous?: boolean;
}

interface ContractData {
    contractName: string;
    byteCode: string;
    abi: Abi[];
}

export const compile = (contractCode: string): Promise<ContractData[]> => {
    return new Promise((resolve, reject) => {
        const worker = new Worker(
            new URL("./solc.worker.ts", import.meta.url), { type: "module" }
        );
        worker.onmessage = function (e: any) {
            console.log("henlo")
            const output = e.data.output;
            console.log(output)
            const result = [];
            if (!output.contracts) {
                if(output.errors){
                    reject(output.errors[0].formattedMessage);
                }

                if(output.contract){
                    reject("No contract?")
                }
                console.log(output)
                reject("Invalid source code");
                return;
            }
            for (const contractName in output.contracts['contract']) {
                const contract = output.contracts['contract'][contractName];
                result.push({
                    contractName: contractName,
                    byteCode: contract.evm.bytecode.object,
                    abi: contract.abi
                } as ContractData);
            }
            resolve(result);
        };
        worker.onerror = reject;
        
        worker.postMessage({
            contractCode: contractCode,
        });
    });
};