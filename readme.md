

  

  

# JSON API response formatter

  

  

Create standardize JSON response output from your REST API by mapping object properties to json

  

  

## Usage Documentation

  

1. Buat transformer dengan format seperti ini:

```javascript

const  moment = require('moment')

const  priceTransfomer = require('@rezariantono/json-transformer')(require('xolura/retail/base/app/item/embeds/price/transformers/price-transformer'))

  

module.exports = {

availableIncludes:  'price',

transform: (item) => {

  

return {

'id':  item.id,

'name':  _.upperCase(item.name),

'code':  item.code,

'created_at':  moment(item.created_at).format('YYYY-MM-DD HH:mm:ss')

}

},

includePrice: (item, includes) => {

  

if (item.price == undefined) {

return {}

}

  

return  priceTransfomer.item(item.price, includes)

}

}

```

2. Update schema.js

3. Pagination

Contoh Controller yang menggunakan pagination

```javascript
 index: async (req, res) => {

        const queryParams = itemModel.queryBuilder(req)
        const query = itemModel.model(req.db.tenant.mongo.connection).find(queryParams)

        if (req.query.paginate) {
            query.skip(_.toInteger((req.query.page -1) * req.query.paginate)).limit(_.toInteger(req.query.paginate))
        }

        try {
           
            const results = await query.exec()
            
            const pagination = {
                'type':'cursor', // optional dapat diisi dengan cursor / paginator atau dikosongkan
                'total':  await itemModel.model(req.db.tenant.mongo.connection).count({}).exec(), // optional ,  total keseluruhan data
                'paginate': req.query.paginate, // jumlah data yang ditampilkan per page
                'page': req.query.page // page yang sedang ditampilkan
            }

            return res.json(serializer.transformCollection(results, {}, req,pagination ))  

        } catch (err) {
            return res.status(400).json(err)
        }
    },
```

  

## Developer Documentation

  

  

Khusus developer package ini saja. Jika Anda user, tidak perlu memikirkan bagian selanjut

  

  

### Includes and excludes parsing

  

Parser akan mengeluarkan data dengan format sepert ini:

  

```javascript

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

### Pagination object structure


```javascript

{
    "type": pagination.type || (isNaN(pagination.total) ? "cursor" : "paginator"), // optional,
    "count": collection.length,
    "per_page": parseInt(pagination.count || pagination.per_page || pagination.paginate),
    "current_page": parseInt(pagination.page || pagination.current_page || 1),
    "total": (int) pagination.total, // optional, provide if the type is paginator
    "total_pages":  Math.ceil(paginationObject.total / paginationObject.per_page)
}
```
### Pagination cursor type output
```json
 {
        "type": "cursor",
        "per_page": 20,
        "count": 10,
        "current_page": 3
    }
 ```
 ### Pagination paginator type ouput
 ```json
 {
        "type": "paginator",
        "per_page": 20,
        "count": 10,
        "current_page": 3,
        "total": 50,
        "total_pages": 3
    }
    ``