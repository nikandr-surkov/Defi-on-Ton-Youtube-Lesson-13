import { toNano } from '@ton/core';
import { Functions } from '../wrappers/Functions';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const functions = provider.open(await Functions.fromInit());

    await functions.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(functions.address);

    // run methods on `functions`
}
