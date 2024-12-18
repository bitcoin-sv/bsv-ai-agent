import { Transaction, PrivateKey, P2PKH, ARC } from '@bsv/sdk';

const BsvButton: React.FC = () => {
  const handleClick = async () => {
    const privKey = PrivateKey.fromWif('');
    const sourceTransaction = Transaction.fromHex('...');

    const version = 1;
    const input = {
      sourceTransaction,
      sourceOutputIndex: 0,
      unlockingScriptTemplate: new P2PKH().unlock(privKey),
    };
    const output = {
      lockingScript: new P2PKH().lock(privKey.toPublicKey().toHash()),
      change: true,
    };

    const tx = new Transaction(version, [input], [output]);
    await tx.fee();
    await tx.sign();

    const apiKey = ''; // replace
    await tx.broadcast(new ARC('https://api.taal.com/arc', apiKey));
  };

  return (
    <button type="button" onClick={handleClick}>
      Create Transaction
    </button>
  );
};

export default BsvButton;
