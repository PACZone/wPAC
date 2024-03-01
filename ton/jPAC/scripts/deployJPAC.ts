import { toNano } from '@ton/core';
import { JPAC } from '../wrappers/JPAC';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const jPAC = provider.open(await JPAC.fromInit());

    await jPAC.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(jPAC.address);

    // run methods on `jPAC`
}
