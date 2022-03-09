import * as React from "react"
import {Box,
  Link, 
  Input, 
  Image, 
  Spinner, 
  Button, 
  Flex, 
  Text, 
  Container, 
  Icon} from '@chakra-ui/react';
import CollectionList from '../components/CollectionList';
import numeral from 'numeral';
import {FaHeart, FaPrayingHands} from 'react-icons/fa';
import {CopyToClipboard} from 'react-copy-to-clipboard';

const IndexPage = () => {
  const walletRef = React.useRef(null);
  const [collections, setCollections] = React.useState([]);
  const [filteredCollections, setFilteredCollections] = React.useState([]);
  const [numRugged, setNumRugged] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [ethPrice, setEthPrice] = React.useState(null);
  const [currency] = React.useState('usd');
  const [walletTotalValue, setWalletTotalValue] = React.useState(null);
  const [totalHolding, setTotalHolding] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  const [queryParam, setQueryParam] = React.useState(null);
  const [apiError, setApiError] = React.useState(false);
  const [quote, setQuote] = React.useState(null);
  const [tipWallet] = React.useState('0x70642BE40a82bC0340439Ed5f98C4F6B48d13c7A ');

  const [copied, setCopied] = React.useState(false);
  const textAreaRef = React.useRef(null);

  React.useEffect(() => {

    const quotes = [
      'you only lose money if you sell.',
      'looks rare.',
      'wen whitelist?',
      'wen mint?',
      'we\'re all gonna make it.',
      'grand rising.',
      'degen hours.',
      'btc i trust, hodl i must.',
      'it\'s digital gold, bro.',
      'dogecoin to the moon.',
      'right click save as.',
      'i\'ve been trying to reach you about your nfts extended warranty.',
      'you got to pump it up.',
      'don\'t you know, pump it up.',
      'i\'m in it for the community.',
      'wen reveal?',
      'but what\'s the utility.',
      'bullish AF bro.',
      'taking this years profits to pay last years capital gains.',
      'these “NFTS” - are they in the room with us now?',
      'buy high sell low.',
    ];

    setQuote(quotes[Math.floor((Math.random()*quotes.length))]);
    async function getEthToFiat() {
      //let response = await fetch('/api/convert-to-fiat', {method: 'GET'});
      let response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=${currency}&ids=ethereum`, {
        method: 'GET'
      });
      response = await response.json();
      setEthPrice(response[0].current_price);
    }
    getEthToFiat();
    // handle query params
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const wallet = urlParams.get('wallet');
    setQueryParam(wallet);
    if (wallet) {
      handleApiResp(wallet);
    }
  }, [currency]);

  async function handleApiResp(wallet) {
    const options = {method: 'GET'}
    try {
      const collections = await fetch(`https://api.opensea.io/api/v1/collections?offset=0&limit=300&asset_owner=${wallet}`, options);
      const colResponse = await collections.json();
      const collectionsArr = await Promise.all(
        colResponse.map(async collection => {
          const stats = await fetch(`https://api.opensea.io/api/v1/collection/${collection.slug}/stats`, options);
          const statsResp = await stats.json();
          return {
            name: collection.name,
            owned: collection.owned_asset_count,
            floorPrice: statsResp.stats.floor_price || '0',
            rugged: !statsResp.stats.floor_price,
            totalEthValue: collection.owned_asset_count * statsResp.stats.floor_price,
            ...collection
          }
        })
      );
      setLoading(false);
      collectionsArr.sort((a, b) => b.floorPrice - a.floorPrice);
      setNumRugged(collectionsArr.filter(collection => collection.rugged).length);
      setCollections(collectionsArr);
      setWalletTotalValue(collectionsArr.reduce((sum, current) => sum + current.totalEthValue, 0));
      setTotalHolding(collectionsArr.reduce((sum, current) => sum + current.owned, 0));
      setLoaded(true);
      setApiError(false);
    } catch(error) {
      setApiError(true);
      setLoading(false);
    }
  } 

  async function onSubmit(e) {
    e.preventDefault();
    setCopied(false);
    setCollections([]);
    setLoading(true);
    const wallet = walletRef.current.value;
    if (!wallet) return;
    window.history.replaceState({}, '',`/?wallet=${wallet}`);
    handleApiResp(wallet);
    return false;
  }

  function handleSearchUpdate(e) {
    e.preventDefault();
    const searchValue = e.target.value.toLowerCase();
    const filtered = collections.filter(collection => collection.name.toLowerCase()
      .includes(searchValue));
    setFilteredCollections(filtered);
    return false;
  };

  const filtered = filteredCollections.length > 0 ? filteredCollections : collections;

  return (
    <main>  
      <title>OpenSea Floor Checker / See your NFT collection's ETH/USD value at a glance.</title>
      <Box position="fixed" 
        top="0"
        width="100%"
        p={{base: "0", md: "0 40px"}}
        h="14vh"
        boxShadow="rgb(4 17 29 / 25%) 0px 0px 8px 0px"
        bg="#fff"
        zIndex={999}>
        <Container maxW="container.xl">
          <Flex mb="20px" 
            mt="10px"
            alignItems="center" 
            justifyContent="space-between">
              <Text fontSize="18px">
                <Link _hover={{
                  textDecoration: 'none'
                }} href="/">
                  <strong>OpenSea</strong> Floor Checker
                </Link>
              </Text>
              {ethPrice &&
                <Text 
                  alignItems="center"
                  display="flex"
                  fontSize="14px"
                  fontWeight={600}
                  color="green.400"><Image 
                  pos="relative"
                  ml="10px"
                  mr="4px"
                  src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" 
                  w="14px" 
                  h="14px" /> ${ethPrice}<sup css={{
                    position: 'relative',
                    top: 0
                  }}>({currency.toUpperCase()})</sup></Text>}
          </Flex>
          <Box mb="2em"> 
            <form onSubmit={onSubmit} method="POST">
              <Flex alignItems="center">
                <Input required mr="1em" name="wallet" ref={walletRef} placeholder={queryParam || "Enter wallet address"} />
                {loading ? <Spinner color="blue.500" /> : 
                <Button 
                  colorScheme="blue"
                  p="4px 20px"
                  type="submit">Check</Button>} 
              </Flex>
            </form>
          </Box>
        </Container>
      </Box>
      <Container maxW="container.xl">
        {apiError ? <Box mt="17vh"  p={{base: "0", md: "0 40px"}}>
            <Text fontSize="90px" fontWeight={800} color="red.500">OpenSea API call was rugged or wallet address wasn't found. Try again shortly...</Text>
          </Box> : 
        <Flex  pt={{base: "0", md: "40px"}} mt="17vh"
          flexDir={{base: "column-reverse", md: "row"}}
          justifyContent="space-between" alignItems="flex-start">
          {collections.length > 0 && loaded && 
          <Box w={{base: "100%", md: "48%"}}>
            <Box w="100%" mb="20px">
              <Input onChange={handleSearchUpdate} placeholder="Search for a collection" />
            </Box>
            <Box>
              <CollectionList currency={currency} ethPrice={ethPrice} collections={filtered} />
            </Box>
          </Box>}
          {collections.length === 0 && <Flex minHeight="60vh"
            alignItems="center">
            <Text 
              textShadow="2px 2px #bee3f8"
              fontSize={{base: "90px", md: "130px"}} 
              color="blue.500" 
              fontWeight={800}>{quote}</Text></Flex>}
          {collections.length > 0 && loaded && <Box w={{base: "100%", md: "48%"}} border="1px solid"
            borderColor="blue.600"
            background="blue.500"
            p="20px"
            mb="30px"
            color="white"
            position={{base: "relative", md: "sticky"}}
            top={{base: "0", md: "150px"}}
            borderRadius={8}> 
            <Text mb="20px" fontSize="26px">This wallet currently holds{' '}
              <Text as="span" display="inline" fontSize="30px" fontWeight="600">{numeral(totalHolding).format(0,0)}</Text> nfts,{' '}
            worth{' '}
            <Text as="span" display="inline" fontSize="30px" fontWeight="600">{numeral(Math.round(walletTotalValue)).format(0,0)}</Text> ETH, or{' '}
            <Text as="span" display="inline" fontSize="30px" fontWeight="600">${numeral(Math.round(walletTotalValue * ethPrice)).format(0,0)}</Text>{' '}
              {currency.toUpperCase()}{' '}
              if sold at their current floor prices.</Text>
          {numRugged !== 0 && <Box>There are {numRugged} potentially rugged collections (floor price of 0)</Box>}
          <Text mt="18px" fontStyle="italic" color="#fff" fontWeight={600}>If this was useful, you can send me a tip 
            <Icon as={FaPrayingHands} 
              pos="relative"
              ml="6 px"
              top="2px"
              color="white" /></Text>
          <Flex
            mt="10px" color="#fff"
            alignItems={{base: "flex-start", md: "center"}}
            flexDir={{base: "column", md: "row"}}>
          <CopyToClipboard onCopy={() => setCopied(true)} text={tipWallet}>
            <Text ref={textAreaRef}
              cursor="pointer"
              bgColor="whiteAlpha.400" 
              p="6px" borderRadius="6px" 
              display="inline-block" fontSize="12px">
              {tipWallet}  
            </Text>
          </CopyToClipboard>
          {copied && <Text 
            ml={{base: "0", md: "12px"}} 
            mt={{base: "10px", md: "0"}}
            fontSize="12px" fontWeight={600}>copied!</Text>}
          </Flex>
          </Box>}
        </Flex>}
        <Flex mt="40px" mb="40px">
          <Text fontWeight="600">
            Made with <Icon pos="relative" top="3px" as={FaHeart} color="red.500" /> by{' '}
            <Link
              target="_blank"
              rel="noopener noreferrer" 
              href="https://twitter.com/thedogemaxi">@thedogemaxi</Link>
          </Text>
        </Flex>
      </Container>
    </main>
  )
}

export default IndexPage
