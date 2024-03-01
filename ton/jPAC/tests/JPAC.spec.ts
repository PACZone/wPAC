import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { toNano } from '@ton/core';
import { JPAC } from '../wrappers/JPAC';
import '@ton/test-utils';

describe('JPAC', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let jPAC: SandboxContract<JPAC>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        jPAC = blockchain.openContract(await JPAC.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await jPAC.send(
            deployer.getSender(),
            {
                value: toNano('0.05'),
            },
            {
                $$type: 'Deploy',
                queryId: 0n,
            }
        );

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: jPAC.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and jPAC are ready to use
    });
});
