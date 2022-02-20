import * as React from "react"
import {Box, Input, Spinner, Button, Flex, Text} from '@chakra-ui/react';
import CollectionList from '../components/CollectionList';

const IndexPage = () => {
  const walletRef = React.useRef(null);
  const [collections, setCollections] = React.useState([]);
  const [filteredCollections, setFilteredCollections] = React.useState([]);
  const [numRugged, setNumRugged] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [ethPrice, setEthPrice] = React.useState(null);
  const [currency, setCurrency] = React.useState('cad');
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
  }, []);

  async function onSubmit(e) {
    setCollections([]);
    e.preventDefault();
    setLoading(true);
    const wallet = walletRef.current.value;
    if (!wallet) return;
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
          totalEthValue: collection.owned_asset_count * statsResp.stats.floor_price
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
      <title>Home Page</title>
      <Box p="40px">
        <Flex mb="20px" justifyContent="flex-end">
            {ethPrice &&
              <Text color="green.500">ETH: ${ethPrice}<sup>({currency.toUpperCase()})</sup></Text>}
        </Flex>
        <Box mb="2em">
          <form onSubmit={onSubmit} method="POST">
            <Flex alignItems="center">
              <Input required mr="1em" name="wallet" ref={walletRef} placeholder="Enter wallet address" />
              {loading ? <Spinner /> : 
              <Button type="submit">Check the floors</Button>}
            </Flex>
          </form>
        </Box>
        {loaded && <Text mb="20px">This wallet currently holds {totalHolding} nfts, 
          worth {Math.round(walletTotalValue)} ETH or ${Math.round(walletTotalValue * ethPrice)} {currency.toUpperCase()} if sold at their current floor prices</Text>}
        {numRugged !== 0 && <Box mb="30px">There are {numRugged} potentially rugged collections (floor price of 0)</Box>}
        {collections.length > 0 && <Box w="420px" mb="40px">
            <Input onChange={handleSearchUpdate} placeholder="Search for a collection" />
          </Box>}
        <Box>
          <CollectionList currency={currency} ethPrice={ethPrice} collections={filtered} />
        </Box>
      </Box>
    </main>
  )
}

export default IndexPage
