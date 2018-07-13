
  

# JSON API response formatter

  

Create standardize JSON response output from your REST API by mapping object properties to json

  

## Usage Documentation

 1. Buat transformer dengan format seperti ini:
		
```javascript
const moment = require('moment')
const priceTransfomer = require('@rezariantono/json-transformer')(require('xolura/retail/base/app/item/embeds/price/transformers/price-transformer'))

module.exports = {
    availableIncludes: 'price',
    transform: (item) => {

        return {
            'id': item.id,
            'name': _.upperCase(item.name),
            'code': item.code,
            'created_at': moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')
        }
    },
    includePrice: (item, includes) => {

        if (item.price == undefined) {
            return {}
        }

        return priceTransfomer.item(item.price, includes)
    }
} 
```
 2.  Update schema.js


  
  
  
  

## Developer Documentation

  

Khusus developer package ini saja. Jika Anda user, tidak perlu memikirkan bagian selanjut

  

### Includes and excludes parsing

  
Parser akan mengeluarkan data dengan format sepert ini:
  

```JSON
{
"price": {
	"otherPrices": {
		"creator": {
		}
	}
	// Provide object name for further includes and excludes
},
"purchaseHistory": {} // Provide empty object if not further includes or excludes is expected
}

```