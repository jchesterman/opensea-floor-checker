import { Box, Flex, Image, Text } from '@chakra-ui/react';
import * as React from 'react';
import numeral from 'numeral';

const CollectionRow = ({currency, price, collection}) => {  

  let value = price * collection.totalEthValue;
  if (collection.rugged) value = '0';

  console.log(collection);

  return (
    <Box
      p="1em 0" 
      borderBottom="1px solid rgb(229, 232, 235)">
      <Flex justifyContent="space-between">
        <Flex alignItems="center">
          {collection.image_url && 
            <Box mr="20px">
              <Image borderRadius="60px" 
              w="60px"
              height="60px"
              src={collection.image_url} />
            </Box>} 
          <Box color="rgb(112, 122, 131)"
            fontSize="14px"
            fontWeight={700}>
            <Text color="black" fontWeight={800}
              fontSize="16px"
              mb="4px">{collection.name}</Text>
            <Text>Currently holding: {numeral(collection.owned).format(0,0)}</Text>
            <Text>Floor value in {currency.toUpperCase()}: ${numeral(Math.round(value)).format(0,0)}</Text>
          </Box>
        </Flex>
        <Box display="flex" color="rgb(112, 122, 131)"
          fontWeight="500"
          fontSize="14px">
          Floor price: <Image 
          pos="relative"
          top="3px"
          ml="10px"
          src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg" 
          w="14px" 
          h="14px" />{collection.floorPrice}
        </Box>
      </Flex>
    </Box>
  );
};

export default CollectionRow;