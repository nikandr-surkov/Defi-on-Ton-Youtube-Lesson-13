import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { beginCell, toNano } from '@ton/core';
import { Functions } from '../wrappers/Functions';
import '@ton/test-utils';

describe('Functions', () => {
    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let functions: SandboxContract<Functions>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        functions = blockchain.openContract(await Functions.fromInit());

        deployer = await blockchain.treasury('deployer');

        const deployResult = await functions.send(
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
            to: functions.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and functions are ready to use
    });

    it('should allow only the deployer to call privileged method', async () => {
        const result = await functions.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'privileged'
        );
        expect(result.transactions).toHaveTransaction({
            from: deployer.address,
            to: functions.address,
            success: true
        });
    });

    it('should return correct blockchain info for TON', async () => {
        const result = await functions.send(
            deployer.getSender(),
            {
                value: toNano('0.05')
            },
            'message-based L1'
        );

        // Convert 'TON' to a Cell
        const expectedBody = beginCell()
            .storeUint(0, 32) // Prefix with 32 zero bits (4 bytes)
            .storeBuffer(Buffer.from('TON'))
            .endCell();

        expect(result.transactions).toHaveTransaction({
            from: functions.address,
            to: deployer.address,
            success: true,
            body: expectedBody
        });
    });

    it('should calculate the correct average', async () => {
        const result = await functions.getResult();
        expect(result).toEqual(5n); // (1 + 10) / 2 = 5
    });

    it('should fail if non-deployer tries to call privileged method', async () => {
        const nonDeployer = await blockchain.treasury('nonDeployer');
        const result = await functions.send(
            nonDeployer.getSender(),
            {
                value: toNano('0.05')
            },
            'privileged'
        );
        expect(result.transactions).toHaveTransaction({
            from: nonDeployer.address,
            to: functions.address,
            success: false
        });
    });

});
