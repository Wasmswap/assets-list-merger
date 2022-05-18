import { useEffect, useState } from "react";
import Head from "next/head";
import Editor from "@monaco-editor/react";
import { Column, Inline, styled, Text } from "junoblocks";
import defaultRewardsList from "../public/rewards_list.local.json";
import defaultTokenList from "../public/token_list.local.json";
import { CopyTextButton } from "../components/CopyTextButton";

const defaultRewardsListPrettified = JSON.stringify(
  defaultRewardsList,
  null,
  2
);

const defaultTokenListPrettified = JSON.stringify(defaultTokenList, null, 2);

const editorHeight = "clamp(250px, 30vh, 450px)";

export default function Home() {
  const [tokenListConfig, setTokenListConfig] = useState(
    defaultTokenListPrettified
  );

  const [rewardsListConfig, setRewardsListConfig] = useState(
    defaultRewardsListPrettified
  );

  const [parsedTokenListConfig, setParsedTokenListConfig] = useState("");
  const [parsedPoolListConfig, setParsedPoolListConfig] = useState("");

  useEffect(() => {
    const tokenList = JSON.parse(tokenListConfig);
    const rewardsList = JSON.parse(rewardsListConfig);

    function cleanUpTokenInfo(token) {
      const copiedToken = JSON.parse(JSON.stringify(token));
      delete copiedToken.staking_address;
      delete copiedToken.rewards_addresses;
      delete copiedToken.swap_address;
      delete copiedToken.pool_id;
      return copiedToken;
    }

    const baseToken = tokenList.base_token;
    const cleanedUpBaseToken = cleanUpTokenInfo(baseToken);

    /* parse token list */
    const parsedTokensFromTokenList = tokenList.tokens.map(cleanUpTokenInfo);
    setParsedTokenListConfig(
      JSON.stringify(
        {
          ...tokenList,
          baseToken: cleanedUpBaseToken,
          tokens: parsedTokensFromTokenList,
        },
        null,
        2
      )
    );

    const pools = tokenList.tokens
      .filter((token) => token.symbol !== baseToken.symbol)
      .map((token) => {
        const poolRewardsTokens = rewardsList.list.find(
          (rewardItem) => rewardItem.swap_address === token.swap_address
        );
        return {
          pool_id: token.pool_id,
          pool_assets: [cleanedUpBaseToken, cleanUpTokenInfo(token)],
          swap_address: token.swap_address || "",
          staking_address:
            poolRewardsTokens?.staking_address || token.staking_address || "",
          rewards_tokens: poolRewardsTokens?.rewards_tokens ?? [],
        };
      });

    setParsedPoolListConfig(
      JSON.stringify(
        {
          name: "Pool list",
          logoURI: tokenList.logoURI,
          keywords: tokenList.keywords,
          tags: tokenList.tags,
          timestamp: new Date().toDateString(),
          pools,
          version: tokenList.version,
        },
        null,
        2
      )
    );
  }, [tokenListConfig, rewardsListConfig]);

  return (
    <StyledDivForContainer css={{ padding: "$10 0" }}>
      <Head>
        <title>Wasmswap config merger</title>
        <meta
          name="description"
          content="Merge your token_list.json with rewards_config.json"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Text variant="hero" css={{ padding: "$18 0 $8" }}>
        Wasmswap config merger
      </Text>
      <Text variant="body" css={{ paddingBottom: "$16" }}>
        This is to generate updated token_list and a new pool_config files based
        on old token_list and rewards_config configurations.
      </Text>
      <Inline gap={8}>
        <Column css={{ flex: 1 }}>
          <Text variant="title" css={{ padding: "$12 0 $8 0" }}>
            Paste your <StyledHighlight>`token_list.json`</StyledHighlight>{" "}
            here:
          </Text>
          <Editor
            height={editorHeight}
            defaultLanguage="json"
            defaultValue={defaultTokenListPrettified}
            onChange={(newValue) => setTokenListConfig(newValue)}
            theme="vs-dark"
          />
          <Text variant="title" css={{ padding: "$12 0 $8 0" }}>
            Paste your <StyledHighlight>`rewards_config.json`</StyledHighlight>{" "}
            here:
          </Text>
          <Editor
            height={editorHeight}
            defaultLanguage="json"
            defaultValue={defaultRewardsListPrettified}
            onChange={(newValue) => setRewardsListConfig(newValue)}
            theme="vs-dark"
          />
        </Column>
        <Column css={{ flex: 1 }}>
          <Inline
            justifyContent="space-between"
            align="center"
            css={{ padding: "$12 0 $8 0" }}
          >
            <Text variant="title">
              Updated <StyledHighlight>`token_list.json`</StyledHighlight>
            </Text>
            <CopyTextButton text={parsedTokenListConfig} />
          </Inline>
          <Editor
            height={editorHeight}
            defaultLanguage="json"
            value={parsedTokenListConfig}
            options={{
              readOnly: true,
            }}
            readOnly
            theme="vs-dark"
          />
          <Inline
            justifyContent="space-between"
            align="center"
            css={{ padding: "$12 0 $8 0" }}
          >
            <Text variant="title">
              Created <StyledHighlight>`pool_list.json`</StyledHighlight>
            </Text>
            <CopyTextButton text={parsedPoolListConfig} />
          </Inline>

          <Editor
            height={editorHeight}
            defaultLanguage="json"
            value={parsedPoolListConfig}
            options={{
              readOnly: true,
            }}
            theme="vs-dark"
          />
        </Column>
      </Inline>
    </StyledDivForContainer>
  );
}

const StyledDivForContainer = styled("div", {
  maxWidth: "1280px",
  width: "90%",
  margin: "0 auto",
});

const StyledHighlight = styled("span", {
  color: "$colors$brand",
});
