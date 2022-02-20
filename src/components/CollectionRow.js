import { Box, Flex, Text } from '@chakra-ui/react';
import * as React from 'react';

const CollectionRow = ({collection}) => {
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
        </Box>
      </Flex>
    </Box>
  );
};

export default CollectionRow;