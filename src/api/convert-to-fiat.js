import axios from 'axios';

export default async function handler(req, res) {

  let response = null;
  const apiPrefix = process.env.production ? 'pro' : 'sandbox';
  console.log('api prefix: ', apiPrefix);
  try {
    response = await axios.get(`https://${apiPrefix}-api.coinmarketcap.com/v2/tools/price-conversion?amount=1&symbol=ETH&convert=CAD,USD`, {
      headers: {
        'X-CMC_PRO_API_KEY': 'af5164a0-9430-4706-bef0-8d412b47039c',
      },
    });
  } catch(ex) {
    response = null;
    // error
    console.log('ERROR HERE: ', ex);
    res.status(403).json({err: ex})
  }
  if (response) {
    // success
    const json = response.data;
    console.log(json);
    res.status(200).json(json)
  }

}