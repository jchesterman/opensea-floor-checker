import * as React from "react"
import {Box, Input, Spinner, Button, Flex, filter} from '@chakra-ui/react';
import CollectionRow from "../components/CollectionRow";

const IndexPage = () => {
  const walletRef = React.useRef(null);
  const [collections, setCollections] = React.useState([]);
  const [filteredCollections, setFilteredCollections] = React.useState([]);
  const [loading, setLoading] = React.useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    const wallet = walletRef.current.value;
    if (!wallet) return;
    const options = {method: 'GET'}
    const collections = await fetch(`https://api.opensea.io/api/v1/collections?offset=0&limit=300&asset_owner=${wallet}`, options);
    const colResponse = await collections.json();

    setLoading(true);
    const collectionsArr = await Promise.all(
      colResponse.map(async collection => {
        const stats = await fetch(`https://api.opensea.io/api/v1/collection/${collection.slug}/stats`, options);
        const statsResp = await stats.json();
        return {
          name: collection.name,
          owned: collection.owned_asset_count,
          floorPrice: statsResp.stats.floor_price || 'prolly rugged lol',
          rugged: !statsResp.stats.floor_price
        }
      })
    );
    setLoading(false);
    
    setLoading(false);
    collectionsArr.sort((a, b) => a.floorPrice - b.floorPrice);
 
    setCollections(collectionsArr);

    return false;
  }

  function handleSearchUpdate(e) {
    e.preventDefault();
    const searchValue = e.target.value.toLowerCase();;
    const filtered = collections.filter(collection => {
      const name = collection.name.toLowerCase();
      if (name.includes(searchValue)) {
        return collection;
      }
    });
    setFilteredCollections(filtered);
    return false;
  };

  const filtered = filteredCollections.length > 0 ? filteredCollections : collections;

  return (
    <main>  
      <title>Home Page</title>
      <Box p="40px">
        <Box mb="2em">
          <form onSubmit={onSubmit} method="POST">
            <Flex alignItems="center">
              <Input required mr="1em" name="wallet" ref={walletRef} placeholder="Enter wallet address" />
              {loading ? <Spinner /> : 
              <Button type="submit">Check the floors</Button>}
            </Flex>
          </form>
        </Box>
        {collections.length > 0 && <Box w="420px" mb="40px">
            <Input onChange={handleSearchUpdate} placeholder="Search for a collection" />
          </Box>}
        <Box>
          {filtered.length > 0 && filtered.map(collection => {
            return (
              <CollectionRow key={collection.name} collection={collection}/>
            );
          })}
        </Box>
      </Box>
    </main>
  )
}

export default IndexPage
