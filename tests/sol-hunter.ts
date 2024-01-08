import * as anchor from "@coral-xyz/anchor";
import * as web3 from "@solana/web3.js";
import { Program } from "@coral-xyz/anchor";
import { SolHunter } from "../target/types/sol_hunter";

describe("sol-hunter", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolHunter as Program<SolHunter>;
  const gameKeypair: web3.Keypair = web3.Keypair.generate();

  it("Is initialized!", async () => {
    const [newGameDataAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("level105", "utf8")],
      program.programId
    );

    const [chestVault] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("chestVault105", "utf8")],
      program.programId
    );

    // If account is null we initialize
    try {
      await program.account.gameDataAccount.fetch(newGameDataAccount);
      await program.account.gameDataAccount.fetch(chestVault);
    } catch {
      let txFund = new anchor.web3.Transaction();
      txFund.add(anchor.web3.SystemProgram.transfer({
          fromPubkey: program.provider.wallet.publicKey,
          toPubkey: gameKeypair.publicKey,
          lamports: 2.5 * anchor.web3.LAMPORTS_PER_SOL,
      })); 
      const sigTxFund = await program.provider.sendAndConfirm(txFund);

      //let balance = await program.provider.connection.getBalance(new web3.PublicKey(player.publicKey));
      //console.log("balance: " + balance);

      const txHash2 = await program.methods
      .initialize()
      .accounts({
        newGameDataAccount: newGameDataAccount,
        chestVault: chestVault,
        signer: gameKeypair.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([gameKeypair])
      .rpc();
    }
  });

  it("spawn player", async () => {
    const [newGameDataAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("level105", "utf8")],
      program.programId
    );

    const [chestVault] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("chestVault105", "utf8")],
      program.programId
    );

    const player1: web3.Keypair = web3.Keypair.generate();

    let txFund = new anchor.web3.Transaction();
    txFund.add(anchor.web3.SystemProgram.transfer({
        fromPubkey: program.provider.wallet.publicKey,
        toPubkey: player1.publicKey,
        lamports: 2.5 * anchor.web3.LAMPORTS_PER_SOL,
    })); 
    const sigTxFund = await program.provider.sendAndConfirm(txFund);

    try {
      await program.account.gameDataAccount.fetch(newGameDataAccount);
      await program.account.gameDataAccount.fetch(chestVault);
    } catch {

      //May need to add payer as signer if using a different payer
      const tx = await program.methods
        .spawnPlayer(gameKeypair.publicKey)
        .accounts({
          payer: program.provider.wallet.publicKey,
          chestVault: chestVault,
          gameDataAccount: newGameDataAccount,
          //systemProgram: web3.SystemProgram.programId,
        })
        .signers([program.provider.wallet.payer]);
      //console.log("txHash: " + txHash);
      let result = await tx.rpc();
      console.log("Your transaction signature", result);

    const tx2 = await program.methods
      .spawnPlayer(player1.publicKey)
      .accounts({
        payer: program.provider.wallet.publicKey,
        chestVault: chestVault,
        gameDataAccount: newGameDataAccount,
        //systemProgram: web3.SystemProgram.programId,
      })
      .signers([program.provider.wallet.payer]);
    let result2 = await tx2.rpc();
    //console.log("Your transaction signature", result2);
    }
    
  });

  it("move player", async () => {
    const [newGameDataAccount] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("level105", "utf8")],
      program.programId
    );

    const [chestVault] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("chestVault105", "utf8")],
      program.programId
    );
    
    try {
      await program.account.gameDataAccount.fetch(newGameDataAccount);
      await program.account.gameDataAccount.fetch(chestVault);
    } catch {
      console.log("game keypair: " + gameKeypair.publicKey)
      console.log("provider waller: " + program.provider.wallet.publicKey)
    const tx = await program.methods
        .movePlayer(1)
        .accounts({
          player: gameKeypair.publicKey,
          chestVault: chestVault,
          gameDataAccount: newGameDataAccount,
          //systemProgram: web3.SystemProgram.programId,
        })
        .signers([program.provider.wallet.payer]);
      //console.log("txHash: " + txHash);
      let result = await tx.rpc();
      console.log("Your transaction signature", result);

      const tx2 = await program.methods
        .movePlayer(2)
        .accounts({
          player: gameKeypair.publicKey,
          chestVault: chestVault,
          gameDataAccount: newGameDataAccount,
          //systemProgram: web3.SystemProgram.programId,
        })
        .signers([program.provider.wallet.payer]);
      //console.log("txHash: " + txHash);
      let result2 = await tx2.rpc();
      console.log("Your transaction signature", result);
    }
  });

});
