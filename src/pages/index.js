import * as React from "react"
import {Box, Input, Image, Spinner, Button, Flex, Text, Container} from '@chakra-ui/react';
import CollectionList from '../components/CollectionList';
import numeral from 'numeral';

const IndexPage = () => {
  const walletRef = React.useRef(null);
  const [collections, setCollections] = React.useState([]);
  const [filteredCollections, setFilteredCollections] = React.useState([]);
  const [numRugged, setNumRugged] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [ethPrice, setEthPrice] = React.useState(null);
  const [currency, setCurrency] = React.useState('usd');
  const [walletTotalValue, setWalletTotalValue] = React.useState(null);
  const [totalHolding, setTotalHolding] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
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
    if (wallet) {
      handleApiResp(wallet);
    }
  }, []);

  async function handleApiResp(wallet) {
    const options = {method: 'GET'}
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
  } 

  async function onSubmit(e) {
    setCollections([]);
    e.preventDefault();
    setLoading(true);
    const wallet = walletRef.current.value;
    if (!wallet) return;
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    urlParams.set('wallet', wallet);
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

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const wallet = urlParams.get('wallet');

  return (
    <main>  
      <title>Home Page</title>
      <Box position="fixed" 
        top="0"
        width="100%"
        p="0 40px"
        boxShadow="rgb(4 17 29 / 25%) 0px 0px 8px 0px"
        bg="#fff"
        zIndex={999}>
        <Container maxW="container.xxl">
          <Flex mb="20px" 
            mt="10px"
            alignItems="center" 
            justifyContent="space-between">
              <Text fontSize="18px"><strong>OpenSea</strong> Floor Checker</Text>
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
                <Input required mr="1em" name="wallet" ref={walletRef} placeholder={wallet || "Enter wallet address"} />
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
      <Container maxW="container.xxl">
        <Flex p="40px" mt="120px" 
          justifyContent="space-between" alignItems="flex-start">
          {collections.length > 0 && loaded && 
          <Box w="48%">
            <Box w="100%" mb="20px">
              <Input onChange={handleSearchUpdate} placeholder="Search for a collection" />
            </Box>
            <Box>
              <CollectionList currency={currency} ethPrice={ethPrice} collections={filtered} />
            </Box>
          </Box>}
          {collections.length > 0 && loaded && <Box w="48%" border="1px solid"
            borderColor="blue.600"
            background="blue.500"
            p="20px"
            mb="30px"
            color="white"
            position="sticky"
            top="150px"
            borderRadius={8}> 
            <Text mb="20px" fontSize="26px">This wallet currently holds{' '}
              <Box display="inline" fontSize="30px" fontWeight="600">{numeral(totalHolding).format(0,0)}</Box> nfts,{' '}
            worth{' '}
            <Box display="inline" fontSize="30px" fontWeight="600">{numeral(Math.round(walletTotalValue)).format(0,0)}</Box> ETH, or{' '}
            <Box display="inline" fontSize="30px" fontWeight="600">${numeral(Math.round(walletTotalValue * ethPrice)).format(0,0)}</Box>{' '}
              {currency.toUpperCase()}{' '}
              if sold at their current floor prices</Text>
          {numRugged !== 0 && <Box>There are {numRugged} potentially rugged collections (floor price of 0)</Box>}
          </Box>}
        </Flex>
      </Container>
    </main>
  )
}

export default IndexPage
