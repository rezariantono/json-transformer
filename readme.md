
# JSON API response formatter

Create standardize JSON response output from your REST API by mapping object properties to json

## Usage Documentation




## Developer Documentation

Khusus developer package ini saja. Jika Anda user, tidak perlu memikirkan bagian selanjut

### Includes and excludes parsing

Data format:

```JSONasPerl
{
    "price": {
        "otherPrices": {} // Provide object name for further includes and excludes
    },
    "purchaseHistory": {} // Provide empty object if not further includes or excludes is expected 
}
```