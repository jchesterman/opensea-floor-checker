import { Box, Flex, Text } from '@chakra-ui/react';
import * as React from 'react';

const CollectionRow = ({currency, price, collection}) => {  

  let value = price * collection.totalEthValue;
  if (collection.rugged) value = '0';

  return (
    <Box mb="1em" bg={collection.rugged ? "red.100" : "green.100"} 
      p="10px" 
      borderRadius="10px">
      <Flex justifyContent="space-between">
        <Box>
          <Text color="black" fontWeight={600}>{collection.name}</Text>
        </Box>
        <Box>
          Current Floor: {collection.floorPrice}
        </Box>
      </Flex>
      <Flex justifyContent="space-between">
        <Box>
          <Text color="black">Currently holding: {collection.owned}</Text>
          <Text color="black">Current floor value in {currency}: {Math.round(value)}</Text>
        </Box>
      </Flex>
    </Box>
  );
};

export default CollectionRow;