import * as React from 'react';
import numeral from 'numeral';
import {Box, Checkbox, Flex, Image, Text} from '@chakra-ui/react';

const HeaderComponents = ({
  rememberWallet,
  handleChecked,
  ethPrice,
  currency,
  handleCurrencyChange
}) => {
  return (
    <Flex mr="6px">
      <Flex fontSize="14px" alignItems="center">
        <Checkbox
          onChange={() => handleChecked()}
          isChecked={rememberWallet}
          mr="6px"
        />
        Remember me
      </Flex>
      {ethPrice && (
        <Text
          alignItems="center"
          display="flex"
          fontSize="14px"
          fontWeight={600}
          color="green.400"
        >
          <Image
            pos="relative"
            ml="10px"
            mr="4px"
            src="https://storage.opensea.io/files/6f8e2979d428180222796ff4a33ab929.svg"
            w="14px"
            h="14px"
          />{' '}
          ${numeral(ethPrice).format('0,0.00')}
          <sup
            css={{
              position: 'relative',
              top: 0,
              marginLeft: 4
            }}
          >
            ({currency.toUpperCase()})
          </sup>
        </Text>
      )}
      <Box
        onClick={() => handleCurrencyChange('usd')}
        cursor="pointer"
        _hover={{
          opacity: 1
        }}
        ml="12px"
        opacity={currency === 'usd' ? 1 : 0.2}
      >
        🇺🇸
      </Box>
      <Box
        onClick={() => handleCurrencyChange('cad')}
        cursor="pointer"
        _hover={{
          opacity: 1
        }}
        ml="6px"
        opacity={currency === 'cad' ? 1 : 0.2}
      >
        🇨🇦
      </Box>
    </Flex>
  );
};

export default HeaderComponents;
