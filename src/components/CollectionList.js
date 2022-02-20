import * as React from 'react';
import CollectionRow from './CollectionRow';

const CollectionList = ({collections, currency, ethPrice}) => {
  return (
    collections.map(collection => {
      return (
        <CollectionRow currency={currency} price={ethPrice} key={collection.name} collection={collection}/>
      );
  })
)};

export default CollectionList;