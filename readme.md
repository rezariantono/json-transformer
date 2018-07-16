
  

  

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

  

const  queryParams = itemModel.queryBuilder(req)

const  query = itemModel.model(req.db.tenant.mongo.connection).find(queryParams)

  

if (req.query.paginate) {

query

.skip(_.toInteger((req.query.page * req.query.paginate) - 1))

.limit(_.toInteger(req.query.paginate))

}

try {

const  results = await  query.exec()

const  pagination = {

'type':  'paginator', // dapat diisi cursor / paginator

'count':  req.query.paginate,// total data yang ditampilkan per page

'current_page':  req.query.page, // page yang sedang ditampilkan

'current_data': (req.query.page -1) * req.query.paginate + 1  // data yang dimulai ditampilkan di page tersebut

}

  

if(pagination.type == 'paginator'){

const  count = await  itemModel.model(req.db.tenant.mongo.connection).find({}).exec()

const  total = {

'total':  count.length, // total data keseluruhan

'total_pages': (count.length / req.query.paginate) // total page keseluruhan

}

  

Object.assign(pagination, total)

}

return  res.json(serializer.transformCollection(results, {}, req,pagination ))

  

} catch (err) {

return  res.status(400).json(err)

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
	"type": pagination.type || (pagination.total.isNaN() ? "cursor" : "paginator"), // optional,
	"count": (pagination.paginate || pagination.per_page),
	"per_page": (pagination.paginate || pagination.per_page),
	"current_page": (pagination.page || pagination.current_page),
	"total": (int) pagination.total, // optional, provide if the type is paginator
	"total_pages": (pagination.total / pagination.paginate)
}

```