import Head from "next/head";
import { ParticleAuthModule, ParticleProvider } from "@biconomy/particle-auth";
import {
  Avalanche,
  BSC,
  BSCTestnet,
  Ethereum,
  EthereumGoerli,
  KCCTestnet,
  Moonbeam,
  Moonriver,
  Optimism,
  PlatON,
  Polygon,
  Solana,
} from "@particle-network/common";
import styles from "@/styles/Home.module.css";
import { useState } from "react";
import { IBundler, Bundler } from "@biconomy/bundler";
import {
  BiconomySmartAccount,
  BiconomySmartAccountConfig,
  DEFAULT_ENTRYPOINT_ADDRESS,
} from "@biconomy/account";
import { ethers } from "ethers";
import { ChainId } from "@biconomy/core-types";
import { IPaymaster, BiconomyPaymaster } from "@biconomy/paymaster";
import Minter from "@/components/Minter";

export default function Home() {
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [smartAccount, setSmartAccount] = useState<BiconomySmartAccount | null>(
    null
  );
  const [provider, setProvider] = useState<ethers.providers.Provider | null>(
    null
  );

  const particle = new ParticleAuthModule.ParticleNetwork({
    //https://docs.particle.network/getting-started/dashboard
    projectId: "9907c5b3-a301-438e-bd84-2de8c100a335",
    clientKey: "cJEtubDg5Q2PYJadqwaClRo2dLaYtpwWFN1IOniQ",
    appId: "cf69b4e3-ba0d-4a22-a471-2dbbf36e0d5f",
    wallet: {
      displayWalletEntry: true,
      defaultWalletEntryPosition: ParticleAuthModule.WalletEntryPosition.BR,
      supportChains: [Ethereum, EthereumGoerli],
    },
  });

  const bundler: IBundler = new Bundler({
    //https://dashboard.biconomy.io/
    bundlerUrl:
      "https://bundler.biconomy.io/api/v2/5/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: ChainId.GOERLI,
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  });

  const paymaster: IPaymaster = new BiconomyPaymaster({
    //https://dashboard.biconomy.io/
    paymasterUrl:
      "https://paymaster.biconomy.io/api/v1/5/2VPXMNQQ1.1383fcd1-47fe-4cb5-8782-3053198ed237",
  });

  const connect = async () => {
    try {
      setLoading(true);
      const userInfo = await particle.auth.login();
      console.log("Logged in user:", userInfo);
      const particleProvider = new ParticleProvider(particle.auth);
      console.log({ particleProvider });
      const web3Provider = new ethers.providers.Web3Provider(
        particleProvider,
        "any"
      );
      setProvider(web3Provider);
      const biconomySmartAccountConfig: BiconomySmartAccountConfig = {
        signer: web3Provider.getSigner(),
        chainId: ChainId.GOERLI,
        bundler: bundler,
        paymaster: paymaster,
      };
      let biconomySmartAccount = new BiconomySmartAccount(
        biconomySmartAccountConfig
      );
      biconomySmartAccount = await biconomySmartAccount.init();
      setAddress(await biconomySmartAccount.getSmartAccountAddress());
      setSmartAccount(biconomySmartAccount);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Head>
        <title>Based Account Abstraction</title>
        <meta name="description" content="Based Account Abstraction" />
      </Head>
      <main className={styles.main}>
        <h1>Based Account Abstraction</h1>
        <h2>Connect and Mint your AA powered NFT now</h2>
        {!loading && !address && (
          <button onClick={connect} className={styles.connect}>
            Connect to Based Web3
          </button>
        )}
        {loading && <p>Loading Smart Account...</p>}
        {address && <h2>Smart Account: {address}</h2>}
        {smartAccount && provider && (
          <Minter
            smartAccount={smartAccount}
            address={address}
            provider={provider}
          />
        )}
      </main>
    </>
  );
}
